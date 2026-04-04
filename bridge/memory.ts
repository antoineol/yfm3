/**
 * DuckStation shared memory reader for Windows.
 *
 * Reads raw PS1 RAM values and returns them without interpretation.
 * All game logic (card filtering, phase mapping, hand reliability)
 * lives in the webapp.
 *
 * RAM addresses are split into two groups:
 *
 * 1. **Universal** — same in all known game versions (NTSC-U, PAL, RP mod).
 *    Hand, field, collection, deck, card stats.
 *
 * 2. **Version-dependent** — differ between compiled binaries (US vs EU).
 *    Duel phase, turn indicator, LP, scene ID, terrain, duelist ID, fusions.
 *    These are stored in an "offset profile" resolved at runtime.
 *
 * Uses bun:ffi to call Windows kernel32.dll for shared memory access.
 */

import { dlopen, type Pointer, ptr, toArrayBuffer } from "bun:ffi";
import { execSync } from "node:child_process";

// ── Types ────────────────────────────────────────────────────────

export interface OffsetProfile {
  label: string;
  duelPhase: number;
  turnIndicator: number;
  sceneId: number;
  terrain: number;
  duelistId: number;
  lpP1: number;
  lpP2: number;
  fusionCounter: number;
  /** Absolute address of total-cards-dealt counter (u8). */
  cardsDealt: number;
  /** Absolute address of hand slot index array (u8[5], 0xFF = card left hand). */
  handSlots: number;
  /**
   * Rank counter base: 6 contiguous u8 counters starting here.
   * [turns, effAttacks, defWins, faceDown, pureMagic, traps]
   * Derived: fusionCounter-7 for NTSC-U (0x0E9FF1).
   */
  rankStatsBase: number;
  /** Equip magic counter (u8), right after fusion counter. */
  equipCounter: number;
}

export interface SharedMemoryMapping {
  handle: Pointer;
  viewPtr: Pointer;
  view: DataView;
  pid: number;
}

interface CardSlot {
  cardId: number;
  atk: number;
  def: number;
  status: number;
}

export interface GameState {
  sceneId: number | null;
  duelPhase: number | null;
  turnIndicator: number | null;
  hand: CardSlot[];
  field: CardSlot[];
  lp: [number, number] | null;
  fusions: number | null;
  terrain: number | null;
  duelistId: number | null;
  /** Hand slot indices (u8[5]): sequential deal index or 0xFF = card left hand. */
  handSlots: number[] | null;
  /** Player's shuffled deck during a duel (40 card IDs, 0 = empty slot). */
  shuffledDeck: number[];
  trunk: number[];
  deckDefinition: number[];
  /** Opponent hand card slots (same 0x1C-byte struct as player). */
  opponentHand: CardSlot[];
  /** Opponent field card slots. */
  opponentField: CardSlot[];
  /** Opponent hand slot indices (u8[5]): same as player handSlots but at lpP2+offset. */
  opponentHandSlots: number[] | null;
  /** CPU's shuffled deck during a duel (40 card IDs, 0 = empty slot). */
  cpuShuffledDeck: number[];
  /** Free-duel duelist unlock bitfield (raw bytes at 0x1D06F4). */
  duelistUnlock: number[];
  /**
   * 10 rank scoring counters, ordered to match the engine's RankFactors:
   * [turns, effAttacks, defWins, faceDown, fusions, equips, pureMagic, traps, remainingCards, remainingLp]
   * null when profile is unavailable.
   */
  rankCounters: number[] | null;
}

// ── Windows constants ──────────────────────────────────────────────
const FILE_MAP_READ = 0x0004;

// ── Universal PS1 RAM offsets (same across all game versions) ─────
const HAND_BASE = 0x1a7ae4;
const HAND_STRIDE = 0x1c;
const HAND_SLOTS = 5;
const FIELD_BASE = 0x1a7b70;
const FIELD_SLOTS = 5;

// Opponent card zones — verified via diagnostic probe (2026-03-28).
// Layout: each player occupies 15 slot positions (hand + field + unknown zone),
// with 0x1C (28) bytes per slot. Player starts at 0x1A7AE4, opponent at 0x1A7C88.
// The 5-slot gap between player field end and opponent hand (0x1A7BFC) is unused/unknown.
const OPPONENT_HAND_BASE = 0x1a7c88;
const OPPONENT_FIELD_BASE = 0x1a7c88 + 5 * 0x1c; // 0x1A7D14

