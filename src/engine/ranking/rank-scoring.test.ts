import { describe, expect, it } from "vitest";
import type { RankFactors, VictoryType } from "./rank-scoring.ts";
import {
  computeFactorPoints,
  computeRankBreakdown,
  computeRankScore,
  getActiveZoneIndex,
  getFactorDefinitions,
  getFactorZoneDefinitions,
  getRankFromScore,
} from "./rank-scoring.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default factors: mid-range values that all score 0 contribution. */
function zeroFactors(): RankFactors {
  return {
    turns: 15, // 9..28 → 0
    effectiveAttacks: 5, // 4..9 → 0
    defensiveWins: 0, // <2 → 0
    faceDownPlays: 0, // <1 → 0
    fusionsInitiated: 2, // 1..4 → 0
    equipMagicUsed: 2, // 1..4 → 0
    pureMagicUsed: 0, // <1 → +2  (no "zero" bucket, smallest positive)
    trapsTriggered: 0, // <1 → +2
    remainingCards: 15, // 8..27 → 0
    remainingLp: 4000, // 1000..6999 → 0
  };
}

// ---------------------------------------------------------------------------
// Factor definitions
// ---------------------------------------------------------------------------

describe("getFactorDefinitions", () => {
  it("returns 10 factor definitions", () => {
    const defs = getFactorDefinitions();
    expect(defs).toHaveLength(10);
  });

  it("each definition has thresholds.length + 1 === points.length", () => {
    for (const def of getFactorDefinitions()) {
      expect(def.points).toHaveLength(def.thresholds.length + 1);
    }
  });

  it("returns copies (not references to internal data)", () => {
    const a = getFactorDefinitions();
    const b = getFactorDefinitions();
    a[0]?.thresholds.push(999);
    expect(b[0]?.thresholds).not.toContain(999);
  });
});

// ---------------------------------------------------------------------------
// computeFactorPoints — boundary tests for each factor
// ---------------------------------------------------------------------------

