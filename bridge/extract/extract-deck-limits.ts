// ---------------------------------------------------------------------------
// Per-card deck-copy limit extraction
// ---------------------------------------------------------------------------
//
// Where the data lives:
//   - RP-family mods: a 7-instruction MIPS prologue at the start of the
//     "limit dispatcher" function, followed by a u16 lookup table.
//   - Vanilla SLUS/SLES: no dispatcher. Exodia's one-copy rule is an inline
//     range check in deck-edit code.
//
// How we read it:
//   1. Signature-match the dispatcher prologue (addiu v0,v0,-336; sw t0..t5,
//      0..20(v0)) anywhere in the text.
//   2. Parse the prologue's magic constants dynamically — don't hard-code
//      them — so a future mod that renumbers the table still works.
//   3. Walk the u16 table, decoding raw - encodingOffset to recover card IDs.
//   4. Find the dispatcher's caller and look for an
//      `addiu rt, rs, -N; sltiu rt, rt, M` range check — the Exodia-style
//      hard cap on a contiguous card-id range.
//
// See docs/SPEC.md for the durable deck-limit extraction rules.

import { parsePsxExeHeader } from "./detect-exe.ts";
import { NUM_CARDS, type PsxExeHeader } from "./types.ts";

/** Default cap when a card is not listed in the dispatcher table. */
export const DEFAULT_MAX_COPIES = 3;

/**
 * Decoded per-card deck-copy limits, sparse: only cards whose cap differs
 * from `DEFAULT_MAX_COPIES` appear. Absent IDs default to 3.
 *
 * When neither the dispatcher nor an inline cap check is present, this whole
 * object is `null` and the caller should treat every card as cap 3.
 */
export interface DeckLimits {
  byCard: Record<number, number>;
  /** For diagnostics / round-trip tests. */
  discovered: {
    source: "dispatcher" | "inline-range";
    dispatcherRamAddr: number | null;
    tableRamAddr: number | null;
    encodingOffset: number | null;
    blockEndCounters: [number, number] | null;
    exodiaRange: { start: number; length: number } | null;
  };
}

/** Seven-instruction byte signature identifying the dispatcher prologue. */
const DISPATCHER_PROLOGUE_SIGNATURE: readonly number[] = [
  0x2442feb0, // addiu v0, v0, -336
  0xac480000, // sw    t0,  0(v0)
  0xac490004, // sw    t1,  4(v0)
  0xac4a0008, // sw    t2,  8(v0)
  0xac4b000c, // sw    t3, 12(v0)
  0xac4c0010, // sw    t4, 16(v0)
  0xac4d0014, // sw    t5, 20(v0)
];

const PSX_EXE_HEADER_SIZE = 0x800;
const MIPS_INSTR_BYTES = 4;

/**
 * Detect the deck-copy-limit table in a PS-X SLUS/SLES executable.
 * Returns `null` when the dispatcher is absent (vanilla case) or can't be
 * parsed.
 */
export function extractDeckLimits(exe: Buffer): DeckLimits | null {
  const header = parsePsxExeHeader(exe);
  const dispatcherOff = findDispatcherOffset(exe);
  const inlineRanges = findInlineOneCopyRanges(exe, header);
  if (dispatcherOff === -1) return buildInlineDeckLimits(inlineRanges);

  const prologue = parseDispatcherPrologue(exe, dispatcherOff);
  if (!prologue) return buildInlineDeckLimits(inlineRanges);

  const tableFileOff = ramToFile(prologue.tableRamAddr, header);
  if (tableFileOff === -1) return buildInlineDeckLimits(inlineRanges);
  const entries = readTableEntries(
    exe,
    tableFileOff,
    prologue.encodingOffset,
    prologue.blockEndCounters,
  );

  const callerOff = findJumpToRam(exe, ramToFile(prologue.dispatcherRamAddr, header), header);
  const exodiaRange = callerOff === -1 ? null : findExodiaRangeCheck(exe, callerOff);

  const byCard: Record<number, number> = {};
  for (const { cardId, maxCopies } of entries) byCard[cardId] = maxCopies;
  for (const range of inlineRanges) {
    for (let id = range.start; id < range.start + range.length; id++) byCard[id] = 1;
  }
  if (exodiaRange && inlineRanges.length === 0) {
    for (let id = exodiaRange.start; id < exodiaRange.start + exodiaRange.length; id++) {
      byCard[id] = 1;
    }
  }

  return {
    byCard,
    discovered: {
      source: "dispatcher",
      dispatcherRamAddr: prologue.dispatcherRamAddr,
      tableRamAddr: prologue.tableRamAddr,
      encodingOffset: prologue.encodingOffset,
      blockEndCounters: prologue.blockEndCounters,
      exodiaRange: inlineRanges[0] ?? exodiaRange,
    },
  };
}