const DECK_DEF_OFFSET = 0x1d0200; // Player's deck definition (40 × uint16 LE)
const DECK_DEF_CARDS = 40;
const COLLECTION_OFFSET = 0x1d0250; // Cards owned (722 bytes, 1 per card ID)
const COLLECTION_SIZE = 722;
const DUELIST_UNLOCK_OFFSET = 0x1d06f4; // Free-duel duelist unlock bitfield (Data Crystal)
const DUELIST_UNLOCK_BYTES = 8; // 4 documented + 4 extra for safety (39 duelists need 5 bytes)
const PLAYER_SHUFFLED_DECK_OFFSET = 0x177fe8; // Shuffled deck during duel
const CPU_SHUFFLED_DECK_OFFSET = 0x178038; // CPU shuffled deck during duel

export const CARD_STATS_OFFSET = 0x1d4244;
export const CARD_STATS_SIZE = 722 * 4; // 2888 bytes — full card stats table
const FINGERPRINT_BYTES = 16;

const PS1_RAM_SIZE = 0x200000;

// ── Version-dependent offset profiles ─────────────────────────────

/** Default profile: NTSC-U (SLUS-01411) — also used by RP mod. */
export const DEFAULT_PROFILE: OffsetProfile = {
  label: "NTSC-U",
  duelPhase: 0x09b23a,
  turnIndicator: 0x09b1d5,
  sceneId: 0x09b26c,
  terrain: 0x09b364,
  duelistId: 0x09b361,
  lpP1: 0x0ea004,
  lpP2: 0x0ea024,
  fusionCounter: 0x0e9ff8,
  cardsDealt: 0x0ea008, // lpP1+0x04 (NTSC-U has 2 LP copies before dealt)
  handSlots: 0x0ea00a, // lpP1+0x06
  rankStatsBase: 0x0e9ff1, // fusionCounter-7: [turns, effAtk, defWin, faceDown, pureMagic, traps]
  equipCounter: 0x0e9ff9, // fusionCounter+1
};

/**
 * PAL profile: SLES-039.47 / SLES-039.48 (EU multi-language, including French).
 *
 * The PAL binary has a different compiled layout — both the absolute addresses
 * AND the relative distances between variables differ from NTSC-U.
 * Phase/turn are in one segment (delta +0x132A from NTSC-U), LP in another
 * (delta +0x1286).
 *
 * PAL scene ID is 0 during duels and non-zero on menu screens (opposite of
 * NTSC-U). This still works for resolveEndedPhase(): it records sceneId=0 at
 * duel end and detects the change to non-zero when the user navigates away.
 *
 * Terrain is not yet mapped — all tested duels had neutral terrain, making it
 * impossible to identify via diffing. Needs a duel with non-Normal terrain.
 *
 * See docs/memory/pal-remaining-addresses.md for investigation evidence.
 */
export const PAL_PROFILE: OffsetProfile = {
  label: "PAL",
  duelPhase: 0x09c564,
  turnIndicator: 0x09c504,
  sceneId: 0x09c4c2, // phase-0xA2, uint16: 0 in duel, non-zero on menus
  terrain: 0, // not yet discovered — needs non-Normal terrain duel
  duelistId: 0x09c6f3, // phase+0x18F, uint8
  lpP1: 0x0eb28a,
  lpP2: 0x0eb2aa,
  fusionCounter: 0x0eb27f, // lpP1-0x0B, uint8
  cardsDealt: 0x0eb290, // lpP1+0x06 (PAL has 3 LP copies before dealt)
  handSlots: 0x0eb292, // lpP1+0x08
  rankStatsBase: 0x0eb278, // fusionCounter-7
  equipCounter: 0x0eb280, // fusionCounter+1
};

/**
 * Validate that a profile's LP addresses point to reasonable values.
 * YGO FM LP is 0–9999 in all known versions (8000 vanilla, 9900 RP).
 * Values above that indicate the addresses are wrong for this binary.
 */
const MAX_VALID_LP = 9999;
export function validateProfile(view: DataView, profile: OffsetProfile): boolean {
  const lp1 = readU16(view, profile.lpP1);
  const lp2 = readU16(view, profile.lpP2);
  return lp1 <= MAX_VALID_LP && lp2 <= MAX_VALID_LP;
}

