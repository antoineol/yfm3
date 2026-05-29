import { describe, expect, it } from "vitest";
import { estimatedRankFactorNames, rankFactorsForBridge } from "./use-rank-tracker.ts";

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

  it("uses known rank counters and neutral values only for unmapped counters", () => {
    expect(
      rankFactorsForBridge({
        stats: {
          fusions: 1,
          terrain: 0,
          duelistId: 1,
          rankCounters: [2, 0, 0, 0, 1, null, 0, 0, 35, 8000],
        },
        shuffledDeck: [1, 2],
        lp: [6500, 4000],
      }),
    ).toMatchObject({
      turns: 2,
      effectiveAttacks: 0,
      fusionsInitiated: 1,
      equipMagicUsed: 2,
      pureMagicUsed: 0,
      trapsTriggered: 0,
      remainingCards: 35,
      remainingLp: 8000,
    });
  });
});

describe("estimatedRankFactorNames", () => {
  it("marks only null counters as estimated when partial rank counters are available", () => {
    expect(
      estimatedRankFactorNames({
        stats: {
          fusions: 1,
          terrain: 0,
          duelistId: 1,
          rankCounters: [2, 0, 0, 0, 1, null, 0, 0, 35, 8000],
        },
        shuffledDeck: null,
        lp: null,
      }),
    ).toEqual(["Equips"]);
  });
});
