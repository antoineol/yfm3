// ---------------------------------------------------------------------------
// Rank scoring engine for Yu-Gi-Oh! Forbidden Memories (Remastered Perfected)
//
// Computes the duel rank from 11 raw factors. The score starts at base 50,
// each factor adds/subtracts points based on threshold ranges, and the final
// score maps to a rank label (S-POW through S-TEC).
// ---------------------------------------------------------------------------

// ── Types ──────────────────────────────────────────────────────────────────

/** The 10 raw counter values from a duel (victory type is separate). */
export interface RankFactors {
  turns: number;
  effectiveAttacks: number;
  defensiveWins: number;
  faceDownPlays: number;
  fusionsInitiated: number;
  equipMagicUsed: number;
  pureMagicUsed: number;
  trapsTriggered: number;
  remainingCards: number; // cards still in deck (not drawn)
  remainingLp: number;
}

export type VictoryType = "normal" | "deckout" | "exodia";

export type RankGrade = "S" | "A" | "B" | "C" | "D";
export type RankSkill = "POW" | "TEC";
export type DropPool = "SA-POW" | "BCD" | "SA-TEC";

export interface RankResult {
  score: number;
  grade: RankGrade;
  skill: RankSkill;
  label: string; // e.g. "S-POW", "A-TEC"
  dropPool: DropPool;
  starChips: number;
}

/** Breakdown of how each factor contributes to the score. */
export interface RankBreakdown {
  base: number; // always 50
  victoryBonus: number;
  factors: Array<{
    name: string;
    rawValue: number;
    points: number;
    /** Min possible points this factor can yield */
    minPoints: number;
    /** Max possible points this factor can yield */
    maxPoints: number;
  }>;
  total: number;
  rank: RankResult;
}

// ── Factor definition table ────────────────────────────────────────────────

interface FactorDefinition {
  name: string;
  key: keyof RankFactors;
  thresholds: number[];
  points: number[];
}

const FACTOR_DEFINITIONS: readonly FactorDefinition[] = [
  { name: "Turns", key: "turns", thresholds: [5, 9, 29, 33], points: [12, 8, 0, -8, -12] },
  {
    name: "Eff. attacks",
    key: "effectiveAttacks",
    thresholds: [2, 4, 10, 20],
    points: [4, 2, 0, -2, -4],
  },
  {
    name: "Def. wins",
    key: "defensiveWins",
    thresholds: [2, 6, 10, 15],
    points: [0, -10, -20, -30, -40],
  },
  {
    name: "Face-downs",
    key: "faceDownPlays",
    thresholds: [1, 11, 21, 31],
    points: [0, -2, -4, -6, -8],
  },
  {
    name: "Fusions",
    key: "fusionsInitiated",
    thresholds: [1, 5, 10, 15],
    points: [4, 0, -4, -8, -12],
  },
  {
    name: "Equips",
    key: "equipMagicUsed",
    thresholds: [1, 5, 10, 15],
    points: [4, 0, -4, -8, -12],
  },
  {
    name: "Magic",
    key: "pureMagicUsed",
    thresholds: [1, 4, 7, 10],
    points: [2, -4, -8, -12, -16],
  },
  {
    name: "Traps",
    key: "trapsTriggered",
    thresholds: [1, 3, 5, 7],
    points: [2, -8, -16, -24, -32],
  },
  {
    name: "Cards left",
    key: "remainingCards",
    thresholds: [4, 8, 28, 32],
    points: [-7, -5, 0, 12, 15],
  },
  {
    name: "Remaining LP",
    key: "remainingLp",
    thresholds: [100, 1000, 7000, 8000],
    points: [-7, -5, 0, 4, 6],
  },
] as const;

const BASE_SCORE = 50;

const VICTORY_BONUSES: Record<VictoryType, number> = {
  normal: 2,
  deckout: -40,
  exodia: 40,
};

// ── Rank thresholds ────────────────────────────────────────────────────────

interface RankThreshold {
  minScore: number;
  maxScore: number;
  grade: RankGrade;
  skill: RankSkill;
  dropPool: DropPool;
  starChips: number;
}