/**
 * Check whether the game is loaded in shared memory.
 * Uses the mod fingerprint (card stats table) which is always non-zero
 * when the game is running, regardless of version.
 */
const ALL_ZERO_FP = "0".repeat(FINGERPRINT_BYTES * 2);
export function isGameLoaded(view: DataView): boolean {
  return readModFingerprint(view) !== ALL_ZERO_FP;
}

/**
 * Read a uint8 at a given offset (exported for serve.ts diagnostics).
 */
export function peekU8(view: DataView, offset: number): number {
  return readU8(view, offset);
}

/**
 * Read a uint16 LE at a given offset (exported for serve.ts diagnostics).
 */
export function peekU16(view: DataView, offset: number): number {
  return readU16(view, offset);
}

/**
 * Scan RAM for version-dependent offsets by looking for structural patterns.
 * Called once during a duel start (when LP = starting value) to discover
 * the correct addresses for an unknown game binary.
 *
 * Strategy: find two uint16 values equal to `startingLP` spaced exactly
 * 0x20 apart (the LP_P1/LP_P2 stride). Then derive the other offsets
 * by applying the same delta from the NTSC-U defaults.
 *
 * Returns a candidate profile or null if no match found.
 */
export function scanForOffsets(view: DataView, startingLP: number): OffsetProfile | null {
  const LpStride = 0x20;
  const candidates: number[] = [];

  // Scan game-state variable range (0x080000–0x120000)
  for (let off = 0x080000; off <= 0x120000 - LpStride; off += 2) {
    if (readU16(view, off) === startingLP && readU16(view, off + LpStride) === startingLP) {
      candidates.push(off);
    }
  }

  if (candidates.length === 0) return null;

  // Try each candidate: compute delta from NTSC-U LP, derive full profile, validate
  const lpDelta = (lpP1: number) => lpP1 - DEFAULT_PROFILE.lpP1;

  for (const lpP1 of candidates) {
    const d = lpDelta(lpP1);
    // Fusion counter is in the same segment as LP (0x0Exxxx)
    const fusionCounter = DEFAULT_PROFILE.fusionCounter + d;
    // The 0x09Bxxx group (phase, scene, turn, terrain, duelist) may have
    // a different delta. Try the same delta first.
    const candidate: OffsetProfile = {
      label: `discovered (delta=0x${d.toString(16)})`,
      duelPhase: DEFAULT_PROFILE.duelPhase + d,
      turnIndicator: DEFAULT_PROFILE.turnIndicator + d,
      sceneId: DEFAULT_PROFILE.sceneId + d,
      terrain: DEFAULT_PROFILE.terrain + d,
      duelistId: DEFAULT_PROFILE.duelistId + d,
      lpP1,
      lpP2: lpP1 + LpStride,
      fusionCounter,
      cardsDealt: DEFAULT_PROFILE.cardsDealt + d,
      handSlots: DEFAULT_PROFILE.handSlots + d,
      rankStatsBase: DEFAULT_PROFILE.rankStatsBase + d,
      equipCounter: DEFAULT_PROFILE.equipCounter + d,
    };

    // Quick validation: duel phase should be a recognized value (1–13) during a duel
    const phase = readU8(view, candidate.duelPhase);
    if (phase >= 0x01 && phase <= 0x0d) {
      console.log(
        `scanForOffsets: LP at 0x${lpP1.toString(16)}, delta=0x${d.toString(16)}, phase=0x${phase.toString(16).padStart(2, "0")} → valid`,
      );
      return candidate;
    }
  }

  // Log all candidates and dump diagnostic data for manual investigation
  console.log(
    `scanForOffsets: ${candidates.length} LP candidates but none had valid phase: ${candidates.map((c) => `0x${c.toString(16)}`).join(", ")}`,
  );

  // LP and phase segments have different deltas in PAL.
  // Scan for phase independently: during HAND_SELECT, phase=0x04 and
  // turn indicator=0x00 at a fixed relative offset (0x65 bytes before phase).
  const phaseCandidates: Array<{ offset: number; duelistId: number; sceneId: number }> = [];

  for (let off = 0x090000; off < 0x0b0000; off++) {
    if (readU8(view, off) !== 0x04) continue; // HAND_SELECT
    if (readU8(view, off - turnDist) !== 0x00) continue; // player's turn
    const dId = readU8(view, off + duelistDist);
    if (dId > 50) continue; // plausible duelist ID
    phaseCandidates.push({
      offset: off,
      duelistId: dId,
      sceneId: readU16(view, off + (DEFAULT_PROFILE.sceneId - DEFAULT_PROFILE.duelPhase)),
    });
  }

  if (phaseCandidates.length > 0) {
    console.log("scanForOffsets: independent phase scan found candidates:");
    for (const c of phaseCandidates) {
      const d = c.offset - DEFAULT_PROFILE.duelPhase;
      console.log(
        `  phase=0x04 at 0x${c.offset.toString(16)} (delta=0x${d.toString(16)}), ` +
          `duelistId=${c.duelistId}, sceneId=0x${c.sceneId.toString(16).padStart(4, "0")}`,
      );
    }
    if (phaseCandidates.length === 1) {
      const pc = phaseCandidates[0];
      const lpP1 = candidates[0];
      if (!pc || lpP1 === undefined) return null;
      return {
        label: "PAL-discovered",
        duelPhase: pc.offset,
        turnIndicator: pc.offset - turnDist,
        sceneId: pc.offset + (DEFAULT_PROFILE.sceneId - DEFAULT_PROFILE.duelPhase),
        terrain: pc.offset + (DEFAULT_PROFILE.terrain - DEFAULT_PROFILE.duelPhase),
        duelistId: pc.offset + duelistDist,
        lpP1,
        lpP2: lpP1 + 0x20,
        fusionCounter: lpP1 - (DEFAULT_PROFILE.lpP1 - DEFAULT_PROFILE.fusionCounter),
        cardsDealt: lpP1 + (PAL_PROFILE.cardsDealt - PAL_PROFILE.lpP1),
        handSlots: lpP1 + (PAL_PROFILE.handSlots - PAL_PROFILE.lpP1),
        rankStatsBase: lpP1 - (PAL_PROFILE.lpP1 - PAL_PROFILE.rankStatsBase),
        equipCounter: lpP1 - (PAL_PROFILE.lpP1 - PAL_PROFILE.equipCounter),
      };
    }
  } else {
    console.log("scanForOffsets: no phase candidates found in 0x090000-0x0B0000");
  }

  return null;
}