describe("computeFactorPoints", () => {
  describe("Turns (index 0): [5,9,29,33] → [+12,+8,0,-8,-12]", () => {
    it("below first threshold (<5) → +12", () => {
      expect(computeFactorPoints(0, 0)).toBe(12);
      expect(computeFactorPoints(0, 4)).toBe(12);
    });
    it("at first threshold (5) → +8", () => {
      expect(computeFactorPoints(0, 5)).toBe(8);
    });
    it("just below second threshold (8) → +8", () => {
      expect(computeFactorPoints(0, 8)).toBe(8);
    });
    it("at second threshold (9) → 0", () => {
      expect(computeFactorPoints(0, 9)).toBe(0);
    });
    it("mid-range (15) → 0", () => {
      expect(computeFactorPoints(0, 15)).toBe(0);
    });
    it("just below third threshold (28) → 0", () => {
      expect(computeFactorPoints(0, 28)).toBe(0);
    });
    it("at third threshold (29) → -8", () => {
      expect(computeFactorPoints(0, 29)).toBe(-8);
    });
    it("just below fourth threshold (32) → -8", () => {
      expect(computeFactorPoints(0, 32)).toBe(-8);
    });
    it("at fourth threshold (33) → -12", () => {
      expect(computeFactorPoints(0, 33)).toBe(-12);
    });
    it("well above fourth threshold (100) → -12", () => {
      expect(computeFactorPoints(0, 100)).toBe(-12);
    });
  });

  describe("Effective attacks (index 1): [2,4,10,20] → [+4,+2,0,-2,-4]", () => {
    it("<2 → +4", () => {
      expect(computeFactorPoints(1, 0)).toBe(4);
      expect(computeFactorPoints(1, 1)).toBe(4);
    });
    it("2 → +2", () => {
      expect(computeFactorPoints(1, 2)).toBe(2);
    });
    it("3 → +2", () => {
      expect(computeFactorPoints(1, 3)).toBe(2);
    });
    it("4 → 0", () => {
      expect(computeFactorPoints(1, 4)).toBe(0);
    });
    it("9 → 0", () => {
      expect(computeFactorPoints(1, 9)).toBe(0);
    });
    it("10 → -2", () => {
      expect(computeFactorPoints(1, 10)).toBe(-2);
    });
    it("19 → -2", () => {
      expect(computeFactorPoints(1, 19)).toBe(-2);
    });
    it("20 → -4", () => {
      expect(computeFactorPoints(1, 20)).toBe(-4);
    });
    it("50 → -4", () => {
      expect(computeFactorPoints(1, 50)).toBe(-4);
    });
  });

  describe("Defensive wins (index 2): [2,6,10,15] → [0,-10,-20,-30,-40]", () => {
    it("<2 → 0", () => {
      expect(computeFactorPoints(2, 0)).toBe(0);
      expect(computeFactorPoints(2, 1)).toBe(0);
    });
    it("2 → -10", () => {
      expect(computeFactorPoints(2, 2)).toBe(-10);
    });
    it("5 → -10", () => {
      expect(computeFactorPoints(2, 5)).toBe(-10);
    });
    it("6 → -20", () => {
      expect(computeFactorPoints(2, 6)).toBe(-20);
    });
    it("10 → -30", () => {
      expect(computeFactorPoints(2, 10)).toBe(-30);
    });
    it("15 → -40", () => {
      expect(computeFactorPoints(2, 15)).toBe(-40);
    });
    it("20 → -40", () => {
      expect(computeFactorPoints(2, 20)).toBe(-40);
    });
  });

  describe("Face-down plays (index 3): [1,11,21,31] → [0,-2,-4,-6,-8]", () => {
    it("<1 → 0", () => {
      expect(computeFactorPoints(3, 0)).toBe(0);
    });
    it("1 → -2", () => {
      expect(computeFactorPoints(3, 1)).toBe(-2);
    });
    it("10 → -2", () => {
      expect(computeFactorPoints(3, 10)).toBe(-2);
    });
    it("11 → -4", () => {
      expect(computeFactorPoints(3, 11)).toBe(-4);
    });
    it("21 → -6", () => {
      expect(computeFactorPoints(3, 21)).toBe(-6);
    });
    it("31 → -8", () => {
      expect(computeFactorPoints(3, 31)).toBe(-8);
    });
  });

  describe("Fusions initiated (index 4): [1,5,10,15] → [+4,0,-4,-8,-12]", () => {
    it("<1 → +4", () => {
      expect(computeFactorPoints(4, 0)).toBe(4);
    });
    it("1 → 0", () => {
      expect(computeFactorPoints(4, 1)).toBe(0);
    });
    it("4 → 0", () => {
      expect(computeFactorPoints(4, 4)).toBe(0);
    });
    it("5 → -4", () => {
      expect(computeFactorPoints(4, 5)).toBe(-4);
    });
    it("10 → -8", () => {
      expect(computeFactorPoints(4, 10)).toBe(-8);
    });
    it("15 → -12", () => {
      expect(computeFactorPoints(4, 15)).toBe(-12);
    });
  });

  describe("Equip magic used (index 5): [1,5,10,15] → [+4,0,-4,-8,-12]", () => {
    it("<1 → +4", () => {
      expect(computeFactorPoints(5, 0)).toBe(4);
    });
    it("1 → 0", () => {
      expect(computeFactorPoints(5, 1)).toBe(0);
    });
    it("5 → -4", () => {
      expect(computeFactorPoints(5, 5)).toBe(-4);
    });
    it("10 → -8", () => {
      expect(computeFactorPoints(5, 10)).toBe(-8);
    });
    it("15 → -12", () => {
      expect(computeFactorPoints(5, 15)).toBe(-12);
    });
  });

  describe("Pure magic used (index 6): [1,4,7,10] → [+2,-4,-8,-12,-16]", () => {
    it("<1 → +2", () => {
      expect(computeFactorPoints(6, 0)).toBe(2);
    });
    it("1 → -4", () => {
      expect(computeFactorPoints(6, 1)).toBe(-4);
    });
    it("3 → -4", () => {
      expect(computeFactorPoints(6, 3)).toBe(-4);
    });
    it("4 → -8", () => {
      expect(computeFactorPoints(6, 4)).toBe(-8);
    });
    it("7 → -12", () => {
      expect(computeFactorPoints(6, 7)).toBe(-12);
    });
    it("10 → -16", () => {
      expect(computeFactorPoints(6, 10)).toBe(-16);
    });
  });

  describe("Traps triggered (index 7): [1,3,5,7] → [+2,-8,-16,-24,-32]", () => {
    it("<1 → +2", () => {
      expect(computeFactorPoints(7, 0)).toBe(2);
    });
    it("1 → -8", () => {
      expect(computeFactorPoints(7, 1)).toBe(-8);
    });
    it("2 → -8", () => {
      expect(computeFactorPoints(7, 2)).toBe(-8);
    });
    it("3 → -16", () => {
      expect(computeFactorPoints(7, 3)).toBe(-16);
    });
    it("5 → -24", () => {
      expect(computeFactorPoints(7, 5)).toBe(-24);
    });
    it("7 → -32", () => {
      expect(computeFactorPoints(7, 7)).toBe(-32);
    });
    it("20 → -32", () => {
      expect(computeFactorPoints(7, 20)).toBe(-32);
    });
  });

  describe("Cards used / remaining (index 8): [4,8,28,32] → [-7,-5,0,+12,+15]", () => {
    it("<4 → -7", () => {
      expect(computeFactorPoints(8, 0)).toBe(-7);
      expect(computeFactorPoints(8, 3)).toBe(-7);
    });
    it("4 → -5", () => {
      expect(computeFactorPoints(8, 4)).toBe(-5);
    });
    it("7 → -5", () => {
      expect(computeFactorPoints(8, 7)).toBe(-5);
    });
    it("8 → 0", () => {
      expect(computeFactorPoints(8, 8)).toBe(0);
    });
    it("27 → 0", () => {
      expect(computeFactorPoints(8, 27)).toBe(0);
    });
    it("28 → +12", () => {
      expect(computeFactorPoints(8, 28)).toBe(12);
    });
    it("31 → +12", () => {
      expect(computeFactorPoints(8, 31)).toBe(12);
    });
    it("32 → +15", () => {
      expect(computeFactorPoints(8, 32)).toBe(15);
    });
    it("40 → +15", () => {
      expect(computeFactorPoints(8, 40)).toBe(15);
    });
  });

  describe("Remaining LP (index 9): [100,1000,7000,8000] → [-7,-5,0,+4,+6]", () => {
    it("<100 → -7", () => {
      expect(computeFactorPoints(9, 0)).toBe(-7);
      expect(computeFactorPoints(9, 99)).toBe(-7);
    });
    it("100 → -5", () => {
      expect(computeFactorPoints(9, 100)).toBe(-5);
    });
    it("999 → -5", () => {
      expect(computeFactorPoints(9, 999)).toBe(-5);
    });
    it("1000 → 0", () => {
      expect(computeFactorPoints(9, 1000)).toBe(0);
    });
    it("6999 → 0", () => {
      expect(computeFactorPoints(9, 6999)).toBe(0);
    });
    it("7000 → +4", () => {
      expect(computeFactorPoints(9, 7000)).toBe(4);
    });
    it("7999 → +4", () => {
      expect(computeFactorPoints(9, 7999)).toBe(4);
    });
    it("8000 → +6", () => {
      expect(computeFactorPoints(9, 8000)).toBe(6);
    });
    it("9999 → +6", () => {
      expect(computeFactorPoints(9, 9999)).toBe(6);
    });
  });

  describe("invalid factor index", () => {
    it("throws for negative index", () => {
      expect(() => computeFactorPoints(-1, 0)).toThrow("Invalid factor index");
    });
    it("throws for out-of-range index", () => {
      expect(() => computeFactorPoints(10, 0)).toThrow("Invalid factor index");
    });
  });
});

