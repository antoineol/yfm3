/**
 * DuckStation shared memory reader for Windows.
 *
 * Hand detection strategy:
 *   Phase 0x02 (turn transition): the game cleans up consumed materials — hand is correct.
 *   Phase 0x03 (draw): new cards arrive one by one.
 *   Phase 0x04 (hand selection): full hand ready — snapshot as "startOfTurnHand".
 *   Phase 0x07-0x08 (fusion): cards consumed, but slots keep status=0x80 (ghost cards).
 *   Phases 0x05-0x0A: ghost cards persist until next phase 0x02.
 *
 *   We track the hand through phase transitions:
 *   - At phase 0x04: snapshot the correct hand (all slots with status=0x80).
 *   - When fusion counter increases: we know N fusions happened.
 *     Use the fusion result + fusion table to identify consumed materials
 *     from the phase-0x04 snapshot.
 *   - At phase 0x02: re-read to confirm (ground truth).
 */

import koffi from "koffi";
import { findFusionPartner, loadFusionLookup } from "./fusions.mjs";

// ── Windows constants ──────────────────────────────────────────────
const FILE_MAP_READ = 0x0004;

// ── PS1 RAM offsets ────────────────────────────────────────────────
const HAND_BASE = 0x1a7ae4;
const HAND_STRIDE = 0x1c;
const HAND_SLOTS = 5;
const FIELD_BASE = 0x1a7b70;
const FIELD_SLOTS = 5;

const LP_P1_OFFSET = 0x0ea004;
const LP_P2_OFFSET = 0x0ea024;
const SCENE_ID_OFFSET = 0x09b26c;

// From RetroAchievements code notes
const FUSION_RESULT_OFFSET = 0x0ea118;
const FUSION_COUNTER_OFFSET = 0x0e9ff8;
const DUEL_PHASE_OFFSET = 0x09b23a;
// Turn indicator (from FM-Online: 0x09B1D5)
const TURN_INDICATOR_OFFSET = 0x09b1d5;

const PS1_RAM_SIZE = 0x200000;

const STATUS_PRESENT = 0x80;
const STATUS_TRANSITIONING = 0x10;

// Duel phases
const PHASE_CLEANUP = 0x02;
const PHASE_DRAW = 0x03;
const PHASE_HAND_SELECT = 0x04;

// ── Load Windows kernel32 ──────────────────────────────────────────
const kernel32 = koffi.load("kernel32.dll");
const OpenFileMappingW = kernel32.func(
  "void* __stdcall OpenFileMappingW(uint32_t dwDesiredAccess, int bInheritHandle, const char16_t* lpName)",
);
const MapViewOfFile = kernel32.func(
  "void* __stdcall MapViewOfFile(void* hFileMappingObject, uint32_t dwDesiredAccess, uint32_t dwFileOffsetHigh, uint32_t dwFileOffsetLow, uintptr_t dwNumberOfBytesToMap)",
);
const UnmapViewOfFile = kernel32.func("int __stdcall UnmapViewOfFile(void* lpBaseAddress)");
const CloseHandle = kernel32.func("int __stdcall CloseHandle(void* hObject)");
const GetLastError = kernel32.func("uint32_t __stdcall GetLastError()");

// ── Fusion lookup ──────────────────────────────────────────────────
let fusionLookup = null;
try {
  fusionLookup = loadFusionLookup();
} catch (err) {
  console.error("Warning: could not load fusion lookup:", err.message);
}

// ── Memory read helpers ────────────────────────────────────────────
function readU16(view, offset) {
  return koffi.decode(view, offset, "uint16");
}
function readU8(view, offset) {
  return koffi.decode(view, offset, "uint8");
}
function readCardSlot(view, base, index) {
  const offset = base + index * HAND_STRIDE;
  return {
    cardId: readU16(view, offset),
    atk: readU16(view, offset + 2),
    def: readU16(view, offset + 4),
    status: readU8(view, offset + 0x0b),
  };
}