// ---------------------------------------------------------------------------
// Internal: vanilla inline Exodia-style hard caps
// ---------------------------------------------------------------------------

function buildInlineDeckLimits(
  ranges: Array<{ start: number; length: number }>,
): DeckLimits | null {
  if (ranges.length === 0) return null;

  const byCard: Record<number, number> = {};
  for (const range of ranges) {
    for (let id = range.start; id < range.start + range.length; id++) byCard[id] = 1;
  }

  return {
    byCard,
    discovered: {
      source: "inline-range",
      dispatcherRamAddr: null,
      tableRamAddr: null,
      encodingOffset: null,
      blockEndCounters: null,
      exodiaRange: ranges[0] ?? null,
    },
  };
}

/**
 * Vanilla deck edit has no RP-style dispatcher. Instead, it inlines:
 *
 *   if (cardId - 17 < 5) canAdd = deckCount[cardId] < 1;
 *   ... later, for every card: deckCount[cardId] < 3
 *
 * Scan for that semantic shape rather than fixed addresses so PAL/NTSC and
 * nearby display/action routines all resolve to the same contiguous 1-copy
 * range.
 */
function findInlineOneCopyRanges(
  exe: Buffer,
  header: PsxExeHeader,
): Array<{ start: number; length: number }> {
  const ranges = new Map<string, { start: number; length: number }>();
  const textStart = PSX_EXE_HEADER_SIZE;
  const textEnd = Math.min(exe.length, textStart + header.textSize);
  for (let off = textStart; off + 2 * MIPS_INSTR_BYTES <= textEnd; off += MIPS_INSTR_BYTES) {
    const subIns = exe.readUInt32LE(off);
    if (subIns >>> 26 !== OP_ADDIU) continue;

    const range = parseNegativeRangeCheck(exe, off);
    if (!range || !hasInlineOneCopyDeckCountCheck(exe, off, textEnd)) continue;
    ranges.set(`${range.start}:${range.length}`, range);
  }
  return [...ranges.values()].sort((a, b) => a.start - b.start || a.length - b.length);
}

function parseNegativeRangeCheck(
  exe: Buffer,
  off: number,
): { start: number; length: number } | null {
  const subIns = exe.readUInt32LE(off);
  const rawImm = subIns & 0xffff;
  const sImm = rawImm & 0x8000 ? rawImm - 0x10000 : rawImm;
  if (sImm >= 0 || sImm < -NUM_CARDS) return null;

  const rt = (subIns >> 16) & 0x1f;
  const next = exe.readUInt32LE(off + MIPS_INSTR_BYTES);
  if (next >>> 26 !== OP_SLTIU) return null;
  if (((next >> 21) & 0x1f) !== rt || ((next >> 16) & 0x1f) !== rt) return null;

  const length = next & 0xffff;
  if (length < 2 || length > 32) return null;
  return { start: -sImm, length };
}