// ── Relative offsets between duel-state variables ─────────────────
// NOTE: These NTSC-U relative distances are used by scanForPhaseStructurally()
// for auto-detection of unknown binaries. They do NOT hold for PAL (PAL offsets
// differ wildly: sceneId is phase-0xA2 vs phase+0x32, duelistId is phase+0x18F
// vs phase+0x127, etc.). PAL is detected by disc serial, not structural scan.
const turnDist = DEFAULT_PROFILE.duelPhase - DEFAULT_PROFILE.turnIndicator; // 0x65
const sceneDist = DEFAULT_PROFILE.sceneId - DEFAULT_PROFILE.duelPhase; // 0x32
const terrainDist = DEFAULT_PROFILE.terrain - DEFAULT_PROFILE.duelPhase; // 0x12A
const duelistDist = DEFAULT_PROFILE.duelistId - DEFAULT_PROFILE.duelPhase; // 0x127
const lpStride = 0x20; // distance between LP_P1 and LP_P2

/**
 * Scan for the duel-phase byte using multi-criteria structural matching.
 *
 * The duel-state variables (phase, turn indicator, scene ID, terrain,
 * duelist ID) live at fixed relative offsets from each other across all
 * known game binaries. We sweep the likely address range and check all
 * constraints simultaneously.  False-positive rate is ~0.4 per 256 KB,
 * so this typically returns 0–2 candidates.
 *
 * @returns Array of { offset, phase, turn, terrain, duelist, scene }.
 */
