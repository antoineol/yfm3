import { describe, expect, it } from "vitest";

import { accumulateCpuSwaps, detectCpuSwaps, type SwapSnapshot } from "./detect-cpu-swaps.ts";

const NOW = 1000;

describe("accumulateCpuSwaps", () => {
  function snap(hand: number[], fieldCount = 0, inDuel = true): SwapSnapshot {
    return { opponentHand: hand, opponentFieldCount: fieldCount, inDuel };
  }

  it("returns [] when duel ended", () => {
    const existing = [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }];
    const result = accumulateCpuSwaps(existing, snap([22]), snap([71], 0, false), "opponent", NOW);
    expect(result).toEqual([]);
  });

  it("preserves existing empty-array ref when not in duel (ref stability across polls)", () => {
    const existing: ReturnType<typeof accumulateCpuSwaps> = [];
    const result = accumulateCpuSwaps(
      existing,
      snap([], 0, false),
      snap([], 0, false),
      "other",
      NOW,
    );
    expect(result).toBe(existing);
  });

  it("returns existing when not opponent's turn", () => {
    const existing = [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }];
    const result = accumulateCpuSwaps(existing, snap([22]), snap([71]), "hand", NOW);
    expect(result).toBe(existing);
  });

  it("detects and appends new swaps", () => {
    const result = accumulateCpuSwaps([], snap([22, 14]), snap([71, 14]), "opponent", NOW);
    expect(result).toEqual([{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }]);
  });

  it("deduplicates same-direction swaps", () => {
    const existing = [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }];
    const result = accumulateCpuSwaps(
      existing,
      snap([22, 14]),
      snap([71, 14]),
      "opponent",
      NOW + 50,
    );
    expect(result).toHaveLength(1);
    expect(result).toBe(existing);
  });

  it("deduplicates reverse-direction swaps", () => {
    const existing = [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }];
    // Reverse: 71→22 at same slot
    const result = accumulateCpuSwaps(
      existing,
      snap([71, 14]),
      snap([22, 14]),
      "opponent",
      NOW + 50,
    );
    expect(result).toHaveLength(1);
    expect(result).toBe(existing);
  });

  it("returns existing (by reference) when no new swaps detected", () => {
    const existing = [{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }];
    const result = accumulateCpuSwaps(existing, snap([14, 67]), snap([14, 67]), "opponent", NOW);
    expect(result).toBe(existing);
  });
});

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
