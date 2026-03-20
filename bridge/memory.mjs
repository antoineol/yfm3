/**
 * DuckStation shared memory reader for Windows.
 *
 * Hand detection strategy (simplified):
 *   The 28-byte card structs at 0x1A7AE4 are only reliably cleaned up
 *   during the player's turn at phases 0x02 (cleanup), 0x03 (draw),
 *   and 0x04 (hand selection). During other phases (field play, fusion,
 *   battle, opponent turn), consumed materials keep status=0x80 and are
 *   indistinguishable from genuine hand cards.
 *
 *   We report a `handReliable` flag so the UI can freeze the display
 *   during unreliable phases and show a phase indicator instead.
 */

import koffi from "koffi";

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

// From RetroAchievements code notes + Data Crystal
const DUEL_PHASE_OFFSET = 0x09b23a;
const TURN_INDICATOR_OFFSET = 0x09b1d5;
const FUSION_COUNTER_OFFSET = 0x0e9ff8;
const TERRAIN_OFFSET = 0x09b364;
const DUELIST_ID_OFFSET = 0x09b361;

const PS1_RAM_SIZE = 0x200000;

// ── Status byte flags (at +0x0B in card struct) ────────────────────
const STATUS_PRESENT = 0x80;
const STATUS_TRANSITIONING = 0x10;

// Duel phases where hand data is reliable (player turn only)
const PHASE_CLEANUP = 0x02;
const PHASE_DRAW = 0x03;
const PHASE_HAND_SELECT = 0x04;
// Other known phases (for UI display)
const PHASE_FIELD = 0x05;
const PHASE_FUSION = 0x07;
const PHASE_FUSION_RESOLVE = 0x08;
const PHASE_BATTLE = 0x09;

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
function readCardSlot(view, base, index) {
  const offset = base + index * HAND_STRIDE;
  return {
    cardId: readU16(view, offset),
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

/**
 * Read the full game state from mapped PS1 RAM.
 */
export function readGameState(view) {
  const sceneId = readU16(view, SCENE_ID_OFFSET);
  const duelPhase = readU8(view, DUEL_PHASE_OFFSET);
  const turnIndicator = readU8(view, TURN_INDICATOR_OFFSET);

  // Read all hand and field slots
  const handSlots = [];
  for (let i = 0; i < HAND_SLOTS; i++) handSlots.push(readCardSlot(view, HAND_BASE, i));
  const fieldSlots = [];
  for (let i = 0; i < FIELD_SLOTS; i++) fieldSlots.push(readCardSlot(view, FIELD_BASE, i));

  // Build card ID lists from status-byte filtering
  const hand = [];
  for (const s of handSlots) {
    const present = (s.status & STATUS_PRESENT) !== 0;
    const transitioning = (s.status & STATUS_TRANSITIONING) !== 0;
    if (s.cardId > 0 && present && !transitioning) {
      hand.push(s.cardId);
    }
  }
  const field = fieldSlots
    .filter((s) => s.cardId > 0 && (s.status & STATUS_PRESENT) !== 0)
    .map((s) => s.cardId);

  // Hand data is reliable only during the player's turn at specific phases
  const isPlayerTurn = turnIndicator === 0;
  const isReliablePhase =
    duelPhase === PHASE_CLEANUP || duelPhase === PHASE_DRAW || duelPhase === PHASE_HAND_SELECT;
  const handReliable = isPlayerTurn && isReliablePhase;

  // Determine the game phase label for UI display
  let phase;
  if (!isPlayerTurn) {
    phase = "opponent";
  } else if (duelPhase === PHASE_HAND_SELECT) {
    phase = "hand";
  } else if (duelPhase === PHASE_DRAW || duelPhase === PHASE_CLEANUP) {
    phase = "draw";
  } else if (duelPhase === PHASE_FUSION || duelPhase === PHASE_FUSION_RESOLVE) {
    phase = "fusion";
  } else if (duelPhase === PHASE_FIELD) {
    phase = "field";
  } else if (duelPhase === PHASE_BATTLE) {
    phase = "battle";
  } else {
    phase = "other";
  }

  // Log phase transitions
  if (duelPhase !== prevDuelPhase) {
    log(
      `Phase: 0x${prevDuelPhase.toString(16)} → 0x${duelPhase.toString(16)}, turn=${turnIndicator}, hand=${hand.length} cards, reliable=${handReliable}`,
    );
  }
  prevDuelPhase = duelPhase;

  const inDuel = hand.length > 0 || field.length > 0;
  const lpP1 = readU16(view, LP_P1_OFFSET);
  const lpP2 = readU16(view, LP_P2_OFFSET);

  return {
    inDuel,
    sceneId,
    hand,
    field,
    lp: [lpP1, lpP2],
    handReliable,
    phase,
    stats: {
      fusions: readU8(view, FUSION_COUNTER_OFFSET),
      terrain: readU8(view, TERRAIN_OFFSET),
      duelistId: readU8(view, DUELIST_ID_OFFSET),
    },
  };
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