// ---------------------------------------------------------------------------
// Victory type bonuses
// ---------------------------------------------------------------------------

describe("victory type bonuses", () => {
  it("normal win adds +2", () => {
    const factors = zeroFactors();
    const scoreNormal = computeRankScore(factors, "normal");
    const scoreExodia = computeRankScore(factors, "exodia");
    // Difference: exodia(+40) - normal(+2) = 38
    expect(scoreExodia - scoreNormal).toBe(38);
  });

  it("deck-out subtracts 40", () => {
    const factors = zeroFactors();
    const scoreNormal = computeRankScore(factors, "normal");
    const scoreDeckout = computeRankScore(factors, "deckout");
    // Difference: normal(+2) - deckout(-40) = 42
    expect(scoreNormal - scoreDeckout).toBe(42);
  });

  it("exodia adds +40", () => {
    const breakdown = computeRankBreakdown(zeroFactors(), "exodia");
    expect(breakdown.victoryBonus).toBe(40);
  });

  it("normal adds +2", () => {
    const breakdown = computeRankBreakdown(zeroFactors(), "normal");
    expect(breakdown.victoryBonus).toBe(2);
  });

  it("deckout subtracts 40", () => {
    const breakdown = computeRankBreakdown(zeroFactors(), "deckout");
    expect(breakdown.victoryBonus).toBe(-40);
  });
});

