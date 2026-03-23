/**
 * Archived: WA_MRG.MRG heuristic scanning functions.
 *
 * These functions locate data tables inside WA_MRG.MRG by scanning the
 * entire file for byte-level structural patterns.  They were replaced by
 * known-offset lookup + structural validation in extract-game-data.ts
 * (see KNOWN_WAMRG_LAYOUTS).
 *
 * Kept here for reference in case a new game version needs offsets that
 * are not yet in the known-layouts table.  To discover offsets for a new
 * version, restore these functions temporarily and run them against the
 * new WA_MRG.MRG, then add the results to KNOWN_WAMRG_LAYOUTS.
 */

const NUM_CARDS = 722;
const FUSION_TABLE_SIZE = 0x1_0000;
const EQUIP_TABLE_SIZE = 0x2800;
const NUM_DUELISTS = 39;
const DUELIST_ENTRY_SIZE = 0x1800;
const DUELIST_DECK_OFFSET = 0x000;
const DUELIST_SA_POW_OFFSET = 0x5b4;
const DUELIST_BCD_OFFSET = 0xb68;
const DUELIST_SA_TEC_OFFSET = 0x111c;

function byte(buf: Buffer, offset: number): number {
  const v = buf[offset];
  if (v === undefined) throw new Error(`Read out of bounds at offset ${offset}`);
  return v;
}

function isValidPasswordWord(val: number): boolean {
  if (val === 0xfffffffe || val === 0) return true;
  for (let i = 0; i < 8; i++) {
    if (((val >>> (i * 4)) & 0xf) > 9) return false;
  }
  return true;
}

function isValidEquipStart(waMrg: Buffer, addr: number): boolean {
  if (addr + 4 > waMrg.length) return false;
  const equipId = waMrg.readUInt16LE(addr);
  const count = waMrg.readUInt16LE(addr + 2);
  return equipId >= 1 && equipId <= NUM_CARDS && count >= 1 && count <= NUM_CARDS;
}

// ---------------------------------------------------------------------------
// Scanning functions
// ---------------------------------------------------------------------------

/** Scan for the starchip/password table: 722 entries of (cost:u32 + password:u32).
 *  Costs are 0–999999, passwords are BCD-encoded or 0xFFFFFFFE.
 *  Returns the candidate with the most non-zero costs (rejects zero-padding regions). */
export function findStarchipTable(waMrg: Buffer): number {
  const entrySize = 8;
  const totalSize = NUM_CARDS * entrySize;
  let bestAddr = -1;
  let bestNonZero = 0;

  for (let addr = 0; addr <= waMrg.length - totalSize; addr += entrySize) {
    // Quick pre-check: first 3 entries
    let quick = true;
    for (let i = 0; i < 3; i++) {
      const off = addr + i * entrySize;
      if (waMrg.readUInt32LE(off) > 999999 || !isValidPasswordWord(waMrg.readUInt32LE(off + 4))) {
        quick = false;
        break;
      }
    }
    if (!quick) continue;

    // Full validation
    let valid = true;
    let nonZeroCosts = 0;
    for (let i = 0; i < NUM_CARDS; i++) {
      const off = addr + i * entrySize;
      const cost = waMrg.readUInt32LE(off);
      if (cost > 999999) {
        valid = false;
        break;
      }
      if (cost > 0) nonZeroCosts++;
      if (!isValidPasswordWord(waMrg.readUInt32LE(off + 4))) {
        valid = false;
        break;
      }
    }
    if (valid && nonZeroCosts > bestNonZero) {
      bestNonZero = nonZeroCosts;
      bestAddr = addr;
    }
  }
  return bestNonZero > 100 ? bestAddr : -1;
}