export function scanForPhaseStructurally(view: DataView) {
  const scanStart = 0x080000;
  const scanEnd = 0x0c0000;
  const candidates: Array<{
    offset: number;
    phase: number;
    turn: number;
    terrain: number;
    duelist: number;
    scene: number;
  }> = [];

  for (let off = scanStart + turnDist; off < scanEnd - terrainDist; off++) {
    const phase = readU8(view, off);
    if (phase < 0x01 || phase > 0x0d) continue;

    const turn = readU8(view, off - turnDist);
    if (turn > 1) continue; // 0 = player, 1 = opponent

    const terrain = readU8(view, off + terrainDist);
    if (terrain > 6) continue; // 7 terrain types (0–6)

    const duelist = readU8(view, off + duelistDist);
    if (duelist > 50) continue; // ~40 duelists in the game

    const scene = readU16(view, off + sceneDist);
    if (scene === 0 || scene === 0xffff) continue;

    candidates.push({ offset: off, phase, turn, terrain, duelist, scene });
  }

  return candidates;
}

/**
 * Scan for LP pairs: two uint16 LE values at lpStride (0x20) apart,
 * both in 1–9999. Optionally filter to a specific value.
 *
 * Returns array of { offset, lp1, lp2 }.
 */
export function scanForLpPairs(
  view: DataView,
  {
    exactValue = null,
    rangeStart = 0x080000,
    rangeEnd = 0x120000,
  }: { exactValue?: number | null; rangeStart?: number; rangeEnd?: number } = {},
) {
  const candidates: Array<{ offset: number; lp1: number; lp2: number }> = [];

  for (let off = rangeStart; off <= rangeEnd - lpStride; off += 2) {
    const v1 = readU16(view, off);
    const v2 = readU16(view, off + lpStride);
    if (v1 < 1 || v1 > 9999 || v2 < 1 || v2 > 9999) continue;
    if (exactValue !== null && exactValue !== undefined && (v1 !== exactValue || v2 !== exactValue))
      continue;
    candidates.push({ offset: off, lp1: v1, lp2: v2 });
  }

  return candidates;
}

/**
 * Build a complete offset profile from a discovered phase address and LP address.
 * Uses the known relative distances from NTSC-U.
 */
export function buildProfileFromDiscovery(
  phaseAddr: number,
  lpP1Addr: number | null,
): OffsetProfile {
  return {
    label: `discovered (phase=0x${phaseAddr.toString(16)}, lp=0x${(lpP1Addr || 0).toString(16)})`,
    duelPhase: phaseAddr,
    turnIndicator: phaseAddr - turnDist,
    sceneId: phaseAddr + sceneDist,
    terrain: phaseAddr + terrainDist,
    duelistId: phaseAddr + duelistDist,
    lpP1: lpP1Addr || 0,
    lpP2: lpP1Addr ? lpP1Addr + lpStride : 0,
    fusionCounter: lpP1Addr ? lpP1Addr - (DEFAULT_PROFILE.lpP1 - DEFAULT_PROFILE.fusionCounter) : 0,
    cardsDealt: lpP1Addr ? lpP1Addr + (DEFAULT_PROFILE.cardsDealt - DEFAULT_PROFILE.lpP1) : 0,
    handSlots: lpP1Addr ? lpP1Addr + (DEFAULT_PROFILE.handSlots - DEFAULT_PROFILE.lpP1) : 0,
    rankStatsBase: lpP1Addr ? lpP1Addr - (DEFAULT_PROFILE.lpP1 - DEFAULT_PROFILE.rankStatsBase) : 0,
    equipCounter: lpP1Addr ? lpP1Addr - (DEFAULT_PROFILE.lpP1 - DEFAULT_PROFILE.equipCounter) : 0,
  };
}

// ── Load Windows kernel32 via bun:ffi ────────────────────────────

const { symbols: k32 } = dlopen("kernel32.dll", {
  OpenFileMappingW: {
    args: ["u32", "i32", "ptr"],
    returns: "ptr",
  },
  MapViewOfFile: {
    args: ["ptr", "u32", "u32", "u32", "u64"],
    returns: "ptr",
  },
  UnmapViewOfFile: {
    args: ["ptr"],
    returns: "i32",
  },
  CloseHandle: {
    args: ["ptr"],
    returns: "i32",
  },
  GetLastError: {
    args: [],
    returns: "u32",
  },
});

