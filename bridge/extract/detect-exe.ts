// ---------------------------------------------------------------------------
// PS1 executable layout detection (card stats, level/attr, attribute mapping)
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import { cardTypes, guardianStars } from "../../src/engine/data/rp-types.ts";
import { detectTextOffsetsByDeltas, detectTextTables } from "./detect-exe-text.ts";
import { byte } from "./iso9660.ts";
import { CHAR_TABLE, extractWaMrgStrings, isTblString } from "./text-decoding.ts";
import type { EquipBonusConfig, ExeLayout, PsxExeHeader } from "./types.ts";
import { NUM_CARDS } from "./types.ts";

type ActiveCardStatsSource =
  | { cardStats: Uint8Array; cardStatsHash?: never }
  | { cardStats?: never; cardStatsHash: string };

interface CardStatsCandidate {
  addr: number;
}

/** Runtime path: resolve the executable layout for the game currently loaded
 * in DuckStation. The RAM card-stats table is the authority for which EXE
 * copy is active; if no EXE table matches it, extraction must fail instead of
 * guessing. */
export function detectActiveExeLayout(exe: Buffer, source: ActiveCardStatsSource): ExeLayout {
  parsePsxExeHeader(exe);
  const candidates = findCardStatsCandidates(exe);
  const cardStats = selectActiveCardStats(exe, candidates, source);
  return buildExeLayout(exe, cardStats);
}

/** Offline path: best-effort layout detection for scripts/debug tools that
 * inspect a disc without a running emulator. Do not use this for autosync or
 * active-ISO refreshes, where RAM stats are available. */
export function detectDiscExeLayout(exe: Buffer): ExeLayout {
  parsePsxExeHeader(exe);
  const candidates = findCardStatsCandidates(exe);
  const cardStats = selectDiscCardStats(exe, candidates);
  return buildExeLayout(exe, cardStats);
}

function findCardStatsCandidates(exe: Buffer): CardStatsCandidate[] {
  const tableBytes = NUM_CARDS * 4;
  const candidates: CardStatsCandidate[] = [];
  const searchStart = PSX_EXE_HEADER_SIZE;
  for (let addr = searchStart; addr <= exe.length - tableBytes; addr += 4) {
    if (!isCardStatsCandidate(exe, addr)) continue;
    candidates.push({ addr });
  }
  return candidates;
}

function buildExeLayout(exe: Buffer, cardStats: number): ExeLayout {
  const levelAttr = findLevelAttrNear(exe, cardStats);

  let text =
    levelAttr >= 0
      ? detectTextTables(exe, cardStats, levelAttr)
      : {
          nameOffsetTable: -1,
          textPoolBase: -1,
          descOffsetTable: -1,
          descTextPoolBase: -1,
          duelistNames: -1,
        };
  if (text.nameOffsetTable === -1) {
    text = detectTextOffsetsByDeltas(exe, cardStats);
  }

  const typeNamesTable = findKnownNameRun(exe, cardStats, cardTypes);
  const gsNamesTable = findKnownNameRun(exe, cardStats, guardianStars.slice(1));

  return {
    cardStats,
    levelAttr,
    nameOffsetTable: text.nameOffsetTable,
    textPoolBase: text.textPoolBase,
    descOffsetTable: text.descOffsetTable,
    descTextPoolBase: text.descTextPoolBase,
    duelistNames: text.duelistNames,
    typeNamesTable,
    gsNamesTable,
  };
}

function selectActiveCardStats(
  exe: Buffer,
  candidates: CardStatsCandidate[],
  source: ActiveCardStatsSource,
): number {
  if (source.cardStats) {
    const match = candidates.find((candidate) =>
      sameCardStats(exe, candidate.addr, source.cardStats),
    );
    if (match) return match.addr;
  }
  if (source.cardStatsHash) {
    const match = candidates.find(
      (candidate) => cardStatsHash(exe, candidate.addr) === source.cardStatsHash,
    );
    if (match) return match.addr;
  }
  throw new Error(
    `Could not locate active card stats table in executable (${candidates.length} candidate${candidates.length === 1 ? "" : "s"} scanned)`,
  );
}

function selectDiscCardStats(exe: Buffer, candidates: CardStatsCandidate[]): number {
  for (const candidate of candidates) {
    if (findLevelAttrNear(exe, candidate.addr) !== -1) return candidate.addr;
  }
  const first = candidates[0];
  if (first) return first.addr;
  throw new Error("Could not locate card stats table in executable");
}

function sameCardStats(exe: Buffer, addr: number, expected: Uint8Array): boolean {
  if (expected.length < NUM_CARDS * 4) return false;
  for (let i = 0; i < NUM_CARDS * 4; i++) {
    if (exe[addr + i] !== expected[i]) return false;
  }
  return true;
}