function hasInlineOneCopyDeckCountCheck(exe: Buffer, off: number, textEnd: number): boolean {
  const nearEnd = Math.min(textEnd, off + 20 * MIPS_INSTR_BYTES);
  const farEnd = Math.min(textEnd, off + 80 * MIPS_INSTR_BYTES);
  return (
    hasLoadByteOffset(exe, off, nearEnd, DECK_COUNT_OFFSET) &&
    hasUnsignedLessThanOne(exe, off, nearEnd) &&
    hasDefaultThreeCopyCheck(exe, off, farEnd)
  );
}

function hasDefaultThreeCopyCheck(exe: Buffer, start: number, end: number): boolean {
  for (let off = start; off + 2 * MIPS_INSTR_BYTES <= end; off += MIPS_INSTR_BYTES) {
    const load = exe.readUInt32LE(off);
    if (!isLoadByteOffset(load, DECK_COUNT_OFFSET)) continue;
    const cmp = exe.readUInt32LE(off + 2 * MIPS_INSTR_BYTES);
    if (cmp >>> 26 !== OP_SLTIU) continue;
    if ((cmp & 0xffff) === DEFAULT_MAX_COPIES) return true;
  }
  return false;
}

function hasLoadByteOffset(exe: Buffer, start: number, end: number, offset: number): boolean {
  for (let off = start; off + MIPS_INSTR_BYTES <= end; off += MIPS_INSTR_BYTES) {
    if (isLoadByteOffset(exe.readUInt32LE(off), offset)) return true;
  }
  return false;
}

function hasUnsignedLessThanOne(exe: Buffer, start: number, end: number): boolean {
  for (let off = start; off + MIPS_INSTR_BYTES <= end; off += MIPS_INSTR_BYTES) {
    const instr = exe.readUInt32LE(off);
    if (instr >>> 26 !== 0) continue;
    if ((instr & 0x3f) !== FN_SLTU) continue;
    const rt = (instr >> 16) & 0x1f;
    if (rt === 0 || hasAddiuFromZero(exe, start, off, rt, 1)) return true;
  }
  return false;
}

function hasAddiuFromZero(
  exe: Buffer,
  start: number,
  end: number,
  rt: number,
  value: number,
): boolean {
  for (let off = start; off < end; off += MIPS_INSTR_BYTES) {
    const instr = exe.readUInt32LE(off);
    if (instr >>> 26 !== OP_ADDIU) continue;
    if (((instr >> 21) & 0x1f) !== 0) continue;
    if (((instr >> 16) & 0x1f) !== rt) continue;
    if (signExtend16(instr & 0xffff) === value) return true;
  }
  return false;
}

function isLoadByteOffset(instr: number, offset: number): boolean {
  if (instr >>> 26 !== OP_LBU) return false;
  return signExtend16(instr & 0xffff) === offset;
}

// ---------------------------------------------------------------------------
// Internal: prologue parsing
// ---------------------------------------------------------------------------

interface DispatcherConstants {
  dispatcherRamAddr: number;
  tableRamAddr: number;
  encodingOffset: number;
  /** [twoCopyEndCounter, oneCopyEndCounter] — the two immediates the loop compares its iteration counter against. */
  blockEndCounters: [number, number];
}

function findDispatcherOffset(exe: Buffer): number {
  const limit = exe.length - DISPATCHER_PROLOGUE_SIGNATURE.length * MIPS_INSTR_BYTES;
  for (let off = PSX_EXE_HEADER_SIZE; off <= limit; off += MIPS_INSTR_BYTES) {
    let match = true;
    for (let k = 0; k < DISPATCHER_PROLOGUE_SIGNATURE.length; k++) {
      if (exe.readUInt32LE(off + k * MIPS_INSTR_BYTES) !== DISPATCHER_PROLOGUE_SIGNATURE[k]) {
        match = false;
        break;
      }
    }
    if (match) return off;
  }
  return -1;
}

