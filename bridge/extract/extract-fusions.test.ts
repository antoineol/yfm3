import { describe, expect, it } from "vitest";
import { extractFusions } from "./extract-fusions.ts";
import type { WaMrgLayout } from "./types.ts";
import { FUSION_TABLE_SIZE, NUM_CARDS } from "./types.ts";

const FUSION_TABLE_OFFSET = 0x100;
const HEADER_SIZE = 2 + NUM_CARDS * 2; // 1446

const layout: WaMrgLayout = {
  fusionTable: FUSION_TABLE_OFFSET,
  equipTable: 0,
  starchipTable: 0,
  duelistTable: 0,
  artworkBlockSize: 0x3800,
};

/**
 * Encode a fusion entry's 5-byte group for two fusions.
 * Each fusion: (mat2, result) where mat2 and result are 10-bit values.
 */
function encodeFusionGroup(mat2a: number, resa: number, mat2b: number, resb: number): Buffer {
  const ctrl =
    ((mat2a >> 8) & 0x03) |
    (((resa >> 8) & 0x03) << 2) |
    (((mat2b >> 8) & 0x03) << 4) |
    (((resb >> 8) & 0x03) << 6);
  return Buffer.from([ctrl, mat2a & 0xff, resa & 0xff, mat2b & 0xff, resb & 0xff]);
}

function makeFusionTable(entries: { cardIndex: number; fusions: [number, number][] }[]): Buffer {
  const buf = Buffer.alloc(FUSION_TABLE_OFFSET + FUSION_TABLE_SIZE);
  const tableBase = FUSION_TABLE_OFFSET;

  // Track where to write fusion data (after the header)
  let dataPos = HEADER_SIZE;

  for (const entry of entries) {
    const count = entry.fusions.length;
    // Write offset for this card
    buf.writeUInt16LE(dataPos, tableBase + 2 + entry.cardIndex * 2);

    // Write count byte
    buf[tableBase + dataPos] = count;
    let pos = dataPos + 1;

    // Write fusion pairs in 5-byte groups
    for (let i = 0; i < count; i += 2) {
      const pair = entry.fusions[i] ?? [0, 0];
      const [mat2a, resa] = pair;
      const mat2b = i + 1 < count ? (entry.fusions[i + 1]?.[0] ?? 0) : 0;
      const resb = i + 1 < count ? (entry.fusions[i + 1]?.[1] ?? 0) : 0;
      const group = encodeFusionGroup(mat2a, resa, mat2b, resb);
      group.copy(buf, tableBase + pos);
      pos += 5;
    }

    dataPos = pos;
  }

  return buf;
}

describe("extractFusions", () => {
  it("parses a simple two-fusion entry for one card", () => {
    // Card index 0 → mat1=1, fuses with card 5 → result 10, and card 8 → result 15
    const waMrg = makeFusionTable([
      {
        cardIndex: 0,
        fusions: [
          [5, 10],
          [8, 15],
        ],
      },
    ]);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toEqual([
      { material1: 1, material2: 5, result: 10 },
      { material1: 1, material2: 8, result: 15 },
    ]);
  });

  it("parses fusions with 10-bit values (>255)", () => {
    // Card index 0 → mat1=1, fuses with card 260 → result 300
    const waMrg = makeFusionTable([{ cardIndex: 0, fusions: [[260, 300]] }]);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toEqual([{ material1: 1, material2: 260, result: 300 }]);
  });

  it("parses odd-count fusions (3 fusions = 2 groups, second group half-used)", () => {
    const waMrg = makeFusionTable([
      {
        cardIndex: 0,
        fusions: [
          [5, 10],
          [8, 15],
          [12, 20],
        ],
      },
    ]);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toHaveLength(3);
    expect(fusions[2]).toEqual({ material1: 1, material2: 12, result: 20 });
  });

  it("skips entries where mat1 > mat2", () => {
    // Card index 9 → mat1=10. Fusion with mat2=3 should be skipped (10 > 3).
    // Fusion with mat2=20 should be kept.
    const waMrg = makeFusionTable([
      {
        cardIndex: 9,
        fusions: [
          [3, 50],
          [20, 60],
        ],
      },
    ]);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toEqual([{ material1: 10, material2: 20, result: 60 }]);
  });

  it("deduplicates same (material1, material2) pair", () => {
    // Two separate card entries that produce the same pair.
    // Card index 0 → mat1=1, two identical fusions with mat2=5
    const buf = Buffer.alloc(FUSION_TABLE_OFFSET + FUSION_TABLE_SIZE);
    const tableBase = FUSION_TABLE_OFFSET;
    const dataPos = HEADER_SIZE;

    buf.writeUInt16LE(dataPos, tableBase + 2 + 0 * 2);
    buf[tableBase + dataPos] = 2; // count=2
    // Both fusions: mat2=5, result=10 and mat2=5, result=20
    const group = encodeFusionGroup(5, 10, 5, 20);
    group.copy(buf, tableBase + dataPos + 1);

    const fusions = extractFusions(buf, layout);
    // First (1,5)→10 is kept, second (1,5)→20 is deduped
    expect(fusions).toEqual([{ material1: 1, material2: 5, result: 10 }]);
  });

  it("returns empty array when no card has fusions", () => {
    const waMrg = Buffer.alloc(FUSION_TABLE_OFFSET + FUSION_TABLE_SIZE);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toEqual([]);
  });

  it("handles multiple cards with fusions", () => {
    const waMrg = makeFusionTable([
      { cardIndex: 0, fusions: [[5, 10]] },
      { cardIndex: 4, fusions: [[6, 11]] },
    ]);
    const fusions = extractFusions(waMrg, layout);
    expect(fusions).toEqual([
      { material1: 1, material2: 5, result: 10 },
      { material1: 5, material2: 6, result: 11 },
    ]);
  });

  it("handles extended count encoding (countByte=0)", () => {
    // When countByte is 0, count = 511 - nextByte, and offset advances by 1.
    // Let's use nextByte=509 → count=2
    const buf = Buffer.alloc(FUSION_TABLE_OFFSET + FUSION_TABLE_SIZE);
    const tableBase = FUSION_TABLE_OFFSET;
    const dataPos = HEADER_SIZE;

    buf.writeUInt16LE(dataPos, tableBase + 2 + 0 * 2); // card index 0
    buf[tableBase + dataPos] = 0; // countByte=0 → extended
    buf[tableBase + dataPos + 1] = 509; // count = 511 - 509 = 2
    // offset advances by 1, so data starts at dataPos+2
    const group = encodeFusionGroup(5, 10, 8, 15);
    group.copy(buf, tableBase + dataPos + 2);

    const fusions = extractFusions(buf, layout);
    expect(fusions).toEqual([
      { material1: 1, material2: 5, result: 10 },
      { material1: 1, material2: 8, result: 15 },
    ]);
  });
});