function cardStatsHash(exe: Buffer, addr: number): string {
  return createHash("sha256")
    .update(exe.subarray(addr, addr + NUM_CARDS * 4))
    .digest("hex");
}

function findKnownNameRun(exe: Buffer, cardStats: number, expected: readonly string[]): number {
  const searchStart = Math.max(PSX_EXE_HEADER_SIZE, cardStats + 0x3000);
  const searchEnd = Math.min(exe.length, cardStats + 0x7000);
  const expectedNames = expected.map(normalizeName);
  for (let offset = searchStart; offset < searchEnd; offset++) {
    if (!isTblString(exe, offset, 50)) continue;
    const names = extractWaMrgStrings(exe, offset, expected.length, CHAR_TABLE);
    if (names.length !== expected.length) continue;
    if (
      names.every((name, i) => name === name.trim() && normalizeName(name) === expectedNames[i])
    ) {
      return offset;
    }
  }
  return -1;
}

function normalizeName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

/** Per-language attribute names for PAL discs (indexed by langIdx). */
const PAL_ATTRIBUTES: Record<number, string>[] = [
  { 0: "Light", 1: "Dark", 2: "Earth", 3: "Water", 4: "Fire", 5: "Wind" }, // EN
  { 0: "Lumière", 1: "Ténèbres", 2: "Terre", 3: "Eau", 4: "Feu", 5: "Vent" }, // FR
  { 0: "Licht", 1: "Finsternis", 2: "Erde", 3: "Wasser", 4: "Feuer", 5: "Wind" }, // DE
  { 0: "Luce", 1: "Oscurità", 2: "Terra", 3: "Acqua", 4: "Fuoco", 5: "Vento" }, // IT
  { 0: "Luz", 1: "Oscuridad", 2: "Tierra", 3: "Agua", 4: "Fuego", 5: "Viento" }, // ES
];

/** Determine the attribute encoding based on whether card names use color prefixes.
 *  RP mod uses {F8 0A XX} color prefixes → distinct encoding.
 *  Vanilla has no color prefixes → standard encoding. */
export function detectAttributeMapping(
  exe: Buffer,
  layout: ExeLayout,
  langIdx?: number,
): Record<number, string> {
  if (layout.nameOffsetTable === -1 || layout.textPoolBase === -1) {
    return (
      PAL_ATTRIBUTES[langIdx ?? 0] ?? {
        0: "Light",
        1: "Dark",
        2: "Earth",
        3: "Water",
        4: "Fire",
        5: "Wind",
      }
    );
  }

  let hasColorPrefix = false;
  for (let i = 0; i < Math.min(100, NUM_CARDS); i++) {
    const off = exe.readUInt16LE(layout.nameOffsetTable + i * 2);
    const addr = layout.textPoolBase + off;
    if (
      addr >= 0 &&
      addr + 2 < exe.length &&
      (exe[addr] ?? 0) === 0xf8 &&
      (exe[addr + 1] ?? 0) === 0x0a
    ) {
      hasColorPrefix = true;
      break;
    }
  }

  if (hasColorPrefix) {
    return { 0: "", 1: "Light", 2: "Dark", 3: "Water", 4: "Fire", 5: "Earth", 6: "Wind" };
  }
  return { 0: "Light", 1: "Dark", 2: "Earth", 3: "Water", 4: "Fire", 5: "Wind" };
}

// ---------------------------------------------------------------------------
// Equip bonus detection (MIPS immediates at known SLUS offsets)
// ---------------------------------------------------------------------------

/** Known SLUS file offsets for equip bonus MIPS instructions.
 *  Source: yfm-equip-editor (jmncamilo/yfm-equip-editor). */
const EQUIP_BONUS_OFFSET = 0xaff8;
const MEGAMORPH_ID_OFFSET = 0xb018;
const MEGAMORPH_BONUS_OFFSET = 0xb020;

/** Read the equip bonus values from the SLUS executable.
 *  Returns null if the instructions at the known offsets aren't the expected pattern. */
export function detectEquipBonuses(exe: Buffer): EquipBonusConfig | null {
  if (exe.length < MEGAMORPH_BONUS_OFFSET + 4) return null;
  const stdInstr = exe.readUInt32LE(EQUIP_BONUS_OFFSET);
  const idInstr = exe.readUInt32LE(MEGAMORPH_ID_OFFSET);
  const mmInstr = exe.readUInt32LE(MEGAMORPH_BONUS_OFFSET);
  if (
    !isMipsLoadImmediate(stdInstr) ||
    !isMipsLoadImmediate(idInstr) ||
    !isMipsLoadImmediate(mmInstr)
  )
    return null;
  return {
    equipBonus: mipsImmediate(stdInstr),
    megamorphId: mipsImmediate(idInstr),
    megamorphBonus: mipsImmediate(mmInstr),
  };
}