// ---------------------------------------------------------------------------
// getRankFromScore — rank threshold boundaries
// ---------------------------------------------------------------------------

describe("getRankFromScore", () => {
  it("score 90 → S-POW", () => {
    const r = getRankFromScore(90);
    expect(r.label).toBe("S-POW");
    expect(r.starChips).toBe(5);
    expect(r.dropPool).toBe("SA-POW");
  });

  it("score 100 → S-POW", () => {
    expect(getRankFromScore(100).label).toBe("S-POW");
  });

  it("score 200 → S-POW (extreme high)", () => {
    expect(getRankFromScore(200).label).toBe("S-POW");
  });

  it("score 89 → A-POW", () => {
    const r = getRankFromScore(89);
    expect(r.label).toBe("A-POW");
    expect(r.starChips).toBe(4);
    expect(r.dropPool).toBe("SA-POW");
  });

  it("score 80 → A-POW", () => {
    expect(getRankFromScore(80).label).toBe("A-POW");
  });

  it("score 79 → B-POW", () => {
    const r = getRankFromScore(79);
    expect(r.label).toBe("B-POW");
    expect(r.starChips).toBe(3);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 70 → B-POW", () => {
    expect(getRankFromScore(70).label).toBe("B-POW");
  });

  it("score 69 → C-POW", () => {
    const r = getRankFromScore(69);
    expect(r.label).toBe("C-POW");
    expect(r.starChips).toBe(2);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 60 → C-POW", () => {
    expect(getRankFromScore(60).label).toBe("C-POW");
  });

  it("score 59 → D-POW", () => {
    const r = getRankFromScore(59);
    expect(r.label).toBe("D-POW");
    expect(r.starChips).toBe(1);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 50 → D-POW", () => {
    expect(getRankFromScore(50).label).toBe("D-POW");
  });

  it("score 49 → D-TEC", () => {
    const r = getRankFromScore(49);
    expect(r.label).toBe("D-TEC");
    expect(r.starChips).toBe(1);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 40 → D-TEC", () => {
    expect(getRankFromScore(40).label).toBe("D-TEC");
  });

  it("score 39 → C-TEC", () => {
    const r = getRankFromScore(39);
    expect(r.label).toBe("C-TEC");
    expect(r.starChips).toBe(2);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 30 → C-TEC", () => {
    expect(getRankFromScore(30).label).toBe("C-TEC");
  });

  it("score 29 → B-TEC", () => {
    const r = getRankFromScore(29);
    expect(r.label).toBe("B-TEC");
    expect(r.starChips).toBe(3);
    expect(r.dropPool).toBe("BCD");
  });

  it("score 20 → B-TEC", () => {
    expect(getRankFromScore(20).label).toBe("B-TEC");
  });

  it("score 19 → A-TEC", () => {
    const r = getRankFromScore(19);
    expect(r.label).toBe("A-TEC");
    expect(r.starChips).toBe(4);
    expect(r.dropPool).toBe("SA-TEC");
  });

  it("score 10 → A-TEC", () => {
    expect(getRankFromScore(10).label).toBe("A-TEC");
  });

  it("score 9 → S-TEC", () => {
    const r = getRankFromScore(9);
    expect(r.label).toBe("S-TEC");
    expect(r.starChips).toBe(5);
    expect(r.dropPool).toBe("SA-TEC");
  });

  it("score 0 → S-TEC", () => {
    expect(getRankFromScore(0).label).toBe("S-TEC");
  });

  it("score -50 → S-TEC (extreme low)", () => {
    expect(getRankFromScore(-50).label).toBe("S-TEC");
  });

  it("score is preserved in result", () => {
    expect(getRankFromScore(73).score).toBe(73);
  });
});

// ---------------------------------------------------------------------------
// computeRankBreakdown — structure and field checks
// ---------------------------------------------------------------------------

