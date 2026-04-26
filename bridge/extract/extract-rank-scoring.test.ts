import { describe, expect, it, vi } from "vitest";
import { extractRankScoring } from "./extract-rank-scoring.ts";

type Row = Array<[number, number]>;

const VANILLA_ROWS: Row[] = [
  [
    [5, 12],
    [9, 8],
    [29, 0],
    [33, -8],
    [0x7fff, -12],
  ],
  [
    [2, 4],
    [4, 2],
    [10, 0],
    [20, -2],
    [0x7fff, -4],
  ],
  [
    [2, 0],
    [6, -10],
    [10, -20],
    [15, -30],
    [0x7fff, -40],
  ],
  [
    [1, 0],
    [11, -2],
    [21, -4],
    [31, -6],
    [0x7fff, -8],
  ],
  [
    [1, 2],
    [4, -4],
    [7, -8],
    [10, -12],
    [0x7fff, -16],
  ],
  [
    [1, 2],
    [3, -8],
    [5, -16],
    [7, -24],
    [0x7fff, -32],
  ],
  [
    [9, 15],
    [13, 12],
    [33, 0],
    [37, -5],
    [0x7fff, -7],
  ],
  [
    [100, -7],
    [1000, -5],
    [7000, 0],
    [8000, 4],
    [0x7fff, 6],
  ],
  [
    [1, 4],
    [5, 0],
    [10, -4],
    [15, -8],
    [0x7fff, -12],
  ],
  [
    [1, 4],
    [5, 0],
    [10, -4],
    [15, -8],
    [0x7fff, -12],
  ],
];

describe("extractRankScoring", () => {
  it("converts the game's cards-used row into the app's cards-left factor", () => {
    const buffer = Buffer.alloc(512);
    writeTable(buffer, 32, VANILLA_ROWS);

    const result = extractRankScoring(buffer);

    expect(result?.tableCount).toBe(1);
    const cardsLeft = result?.factors.find((factor) => factor.key === "remainingCards");
    expect(cardsLeft?.thresholds).toEqual([4, 8, 28, 32]);
    expect(cardsLeft?.points).toEqual([-7, -5, 0, 12, 15]);
  });

  it("uses the majority table when repeated executable copies disagree", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const buffer = Buffer.alloc(1024);
    writeTable(buffer, 32, VANILLA_ROWS);
    writeTable(buffer, 288, patchCardsUsed(VANILLA_ROWS, [9, 32], [15, 20], [33, 0], [37, -5]));
    writeTable(buffer, 544, patchCardsUsed(VANILLA_ROWS, [9, 32], [15, 20], [33, 0], [37, -5]));

    const result = extractRankScoring(buffer);

    expect(result?.tableCount).toBe(3);
    expect(result?.selectedCount).toBe(2);
    expect(result?.variantCount).toBe(2);
    const cardsLeft = result?.factors.find((factor) => factor.key === "remainingCards");
    expect(cardsLeft?.thresholds).toEqual([4, 8, 26, 32]);
    expect(cardsLeft?.points).toEqual([-7, -5, 0, 20, 32]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("returns null when no rank table is present", () => {
    expect(extractRankScoring(Buffer.alloc(512))).toBeNull();
  });
});

function patchCardsUsed(rows: Row[], ...pairs: Row): Row[] {
  const next = rows.map((row) => row.map(([limit, points]) => [limit, points] as [number, number]));
  next[6] = [...pairs, [0x7fff, -7]];
  return next;
}

function writeTable(buffer: Buffer, offset: number, rows: Row[]): void {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row) continue;
    for (let pairIndex = 0; pairIndex < row.length; pairIndex++) {
      const pair = row[pairIndex];
      if (!pair) continue;
      const pairOffset = offset + rowIndex * 20 + pairIndex * 4;
      buffer.writeInt16LE(pair[0], pairOffset);
      buffer.writeInt16LE(pair[1], pairOffset + 2);
    }
  }
}
