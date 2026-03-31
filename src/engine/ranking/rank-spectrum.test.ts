import { describe, expect, it } from "vitest";
import {
  isInTargetZone,
  SPECTRUM_SEGMENTS,
  scoreToColor,
  scoreToPosition,
  scoreToSegmentIndex,
  TARGET_RANK_OPTIONS,
  targetRankToSegmentIndex,
} from "./rank-spectrum.ts";

// ---------------------------------------------------------------------------
// scoreToPosition
// ---------------------------------------------------------------------------

describe("scoreToPosition", () => {
  it("score -10 → 0.0 (left edge of S-TEC)", () => {
    expect(scoreToPosition(-10)).toBeCloseTo(0.0, 5);
  });

  it("score 9 → ~0.2 (top of S-TEC)", () => {
    expect(scoreToPosition(9)).toBeCloseTo(0.2, 5);
  });

  it("score 10 → 0.2 (bottom of A-TEC)", () => {
    expect(scoreToPosition(10)).toBeCloseTo(0.2, 5);
  });

  it("score 19 → ~0.4 (top of A-TEC)", () => {
    expect(scoreToPosition(19)).toBeCloseTo(0.4, 5);
  });

  it("score 20 → 0.4 (bottom of BCD)", () => {
    expect(scoreToPosition(20)).toBeCloseTo(0.4, 5);
  });

  it("score 50 → 0.5 (middle of BCD)", () => {
    // BCD range: 20-79, midpoint = 49.5 → t = (50-20)/59 ≈ 0.508
    // position = 0.4 + 0.508 * 0.2 ≈ 0.5017
    expect(scoreToPosition(50)).toBeCloseTo(0.5, 1);
  });

  it("score 79 → ~0.6 (top of BCD)", () => {
    expect(scoreToPosition(79)).toBeCloseTo(0.6, 1);
  });

  it("score 80 → 0.6 (bottom of A-POW)", () => {
    expect(scoreToPosition(80)).toBeCloseTo(0.6, 5);
  });

  it("score 89 → ~0.8 (top of A-POW)", () => {
    expect(scoreToPosition(89)).toBeCloseTo(0.8, 5);
  });

  it("score 90 → 0.8 (bottom of S-POW)", () => {
    expect(scoreToPosition(90)).toBeCloseTo(0.8, 5);
  });

  it("score 110 → 1.0 (right edge of S-POW)", () => {
    expect(scoreToPosition(110)).toBeCloseTo(1.0, 5);
  });

  it("extreme negative (-150) → 0.0 (clamped)", () => {
    expect(scoreToPosition(-150)).toBe(0.0);
  });

  it("extreme positive (200) → 1.0 (clamped)", () => {
    expect(scoreToPosition(200)).toBe(1.0);
  });

  it("position increases monotonically across segment boundaries", () => {
    const scores = [-10, 0, 9, 10, 15, 19, 20, 50, 79, 80, 85, 89, 90, 100, 110];
    for (let i = 1; i < scores.length; i++) {
      const prev = scores[i - 1];
      const curr = scores[i];
      if (prev === undefined || curr === undefined) continue;
      expect(scoreToPosition(curr)).toBeGreaterThanOrEqual(scoreToPosition(prev));
    }
  });

  it("result is always in [0, 1]", () => {
    const testScores = [-200, -10, 0, 9, 10, 50, 79, 80, 89, 90, 110, 200];
    for (const score of testScores) {
      const pos = scoreToPosition(score);
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// scoreToSegmentIndex
// ---------------------------------------------------------------------------

describe("scoreToSegmentIndex", () => {
  it("score 9 → 0 (S-TEC)", () => {
    expect(scoreToSegmentIndex(9)).toBe(0);
  });

  it("score 10 → 1 (A-TEC)", () => {
    expect(scoreToSegmentIndex(10)).toBe(1);
  });

  it("score 19 → 1 (A-TEC)", () => {
    expect(scoreToSegmentIndex(19)).toBe(1);
  });

  it("score 20 → 2 (BCD)", () => {
    expect(scoreToSegmentIndex(20)).toBe(2);
  });

  it("score 79 → 2 (BCD)", () => {
    expect(scoreToSegmentIndex(79)).toBe(2);
  });

  it("score 80 → 3 (A-POW)", () => {
    expect(scoreToSegmentIndex(80)).toBe(3);
  });

  it("score 89 → 3 (A-POW)", () => {
    expect(scoreToSegmentIndex(89)).toBe(3);
  });

  it("score 90 → 4 (S-POW)", () => {
    expect(scoreToSegmentIndex(90)).toBe(4);
  });

  it("extreme negative (-100) → 0 (S-TEC)", () => {
    expect(scoreToSegmentIndex(-100)).toBe(0);
  });

  it("extreme positive (200) → 4 (S-POW)", () => {
    expect(scoreToSegmentIndex(200)).toBe(4);
  });

  it("score 50 → 2 (BCD mid-range)", () => {
    expect(scoreToSegmentIndex(50)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// targetRankToSegmentIndex
// ---------------------------------------------------------------------------

describe("targetRankToSegmentIndex", () => {
  it("S-TEC → 0", () => {
    expect(targetRankToSegmentIndex("S-TEC")).toBe(0);
  });

  it("A-TEC → 1", () => {
    expect(targetRankToSegmentIndex("A-TEC")).toBe(1);
  });

  it("BCD → 2", () => {
    expect(targetRankToSegmentIndex("BCD")).toBe(2);
  });

  it("A-POW → 3", () => {
    expect(targetRankToSegmentIndex("A-POW")).toBe(3);
  });

  it("S-POW → 4", () => {
    expect(targetRankToSegmentIndex("S-POW")).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// isInTargetZone
// ---------------------------------------------------------------------------

describe("isInTargetZone", () => {
  it("score 95 + target S-POW → true", () => {
    expect(isInTargetZone(95, "S-POW")).toBe(true);
  });

  it("score 85 + target S-POW → false", () => {
    expect(isInTargetZone(85, "S-POW")).toBe(false);
  });

  it("score 15 + target A-TEC → true", () => {
    expect(isInTargetZone(15, "A-TEC")).toBe(true);
  });

  it("score 50 + target BCD → true", () => {
    expect(isInTargetZone(50, "BCD")).toBe(true);
  });

  it("score 20 + target BCD → true (lower boundary)", () => {
    expect(isInTargetZone(20, "BCD")).toBe(true);
  });

  it("score 79 + target BCD → true (upper boundary)", () => {
    expect(isInTargetZone(79, "BCD")).toBe(true);
  });

  it("score 19 + target BCD → false (just below BCD)", () => {
    expect(isInTargetZone(19, "BCD")).toBe(false);
  });

  it("score 80 + target BCD → false (just above BCD)", () => {
    expect(isInTargetZone(80, "BCD")).toBe(false);
  });

  it("score 9 + target S-TEC → true (boundary)", () => {
    expect(isInTargetZone(9, "S-TEC")).toBe(true);
  });

  it("score 10 + target S-TEC → false (just above S-TEC)", () => {
    expect(isInTargetZone(10, "S-TEC")).toBe(false);
  });

  it("score -100 + target S-TEC → true (extreme negative)", () => {
    expect(isInTargetZone(-100, "S-TEC")).toBe(true);
  });

  it("score 200 + target S-POW → true (extreme positive)", () => {
    expect(isInTargetZone(200, "S-POW")).toBe(true);
  });

  it("score 85 + target A-POW → true", () => {
    expect(isInTargetZone(85, "A-POW")).toBe(true);
  });

  it("score 89 + target A-POW → true (upper boundary)", () => {
    expect(isInTargetZone(89, "A-POW")).toBe(true);
  });

  it("score 90 + target A-POW → false (just above)", () => {
    expect(isInTargetZone(90, "A-POW")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scoreToColor
// ---------------------------------------------------------------------------

describe("scoreToColor", () => {
  it("returns S-TEC color for score 5", () => {
    expect(scoreToColor(5)).toBe("var(--color-rank-s-tec)");
  });

  it("returns A-TEC color for score 15", () => {
    expect(scoreToColor(15)).toBe("var(--color-rank-a-tec)");
  });

  it("returns BCD color for score 50", () => {
    expect(scoreToColor(50)).toBe("var(--color-rank-bcd)");
  });

  it("returns A-POW color for score 85", () => {
    expect(scoreToColor(85)).toBe("var(--color-rank-a-pow)");
  });

  it("returns S-POW color for score 95", () => {
    expect(scoreToColor(95)).toBe("var(--color-rank-s-pow)");
  });

  it("returns S-TEC color for extreme negative", () => {
    expect(scoreToColor(-100)).toBe("var(--color-rank-s-tec)");
  });

  it("returns S-POW color for extreme positive", () => {
    expect(scoreToColor(200)).toBe("var(--color-rank-s-pow)");
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("SPECTRUM_SEGMENTS", () => {
  it("has 5 segments", () => {
    expect(SPECTRUM_SEGMENTS).toHaveLength(5);
  });

  it("segments are ordered left to right (S-TEC to S-POW)", () => {
    expect(SPECTRUM_SEGMENTS.map((s) => s.label)).toEqual([
      "S-TEC",
      "A-TEC",
      "BCD",
      "A-POW",
      "S-POW",
    ]);
  });
});

describe("TARGET_RANK_OPTIONS", () => {
  it("has 5 options", () => {
    expect(TARGET_RANK_OPTIONS).toHaveLength(5);
  });

  it("ordered most common first (S-POW first)", () => {
    expect(TARGET_RANK_OPTIONS[0]).toBe("S-POW");
  });
});
