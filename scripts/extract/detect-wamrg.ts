// ---------------------------------------------------------------------------
// WA_MRG layout detection (KNOWN_WAMRG_LAYOUTS + structural validators)
// ---------------------------------------------------------------------------
//
// WA_MRG.MRG is a flat "merge" archive with NO internal file table or
// directory.  Data blocks sit at hardcoded byte offsets that vary per game
// version.  Community tools (fmlib-cpp, fmscrambler) use version-specific
// constants.  We try each known layout and validate structurally.
//
// Known WA_MRG structure (US / SLUS_014.11 and RP mod):
//   0x000000  Card thumbnails   (722 × 0x800 = 0x169000 bytes)
//   0x169000  Full card artwork  (722 × 0x3800 bytes)
//   0xB85000  Equip table        (0x2800 bytes)
//   0xB87800  Fusion table       (0x10000 bytes)
//   0xE9B000  Duelist table      (39 × 0x1800 bytes)
//   0xFB9808  Starchip table     (722 × 8 bytes)
//
// PAL uses 0x4000-byte artwork blocks (0x800 larger — extra card name image
// data for multi-language support), shifting all subsequent offsets.
//
// Sources:
//   github.com/forbidden-memories-coding/fmlib-cpp  DataReader.cpp
//   github.com/forbidden-memories-coding/fmscrambler DataScrambler.cs
// ---------------------------------------------------------------------------

import { byte } from "./iso9660.ts";
import type { WaMrgLayout } from "./types.ts";
import { NUM_CARDS, NUM_DUELISTS } from "./types.ts";

const FUSION_TABLE_SIZE = 0x1_0000;
const DUELIST_ENTRY_SIZE = 0x1800;
const DUELIST_DECK_OFFSET = 0x000;
const DUELIST_SA_POW_OFFSET = 0x5b4;
const DUELIST_BCD_OFFSET = 0xb68;
const DUELIST_SA_TEC_OFFSET = 0x111c;

/** Known WA_MRG layouts, tried in order.  Each is validated structurally
 *  against the actual file before use. */
const KNOWN_WAMRG_LAYOUTS: WaMrgLayout[] = [
  // Vanilla US (SLUS_014.11) and Remastered Perfected mod
  {
    fusionTable: 0xb8_7800,
    equipTable: 0xb8_5000,
    starchipTable: 0xfb_9808,
    duelistTable: 0xe9_b000,
    artworkBlockSize: 0x3800,
  },
  // Vanilla PAL (SLES_039.47–51, all EU languages)
  {
    fusionTable: 0xde_b000,
    equipTable: 0xde_8800,
    starchipTable: 0x127_8808,
    duelistTable: 0x110_d800,
    artworkBlockSize: 0x4000,
  },
];

/** Check a password uint32 is valid: either 0xFFFFFFFE (no password) or all-BCD nibbles (0-9). */
function isValidPasswordWord(val: number): boolean {
  if (val === 0xfffffffe || val === 0) return true;
  for (let i = 0; i < 8; i++) {
    if (((val >>> (i * 4)) & 0xf) > 9) return false;
  }
  return true;
}

/** Check if a valid fusion table header starts at `addr`:
 *  2 skip bytes + 722 uint16LE offsets, mostly zero, non-decreasing non-zero values. */
function isValidFusionHeader(waMrg: Buffer, addr: number): boolean {
  const headerSize = 2 + NUM_CARDS * 2;
  if (addr + FUSION_TABLE_SIZE > waMrg.length) return false;

  let zeros = 0;
  let prevNonZero = 0;
  let firstNonZeroOff = 0;

  for (let i = 0; i < NUM_CARDS; i++) {
    const v = waMrg.readUInt16LE(addr + 2 + i * 2);
    if (v === 0) {
      zeros++;
      continue;
    }
    if (v < headerSize || v >= FUSION_TABLE_SIZE) return false;
    if (v < prevNonZero) return false;
    if (firstNonZeroOff === 0) firstNonZeroOff = v;
    prevNonZero = v;
  }

  if (zeros < 100 || zeros >= NUM_CARDS - 10) return false;
  if (firstNonZeroOff === 0 || firstNonZeroOff > headerSize * 2) return false;
  if (byte(waMrg, addr + firstNonZeroOff) === 0) return false;
  return true;
}

