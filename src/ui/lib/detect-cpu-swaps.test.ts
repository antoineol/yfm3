import { describe, expect, it } from "vitest";
import { detectCpuSwaps } from "./detect-cpu-swaps.ts";

function slot(cardId: number, atk = 1000, def = 800) {
  return { cardId, atk, def };
}

const NOW = 1000;
/** Hand slot deal indices for a full 5-card hand. */
const FULL = [40, 41, 42, 43, 44];

describe("detectCpuSwaps", () => {
  it("detects a card swap (same deal index, different card ID)", () => {
    const prev = [slot(22), slot(14), slot(67), slot(0), slot(0)];
    const curr = [slot(71), slot(14), slot(67), slot(0), slot(0)];
    const result = detectCpuSwaps(prev, curr, FULL, FULL, true, true, NOW);
    expect(result).toEqual([{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }]);
  });

  it("detects multiple simultaneous swaps", () => {
    const prev = [slot(22), slot(14), slot(67), slot(69), slot(73)];
    const curr = [slot(71), slot(14), slot(68), slot(69), slot(73)];
    const result = detectCpuSwaps(prev, curr, FULL, FULL, true, true, NOW);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ slotIndex: 0, fromCardId: 22, toCardId: 71 });
    expect(result[1]).toMatchObject({ slotIndex: 2, fromCardId: 67, toCardId: 68 });
  });

  it("ignores initial deal (empty → populated)", () => {
    const prev = [slot(0), slot(0), slot(0), slot(0), slot(0)];
    const curr = [slot(22), slot(14), slot(67), slot(69), slot(73)];
    const emptySlots = [0xff, 0xff, 0xff, 0xff, 0xff];
    const result = detectCpuSwaps(prev, curr, emptySlots, FULL, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores card leaving hand (populated → empty)", () => {
    const prev = [slot(22), slot(14), slot(67), slot(69), slot(73)];
    const curr = [slot(0), slot(14), slot(67), slot(69), slot(73)];
    const result = detectCpuSwaps(prev, curr, FULL, [0xff, 41, 42, 43, 44], true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores intermediate 0/0 write during swap", () => {
    const prev = [slot(22, 800, 2000), slot(14), slot(67), slot(0), slot(0)];
    const curr = [slot(71, 0, 0), slot(14), slot(67), slot(0), slot(0)];
    const result = detectCpuSwaps(prev, curr, FULL, FULL, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores draws into previously empty slots (prevHandSlots=0xFF)", () => {
    const prev = [slot(14), slot(22), slot(14), slot(0), slot(0)];
    const curr = [slot(14), slot(22), slot(15), slot(22), slot(67)];
    const prevSlots = [43, 44, 0xff, 0xff, 0xff];
    const currSlots = [43, 44, 45, 46, 47];
    const result = detectCpuSwaps(prev, curr, prevSlots, currSlots, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("ignores hand shifts after fusions (deal index changes)", () => {
    // After fusions, remaining cards shift to fill gaps.
    // Slot 0 had cardId=Raigeki(337) with dealIndex=43,
    // but after shift slot 0 gets a different card with dealIndex=45.
    const prev = [slot(337), slot(67), slot(0), slot(0), slot(0)];
    const curr = [slot(67), slot(73), slot(15), slot(69), slot(0)];
    const prevSlots = [43, 44, 0xff, 0xff, 0xff];
    const currSlots = [44, 45, 46, 47, 0xff]; // deal indices changed!
    const result = detectCpuSwaps(prev, curr, prevSlots, currSlots, true, true, NOW);
    expect(result).toEqual([]);
  });

  it("returns empty when not in duel", () => {
    const prev = [slot(22), slot(14), slot(67), slot(0), slot(0)];
    const curr = [slot(71), slot(14), slot(67), slot(0), slot(0)];
    expect(detectCpuSwaps(prev, curr, null, null, false, false, NOW)).toEqual([]);
    expect(detectCpuSwaps(prev, curr, null, null, true, false, NOW)).toEqual([]);
    expect(detectCpuSwaps(prev, curr, null, null, false, true, NOW)).toEqual([]);
  });

  it("returns empty when prev or curr is undefined", () => {
    const hand = [slot(22), slot(14), slot(67), slot(0), slot(0)];
    expect(detectCpuSwaps(undefined, hand, null, null, true, true, NOW)).toEqual([]);
    expect(detectCpuSwaps(hand, undefined, null, null, true, true, NOW)).toEqual([]);
  });

  it("handles mismatched array lengths gracefully", () => {
    const prev = [slot(22), slot(14), slot(67)];
    const curr = [slot(71), slot(14), slot(67), slot(69), slot(73)];
    const result = detectCpuSwaps(prev, curr, FULL, FULL, true, true, NOW);
    expect(result).toEqual([{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }]);
  });

  it("still detects swaps when handSlots are null (unknown profile)", () => {
    const prev = [slot(22), slot(14), slot(67), slot(0), slot(0)];
    const curr = [slot(71), slot(14), slot(67), slot(0), slot(0)];
    const result = detectCpuSwaps(prev, curr, null, null, true, true, NOW);
    expect(result).toEqual([{ slotIndex: 0, fromCardId: 22, toCardId: 71, timestamp: NOW }]);
  });
});