describe("computeRankBreakdown", () => {
  it("base is always 50", () => {
    const bd = computeRankBreakdown(zeroFactors(), "normal");
    expect(bd.base).toBe(50);
  });

  it("factors array has 10 entries", () => {
    const bd = computeRankBreakdown(zeroFactors(), "normal");
    expect(bd.factors).toHaveLength(10);
  });

  it("total equals base + victoryBonus + sum of factor points", () => {
    const bd = computeRankBreakdown(zeroFactors(), "normal");
    const factorSum = bd.factors.reduce((s, f) => s + f.points, 0);
    expect(bd.total).toBe(bd.base + bd.victoryBonus + factorSum);
  });

  it("each factor has min/max points", () => {
    const bd = computeRankBreakdown(zeroFactors(), "normal");
    for (const f of bd.factors) {
      expect(f.minPoints).toBeLessThanOrEqual(f.maxPoints);
      expect(f.points).toBeGreaterThanOrEqual(f.minPoints);
      expect(f.points).toBeLessThanOrEqual(f.maxPoints);
    }
  });

  it("rank is consistent with total", () => {
    const bd = computeRankBreakdown(zeroFactors(), "normal");
    const expected = getRankFromScore(bd.total);
    expect(bd.rank.label).toBe(expected.label);
    expect(bd.rank.score).toBe(bd.total);
  });
});

// ---------------------------------------------------------------------------
// computeRankScore — consistency with breakdown
// ---------------------------------------------------------------------------

describe("computeRankScore", () => {
  it("matches breakdown total", () => {
    const factors = zeroFactors();
    for (const vt of ["normal", "deckout", "exodia"] as VictoryType[]) {
      const score = computeRankScore(factors, vt);
      const bd = computeRankBreakdown(factors, vt);
      expect(score).toBe(bd.total);
    }
  });
});

// ---------------------------------------------------------------------------
// Full scenario tests
// ---------------------------------------------------------------------------

describe("scenario: Perfect S-POW", () => {
  // 4 turns, 1 attack, 0 defensive wins, 0 face-down, 0 fusions,
  // 0 equip, 0 magic, 0 traps, 35 remaining cards, 8000 LP, normal win
  const factors: RankFactors = {
    turns: 4, // <5 → +12
    effectiveAttacks: 1, // <2 → +4
    defensiveWins: 0, // <2 → 0
    faceDownPlays: 0, // <1 → 0
    fusionsInitiated: 0, // <1 → +4
    equipMagicUsed: 0, // <1 → +4
    pureMagicUsed: 0, // <1 → +2
    trapsTriggered: 0, // <1 → +2
    remainingCards: 35, // >=32 → +15
    remainingLp: 8000, // >=8000 → +6
  };
  // total = 50 + 2 + 12 + 4 + 0 + 0 + 4 + 4 + 2 + 2 + 15 + 6 = 101

  it("computes expected score", () => {
    const score = computeRankScore(factors, "normal");
    expect(score).toBe(101);
  });

  it("ranks as S-POW", () => {
    const bd = computeRankBreakdown(factors, "normal");
    expect(bd.rank.label).toBe("S-POW");
    expect(bd.rank.starChips).toBe(5);
    expect(bd.rank.dropPool).toBe("SA-POW");
  });

  it("breakdown factor names are correct", () => {
    const bd = computeRankBreakdown(factors, "normal");
    expect(bd.factors.map((f) => f.name)).toEqual([
      "Turns",
      "Eff. attacks",
      "Def. wins",
      "Face-downs",
      "Fusions",
      "Equips",
      "Magic",
      "Traps",
      "Cards left",
      "Remaining LP",
    ]);
  });
});