/**
 * Walk the 10 instructions that follow the prologue signature to recover the
 * dispatcher's magic constants: the two iteration-counter boundaries, the
 * table base RAM address, and the card-id encoding offset.
 *
 * Layout (same in Alpha and RP):
 *   addiu t2, zero, 1           // counter init
 *   addiu t3, zero, imm_a        ← 2-copy window end
 *   addiu t4, zero, imm_b        ← 1-copy window end
 *   addiu a0, zero, 2           // default cap
 *   lui   t1, imm_hi            \  table RAM addr = (imm_hi << 16) + sign-extended(imm_lo)
 *   addiu t1, t1, imm_lo        /
 *   lui   t0, imm_top           (upper half of v1 base, unused here)
 *   sub   t0, v1, t0
 *   addiu t0, t0, imm_off        ← encoding offset
 */
function parseDispatcherPrologue(exe: Buffer, prologueOff: number): DispatcherConstants | null {
  const header = parsePsxExeHeader(exe);
  const dispatcherRamAddr = fileToRam(prologueOff, header);

  const afterPrologueOff = prologueOff + DISPATCHER_PROLOGUE_SIGNATURE.length * MIPS_INSTR_BYTES;
  const at = (i: number) => exe.readUInt32LE(afterPrologueOff + i * MIPS_INSTR_BYTES);

  const twoCopyEnd = immediate(at(1), OP_ADDIU, /*rs=*/ 0, /*rt=*/ 11 /* t3 */);
  const oneCopyEnd = immediate(at(2), OP_ADDIU, /*rs=*/ 0, /*rt=*/ 12 /* t4 */);
  if (twoCopyEnd === null || oneCopyEnd === null) return null;
  if (twoCopyEnd >= oneCopyEnd || twoCopyEnd < 2 || oneCopyEnd < twoCopyEnd + 2) return null;

  const luiT1 = upperImmediate(at(4), /*rt=*/ 9 /* t1 */);
  const addiuT1 = immediate(at(5), OP_ADDIU, /*rs=*/ 9 /* t1 */, /*rt=*/ 9 /* t1 */);
  if (luiT1 === null || addiuT1 === null) return null;
  const tableRamAddr = (luiT1 + addiuT1) >>> 0;

  const encodingOffset = immediate(at(8), OP_ADDIU, /*rs=*/ 8 /* t0 */, /*rt=*/ 8 /* t0 */);
  if (encodingOffset === null) return null;

  return {
    dispatcherRamAddr,
    tableRamAddr,
    encodingOffset,
    blockEndCounters: [twoCopyEnd, oneCopyEnd],
  };
}

// ---------------------------------------------------------------------------
// Internal: table walk
// ---------------------------------------------------------------------------

interface TableEntry {
  cardId: number;
  maxCopies: 1 | 2;
}

/**
 * Walk the u16 table exactly as the dispatcher does.
 *
 * Semantics: the counter starts at 1 and increments once per entry read.
 *  - While counter < twoCopyEnd, matching the entry yields a cap of 2.
 *  - At counter == twoCopyEnd, the dispatcher re-reads the same entry with
 *    the cap switched to 1 (harmless — that entry is always a zero padder).
 *  - Then entries continue with cap 1 until counter == oneCopyEnd.
 *
 * So the number of entries physically read is `oneCopyEnd - 2` (one entry
 * for each counter value from 1 to oneCopyEnd - 1, minus the re-read at the
 * boundary which doesn't advance the pointer).
 */
