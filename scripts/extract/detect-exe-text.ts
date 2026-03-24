// ---------------------------------------------------------------------------
// EXE text offset table detection (card names, descriptions, duelist names)
// ---------------------------------------------------------------------------

import { isTblString } from "./text-decoding.ts";
import { NUM_CARDS, NUM_DUELISTS } from "./types.ts";

/** Size of the PS-X EXE header (precedes the code/data payload). */
const PSX_EXE_HEADER_SIZE = 0x800;

export interface TextTableResult {
  nameOffsetTable: number;
  textPoolBase: number;
  descOffsetTable: number;
  descTextPoolBase: number;
  duelistNames: number;
}

const NO_TEXT: TextTableResult = {
  nameOffsetTable: -1,
  textPoolBase: -1,
  descOffsetTable: -1,
  descTextPoolBase: -1,
  duelistNames: -1,
};

export function detectTextTables(
  exe: Buffer,
  cardStats: number,
  levelAttr: number,
): TextTableResult {
  const nameSearchStart = (levelAttr + NUM_CARDS + 1) & ~1;
  const nameSearchEnd = Math.min(exe.length, cardStats + 0x4000);
  const nameResult = findTextOffsetTable(exe, nameSearchStart, nameSearchEnd, NUM_CARDS);
  if (!nameResult) return NO_TEXT;

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

/** Fallback: use known fixed deltas from cardStats to locate text tables.
 *  These deltas were measured from the vanilla SLUS executable. */
export function detectTextOffsetsByDeltas(exe: Buffer, cardStats: number): TextTableResult {
  const nameOT = cardStats + 0x15be;
  const namePool = cardStats - 0x4244;
  const descOT = cardStats - 0x14042;
  const descPool = cardStats - 0x14244;
  const duelNames = cardStats + 0x1c0e;

  if (nameOT < 0 || nameOT + NUM_CARDS * 2 > exe.length) return NO_TEXT;
  if (namePool < 0) return NO_TEXT;

  let validNames = 0;
  for (let i = 0; i < Math.min(20, NUM_CARDS); i++) {
    const off = exe.readUInt16LE(nameOT + i * 2);
    const addr = namePool + off;
    if (addr >= 0 && addr < exe.length && isTblString(exe, addr)) validNames++;
  }
  if (validNames < 10) return NO_TEXT;

  return {
    nameOffsetTable: nameOT,
    textPoolBase: namePool,
    descOffsetTable: descOT >= 0 && descOT + NUM_CARDS * 2 <= exe.length ? descOT : -1,
    descTextPoolBase: descPool >= 0 ? descPool : -1,
    duelistNames: duelNames >= 0 && duelNames + NUM_DUELISTS * 2 <= exe.length ? duelNames : -1,
  };
}

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