describe("scenario: Easy A-TEC via deck-out", () => {
  // deck-out victory with neutral stats
  // All factors at neutral (0 contribution where possible)
  const factors: RankFactors = {
    turns: 15, // 9..28 → 0
    effectiveAttacks: 5, // 4..9 → 0
    defensiveWins: 0, // <2 → 0
    faceDownPlays: 0, // <1 → 0
    fusionsInitiated: 2, // 1..4 → 0
    equipMagicUsed: 2, // 1..4 → 0
    pureMagicUsed: 0, // <1 → +2
    trapsTriggered: 0, // <1 → +2
    remainingCards: 15, // 8..27 → 0
    remainingLp: 4000, // 1000..6999 → 0
  };
  // total = 50 + (-40) + 0 + 0 + 0 + 0 + 0 + 0 + 2 + 2 + 0 + 0 = 14

  it("computes expected score", () => {
    const score = computeRankScore(factors, "deckout");
    expect(score).toBe(14);
  });

  it("ranks as A-TEC", () => {
    const bd = computeRankBreakdown(factors, "deckout");
    expect(bd.rank.label).toBe("A-TEC");
    expect(bd.rank.dropPool).toBe("SA-TEC");
  });
});

describe("scenario: Typical mid-game", () => {
  // ~15 turns, 5 attacks, 2 fusions, 1 equip, 20 remaining cards, 4000 LP
  const factors: RankFactors = {
    turns: 15, // 9..28 → 0
    effectiveAttacks: 5, // 4..9 → 0
    defensiveWins: 1, // <2 → 0
    faceDownPlays: 3, // 1..10 → -2
    fusionsInitiated: 2, // 1..4 → 0
    equipMagicUsed: 1, // 1..4 → 0
    pureMagicUsed: 0, // <1 → +2
    trapsTriggered: 0, // <1 → +2
    remainingCards: 20, // 8..27 → 0
    remainingLp: 4000, // 1000..6999 → 0
  };
  // total = 50 + 2 + 0 + 0 + 0 + (-2) + 0 + 0 + 2 + 2 + 0 + 0 = 54

  it("computes expected score", () => {
    const score = computeRankScore(factors, "normal");
    expect(score).toBe(54);
  });

  it("ranks in BCD drop pool (D-POW)", () => {
    const bd = computeRankBreakdown(factors, "normal");
    expect(bd.rank.label).toBe("D-POW");
    expect(bd.rank.dropPool).toBe("BCD");
  });
});

describe("scenario: Exodia victory with all-zero factors", () => {
  const factors: RankFactors = {
    turns: 0,
    effectiveAttacks: 0,
    defensiveWins: 0,
    faceDownPlays: 0,
    fusionsInitiated: 0,
    equipMagicUsed: 0,
    pureMagicUsed: 0,
    trapsTriggered: 0,
    remainingCards: 0,
    remainingLp: 0,
  };
  // turns: +12, attacks: +4, def: 0, fd: 0, fusions: +4, equip: +4,
  // magic: +2, traps: +2, cards: -7, lp: -7
  // factor sum = 12 + 4 + 0 + 0 + 4 + 4 + 2 + 2 + (-7) + (-7) = 14
  // total = 50 + 40 + 14 = 104

  it("computes expected score", () => {
    expect(computeRankScore(factors, "exodia")).toBe(104);
  });

  it("ranks as S-POW", () => {
    expect(computeRankBreakdown(factors, "exodia").rank.label).toBe("S-POW");
  });
});

describe("scenario: Worst possible score", () => {
  // Maximize all negative factors
  const factors: RankFactors = {
    turns: 50, // >=33 → -12
    effectiveAttacks: 30, // >=20 → -4
    defensiveWins: 20, // >=15 → -40
    faceDownPlays: 40, // >=31 → -8
    fusionsInitiated: 20, // >=15 → -12
    equipMagicUsed: 20, // >=15 → -12
    pureMagicUsed: 15, // >=10 → -16
    trapsTriggered: 10, // >=7 → -32
    remainingCards: 0, // <4 → -7
    remainingLp: 0, // <100 → -7
  };
  // factor sum = -12 + (-4) + (-40) + (-8) + (-12) + (-12) + (-16) + (-32) + (-7) + (-7) = -150
  // deckout: 50 + (-40) + (-150) = -140

  it("computes expected score with deckout", () => {
    expect(computeRankScore(factors, "deckout")).toBe(-140);
  });

  it("ranks as S-TEC", () => {
    expect(getRankFromScore(-140).label).toBe("S-TEC");
  });
});

