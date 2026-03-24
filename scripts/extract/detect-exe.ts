// ---------------------------------------------------------------------------
// PS1 executable layout detection (card stats, level/attr, text tables)
// ---------------------------------------------------------------------------

import { byte } from "./iso9660.ts";
import { isTblString } from "./text-decoding.ts";
import type { ExeLayout, PsxExeHeader } from "./types.ts";
import { NUM_CARDS, NUM_DUELISTS } from "./types.ts";

/** Size of the PS-X EXE header (precedes the code/data payload). */
const PSX_EXE_HEADER_SIZE = 0x800;

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
// Card stat + level/attr detection
// ---------------------------------------------------------------------------

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
    if ((b & 0xf) > 12 || ((b >> 4) & 0xf) > 7) return false;
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

// ---------------------------------------------------------------------------
// Text offset table scanning
// ---------------------------------------------------------------------------

/** Scan a region of the executable for a uint16 offset table that resolves
 *  to TBL-encoded strings through some pool base. */
function findTextOffsetTable(
  exe: Buffer,
  searchStart: number,
  searchEnd: number,
  numEntries: number,
  tblLimit = 100,
): { offsetTable: number; textPool: number } | null {
  const otSize = numEntries * 2;

  let best: { offsetTable: number; textPool: number; score: number } | null = null;

  for (let ot = searchStart; ot < searchEnd && ot + otSize <= exe.length; ot += 2) {
    const offsets = new Uint16Array(numEntries);
    let maxOff = 0;
    let minOff = 0xffff;
    for (let i = 0; i < numEntries; i++) {
      const v = exe.readUInt16LE(ot + i * 2);
      offsets[i] = v;
      if (v > maxOff) maxOff = v;
      if (v < minOff) minOff = v;
    }

    if (maxOff > 0xf000) continue;
    if (maxOff - minOff < 0x200) continue;

    const unique = new Set(offsets).size;
    if (unique < numEntries * 0.7) continue;

    let increasing = 0;
    for (let i = 0; i < numEntries - 1; i++) {
      if ((offsets[i + 1] ?? 0) >= (offsets[i] ?? 0)) increasing++;
    }
    if (increasing < (numEntries - 1) * 0.8) continue;

    const poolLo = Math.max(0, ot + otSize - minOff);
    const poolHi = ot;

    for (let pool = poolLo; pool < poolHi; pool++) {
      const firstAddr = pool + (offsets[0] ?? 0);
      if (firstAddr >= exe.length) continue;
      const fb = exe[firstAddr] ?? 0xff;
      if (fb > 91 && fb !== 0xf8 && fb !== 0xfe) continue;
      if (!isTblString(exe, firstAddr, tblLimit)) continue;

      let valid = 0;
      const sample = Math.min(20, numEntries);
      for (let i = 0; i < sample; i++) {
        const addr = pool + (offsets[i] ?? 0);
        if (!isTblString(exe, addr, tblLimit)) continue;
        if ((offsets[i] ?? 0) !== minOff && addr > 0 && (exe[addr - 1] ?? 0) !== 0xff) continue;
        valid++;
      }
      if (valid < sample * 0.75) continue;

      let allValid = 0;
      for (let i = 0; i < numEntries; i++) {
        const addr = pool + (offsets[i] ?? 0);
        if (!isTblString(exe, addr, tblLimit)) continue;
        if ((offsets[i] ?? 0) !== minOff && addr > 0 && (exe[addr - 1] ?? 0) !== 0xff) continue;
        allValid++;
      }
      if (allValid < numEntries * 0.95) continue;

      let gapConsistent = 0;
      for (let i = 0; i < numEntries - 1; i++) {
        const gap = (offsets[i + 1] ?? 0) - (offsets[i] ?? 0);
        if (gap <= 0) continue;
        const strAddr = pool + (offsets[i] ?? 0);
        let len = 0;
        for (let j = 0; j < tblLimit && strAddr + j < exe.length; j++) {
          if ((exe[strAddr + j] ?? 0) === 0xff) {
            len = j + 1;
            break;
          }
        }
        if (len > 0 && gap === len) gapConsistent++;
      }

      const score = allValid * 100000 + gapConsistent;
      if (!best || score > best.score) {
        best = { offsetTable: ot, textPool: pool, score };
        if (allValid === numEntries && gapConsistent === numEntries - 1) {
          return best;
        }
      }
    }
  }

  return best;
}

