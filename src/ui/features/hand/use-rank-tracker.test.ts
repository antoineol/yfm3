import { describe, expect, it } from "vitest";
import { rankFactorsForBridge } from "./use-rank-tracker.ts";

describe("rankFactorsForBridge", () => {
  it("uses partial mode values without inventing an equip count", () => {
    expect(
      rankFactorsForBridge({
        stats: { fusions: 2, terrain: 0, duelistId: 1, rankCounters: null },
        shuffledDeck: [1, 2, 0, 0],
        lp: [6500, 4000],
      }),
    ).toMatchObject({
      fusionsInitiated: 2,
      equipMagicUsed: 2,
      remainingCards: 2,
      remainingLp: 6500,
    });
  });

  it("uses full rank counters when all 10 values are available", () => {
    expect(
      rankFactorsForBridge({
        stats: {
          fusions: 3,
          terrain: 0,
          duelistId: 1,
          rankCounters: [8, 4, 1, 0, 3, 1, 2, 0, 31, 7000],
        },
        shuffledDeck: [1, 2],
        lp: [6500, 4000],
      }),
    ).toMatchObject({
      turns: 8,
      effectiveAttacks: 4,
      defensiveWins: 1,
      fusionsInitiated: 3,
      equipMagicUsed: 1,
      remainingCards: 31,
      remainingLp: 7000,
    });
  });
});