describe("scenario: Best possible score", () => {
  // Maximize all positive factors
  const factors: RankFactors = {
    turns: 1, // <5 → +12
    effectiveAttacks: 0, // <2 → +4
    defensiveWins: 0, // <2 → 0
    faceDownPlays: 0, // <1 → 0
    fusionsInitiated: 0, // <1 → +4
    equipMagicUsed: 0, // <1 → +4
    pureMagicUsed: 0, // <1 → +2
    trapsTriggered: 0, // <1 → +2
    remainingCards: 40, // >=32 → +15
    remainingLp: 8000, // >=8000 → +6
  };
  // factor sum = 12 + 4 + 0 + 0 + 4 + 4 + 2 + 2 + 15 + 6 = 49
  // exodia: 50 + 40 + 49 = 139

  it("computes expected score with exodia", () => {
    expect(computeRankScore(factors, "exodia")).toBe(139);
  });

  it("ranks as S-POW", () => {
    expect(getRankFromScore(139).label).toBe("S-POW");
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("score exactly at each rank boundary", () => {
    const boundaries = [
      { score: 90, label: "S-POW" },
      { score: 89, label: "A-POW" },
      { score: 80, label: "A-POW" },
      { score: 79, label: "B-POW" },
      { score: 70, label: "B-POW" },
      { score: 69, label: "C-POW" },
      { score: 60, label: "C-POW" },
      { score: 59, label: "D-POW" },
      { score: 50, label: "D-POW" },
      { score: 49, label: "D-TEC" },
      { score: 40, label: "D-TEC" },
      { score: 39, label: "C-TEC" },
      { score: 30, label: "C-TEC" },
      { score: 29, label: "B-TEC" },
      { score: 20, label: "B-TEC" },
      { score: 19, label: "A-TEC" },
      { score: 10, label: "A-TEC" },
      { score: 9, label: "S-TEC" },
    ];
    for (const { score, label } of boundaries) {
      expect(getRankFromScore(score).label).toBe(label);
    }
  });

  it("all zero factors with normal win", () => {
    const factors: RankFactors = {
      turns: 0,
      effectiveAttacks: 0,
      defensiveWins: 0,
      faceDownPlays: 0,
      fusionsInitiated: 0,
      equipMagicUsed: 0,
      pureMagicUsed: 0,
      trapsTriggered: 0,
      remainingCards: 0,
      remainingLp: 0,
    };
    // 50 + 2 + 12 + 4 + 0 + 0 + 4 + 4 + 2 + 2 + (-7) + (-7) = 66
    expect(computeRankScore(factors, "normal")).toBe(66);
  });

  it("rank result grade and skill fields match label", () => {
    for (let score = -10; score <= 110; score += 5) {
      const r = getRankFromScore(score);
      expect(r.label).toBe(`${r.grade}-${r.skill}`);
    }
  });
});

// ---------------------------------------------------------------------------
// getFactorZoneDefinitions
// ---------------------------------------------------------------------------

describe("getFactorZoneDefinitions", () => {
  it("returns 10 factor zone layouts", () => {
    expect(getFactorZoneDefinitions()).toHaveLength(10);
  });

  it("each factor has exactly 5 zones", () => {
    for (const layout of getFactorZoneDefinitions()) {
      expect(layout.zones).toHaveLength(5);
    }
  });

  it("zones are ordered TEC→POW (ascending points)", () => {
    for (const layout of getFactorZoneDefinitions()) {
      const pts = layout.zones.map((z) => z.points);
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i]).toBeGreaterThanOrEqual(pts[i - 1] ?? -Infinity);
      }
    }
  });

  it("Equips zones (reversed: TEC left, POW right)", () => {
    const equips = getFactorZoneDefinitions().find((f) => f.name === "Equips");
    const pts = equips?.zones.map((z) => z.points);
    expect(pts).toEqual([-12, -8, -4, 0, 4]);
    // After reversal, leftLabel/rightLabel are swapped so open ends face outward
    const left = equips?.zones.map((z) => z.leftLabel);
    const right = equips?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "14", "9", "4", "0"]);
    expect(right).toEqual(["15", "10", "5", "1", ""]);
  });

  it("Turns zones (reversed: TEC left, POW right)", () => {
    const turns = getFactorZoneDefinitions().find((f) => f.name === "Turns");
    const pts = turns?.zones.map((z) => z.points);
    expect(pts).toEqual([-12, -8, 0, 8, 12]);
    const left = turns?.zones.map((z) => z.leftLabel);
    const right = turns?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "32", "28", "8", "4"]);
    expect(right).toEqual(["33", "29", "9", "5", ""]);
  });

  it("Remaining LP zones (not reversed, already ascending)", () => {
    const lp = getFactorZoneDefinitions().find((f) => f.name === "Remaining LP");
    const pts = lp?.zones.map((z) => z.points);
    expect(pts).toEqual([-7, -5, 0, 4, 6]);
    const left = lp?.zones.map((z) => z.leftLabel);
    const right = lp?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "100", "1k", "7k", "8k"]);
    expect(right).toEqual(["99", "1k", "7k", "8k", ""]);
  });

  it("Cards left zones (not reversed, already ascending)", () => {
    const cards = getFactorZoneDefinitions().find((f) => f.name === "Cards left");
    const pts = cards?.zones.map((z) => z.points);
    expect(pts).toEqual([-7, -5, 0, 12, 15]);
    const left = cards?.zones.map((z) => z.leftLabel);
    const right = cards?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "4", "8", "28", "32"]);
    expect(right).toEqual(["3", "7", "27", "31", ""]);
  });

  it("Traps zones (reversed: TEC left, POW right)", () => {
    const traps = getFactorZoneDefinitions().find((f) => f.name === "Traps");
    const pts = traps?.zones.map((z) => z.points);
    expect(pts).toEqual([-32, -24, -16, -8, 2]);
    const left = traps?.zones.map((z) => z.leftLabel);
    const right = traps?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "6", "4", "2", "0"]);
    expect(right).toEqual(["7", "5", "3", "1", ""]);
  });
});