function detectTextTables(
  exe: Buffer,
  cardStats: number,
  levelAttr: number,
): {
  nameOffsetTable: number;
  textPoolBase: number;
  descOffsetTable: number;
  descTextPoolBase: number;
  duelistNames: number;
} {
  const none = {
    nameOffsetTable: -1,
    textPoolBase: -1,
    descOffsetTable: -1,
    descTextPoolBase: -1,
    duelistNames: -1,
  };

  const nameSearchStart = (levelAttr + NUM_CARDS + 1) & ~1;
  const nameSearchEnd = Math.min(exe.length, cardStats + 0x4000);
  const nameResult = findTextOffsetTable(exe, nameSearchStart, nameSearchEnd, NUM_CARDS);
  if (!nameResult) return none;

  const descSearchStart = Math.max(PSX_EXE_HEADER_SIZE, cardStats - 0x18000) & ~1;
  const descSearchEnd = Math.max(PSX_EXE_HEADER_SIZE, nameResult.textPool);
  const descResult = findTextOffsetTable(exe, descSearchStart, descSearchEnd, NUM_CARDS, 200);

  const duelNamesDelta = 0x650;
  const duelNamesCandidate = nameResult.offsetTable + duelNamesDelta;
  let duelNames = -1;
  if (duelNamesCandidate + NUM_DUELISTS * 2 <= exe.length) {
    let valid = 0;
    for (let i = 0; i < NUM_DUELISTS; i++) {
      const off = exe.readUInt16LE(duelNamesCandidate + i * 2);
      if (off > 0xf000) {
        valid = -1;
        break;
      }
      if (isTblString(exe, nameResult.textPool + off)) valid++;
    }
    if (valid >= NUM_DUELISTS * 0.9) duelNames = duelNamesCandidate;
  }

  return {
    nameOffsetTable: nameResult.offsetTable,
    textPoolBase: nameResult.textPool,
    descOffsetTable: descResult ? descResult.offsetTable : -1,
    descTextPoolBase: descResult ? descResult.textPool : -1,
    duelistNames: duelNames,
  };
}

function detectTextOffsetsByDeltas(
  exe: Buffer,
  cardStats: number,
): {
  nameOffsetTable: number;
  textPoolBase: number;
  descOffsetTable: number;
  descTextPoolBase: number;
  duelistNames: number;
} {
  const none = {
    nameOffsetTable: -1,
    textPoolBase: -1,
    descOffsetTable: -1,
    descTextPoolBase: -1,
    duelistNames: -1,
  };

  const nameOT = cardStats + 0x15be;
  const namePool = cardStats - 0x4244;
  const descOT = cardStats - 0x14042;
  const descPool = cardStats - 0x14244;
  const duelNames = cardStats + 0x1c0e;

  if (nameOT < 0 || nameOT + NUM_CARDS * 2 > exe.length) return none;
  if (namePool < 0) return none;

  let validNames = 0;
  for (let i = 0; i < Math.min(20, NUM_CARDS); i++) {
    const off = exe.readUInt16LE(nameOT + i * 2);
    const addr = namePool + off;
    if (addr >= 0 && addr < exe.length && isTblString(exe, addr)) validNames++;
  }
  if (validNames < 10) return none;

  return {
    nameOffsetTable: nameOT,
    textPoolBase: namePool,
    descOffsetTable: descOT >= 0 && descOT + NUM_CARDS * 2 <= exe.length ? descOT : -1,
    descTextPoolBase: descPool >= 0 ? descPool : -1,
    duelistNames: duelNames >= 0 && duelNames + NUM_DUELISTS * 2 <= exe.length ? duelNames : -1,
  };
}

export function detectExeLayout(exe: Buffer): ExeLayout {
  parsePsxExeHeader(exe);

  let cardStats = -1;
  let levelAttr = -1;
  const tableBytes = NUM_CARDS * 4;

  const searchStart = Math.floor(exe.length / 2) & ~3;
  for (let addr = searchStart; addr <= exe.length - tableBytes; addr += 4) {
    let quick = true;
    for (let i = 0; i < 5; i++) {
      const raw = exe.readUInt32LE(addr + i * 4);
      if (!isValidCardStat(raw) || (raw & 0x3ffff) === 0) {
        quick = false;
        break;
      }
    }
    if (!quick) continue;

    let allValid = true;
    let monsterWithStats = 0;
    let nonMonsterZeroStats = 0;
    for (let i = 0; i < NUM_CARDS; i++) {
      const raw = exe.readUInt32LE(addr + i * 4);
      if (!isValidCardStat(raw)) {
        allValid = false;
        break;
      }
      const type = (raw >> 26) & 0x1f;
      const atk = raw & 0x1ff;
      const def = (raw >> 9) & 0x1ff;
      if (type < 20 && (atk > 0 || def > 0)) monsterWithStats++;
      if (type >= 20 && atk === 0 && def === 0) nonMonsterZeroStats++;
    }
    if (!allValid || monsterWithStats < 200 || nonMonsterZeroStats < 50) continue;

    const la = findLevelAttrNear(exe, addr);
    if (la === -1) continue;

    cardStats = addr;
    levelAttr = la;
    break;
  }
  if (cardStats === -1) throw new Error("Could not locate card stats table in executable");
  if (levelAttr === -1) throw new Error("Could not locate level/attribute table in executable");

  let text = detectTextTables(exe, cardStats, levelAttr);
  if (text.nameOffsetTable === -1) {
    text = detectTextOffsetsByDeltas(exe, cardStats);
  }

  return {
    cardStats,
    levelAttr,
    nameOffsetTable: text.nameOffsetTable,
    textPoolBase: text.textPoolBase,
    descOffsetTable: text.descOffsetTable,
    descTextPoolBase: text.descTextPoolBase,
    duelistNames: text.duelistNames,
  };
}

/** Determine the attribute encoding based on whether card names use color prefixes.
 *  RP mod uses {F8 0A XX} color prefixes → distinct encoding.
 *  Vanilla has no color prefixes → standard encoding. */
export function detectAttributeMapping(exe: Buffer, layout: ExeLayout): Record<number, string> {
  if (layout.nameOffsetTable === -1 || layout.textPoolBase === -1) {
    return { 0: "Light", 1: "Dark", 2: "Earth", 3: "Water", 4: "Fire", 5: "Wind" };
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
