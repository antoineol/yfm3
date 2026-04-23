import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_COPIES, extractDeckLimits } from "./extract-deck-limits.ts";

/**
 * Build a PSX-EXE buffer whose text section contains a synthetic deck-limit
 * dispatcher at the given RAM address, followed by a u16 table.
 *
 * The synthesized dispatcher mirrors the byte layout of the real one in RP
 * and Alpha: 7-instruction prologue, 10 prologue-tail instructions encoding
 * the magic constants, then the loop body (not checked by the extractor).
 */
function buildTestExe(params: {
  loadAddr: number;
  dispatcherRamAddr: number;
  tableRamAddr: number;
  encodingOffset: number;
  twoCopyEnd: number;
  oneCopyEnd: number;
  /** Entries in the order they sit in the table. Use 0 for padding slots. */
  tableEntries: number[];
  /** Optional Exodia-style range check in the caller, emitted as a tiny function. */
  callerExodia?: { start: number; length: number };
}): Buffer {
  const headerSize = 0x800;
  const textSize = 0x20_000;
  const exe = Buffer.alloc(headerSize + textSize);
  exe.write("PS-X EXE", 0, "ascii");
  exe.writeUInt32LE(params.loadAddr, 0x18);
  exe.writeUInt32LE(textSize, 0x1c);

  const ramToFile = (ram: number) => ram - params.loadAddr + headerSize;

  // --- dispatcher prologue signature (7 instructions) ---
  const dOff = ramToFile(params.dispatcherRamAddr);
  const signature = [
    0x2442feb0, 0xac480000, 0xac490004, 0xac4a0008, 0xac4b000c, 0xac4c0010, 0xac4d0014,
  ];
  for (let i = 0; i < signature.length; i++) {
    exe.writeUInt32LE(signature[i] as number, dOff + i * 4);
  }

  // --- constant-setup block (10 instructions). Only 5 of them are actually
  //     parsed; the rest must just parse past without error so we mirror the
  //     real layout faithfully. ---
  const addiu = (rt: number, rs: number, simm: number) =>
    (9 << 26) | ((rs & 0x1f) << 21) | ((rt & 0x1f) << 16) | (simm & 0xffff);
  const lui = (rt: number, uimm: number) => (0xf << 26) | ((rt & 0x1f) << 16) | (uimm & 0xffff);
  // sub rd, rs, rt (funct=0x22)
  const sub = (rd: number, rs: number, rt: number) =>
    ((rs & 0x1f) << 21) | ((rt & 0x1f) << 16) | ((rd & 0x1f) << 11) | 0x22;
  // register aliases we care about: t0=8, t1=9, t2=10, t3=11, t4=12, v1=3, zero=0, a0=4
  const tailStart = dOff + 7 * 4;
  const highHalf = (params.tableRamAddr >>> 16) & 0xffff;
  const lowHalf = params.tableRamAddr & 0xffff;
  // If low half would appear as negative when sign-extended, add 1 to the high half
  // and keep the negative low half. This matches real lui/addiu pairs.
  let highFix = highHalf;
  let lowFix = lowHalf;
  if (lowHalf & 0x8000) {
    highFix = (highHalf + 1) & 0xffff;
    lowFix = lowHalf - 0x10000;
  }
  const tail = [
    addiu(10, 0, 1), // addiu t2, zero, 1
    addiu(11, 0, params.twoCopyEnd), // addiu t3, zero, twoCopyEnd
    addiu(12, 0, params.oneCopyEnd), // addiu t4, zero, oneCopyEnd
    addiu(4, 0, 2), // addiu a0, zero, 2
    lui(9, highFix), // lui t1, highFix
    addiu(9, 9, lowFix), // addiu t1, t1, lowFix
    lui(8, 0x8010), // lui t0, 0x8010
    sub(8, 3, 8), // sub t0, v1, t0
    addiu(8, 8, params.encodingOffset), // addiu t0, t0, encodingOffset
    0, // pad (lhu goes here in real code; not parsed)
  ];
  for (let i = 0; i < tail.length; i++) {
    exe.writeUInt32LE(tail[i] as number, tailStart + i * 4);
  }

  // --- u16 table ---
  const tOff = ramToFile(params.tableRamAddr);
  for (let i = 0; i < params.tableEntries.length; i++) {
    exe.writeUInt16LE(params.tableEntries[i] as number, tOff + i * 2);
  }

  // --- optional caller with Exodia-style range check + j dispatcher ---
  if (params.callerExodia) {
    // Place the caller well away from the dispatcher prologue to avoid any
    // conflicts with the searched window.
    const callerRam = params.dispatcherRamAddr + 0x4000;
    const cOff = ramToFile(callerRam);
    // addiu v0, s0, -start; sltiu v0, v0, length; nop
    const sltiu = (rt: number, rs: number, uimm: number) =>
      (0xb << 26) | ((rs & 0x1f) << 21) | ((rt & 0x1f) << 16) | (uimm & 0xffff);
    exe.writeUInt32LE(addiu(2, 16, -params.callerExodia.start), cOff);
    exe.writeUInt32LE(sltiu(2, 2, params.callerExodia.length), cOff + 4);
    exe.writeUInt32LE(0, cOff + 8);
    // j <dispatcher> ; nop
    const jTarget = (params.dispatcherRamAddr >>> 2) & 0x03_ffffff;
    exe.writeUInt32LE((2 << 26) | jTarget, cOff + 12);
    exe.writeUInt32LE(0, cOff + 16);
  }

  return exe;
}