const RANK_THRESHOLDS: readonly RankThreshold[] = [
  { minScore: 90, maxScore: Infinity, grade: "S", skill: "POW", dropPool: "SA-POW", starChips: 5 },
  { minScore: 80, maxScore: 89, grade: "A", skill: "POW", dropPool: "SA-POW", starChips: 4 },
  { minScore: 70, maxScore: 79, grade: "B", skill: "POW", dropPool: "BCD", starChips: 3 },
  { minScore: 60, maxScore: 69, grade: "C", skill: "POW", dropPool: "BCD", starChips: 2 },
  { minScore: 50, maxScore: 59, grade: "D", skill: "POW", dropPool: "BCD", starChips: 1 },
  { minScore: 40, maxScore: 49, grade: "D", skill: "TEC", dropPool: "BCD", starChips: 1 },
  { minScore: 30, maxScore: 39, grade: "C", skill: "TEC", dropPool: "BCD", starChips: 2 },
  { minScore: 20, maxScore: 29, grade: "B", skill: "TEC", dropPool: "BCD", starChips: 3 },
  { minScore: 10, maxScore: 19, grade: "A", skill: "TEC", dropPool: "SA-TEC", starChips: 4 },
  { minScore: -Infinity, maxScore: 9, grade: "S", skill: "TEC", dropPool: "SA-TEC", starChips: 5 },
];

// ── Public API (reading order: callers before callees) ─────────────────────

/** Compute the full rank breakdown from raw factors and victory type. */
export function computeRankBreakdown(
  factors: RankFactors,
  victoryType: VictoryType,
): RankBreakdown {
  const victoryBonus = VICTORY_BONUSES[victoryType];

  const factorResults = FACTOR_DEFINITIONS.map((def, i) => {
    const rawValue = factors[def.key];
    const pts = computeFactorPoints(i, rawValue);
    const sortedPoints = [...def.points].sort((a, b) => a - b);
    return {
      name: def.name,
      rawValue,
      points: pts,
      minPoints: sortedPoints[0] ?? 0,
      maxPoints: sortedPoints[sortedPoints.length - 1] ?? 0,
    };
  });

  const total = BASE_SCORE + victoryBonus + factorResults.reduce((sum, f) => sum + f.points, 0);

  return {
    base: BASE_SCORE,
    victoryBonus,
    factors: factorResults,
    total,
    rank: getRankFromScore(total),
  };
}

/** Quick score computation without breakdown. */
export function computeRankScore(factors: RankFactors, victoryType: VictoryType): number {
  let score = BASE_SCORE + VICTORY_BONUSES[victoryType];
  for (let i = 0; i < FACTOR_DEFINITIONS.length; i++) {
    const def = FACTOR_DEFINITIONS[i];
    if (def) {
      score += computeFactorPoints(i, factors[def.key]);
    }
  }
  return score;
}

/** Get rank result from a final score. */
export function getRankFromScore(score: number): RankResult {
  const entry = findRankEntry(score);
  return {
    score,
    grade: entry.grade,
    skill: entry.skill,
    label: `${entry.grade}-${entry.skill}`,
    dropPool: entry.dropPool,
    starChips: entry.starChips,
  };
}

/** Compute score contribution for a single factor given its raw value. */
export function computeFactorPoints(factorIndex: number, rawValue: number): number {
  const def = FACTOR_DEFINITIONS[factorIndex];
  if (!def) {
    throw new Error(`Invalid factor index: ${factorIndex}`);
  }
  return resolveThresholdPoints(rawValue, def.thresholds, def.points);
}

/** Get the factor definitions array (for UI rendering). */
export function getFactorDefinitions(): Array<{
  name: string;
  key: keyof RankFactors;
  thresholds: number[];
  points: number[];
}> {
  return FACTOR_DEFINITIONS.map((def) => ({
    name: def.name,
    key: def.key,
    thresholds: [...def.thresholds],
    points: [...def.points],
  }));
}

// ── Threshold zone helpers (for UI zone gauge) ─────────────────────────────

/** A single threshold zone within a factor. */
export interface FactorZone {
  points: number;
  /** Label for the left edge of this zone cell ("" if open-ended). */
  leftLabel: string;
  /** Label for the right edge of this zone cell ("" if open-ended). */
  rightLabel: string;
  /** Numeric value at the left edge (for cursor positioning). */
  rangeStart: number;
  /** Numeric value at the right edge (for cursor positioning). */
  rangeEnd: number;
}