// ── Exported functions ─────────────────────────────────────────────
export async function findDuckStationPids() {
  const { execSync } = await import("node:child_process");
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq duckstation*" /FO CSV /NH', {
      encoding: "utf-8",
    });
    const pids = [];
    for (const line of output.split("\n")) {
      const match = line.match(/"[^"]*","(\d+)"/);
      if (match) pids.push(Number(match[1]));
    }
    return pids;
  } catch {
    return [];
  }
}
export function openSharedMemory(pid) {
  const name = `duckstation_${pid}`;
  const handle = OpenFileMappingW(FILE_MAP_READ, 0, name);
  if (!handle) {
    console.error(`OpenFileMappingW("${name}") failed, error=${GetLastError()}`);
    return null;
  }
  const view = MapViewOfFile(handle, FILE_MAP_READ, 0, 0, PS1_RAM_SIZE);
  if (!view) {
    console.error(`MapViewOfFile failed, error=${GetLastError()}`);
    CloseHandle(handle);
    return null;
  }
  console.log(`Mapped shared memory for PID ${pid} (${name})`);
  return { handle, view, pid };
}
export function closeSharedMemory(mapping) {
  if (mapping.view) UnmapViewOfFile(mapping.view);
  if (mapping.handle) CloseHandle(mapping.handle);
}

// ── State tracking ─────────────────────────────────────────────────
let prevDuelPhase = -1;
let prevFusionCounter = -1;
let prevFusionResult = 0; // tracks the last fusion result for chain detection
let prevFieldIds = [];

// The "confirmed hand" is the set of card IDs known to be genuinely in hand.
// Updated at reliable phases (0x02 cleanup, 0x03 draw, 0x04 hand selection).
// During unreliable phases (post-fusion), used as a filter.
let confirmedHand = []; // card IDs

function setConfirmedHand(cardIds) {
  confirmedHand = [...cardIds];
  log(`  confirmedHand = [${cardIds.join(", ")}] (${cardIds.length} cards)`);
}

/**
 * Read the full game state from mapped PS1 RAM.
 */