describe("extractDeckLimits", () => {
  it("returns null when dispatcher is absent (vanilla-style EXE)", () => {
    const exe = Buffer.alloc(0x800 + 0x1000);
    exe.write("PS-X EXE", 0, "ascii");
    exe.writeUInt32LE(0x8001_0000, 0x18);
    exe.writeUInt32LE(0x1000, 0x1c);
    expect(extractDeckLimits(exe)).toBeNull();
  });

  it("decodes a table with 2-copy and 1-copy entries using real Alpha constants", () => {
    // Alpha's layout: offset 31452, counters [17, 28], 14 × 2-copy + 10 × 1-copy
    // with two zero padders between.
    const twoCopy = [329, 657, 685]; // 3 entries (rest padded with zeros)
    const oneCopy = [249, 312, 720]; // 3 entries
    const twoCopyEnd = 17; // iterations 1..16 → entries 0..15 in 2-copy window
    const oneCopyEnd = 28;
    const twoCopyLen = twoCopyEnd - 1;
    const totalEntries = oneCopyEnd - 2;
    const encode = (id: number) => (id + 31452) & 0xffff;
    const tableEntries = new Array(totalEntries).fill(0);
    twoCopy.forEach((id, i) => {
      tableEntries[i] = encode(id);
    });
    oneCopy.forEach((id, i) => {
      tableEntries[twoCopyLen + i] = encode(id);
    });

    const exe = buildTestExe({
      loadAddr: 0x8001_0000,
      dispatcherRamAddr: 0x8001_2000,
      tableRamAddr: 0x8001_1000,
      encodingOffset: 31452,
      twoCopyEnd,
      oneCopyEnd,
      tableEntries,
    });

    const limits = extractDeckLimits(exe);
    expect(limits).not.toBeNull();
    expect(limits?.discovered).toMatchObject({
      dispatcherRamAddr: 0x8001_2000,
      tableRamAddr: 0x8001_1000,
      encodingOffset: 31452,
      blockEndCounters: [17, 28],
    });
    expect(limits?.byCard).toEqual({
      249: 1,
      312: 1,
      329: 2,
      657: 2,
      685: 2,
      720: 1,
    });
  });

  it("detects a hardcoded 1-copy range (Exodia-style) in the caller", () => {
    const exe = buildTestExe({
      loadAddr: 0x8001_0000,
      dispatcherRamAddr: 0x8001_2000,
      tableRamAddr: 0x8001_1000,
      encodingOffset: 31452,
      twoCopyEnd: 17,
      oneCopyEnd: 28,
      tableEntries: new Array(26).fill(0),
      callerExodia: { start: 17, length: 5 },
    });
    const limits = extractDeckLimits(exe);
    expect(limits).not.toBeNull();
    expect(limits?.discovered.exodiaRange).toEqual({ start: 17, length: 5 });
    expect(limits?.byCard).toEqual({ 17: 1, 18: 1, 19: 1, 20: 1, 21: 1 });
  });

  it("returns empty byCard when the table is all zeros and no caller range", () => {
    const exe = buildTestExe({
      loadAddr: 0x8001_0000,
      dispatcherRamAddr: 0x8001_2000,
      tableRamAddr: 0x8001_1000,
      encodingOffset: 31452,
      twoCopyEnd: 17,
      oneCopyEnd: 28,
      tableEntries: new Array(26).fill(0),
    });
    const limits = extractDeckLimits(exe);
    expect(limits).not.toBeNull();
    expect(limits?.byCard).toEqual({});
  });

  it("uses whatever encoding offset the prologue declares, not a hardcoded one", () => {
    // Same shape as the real dispatcher, but with a different offset to prove
    // we're reading it from the instruction stream.
    const customOffset = 12345;
    const encode = (id: number) => (id + customOffset) & 0xffff;
    const entries = new Array(26).fill(0);
    entries[0] = encode(10); // 2-copy
    entries[16] = encode(20); // 1-copy
    const exe = buildTestExe({
      loadAddr: 0x8001_0000,
      dispatcherRamAddr: 0x8001_2000,
      tableRamAddr: 0x8001_1000,
      encodingOffset: customOffset,
      twoCopyEnd: 17,
      oneCopyEnd: 28,
      tableEntries: entries,
    });
    const limits = extractDeckLimits(exe);
    expect(limits?.discovered.encodingOffset).toBe(customOffset);
    expect(limits?.byCard).toEqual({ 10: 2, 20: 1 });
  });

  it("exposes DEFAULT_MAX_COPIES for consumers that need the fallback", () => {
    expect(DEFAULT_MAX_COPIES).toBe(3);
  });
});

