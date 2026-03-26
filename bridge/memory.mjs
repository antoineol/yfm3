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
 */

import koffi from "koffi";

// ── Windows constants ──────────────────────────────────────────────
const FILE_MAP_READ = 0x0004;

// ── Universal PS1 RAM offsets (same across all game versions) ─────
const HAND_BASE = 0x1a7ae4;
const HAND_STRIDE = 0x1c;
const HAND_SLOTS = 5;
const FIELD_BASE = 0x1a7b70;
const FIELD_SLOTS = 5;

const DECK_DEF_OFFSET = 0x1d0200; // Player's deck definition (40 × uint16 LE)
const DECK_DEF_CARDS = 40;
const COLLECTION_OFFSET = 0x1d0250; // Cards owned (722 bytes, 1 per card ID)
const COLLECTION_SIZE = 722;
const PLAYER_SHUFFLED_DECK_OFFSET = 0x177fe8; // Shuffled deck during duel
const _CPU_SHUFFLED_DECK_OFFSET = 0x178038; // eslint-disable-line -- documented for reference

const CARD_STATS_OFFSET = 0x1d4244;
const FINGERPRINT_BYTES = 16;

const PS1_RAM_SIZE = 0x200000;

// ── Version-dependent offset profiles ─────────────────────────────
// Different compiled binaries (NTSC-U vs PAL) place runtime game-state
// variables at different RAM addresses. The profile maps each variable
// to its address for a specific binary.

/** Default profile: NTSC-U (SLUS-01411) — also used by RP mod. */
export const DEFAULT_PROFILE = {
  label: "NTSC-U",
  duelPhase: 0x09b23a,
  turnIndicator: 0x09b1d5,
  sceneId: 0x09b26c,
  terrain: 0x09b364,
  duelistId: 0x09b361,
  lpP1: 0x0ea004,
  lpP2: 0x0ea024,
  fusionCounter: 0x0e9ff8,
};

/**
 * PAL profile: SLES-039.47 / SLES-039.48 (EU multi-language, including French).
 *
 * The PAL binary has a different compiled layout — both the absolute addresses
 * AND the relative distances between variables differ from NTSC-U.
 * Phase/turn are in one segment (delta +0x132A from NTSC-U), LP in another
 * (delta +0x1286).
 *
 * Scene ID, terrain, duelist ID, and fusion counter are not yet mapped for PAL.
 * They are set to 0 so readGameState returns null for those fields.
 * See docs/investigation-duel-memory.md for the plan to find them.
 */
export const PAL_PROFILE = {
  label: "PAL",
  duelPhase: 0x09c564,
  turnIndicator: 0x09c504,
  sceneId: 0, // TODO: not yet discovered
  terrain: 0, // TODO: not yet discovered
  duelistId: 0, // TODO: not yet discovered
  lpP1: 0x0eb28a,
  lpP2: 0x0eb2aa,
  fusionCounter: 0, // TODO: not yet discovered
};

/**
 * Validate that a profile's LP addresses point to reasonable values.
 * YGO FM LP is 0–9999 in all known versions (8000 vanilla, 9900 RP).
 * Values above that indicate the addresses are wrong for this binary.
 */
const MAX_VALID_LP = 9999;
export function validateProfile(view, profile) {
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
export function isGameLoaded(view) {
  return readModFingerprint(view) !== ALL_ZERO_FP;
}

/**
 * Read a uint8 at a given offset (exported for serve.mjs diagnostics).
 */
export function peekU8(view, offset) {
  return readU8(view, offset);
}

/**
 * Read a uint16 LE at a given offset (exported for serve.mjs diagnostics).
 */
export function peekU16(view, offset) {
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
export function scanForOffsets(view, startingLP) {
  const LpStride = 0x20;
  const candidates = [];

  // Scan game-state variable range (0x080000–0x120000)
  for (let off = 0x080000; off <= 0x120000 - LpStride; off += 2) {
    if (readU16(view, off) === startingLP && readU16(view, off + LpStride) === startingLP) {
      candidates.push(off);
    }
  }

  if (candidates.length === 0) return null;

  // Try each candidate: compute delta from NTSC-U LP, derive full profile, validate
  const lpDelta = (lpP1) => lpP1 - DEFAULT_PROFILE.lpP1;

  for (const lpP1 of candidates) {
    const d = lpDelta(lpP1);
    // Fusion counter is in the same segment as LP (0x0Exxxx)
    const fusionCounter = DEFAULT_PROFILE.fusionCounter + d;
    // The 0x09Bxxx group (phase, scene, turn, terrain, duelist) may have
    // a different delta. Try the same delta first.
    const candidate = {
      label: `discovered (delta=0x${d.toString(16)})`,
      duelPhase: DEFAULT_PROFILE.duelPhase + d,
      turnIndicator: DEFAULT_PROFILE.turnIndicator + d,
      sceneId: DEFAULT_PROFILE.sceneId + d,
      terrain: DEFAULT_PROFILE.terrain + d,
      duelistId: DEFAULT_PROFILE.duelistId + d,
      lpP1,
      lpP2: lpP1 + LpStride,
      fusionCounter,
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
  const turnDist = DEFAULT_PROFILE.duelPhase - DEFAULT_PROFILE.turnIndicator; // 0x65
  const duelistDist = DEFAULT_PROFILE.duelistId - DEFAULT_PROFILE.duelPhase; // 0x127
  const phaseCandidates = [];

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
      };
    }
  } else {
    console.log("scanForOffsets: no phase candidates found in 0x090000-0x0B0000");
  }

  return null;
}

// ── Relative offsets between duel-state variables ─────────────────
// These distances are preserved across NTSC-U and PAL because the
// variables live in the same struct/data segment.  Only the segment's
// base address changes between binaries.
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
export function scanForPhaseStructurally(view) {
  const scanStart = 0x080000;
  const scanEnd = 0x0c0000;
  const candidates = [];

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
  view,
  { exactValue = null, rangeStart = 0x080000, rangeEnd = 0x120000 } = {},
) {
  const candidates = [];

  for (let off = rangeStart; off <= rangeEnd - lpStride; off += 2) {
    const v1 = readU16(view, off);
    const v2 = readU16(view, off + lpStride);
    if (v1 < 1 || v1 > 9999 || v2 < 1 || v2 > 9999) continue;
    if (exactValue !== null && (v1 !== exactValue || v2 !== exactValue)) continue;
    candidates.push({ offset: off, lp1: v1, lp2: v2 });
  }

  return candidates;
}

/**
 * Build a complete offset profile from a discovered phase address and LP address.
 * Uses the known relative distances from NTSC-U.
 */
export function buildProfileFromDiscovery(phaseAddr, lpP1Addr) {
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
  };
}

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