export function readGameState(view) {
  const sceneId = readU16(view, SCENE_ID_OFFSET);
  const duelPhase = readU8(view, DUEL_PHASE_OFFSET);
  const fusionResult = readU16(view, FUSION_RESULT_OFFSET);
  const fusionCounter = readU8(view, FUSION_COUNTER_OFFSET);
  const turnIndicator = readU8(view, TURN_INDICATOR_OFFSET);

  // Read all slots
  const handSlots = [];
  for (let i = 0; i < HAND_SLOTS; i++) handSlots.push(readCardSlot(view, HAND_BASE, i));
  const fieldSlots = [];
  for (let i = 0; i < FIELD_SLOTS; i++) fieldSlots.push(readCardSlot(view, FIELD_BASE, i));

  const fieldIds = fieldSlots
    .filter((s) => s.cardId > 0 && (s.status & STATUS_PRESENT) !== 0)
    .map((s) => s.cardId);

  // Read all present hand cards from slots (raw, unfiltered except by status bits)
  const rawHand = [];
  for (const s of handSlots) {
    const present = (s.status & STATUS_PRESENT) !== 0;
    const transitioning = (s.status & STATUS_TRANSITIONING) !== 0;
    if (s.cardId > 0 && present && !transitioning) {
      rawHand.push(s.cardId);
    }
  }

  // ── Phase-based hand tracking ──────────────────────────────────
  const phaseChanged = duelPhase !== prevDuelPhase;

  if (phaseChanged) {
    log(`Phase: 0x${prevDuelPhase.toString(16)} → 0x${duelPhase.toString(16)}, turn=${turnIndicator}, rawHand=[${rawHand.join(",")}]`);
  }

  // Phase 0x02/0x03/0x04 are reliable ONLY during the player's turn (turn=0).
  // During the opponent's turn, these phases cycle too but the player's hand
  // slots still contain ghost cards from previous fusions.
  const isPlayerTurn = turnIndicator === 0;
  if (isPlayerTurn && (duelPhase === PHASE_CLEANUP || duelPhase === PHASE_DRAW || duelPhase === PHASE_HAND_SELECT)) {
    if (rawHand.join(",") !== confirmedHand.join(",")) {
      log(`Reliable phase 0x${duelPhase.toString(16)} (player turn): updating confirmed hand`);
      setConfirmedHand(rawHand);
    }
  }

  // Fusion detection: when fusion counter increases, identify consumed materials
  const fusionJustHappened = prevFusionCounter >= 0 && fusionCounter > prevFusionCounter;
  if (fusionJustHappened && fusionLookup) {
    const numFusions = fusionCounter - prevFusionCounter;
    log(`FUSION x${numFusions}: result=card#${fusionResult}, field=[${fieldIds.join(",")}]`);

    // Try hand+hand materials first, then hand+intermediateResult (chain),
    // then hand+field
    let consumed = identifyConsumedMaterials(confirmedHand, fusionResult, numFusions);
    if (consumed.length === 0 && prevFusionResult > 0) {
      // Chain fusion: one material from hand, one is the previous fusion result
      consumed = identifyChainFusion(confirmedHand, prevFusionResult, fusionResult);
    }
    if (consumed.length === 0) {
      // Hand + field fusion: one material from hand, one from field
      consumed = identifyHandFieldFusion(confirmedHand, fieldIds, fusionResult);
    }

    if (consumed.length > 0) {
      log(`  consumed from hand: [${consumed.join(", ")}]`);
      const remaining = [...confirmedHand];
      for (const materialId of consumed) {
        const idx = remaining.indexOf(materialId);
        if (idx >= 0) remaining.splice(idx, 1);
      }
      setConfirmedHand(remaining);
    } else {
      log("  could not identify consumed materials");
    }
    prevFusionResult = fusionResult;
  } else if (!fusionJustHappened) {
    // Reset chain tracking when no fusion is happening
    prevFusionResult = 0;
  }

  // Detect cards played directly to field (no fusion, e.g. failed fusion chain or simple play).
  // If a confirmed hand card now appears on the field but wasn't there before,
  // and no fusion produced it, it was played directly.
  if (prevFieldIds.length > 0 && confirmedHand.length > 0) {
    const prevFieldSet = new Set(prevFieldIds);
    const newFieldCards = fieldIds.filter((id) => !prevFieldSet.has(id));
    for (const newFieldCard of newFieldCards) {
      // Skip if this card is the fusion result (already handled above)
      if (fusionJustHappened && newFieldCard === fusionResult) continue;
      // Check if this card is in confirmedHand
      const idx = confirmedHand.indexOf(newFieldCard);
      if (idx >= 0) {
        log(`PLAYED TO FIELD: card#${newFieldCard} (was in confirmed hand)`);
        const remaining = [...confirmedHand];
        remaining.splice(idx, 1);
        setConfirmedHand(remaining);
      }
    }
  }
  prevFieldIds = [...fieldIds];

  // ── Build the output hand ──────────────────────────────────────
  // During reliable phases, use rawHand directly.
  // During unreliable phases, use confirmedHand as a filter on rawHand.
  let hand;
  const reliablePhase =
    duelPhase === PHASE_CLEANUP || duelPhase === PHASE_DRAW || duelPhase === PHASE_HAND_SELECT;

  if (reliablePhase || confirmedHand.length === 0) {
    hand = rawHand;
  } else {
    // Filter rawHand to only include cards in confirmedHand.
    // Handle duplicates: for each card in rawHand, include it only if
    // confirmedHand has a remaining instance.
    const budget = new Map();
    for (const id of confirmedHand) {
      budget.set(id, (budget.get(id) || 0) + 1);
    }
    hand = [];
    for (const id of rawHand) {
      const remaining = budget.get(id) || 0;
      if (remaining > 0) {
        hand.push(id);
        budget.set(id, remaining - 1);
      }
    }
  }

  // Save state
  prevDuelPhase = duelPhase;
  prevFusionCounter = fusionCounter;

  const inDuel = hand.length > 0 || fieldIds.length > 0;
  const lpP1 = readU16(view, LP_P1_OFFSET);
  const lpP2 = readU16(view, LP_P2_OFFSET);

  return {
    inDuel,
    sceneId,
    hand,
    field: fieldIds,
    lp: [lpP1, lpP2],
    debug: {
      duelPhase,
      turnIndicator,
      fusionResult,
      fusionCounter,
      rawHand,
      confirmedHand: [...confirmedHand],
      handSlots,
    },
  };
}