/** Encode a JavaScript string as a null-terminated UTF-16LE buffer for Win32 W APIs. */
function encodeWideString(str: string): Buffer {
  const buf = Buffer.alloc((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) {
    buf.writeUInt16LE(str.charCodeAt(i), i * 2);
  }
  return buf;
}

// ── Memory read helpers ────────────────────────────────────────────
function readU16(view: DataView, offset: number): number {
  return view.getUint16(offset, true); // little-endian
}
function readU8(view: DataView, offset: number): number {
  return view.getUint8(offset);
}
function readU16Array(view: DataView, offset: number, count: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) result.push(view.getUint16(offset + i * 2, true));
  return result;
}
function readU8Array(view: DataView, offset: number, count: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) result.push(view.getUint8(offset + i));
  return result;
}
function readCardSlot(view: DataView, base: number, index: number): CardSlot {
  const offset = base + index * HAND_STRIDE;
  const equipBoost = readU16(view, offset + 0x06);
  return {
    cardId: readU16(view, offset),
    atk: readU16(view, offset + 0x02) + equipBoost,
    def: readU16(view, offset + 0x04) + equipBoost,
    status: readU8(view, offset + 0x0b),
  };
}

// ── Exported functions ─────────────────────────────────────────────
export async function findDuckStationPids(): Promise<number[]> {
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq duckstation*" /FO CSV /NH', {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      cwd: "C:\\",
    });
    const pids: number[] = [];
    for (const line of output.split("\n")) {
      const match = line.match(/"[^"]*","(\d+)"/);
      if (match) pids.push(Number(match[1]));
    }
    return pids;
  } catch {
    return [];
  }
}

export function openSharedMemory(pid: number, { quiet = false } = {}): SharedMemoryMapping | null {
  const name = `duckstation_${pid}`;
  const nameBuf = encodeWideString(name);
  const handle = k32.OpenFileMappingW(FILE_MAP_READ, 0, ptr(nameBuf));
  if (!handle) {
    if (!quiet) console.error(`OpenFileMappingW("${name}") failed, error=${k32.GetLastError()}`);
    return null;
  }
  const viewPtr = k32.MapViewOfFile(handle, FILE_MAP_READ, 0, 0, PS1_RAM_SIZE);
  if (!viewPtr) {
    if (!quiet) console.error(`MapViewOfFile failed, error=${k32.GetLastError()}`);
    k32.CloseHandle(handle);
    return null;
  }
  const view = new DataView(toArrayBuffer(viewPtr, 0, PS1_RAM_SIZE));
  console.log(`Mapped shared memory for PID ${pid} (${name})`);
  return { handle, viewPtr, view, pid };
}

/** Re-create the DataView from the existing mapped pointer (refreshes stale toArrayBuffer snapshots). */
export function refreshView(m: SharedMemoryMapping): void {
  m.view = new DataView(toArrayBuffer(m.viewPtr, 0, PS1_RAM_SIZE));
}

export function closeSharedMemory(mapping: SharedMemoryMapping): void {
  if (mapping.viewPtr) k32.UnmapViewOfFile(mapping.viewPtr);
  if (mapping.handle) k32.CloseHandle(mapping.handle);
}

/**
 * Read raw game state from mapped PS1 RAM.
 * Returns uninterpreted values — the webapp handles all game logic.
 */
export function readGameState(view: DataView, profile: OffsetProfile | null): GameState {
  const hand: CardSlot[] = [];
  for (let i = 0; i < HAND_SLOTS; i++) hand.push(readCardSlot(view, HAND_BASE, i));
  const field: CardSlot[] = [];
  for (let i = 0; i < FIELD_SLOTS; i++) field.push(readCardSlot(view, FIELD_BASE, i));

  // Opponent card zones (same struct layout as player)
  const opponentHand: CardSlot[] = [];
  for (let i = 0; i < HAND_SLOTS; i++) opponentHand.push(readCardSlot(view, OPPONENT_HAND_BASE, i));
  const opponentField: CardSlot[] = [];
  for (let i = 0; i < FIELD_SLOTS; i++)
    opponentField.push(readCardSlot(view, OPPONENT_FIELD_BASE, i));

  // Opponent hand slot tracking: same relative offset from lpP2 as player's from lpP1
  const opponentHandSlots = profile?.handSlots
    ? readU8Array(view, profile.lpP2 + (profile.handSlots - profile.lpP1), HAND_SLOTS)
    : null;

  // Helper: read from profile offset, returning null if offset is 0 (unmapped)
  const u8 = (off: number | undefined): number | null =>
    profile && off ? readU8(view, off) : null;
  const u16 = (off: number | undefined): number | null =>
    profile && off ? readU16(view, off) : null;

  return {
    sceneId: u16(profile?.sceneId),
    duelPhase: u8(profile?.duelPhase),
    turnIndicator: u8(profile?.turnIndicator),
    hand,
    field,
    lp: profile?.lpP1 ? [readU16(view, profile.lpP1), readU16(view, profile.lpP2)] : null,
    fusions: u8(profile?.fusionCounter),
    terrain: u8(profile?.terrain),
    duelistId: u8(profile?.duelistId),
    handSlots: profile?.handSlots ? readU8Array(view, profile.handSlots, HAND_SLOTS) : null,
    shuffledDeck: readShuffledDeck(view),
    trunk: readCollection(view),
    deckDefinition: readDeckDefinition(view),
    opponentHand,
    opponentField,
    opponentHandSlots,
    cpuShuffledDeck: readCpuShuffledDeck(view),
    rankCounters: profile?.rankStatsBase ? readRankCounters(view, profile) : null,
    duelistUnlock: readDuelistUnlock(view),
  };
}

