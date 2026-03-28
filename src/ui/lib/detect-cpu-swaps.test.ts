import { describe, expect, it } from "vitest";
import { detectCpuSwaps } from "./detect-cpu-swaps.ts";

const NOW = 1000;

describe("detectCpuSwaps", () => {
  it("detects a card swap (same hand count, new card ID)", () => {
    const prev = [22, 14, 67];
    const curr = [71, 14, 67];
    const result = detectCpuSwaps(prev, curr, 0, 0, true, true, NOW);
    expect(result).toEqual([{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }]);
  });

  it("detects multiple simultaneous swaps", () => {
    const prev = [22, 14, 67, 69, 73];
    const curr = [71, 14, 68, 69, 73];
    const result = detectCpuSwaps(prev, curr, 0, 0, true, true, NOW);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ slotIndex: 0, fromCardId: 22, toCardId: 71 });
    expect(result[1]).toMatchObject({ slotIndex: 2, fromCardId: 67, toCardId: 68 });
  });

  it("ignores draws (hand count increased)", () => {
    const prev = [22, 14, 67, 69];
    const curr = [22, 14, 67, 69, 99];
    const result = detectCpuSwaps(prev, curr, 0, 0, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores plays (hand count decreased)", () => {
    const prev = [22, 14, 67, 69, 73];
    const curr = [14, 67, 69, 73];
    const result = detectCpuSwaps(prev, curr, 0, 0, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores changes when field changed (play to field)", () => {
    const prev = [22, 14, 67, 69, 73];
    const curr = [71, 14, 67, 69, 73];
    const result = detectCpuSwaps(prev, curr, 0, 1, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores initial deal (empty → populated)", () => {
    const prev: number[] = [];
    const curr = [22, 14, 67, 69, 73];
    const result = detectCpuSwaps(prev, curr, 0, 0, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("returns empty when not in duel", () => {
    const prev = [22, 14, 67];
    const curr = [71, 14, 67];
    expect(detectCpuSwaps(prev, curr, 0, 0, false, false, NOW)).toEqual([]);
    expect(detectCpuSwaps(prev, curr, 0, 0, true, false, NOW)).toEqual([]);
    expect(detectCpuSwaps(prev, curr, 0, 0, false, true, NOW)).toEqual([]);
  });

  it("ignores fusions (hand count decreased, field unchanged)", () => {
    // Fusion consumes 2 cards, produces 1 → hand shrinks by 1
    const prev = [22, 14, 67, 69, 73];
    const curr = [500, 67, 69, 73];
    const result = detectCpuSwaps(prev, curr, 1, 1, true, true, NOW);
    expect(result).toEqual([]);
  });
});