function readTableEntries(
  exe: Buffer,
  tableFileOff: number,
  encodingOffset: number,
  [twoCopyEnd, oneCopyEnd]: [number, number],
): TableEntry[] {
  const entryCount = oneCopyEnd - 2;
  const twoCopyLen = twoCopyEnd - 1;
  const results: TableEntry[] = [];
  for (let i = 0; i < entryCount; i++) {
    const off = tableFileOff + i * 2;
    if (off + 2 > exe.length) break;
    const raw = exe.readUInt16LE(off);
    if (raw === 0) continue;
    const cardId = raw - encodingOffset;
    if (cardId < 1 || cardId >= NUM_CARDS + 1) continue;
    const maxCopies: 1 | 2 = i < twoCopyLen ? 2 : 1;
    results.push({ cardId, maxCopies });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Internal: caller + Exodia range check
// ---------------------------------------------------------------------------

/**
 * Scan for `j <target>` or `jal <target>` anywhere in the text.
 * Returns the file offset of the first such instruction, or -1 if none.
 * (Matches both j and jal; RP/Alpha use `j` for the dispatcher.)
 */
function findJumpToRam(exe: Buffer, targetFileOff: number, header: PsxExeHeader): number {
  if (targetFileOff === -1) return -1;
  const targetRam = fileToRam(targetFileOff, header);
  const jImm = (targetRam >>> 2) & 0x03ffffff;
  const jOpcodes = [0x08000000 | jImm, 0x0c000000 | jImm]; // j, jal
  for (
    let off = PSX_EXE_HEADER_SIZE;
    off + MIPS_INSTR_BYTES <= exe.length;
    off += MIPS_INSTR_BYTES
  ) {
    const instr = exe.readUInt32LE(off);
    if (instr === jOpcodes[0] || instr === jOpcodes[1]) return off;
  }
  return -1;
}

/**
 * Scan backwards from the call site for `addiu rt, rs, -N` followed shortly
 * by `sltiu rt, rt, M`. If found, the caller is range-checking
 * `rs - N < M`, i.e. cards in [N, N + M).
 */
function findExodiaRangeCheck(
  exe: Buffer,
  callerFileOff: number,
): { start: number; length: number } | null {
  const scanStart = Math.max(PSX_EXE_HEADER_SIZE, callerFileOff - 80 * MIPS_INSTR_BYTES);
  for (let off = scanStart; off + MIPS_INSTR_BYTES < callerFileOff; off += MIPS_INSTR_BYTES) {
    const subIns = exe.readUInt32LE(off);
    if (subIns >>> 26 !== OP_ADDIU) continue;
    const rawImm = subIns & 0xffff;
    const sImm = rawImm & 0x8000 ? rawImm - 0x10000 : rawImm;
    if (sImm >= 0 || sImm < -NUM_CARDS) continue;
    const rt = (subIns >> 16) & 0x1f;

    for (let k = 1; k <= 4; k++) {
      const next = off + k * MIPS_INSTR_BYTES;
      if (next >= callerFileOff) break;
      const nextIns = exe.readUInt32LE(next);
      if (nextIns >>> 26 !== OP_SLTIU) continue;
      if (((nextIns >> 21) & 0x1f) !== rt) continue;
      const length = nextIns & 0xffff;
      if (length < 2 || length > 32) continue;
      return { start: -sImm, length };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Internal: MIPS helpers
// ---------------------------------------------------------------------------

const OP_ADDIU = 9;
const OP_LUI = 0xf;
const OP_LBU = 0x24;
const OP_SLTIU = 0xb;
const FN_SLTU = 0x2b;
const DECK_COUNT_OFFSET = 0x5ac4;

function immediate(
  instr: number,
  expectedOp: number,
  expectedRs: number,
  expectedRt: number,
): number | null {
  if (instr >>> 26 !== expectedOp) return null;
  if (((instr >> 21) & 0x1f) !== expectedRs) return null;
  if (((instr >> 16) & 0x1f) !== expectedRt) return null;
  return signExtend16(instr & 0xffff);
}

function upperImmediate(instr: number, expectedRt: number): number | null {
  if (instr >>> 26 !== OP_LUI) return null;
  if (((instr >> 16) & 0x1f) !== expectedRt) return null;
  return (instr & 0xffff) << 16;
}

function ramToFile(ramAddr: number, header: PsxExeHeader): number {
  const offsetInText = ramAddr - header.loadAddr;
  if (offsetInText < 0 || offsetInText >= header.textSize) return -1;
  return offsetInText + PSX_EXE_HEADER_SIZE;
}

function fileToRam(fileOff: number, header: PsxExeHeader): number {
  return header.loadAddr + (fileOff - PSX_EXE_HEADER_SIZE);
}

function signExtend16(value: number): number {
  return value & 0x8000 ? value - 0x10000 : value;
}