/** Zone layout for a factor — name, key, and all zones in display order. */
export interface FactorZoneLayout {
  name: string;
  key: keyof RankFactors;
  zones: FactorZone[];
}

/**
 * Get zone definitions for all 10 factors, ordered TEC→POW (ascending points).
 * Zones are sorted so the leftmost zone is most TEC-friendly (lowest points)
 * and the rightmost is most POW-friendly (highest points).
 */
export function getFactorZoneDefinitions(): FactorZoneLayout[] {
  return FACTOR_DEFINITIONS.map((def) => {
    const zones = buildFactorZones(def);
    // If points descend (POW first), reverse so TEC is on the left, POW on the right
    if (zones.length >= 2 && (zones[0]?.points ?? 0) > (zones[zones.length - 1]?.points ?? 0)) {
      zones.reverse();
      for (const zone of zones) {
        [zone.leftLabel, zone.rightLabel] = [zone.rightLabel, zone.leftLabel];
        [zone.rangeStart, zone.rangeEnd] = [zone.rangeEnd, zone.rangeStart];
      }
    }
    return { name: def.name, key: def.key, zones };
  });
}

/**
 * Determine which zone index (0-based) a raw value maps to in display order.
 * The returned index matches the zone array from getFactorZoneDefinitions().
 */
export function getActiveZoneIndex(factorIndex: number, rawValue: number): number {
  const def = FACTOR_DEFINITIONS[factorIndex];
  if (!def) return 0;

  let idx = def.thresholds.length;
  for (let i = 0; i < def.thresholds.length; i++) {
    const t = def.thresholds[i];
    if (t !== undefined && rawValue < t) {
      idx = i;
      break;
    }
  }

  const isReversed =
    def.points.length >= 2 && (def.points[0] ?? 0) > (def.points[def.points.length - 1] ?? 0);
  return isReversed ? def.points.length - 1 - idx : idx;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function buildFactorZones(def: FactorDefinition): FactorZone[] {
  const isLp = def.key === "remainingLp";
  const fmt = (n: number): string => {
    if (isLp && n >= 1000 && n % 1000 === 0) return `${String(n / 1000)}k`;
    return String(n);
  };

  return def.points.map((pts, i) => {
    const isFirst = i === 0;
    const isLast = i === def.thresholds.length;

    if (isFirst) {
      const t = def.thresholds[0] ?? 1;
      return {
        points: pts,
        leftLabel: "",
        rightLabel: fmt(t - 1),
        rangeStart: 0,
        rangeEnd: t - 1,
      };
    }

    if (isLast) {
      const t = def.thresholds[def.thresholds.length - 1] ?? 0;
      return {
        points: pts,
        leftLabel: fmt(t),
        rightLabel: "",
        rangeStart: t,
        rangeEnd: t + Math.max(10, Math.round(t * 0.3)),
      };
    }

    const lower = def.thresholds[i - 1] ?? 0;
    const upperExcl = def.thresholds[i] ?? 0;
    const upperIncl = upperExcl - 1;
    return {
      points: pts,
      leftLabel: fmt(lower),
      rightLabel: isLp ? fmt(upperExcl) : fmt(upperIncl),
      rangeStart: lower,
      rangeEnd: upperIncl,
    };
  });
}

/**
 * Given a raw value, a sorted list of thresholds, and the corresponding
 * points array (length = thresholds.length + 1), return the applicable points.
 *
 * Logic: if value < threshold[0] -> points[0],
 *        if value < threshold[1] -> points[1], ... etc.
 *        if value >= all thresholds -> last points entry.
 */
function resolveThresholdPoints(
  value: number,
  thresholds: readonly number[],
  points: readonly number[],
): number {
  for (let i = 0; i < thresholds.length; i++) {
    const t = thresholds[i];
    if (t !== undefined && value < t) {
      return points[i] ?? 0;
    }
  }
  return points[points.length - 1] ?? 0;
}

function findRankEntry(score: number): RankThreshold {
  for (const entry of RANK_THRESHOLDS) {
    if (score >= entry.minScore && score <= entry.maxScore) {
      return entry;
    }
  }
  // Should never happen, but fallback to S-TEC for extreme negative scores
  const fallback = RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
  if (fallback) return fallback;
  return {
    minScore: -Infinity,
    maxScore: 9,
    grade: "S",
    skill: "TEC",
    dropPool: "SA-TEC",
    starChips: 5,
  };
}
