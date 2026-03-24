import { describe, expect, it } from "vitest";
import { detectWaMrgLayout } from "./detect-wamrg.ts";
import { DUELIST_DECK_OFFSET, DUELIST_ENTRY_SIZE, FUSION_TABLE_SIZE, NUM_CARDS } from "./types.ts";

// US layout constants
const US_LAYOUT = {
  fusionTable: 0xb8_7800,
  equipTable: 0xb8_5000,
  starchipTable: 0xfb_9808,
  duelistTable: 0xe9_b000,
  artworkBlockSize: 0x3800,
};

/** Minimum buffer size to cover all US layout tables */
const MIN_BUF_SIZE = US_LAYOUT.starchipTable + NUM_CARDS * 8;

/**
 * Build a synthetic WA_MRG buffer that passes all US layout validators.
 * ~16MB but allocated as zeroed memory (fast, no disk).
 */
function makeValidUsWaMrg(): Buffer {
  const buf = Buffer.alloc(MIN_BUF_SIZE);

  // --- Fusion header at 0xB87800 ---
  // Format: 2 skip bytes + 722 uint16LE offsets.
  // Need: 100+ zeros, <712 zeros, non-decreasing non-zero offsets in [headerSize, 0x10000),
  //       firstNonZeroOff <= headerSize*2, byte at fusionTable+firstNonZeroOff != 0.
  const headerSize = 2 + NUM_CARDS * 2; // 1446
  const ft = US_LAYOUT.fusionTable;
  // Set ~200 cards to have fusion offsets, rest zero
  let offset = headerSize;
  for (let i = 0; i < 200 && offset < FUSION_TABLE_SIZE; i++) {
    buf.writeUInt16LE(offset, ft + 2 + i * 2);
    // Write a non-zero count byte at that offset so the first non-zero passes
    buf[ft + offset] = 1;
    offset += 10;
  }

  // --- Equip table at 0xB85000 ---
  // First entry: (equipId: 1-722, monsterCount: 1-722)
  buf.writeUInt16LE(100, US_LAYOUT.equipTable);
  buf.writeUInt16LE(5, US_LAYOUT.equipTable + 2);

  // --- Starchip table at 0xFB9808 ---
  // 722 entries of (cost:u32 ≤ 999999, password:u32 valid BCD or 0xFFFFFFFE).
  // Need 100+ non-zero costs.
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = US_LAYOUT.starchipTable + i * 8;
    if (i < 200) {
      buf.writeUInt32LE(1000 + i, off); // non-zero cost
    }
    buf.writeUInt32LE(0xfffffffe, off + 4); // no-password sentinel
  }

  // --- Duelist table at 0xE9B000 ---
  // Spot-checked duelists: [0, 10, 19, 29, 38]
  // Each pool (deck, sa_pow, bcd, sa_tec) must be sparse (>=300 zeros, all <=2048).
  // Deck must have >=5 non-zero entries.
  for (const di of [0, 10, 19, 29, 38]) {
    const entryBase = US_LAYOUT.duelistTable + di * DUELIST_ENTRY_SIZE;
    // Write 10 non-zero deck entries (small values ≤ 2048)
    for (let c = 0; c < 10; c++) {
      buf.writeUInt16LE(1 + c, entryBase + DUELIST_DECK_OFFSET + c * 2);
    }
    // sa_pow, bcd, sa_tec: all zeros is fine (>=300 zeros ✓, all ≤2048 ✓)
    // But we need them to exist within the buffer (they do since buffer is large enough)
  }

  return buf;
}

describe("detectWaMrgLayout", () => {
  it("detects US layout from valid synthetic buffer", () => {
    const waMrg = makeValidUsWaMrg();
    const layout = detectWaMrgLayout(waMrg);
    expect(layout).toEqual(US_LAYOUT);
  });

  it("throws on buffer too small for any layout", () => {
    const tiny = Buffer.alloc(1024);
    expect(() => detectWaMrgLayout(tiny)).toThrow("Could not match");
  });

  it("throws on all-zero buffer (even if large enough)", () => {
    const zeros = Buffer.alloc(MIN_BUF_SIZE);
    expect(() => detectWaMrgLayout(zeros)).toThrow("Could not match");
  });

  it("throws when fusion header is corrupted", () => {
    const waMrg = makeValidUsWaMrg();
    // Corrupt fusion header: write descending offsets (violates non-decreasing)
    const ft = US_LAYOUT.fusionTable;
    for (let i = 0; i < 200; i++) {
      buf16LE(waMrg, ft + 2 + i * 2, 60000 - i * 100);
    }
    expect(() => detectWaMrgLayout(waMrg)).toThrow("Could not match");
  });

  it("throws when starchip costs are too high", () => {
    const waMrg = makeValidUsWaMrg();
    // Set all starchip costs > 999999
    for (let i = 0; i < NUM_CARDS; i++) {
      waMrg.writeUInt32LE(1_000_000, US_LAYOUT.starchipTable + i * 8);
    }
    expect(() => detectWaMrgLayout(waMrg)).toThrow("Could not match");
  });

  it("throws when equip table has invalid first entry", () => {
    const waMrg = makeValidUsWaMrg();
    // equipId=0 is invalid
    waMrg.writeUInt16LE(0, US_LAYOUT.equipTable);
    expect(() => detectWaMrgLayout(waMrg)).toThrow("Could not match");
  });
});

/** Helper to write uint16LE */
function buf16LE(buf: Buffer, offset: number, value: number): void {
  buf.writeUInt16LE(value, offset);
}