/**
 * Read the player's card collection (722 bytes, one per card ID 1–722).
 * Each byte = number of copies owned (expected 0–3).
 */
export function readCollection(view: DataView): number[] {
  return readU8Array(view, COLLECTION_OFFSET, COLLECTION_SIZE);
}

/**
 * Read the free-duel duelist unlock bitfield (8 bytes at 0x1D06F4).
 */
export function readDuelistUnlock(view: DataView): number[] {
  return readU8Array(view, DUELIST_UNLOCK_OFFSET, DUELIST_UNLOCK_BYTES);
}

/**
 * Read the player's deck definition (40 card IDs as uint16 LE).
 */
export function readDeckDefinition(view: DataView): number[] {
  return readU16Array(view, DECK_DEF_OFFSET, DECK_DEF_CARDS);
}

/**
 * Read the player's shuffled deck during a duel (40 card IDs).
 */
export function readShuffledDeck(view: DataView): number[] {
  return readU16Array(view, PLAYER_SHUFFLED_DECK_OFFSET, DECK_DEF_CARDS);
}

/**
 * Read the CPU's shuffled deck during a duel (40 card IDs).
 */
export function readCpuShuffledDeck(view: DataView): number[] {
  return readU16Array(view, CPU_SHUFFLED_DECK_OFFSET, DECK_DEF_CARDS);
}

/**
 * Read the 10 rank scoring counters from RAM.
 *
 * The game stores duel stats in two groups:
 * - 6 contiguous u8 at rankStatsBase: [turns, effAttacks, defWins, faceDown, pureMagic, traps]
 * - fusionCounter (u8), equipCounter (u8): separate addresses
 * - cardsDealt (u8), lpP1 (u16): in the LP block
 *
 * Returns them in the engine's RankFactors order:
 * [turns, effAttacks, defWins, faceDown, fusions, equips, pureMagic, traps, remainingCards, remainingLp]
 */
function readRankCounters(view: DataView, profile: OffsetProfile): number[] {
  const base = readU8Array(view, profile.rankStatsBase, 6); // turns, effAtk, defWin, faceDown, pureMagic, traps
  const fusions = readU8(view, profile.fusionCounter);
  const equips = readU8(view, profile.equipCounter);
  const cardsDealt = readU8(view, profile.cardsDealt);
  const lp = readU16(view, profile.lpP1);

  return [
    base[0] ?? 0, // turns
    base[1] ?? 0, // effectiveAttacks
    base[2] ?? 0, // defensiveWins
    base[3] ?? 0, // faceDownPlays
    fusions, // fusionsInitiated
    equips, // equipMagicUsed
    base[4] ?? 0, // pureMagicUsed
    base[5] ?? 0, // trapsTriggered
    40 - cardsDealt, // remainingCards (convert dealt→remaining)
    lp, // remainingLp
  ];
}

/**
 * Read raw bytes as hex string for memory exploration.
 */