describe("extractDeckLimits — real fixture parity (Alpha / RP / vanilla)", async () => {
  // These tests only run when the repo's fixture binaries are present. They
  // give us end-to-end coverage without shipping the ~6 MB of binaries in the
  // test suite.
  const { existsSync, readFileSync } = await import("node:fs");

  const alphaPath = "./gamedata/exe/alpha-slus.bin";
  if (existsSync(alphaPath)) {
    it("decodes Alpha's 15 × 1-copy + 14 × 2-copy rule", () => {
      const exe = readFileSync(alphaPath);
      const limits = extractDeckLimits(exe);
      if (!limits) throw new Error("expected dispatcher in Alpha SLUS");
      const oneCopy = Object.entries(limits.byCard)
        .filter(([, v]) => v === 1)
        .map(([k]) => Number(k))
        .sort((a, b) => a - b);
      const twoCopy = Object.entries(limits.byCard)
        .filter(([, v]) => v === 2)
        .map(([k]) => Number(k))
        .sort((a, b) => a - b);
      expect(oneCopy).toEqual([
        17, 18, 19, 20, 21, 249, 312, 655, 669, 686, 698, 699, 700, 710, 720,
      ]);
      expect(twoCopy).toEqual([
        298, 299, 300, 309, 329, 337, 344, 348, 350, 657, 661, 672, 685, 690,
      ]);
      expect(limits.discovered).toMatchObject({
        dispatcherRamAddr: 0x801c_f364,
        tableRamAddr: 0x801c_f324,
        encodingOffset: 31452,
        blockEndCounters: [17, 28],
        exodiaRange: { start: 17, length: 5 },
      });
    });
  }
});