// ---------------------------------------------------------------------------
// getActiveZoneIndex
// ---------------------------------------------------------------------------

describe("getActiveZoneIndex", () => {
  it("Turns: reversed — low turns (POW) on right, high turns (TEC) on left", () => {
    // Turns (index 0): reversed, display order [-12, -8, 0, +8, +12]
    expect(getActiveZoneIndex(0, 0)).toBe(4); // <5 turns → rightmost (POW)
    expect(getActiveZoneIndex(0, 4)).toBe(4);
    expect(getActiveZoneIndex(0, 5)).toBe(3); // 5-8
    expect(getActiveZoneIndex(0, 8)).toBe(3);
    expect(getActiveZoneIndex(0, 9)).toBe(2); // 9-28
    expect(getActiveZoneIndex(0, 28)).toBe(2);
    expect(getActiveZoneIndex(0, 29)).toBe(1); // 29-32
    expect(getActiveZoneIndex(0, 32)).toBe(1);
    expect(getActiveZoneIndex(0, 33)).toBe(0); // 33+ → leftmost (TEC)
    expect(getActiveZoneIndex(0, 100)).toBe(0);
  });

  it("Equips: reversed — 0 equips (POW) on right, 15+ (TEC) on left", () => {
    // Equips (index 5): reversed, display order [-12, -8, -4, 0, +4]
    expect(getActiveZoneIndex(5, 0)).toBe(4); // 0 equips → rightmost (POW)
    expect(getActiveZoneIndex(5, 1)).toBe(3); // 1-4
    expect(getActiveZoneIndex(5, 4)).toBe(3);
    expect(getActiveZoneIndex(5, 5)).toBe(2); // 5-9
    expect(getActiveZoneIndex(5, 15)).toBe(0); // 15+ → leftmost (TEC)
  });

  it("Remaining LP: not reversed — low LP (TEC) on left, high LP (POW) on right", () => {
    // Remaining LP (index 9): not reversed, display order [-7, -5, 0, +4, +6]
    expect(getActiveZoneIndex(9, 0)).toBe(0); // <100 → leftmost (TEC)
    expect(getActiveZoneIndex(9, 99)).toBe(0);
    expect(getActiveZoneIndex(9, 100)).toBe(1); // 100-1k
    expect(getActiveZoneIndex(9, 999)).toBe(1);
    expect(getActiveZoneIndex(9, 1000)).toBe(2); // 1k-7k
    expect(getActiveZoneIndex(9, 6999)).toBe(2);
    expect(getActiveZoneIndex(9, 7000)).toBe(3); // 7k-8k
    expect(getActiveZoneIndex(9, 8000)).toBe(4); // 8k+ → rightmost (POW)
  });

  it("invalid factor index returns 0", () => {
    expect(getActiveZoneIndex(99, 5)).toBe(0);
  });
});