/**
 * Given the confirmed hand, the final fusion result, and the number of fusions,
 * identify which hand cards were consumed as materials.
 *
 * For a single fusion (A + B → R): find A, B in confirmedHand where fusion(A,B)=R.
 * For a chain (A + B → C, C + D → R): find A, B, D in confirmedHand.
 */
function identifyConsumedMaterials(handCards, finalResult, numFusions) {
  if (!fusionLookup || handCards.length === 0) return [];

  if (numFusions === 1) {
    // Simple case: find 2 cards in hand that fuse into finalResult
    return findMaterialPair(handCards, finalResult);
  }

  // Chain case: work backwards from the final result
  // Last fusion: X + D → finalResult, where X is an intermediate result
  // We need to find D in handCards, and then recurse to find materials for X
  for (let d = 0; d < handCards.length; d++) {
    const cardD = handCards[d];
    // Check: is there some intermediate result X where fusion(X, cardD) = finalResult?
    const partnersForD = findFusionPartner(fusionLookup, cardD, finalResult);
    for (const intermediateResult of partnersForD) {
      // Now find materials for the intermediate result from remaining hand cards
      const remainingHand = handCards.filter((_, i) => i !== d);
      const earlierMaterials = identifyConsumedMaterials(
        remainingHand,
        intermediateResult,
        numFusions - 1,
      );
      if (earlierMaterials.length > 0) {
        return [...earlierMaterials, cardD];
      }
    }
  }

  return []; // Could not trace the fusion chain
}

/**
 * Chain fusion: one material is the previous fusion result (intermediate),
 * the other is from hand. Returns the hand card consumed (0 or 1 cards).
 */
function identifyChainFusion(handCards, intermediateResult, fusionResult) {
  if (!fusionLookup) return [];
  const partners = findFusionPartner(fusionLookup, intermediateResult, fusionResult);
  for (const handCard of handCards) {
    if (partners.has(handCard)) {
      log(`  chain fusion: intermediate card#${intermediateResult} + hand card#${handCard} → ${fusionResult}`);
      return [handCard];
    }
  }
  return [];
}

/**
 * Hand + field fusion: one material from hand, one from field.
 * Returns the hand card IDs that were consumed (0 or 1 cards).
 */
function identifyHandFieldFusion(handCards, fieldCards, fusionResult) {
  if (!fusionLookup) return [];
  for (const handCard of handCards) {
    const partners = findFusionPartner(fusionLookup, handCard, fusionResult);
    for (const fieldCard of fieldCards) {
      if (partners.has(fieldCard)) {
        log(`  hand+field fusion: hand card#${handCard} + field card#${fieldCard} → ${fusionResult}`);
        return [handCard];
      }
    }
  }
  return [];
}

/**
 * Find 2 cards in handCards that fuse into the given result.
 */
function findMaterialPair(handCards, result) {
  for (let i = 0; i < handCards.length; i++) {
    const partners = findFusionPartner(fusionLookup, handCards[i], result);
    for (let j = i + 1; j < handCards.length; j++) {
      if (partners.has(handCards[j])) {
        return [handCards[i], handCards[j]];
      }
    }
  }
  return [];
}

// ── Logging ─────────────────────────────────────────────────────────
import { appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const logFile = join(dirname(fileURLToPath(import.meta.url)), "bridge.log");

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    appendFileSync(logFile, `${line}\n`);
  } catch {
    /* ignore */
  }
}