/** Check if a valid starchip table starts at `addr`:
 *  722 entries of (cost:u32 ≤ 999999, password:u32 in BCD or 0xFFFFFFFE).
 *  At least 100 cards must have a non-zero cost. */
function isValidStarchipTable(waMrg: Buffer, addr: number): boolean {
  const totalSize = NUM_CARDS * 8;
  if (addr + totalSize > waMrg.length) return false;

  let nonZeroCosts = 0;
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = addr + i * 8;
    const cost = waMrg.readUInt32LE(off);
    if (cost > 999999) return false;
    if (cost > 0) nonZeroCosts++;
    if (!isValidPasswordWord(waMrg.readUInt32LE(off + 4))) return false;
  }
  return nonZeroCosts > 100;
}

/** Check if a valid duelist table starts at `addr`:
 *  Spot-check a few duelists for sparse uint16 probability arrays. */
function isValidDuelistBlock(waMrg: Buffer, addr: number): boolean {
  const totalSize = NUM_DUELISTS * DUELIST_ENTRY_SIZE;
  if (addr + totalSize > waMrg.length) return false;

  const poolOffsets = [
    DUELIST_DECK_OFFSET,
    DUELIST_SA_POW_OFFSET,
    DUELIST_BCD_OFFSET,
    DUELIST_SA_TEC_OFFSET,
  ];

  for (const di of [0, 10, 19, 29, 38]) {
    const entryBase = addr + di * DUELIST_ENTRY_SIZE;
    for (const poolOff of poolOffsets) {
      const poolBase = entryBase + poolOff;
      let zeros = 0;
      for (let c = 0; c < NUM_CARDS; c++) {
        const v = waMrg.readUInt16LE(poolBase + c * 2);
        if (v === 0) zeros++;
        if (v > 2048) return false;
      }
      if (zeros < 300) return false;
    }
    let deckNonZero = 0;
    for (let c = 0; c < NUM_CARDS; c++) {
      if (waMrg.readUInt16LE(entryBase + DUELIST_DECK_OFFSET + c * 2) > 0) deckNonZero++;
    }
    if (deckNonZero < 5) return false;
  }
  return true;
}

/** Check if an offset looks like the start of a valid equip table.
 *  First entry should be (equipId: uint16 in 1-722, monsterCount: uint16 in 1-722). */
function isValidEquipStart(waMrg: Buffer, addr: number): boolean {
  if (addr + 4 > waMrg.length) return false;
  const equipId = waMrg.readUInt16LE(addr);
  const count = waMrg.readUInt16LE(addr + 2);
  return equipId >= 1 && equipId <= NUM_CARDS && count >= 1 && count <= NUM_CARDS;
}

/** Validate a candidate layout against the actual WA_MRG data.
 *  Every table must pass structural checks. */
function isValidWaMrgLayout(waMrg: Buffer, layout: WaMrgLayout): boolean {
  const { fusionTable, equipTable, starchipTable, duelistTable } = layout;
  return (
    isValidFusionHeader(waMrg, fusionTable) &&
    isValidEquipStart(waMrg, equipTable) &&
    isValidStarchipTable(waMrg, starchipTable) &&
    isValidDuelistBlock(waMrg, duelistTable)
  );
}

export function detectWaMrgLayout(waMrg: Buffer): WaMrgLayout {
  for (const candidate of KNOWN_WAMRG_LAYOUTS) {
    if (isValidWaMrgLayout(waMrg, candidate)) return candidate;
  }
  throw new Error(
    "Could not match WA_MRG.MRG to any known layout " +
      `(file size: 0x${waMrg.length.toString(16)})`,
  );
}