export function readRawHex(view: DataView, offset: number, length: number): string {
  const bytes = readU8Array(view, offset, length);
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

/**
 * Read the full card stats table (2888 bytes) from RAM.
 * Returns a copy (snapshot) — safe to use after shared memory changes.
 */
export function readCardStats(view: DataView): Uint8Array {
  return new Uint8Array(
    view.buffer.slice(
      view.byteOffset + CARD_STATS_OFFSET,
      view.byteOffset + CARD_STATS_OFFSET + CARD_STATS_SIZE,
    ),
  );
}

/**
 * Read a mod fingerprint from the card stats table in RAM.
 * The first 16 bytes (4 card stat entries) uniquely identify each mod.
 */
export function readModFingerprint(view: DataView): string {
  let hex = "";
  for (let i = 0; i < FINGERPRINT_BYTES; i++) {
    hex += view
      .getUint8(CARD_STATS_OFFSET + i)
      .toString(16)
      .padStart(2, "0");
  }
  return hex;
}

// ── Field bonus table ────────────────────────────────────────────
// The game stores a 120-byte lookup table that maps (monsterType, terrain)
// to an ATK/DEF bonus. Layout: 20 monster types × 6 non-Normal terrains,
// stored in type-major order. Each signed byte is the bonus divided by 10
// (e.g., 50 = +500, -50 = -500, 0 = neutral).
//
// Terrains 1–6 = Forest, Wasteland, Mountain, Sogen, Umi, Yami.
// Index formula: type * 6 + (terrain - 1).
//
// The function at the call site does: return table[offset] * 10.

const FIELD_BONUS_TABLE_SIZE = 120; // 20 types × 6 terrains
const FIELD_BONUS_VALID_VALUES = new Set([0, 50, -50]);
const FIELD_BONUS_MIN_NONZERO = 10; // at least 10 bonuses/maluses expected

/**
 * Scan the EXE code+data section in RAM for the field bonus table.
 * Returns the RAM offset of the table, or null if not found.
 *
 * Signature: 120 contiguous signed bytes where every value is 0, 50, or -50,
 * with at least 10 non-zero entries.
 */
export function scanFieldBonusTable(view: DataView): number | null {
  // EXE occupies physical RAM 0x010000–0x1E0000
  const scanStart = 0x010000;
  const scanEnd = 0x1e0000 - FIELD_BONUS_TABLE_SIZE;

  for (let off = scanStart; off < scanEnd; off++) {
    let nonZero = 0;
    let valid = true;

    for (let i = 0; i < FIELD_BONUS_TABLE_SIZE; i++) {
      const v = view.getInt8(off + i);
      if (!FIELD_BONUS_VALID_VALUES.has(v)) {
        valid = false;
        break;
      }
      if (v !== 0) nonZero++;
    }

    if (valid && nonZero >= FIELD_BONUS_MIN_NONZERO) return off;
  }
  return null;
}

/**
 * Read the field bonus table from a known RAM offset.
 * Returns a flat array of 120 actual bonus values (e.g., 500, -500, 0),
 * indexed as type * 6 + (terrain - 1).
 */
export function readFieldBonusTable(view: DataView, offset: number): number[] {
  const table: number[] = [];
  for (let i = 0; i < FIELD_BONUS_TABLE_SIZE; i++) {
    table.push(view.getInt8(offset + i) * 10);
  }
  return table;
}

/**
 * Try to find the game's disc serial (e.g. "SLES_039.48") in PS1 RAM.
 *
 * The PS1 executable filename is embedded in the EXE code/data section
 * loaded into RAM.  We scan the first 512 KB for the ASCII pattern
 * "SLxS_ddd.dd" (NTSC-U SLUS or PAL SLES/SCES).
 *
 * Returns the serial string or null if not found.
 */
const SERIAL_RE = /^S[CL][A-Z]{2}_\d{3}\.\d{2}$/;

export function readGameSerial(view: DataView): string | null {
  const scanLen = 0x80000; // first 512 KB

  for (let i = 0; i < scanLen - 11; i++) {
    // Quick filter: must start with 'S' (0x53)
    if (view.getUint8(i) !== 0x53) continue;
    // Must have 'L' or 'C' at position 1
    const b1 = view.getUint8(i + 1);
    if (b1 !== 0x4c && b1 !== 0x43) continue;

    let candidate = "";
    for (let j = 0; j < 11; j++) {
      candidate += String.fromCharCode(view.getUint8(i + j));
    }
    if (SERIAL_RE.test(candidate)) {
      return candidate;
    }
  }
  return null;
}
