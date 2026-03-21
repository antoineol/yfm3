/**
 * DuckStation shared memory reader for Windows.
 *
 * Reads raw PS1 RAM values and returns them without interpretation.
 * All game logic (card filtering, phase mapping, hand reliability)
 * lives in the webapp.
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

/**
 * Read raw game state from mapped PS1 RAM.
 * Returns uninterpreted values — the webapp handles all game logic.
 */
export function readGameState(view) {
  const hand = [];
  for (let i = 0; i < HAND_SLOTS; i++) hand.push(readCardSlot(view, HAND_BASE, i));
  const field = [];
  for (let i = 0; i < FIELD_SLOTS; i++) field.push(readCardSlot(view, FIELD_BASE, i));

  return {
    sceneId: readU16(view, SCENE_ID_OFFSET),
    duelPhase: readU8(view, DUEL_PHASE_OFFSET),
    turnIndicator: readU8(view, TURN_INDICATOR_OFFSET),
    hand,
    field,
    lp: [readU16(view, LP_P1_OFFSET), readU16(view, LP_P2_OFFSET)],
    fusions: readU8(view, FUSION_COUNTER_OFFSET),
    terrain: readU8(view, TERRAIN_OFFSET),
    duelistId: readU8(view, DUELIST_ID_OFFSET),
  };
}