/** Check that a uint32 is a MIPS `addiu $rt, $zero, imm` instruction (opcode 9, rs=0). */
function isMipsLoadImmediate(instr: number): boolean {
  return instr >>> 26 === 9 && ((instr >> 21) & 0x1f) === 0;
}

/** Extract the unsigned 16-bit immediate from a MIPS I-type instruction. */
function mipsImmediate(instr: number): number {
  return instr & 0xffff;
}

/** Parse the PS-X EXE header from the start of a PS1 executable file.
 *  Validates the "PS-X EXE" magic and extracts load address + text size. */
export function parsePsxExeHeader(exe: Buffer): PsxExeHeader {
  if (exe.length < PSX_EXE_HEADER_SIZE) {
    throw new Error(`PS-X EXE too small: ${exe.length} bytes (need ≥ ${PSX_EXE_HEADER_SIZE})`);
  }
  const magic = exe.subarray(0, 8).toString("ascii");
  if (magic !== "PS-X EXE") {
    throw new Error(`Not a PS-X EXE: magic is "${magic}"`);
  }
  return {
    loadAddr: exe.readUInt32LE(0x18),
    textSize: exe.readUInt32LE(0x1c),
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Size of the PS-X EXE header (precedes the code/data payload). */
const PSX_EXE_HEADER_SIZE = 0x800;

/** Check that a uint32LE encodes a valid card stat entry:
 *  bits 0-8: atk/10, 9-17: def/10, 18-21: gs2 (0-10), 22-25: gs1 (0-10), 26-30: type (0-23), 31: 0 */
function isValidCardStat(raw: number): boolean {
  return (
    raw >>> 31 === 0 &&
    ((raw >> 26) & 0x1f) <= 23 &&
    ((raw >> 22) & 0xf) <= 10 &&
    ((raw >> 18) & 0xf) <= 10
  );
}

/** Validate a card stats table candidate: all 722 entries valid, enough monsters
 *  with stats and non-monsters with zero stats. */
function isCardStatsCandidate(exe: Buffer, addr: number): boolean {
  // Quick-reject: first 5 entries must be valid monsters
  for (let i = 0; i < 5; i++) {
    const raw = exe.readUInt32LE(addr + i * 4);
    if (!isValidCardStat(raw) || (raw & 0x3ffff) === 0) return false;
  }
  let monsterWithStats = 0;
  let nonMonsterZeroStats = 0;
  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = exe.readUInt32LE(addr + i * 4);
    if (!isValidCardStat(raw)) return false;
    const type = (raw >> 26) & 0x1f;
    const atk = raw & 0x1ff;
    const def = (raw >> 9) & 0x1ff;
    if (type < 20 && (atk > 0 || def > 0)) monsterWithStats++;
    if (type >= 20 && atk === 0 && def === 0) nonMonsterZeroStats++;
  }
  return monsterWithStats >= 200 && nonMonsterZeroStats >= 50;
}

/** Check if addr is a valid level/attr table, cross-validated with card stats.
 *  Non-monster cards (type >= 20) must have level 0. */
function isValidLevelAttrTable(exe: Buffer, addr: number, cardStatsAddr: number): boolean {
  if (addr < 0 || addr + NUM_CARDS > exe.length) return false;
  const first = byte(exe, addr);
  if ((first & 0xf) === 0 || (first & 0xf) > 12) return false;
  let nonZeroLevels = 0;
  let nonMonsterZeroLevel = 0;
  let nonMonsterCount = 0;
  for (let i = 0; i < NUM_CARDS; i++) {
    const b = byte(exe, addr + i);
    if ((b & 0xf) > 12) return false;
    if ((b & 0xf) > 0) nonZeroLevels++;
    const raw = exe.readUInt32LE(cardStatsAddr + i * 4);
    const type = (raw >> 26) & 0x1f;
    if (type >= 20) {
      nonMonsterCount++;
      if ((b & 0xf) === 0) nonMonsterZeroLevel++;
    }
  }
  return (
    nonZeroLevels > 200 &&
    nonZeroLevels < NUM_CARDS &&
    nonMonsterZeroLevel >= nonMonsterCount * 0.98
  );
}

function findLevelAttrNear(exe: Buffer, cardStatsAddr: number): number {
  const lo = Math.max(0, cardStatsAddr - 0x10000);
  const hi = Math.min(exe.length - NUM_CARDS, cardStatsAddr + 0x10000);
  for (let addr = lo; addr < hi; addr++) {
    if (isValidLevelAttrTable(exe, addr, cardStatsAddr)) return addr;
  }
  return -1;
}