// ── Memory read helpers ────────────────────────────────────────────
function readU16(view, offset) {
  return koffi.decode(view, offset, "uint16");
}
function readU8(view, offset) {
  return koffi.decode(view, offset, "uint8");
}
function readU16Array(view, offset, count) {
  const result = [];
  for (let i = 0; i < count; i++) result.push(readU16(view, offset + i * 2));
  return result;
}
function readU8Array(view, offset, count) {
  const result = [];
  for (let i = 0; i < count; i++) result.push(readU8(view, offset + i));
  return result;
}
function readCardSlot(view, base, index) {
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
export async function findDuckStationPids() {
  const { execSync } = await import("node:child_process");
  try {
    const output = execSync('tasklist /FI "IMAGENAME eq duckstation*" /FO CSV /NH', {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      cwd: "C:\\",
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

export function openSharedMemory(pid, { quiet = false } = {}) {
  const name = `duckstation_${pid}`;
  const handle = OpenFileMappingW(FILE_MAP_READ, 0, name);
  if (!handle) {
    if (!quiet) console.error(`OpenFileMappingW("${name}") failed, error=${GetLastError()}`);
    return null;
  }
  const view = MapViewOfFile(handle, FILE_MAP_READ, 0, 0, PS1_RAM_SIZE);
  if (!view) {
    if (!quiet) console.error(`MapViewOfFile failed, error=${GetLastError()}`);
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

/**
 * Read raw game state from mapped PS1 RAM.
 * Returns uninterpreted values — the webapp handles all game logic.
 *
 * @param {*} view - Mapped shared memory view
 * @param {object|null} profile - Version-dependent offset profile.
 *   When null, version-dependent fields (duelPhase, lp, etc.) are null.
 */
export function readGameState(view, profile) {
  const hand = [];
  for (let i = 0; i < HAND_SLOTS; i++) hand.push(readCardSlot(view, HAND_BASE, i));
  const field = [];
  for (let i = 0; i < FIELD_SLOTS; i++) field.push(readCardSlot(view, FIELD_BASE, i));

  // Helper: read from profile offset, returning null if offset is 0 (unmapped)
  const u8 = (off) => (profile && off ? readU8(view, off) : null);
  const u16 = (off) => (profile && off ? readU16(view, off) : null);

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
    trunk: readCollection(view),
    deckDefinition: readDeckDefinition(view),
  };
}

/**
 * Read the player's card collection (722 bytes, one per card ID 1–722).
 * Each byte = number of copies owned (expected 0–3).
 */
export function readCollection(view) {
  return readU8Array(view, COLLECTION_OFFSET, COLLECTION_SIZE);
}

/**
 * Read the player's deck definition (40 card IDs as uint16 LE).
 */
export function readDeckDefinition(view) {
  return readU16Array(view, DECK_DEF_OFFSET, DECK_DEF_CARDS);
}

/**
 * Read the player's shuffled deck during a duel (40 card IDs).
 */
export function readShuffledDeck(view) {
  return readU16Array(view, PLAYER_SHUFFLED_DECK_OFFSET, DECK_DEF_CARDS);
}

/**
 * Read raw bytes as hex string for memory exploration.
 */
export function readRawHex(view, offset, length) {
  const bytes = readU8Array(view, offset, length);
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

/**
 * Read a mod fingerprint from the card stats table in RAM.
 * The first 16 bytes (4 card stat entries) uniquely identify each mod.
 */
export function readModFingerprint(view) {
  const bytes = readU8Array(view, CARD_STATS_OFFSET, FINGERPRINT_BYTES);
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
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

export function readGameSerial(view) {
  const scanLen = 0x80000; // first 512 KB
  const bytes = readU8Array(view, 0, scanLen);

  for (let i = 0; i < bytes.length - 11; i++) {
    // Quick filter: must start with 'S' (0x53)
    if (bytes[i] !== 0x53) continue;
    // Must have 'L' or 'C' at position 1
    const b1 = bytes[i + 1];
    if (b1 !== 0x4c && b1 !== 0x43) continue;

    const candidate = String.fromCharCode(...bytes.slice(i, i + 11));
    if (SERIAL_RE.test(candidate)) {
      return candidate;
    }
  }
  return null;
}