/** Scan for the equip table: sequential (equipId, monsterCount, monsterIds...) entries. */
export function findEquipTable(waMrg: Buffer): number {
  for (let addr = 0; addr <= waMrg.length - EQUIP_TABLE_SIZE; addr += 0x800) {
    if (!isValidEquipStart(waMrg, addr)) continue;
    let pos = addr;
    let validEntries = 0;
    let prevId = 0;
    while (pos < addr + EQUIP_TABLE_SIZE - 1) {
      const eqId = waMrg.readUInt16LE(pos);
      if (eqId === 0) break;
      if (eqId < 1 || eqId > NUM_CARDS || eqId <= prevId) break;
      const cnt = waMrg.readUInt16LE(pos + 2);
      if (cnt < 1 || cnt > NUM_CARDS) break;
      pos += 4 + cnt * 2;
      prevId = eqId;
      validEntries++;
    }
    if (validEntries >= 10) return addr;
  }
  return -1;
}

/** Find the fusion table by its characteristic header: 2 skip bytes + 722 uint16LE offsets.
 *  Non-zero offsets must point past the header into the data area and be non-decreasing. */
export function findFusionTable(waMrg: Buffer): number {
  const headerSize = 2 + NUM_CARDS * 2;
  for (let addr = 0; addr <= waMrg.length - FUSION_TABLE_SIZE; addr += 0x800) {
    let zeros = 0;
    let valid = true;
    let prevNonZero = 0;
    let nonDecreasing = true;
    let firstNonZeroOff = 0;

    for (let i = 0; i < NUM_CARDS; i++) {
      const v = waMrg.readUInt16LE(addr + 2 + i * 2);
      if (v === 0) {
        zeros++;
        continue;
      }
      if (v < headerSize || v >= FUSION_TABLE_SIZE) {
        valid = false;
        break;
      }
      if (v < prevNonZero) nonDecreasing = false;
      if (firstNonZeroOff === 0) firstNonZeroOff = v;
      prevNonZero = v;
    }
    if (!valid || !nonDecreasing) continue;
    if (zeros < 100 || zeros >= NUM_CARDS - 10) continue;
    if (firstNonZeroOff === 0) continue;
    if (firstNonZeroOff > headerSize * 2) continue;
    if (byte(waMrg, addr + firstNonZeroOff) === 0) continue;

    return addr;
  }
  return -1;
}

/** Find the duelist table: 39 blocks of 0x1800 bytes containing sparse uint16 probability arrays.
 *  Returns the candidate with the best score (rejects all-zero regions). */
export function findDuelistTable(waMrg: Buffer): number {
  const totalSize = NUM_DUELISTS * DUELIST_ENTRY_SIZE;
  let bestAddr = -1;
  let bestScore = 0;

  for (let addr = 0; addr <= waMrg.length - totalSize; addr += 0x800) {
    let valid = true;
    let totalNonZero = 0;
    const poolOffsets = [
      DUELIST_DECK_OFFSET,
      DUELIST_SA_POW_OFFSET,
      DUELIST_BCD_OFFSET,
      DUELIST_SA_TEC_OFFSET,
    ];
    for (const di of [0, 10, 19, 29, 38]) {
      const entryBase = addr + di * DUELIST_ENTRY_SIZE;
      if (entryBase + DUELIST_ENTRY_SIZE > waMrg.length) {
        valid = false;
        break;
      }
      for (const poolOff of poolOffsets) {
        const poolBase = entryBase + poolOff;
        let zeros = 0;
        let outOfRange = 0;
        for (let c = 0; c < NUM_CARDS; c++) {
          const v = waMrg.readUInt16LE(poolBase + c * 2);
          if (v === 0) zeros++;
          if (v > 2048) outOfRange++;
        }
        if (zeros < 300 || outOfRange > 0) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
      let deckNonZero = 0;
      for (let c = 0; c < NUM_CARDS; c++) {
        if (waMrg.readUInt16LE(entryBase + DUELIST_DECK_OFFSET + c * 2) > 0) deckNonZero++;
      }
      if (deckNonZero < 5) {
        valid = false;
        break;
      }
      totalNonZero += deckNonZero;
    }
    if (valid && totalNonZero > bestScore) {
      bestScore = totalNonZero;
      bestAddr = addr;
    }
  }
  return bestAddr;
}
