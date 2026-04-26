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
export type RankScoringProfile = "vanilla" | "rp";

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

const RP_FACTOR_DEFINITIONS: readonly FactorDefinition[] = FACTOR_DEFINITIONS.map((def) =>
  def.key === "remainingCards"
    ? {
        ...def,
        thresholds: [4, 8, 26, 32],
        points: [-7, -5, 0, 20, 32],
      }
    : def,
);

const FACTOR_DEFINITIONS_BY_PROFILE: Record<RankScoringProfile, readonly FactorDefinition[]> = {
  vanilla: FACTOR_DEFINITIONS,
  rp: RP_FACTOR_DEFINITIONS,
};

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
  profile: RankScoringProfile = "vanilla",
): RankBreakdown {
  const victoryBonus = VICTORY_BONUSES[victoryType];
  const definitions = getDefinitions(profile);

  const factorResults = definitions.map((def, i) => {
    const rawValue = factors[def.key];
    const pts = computeFactorPoints(i, rawValue, profile);
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
export function computeRankScore(
  factors: RankFactors,
  victoryType: VictoryType,
  profile: RankScoringProfile = "vanilla",
): number {
  let score = BASE_SCORE + VICTORY_BONUSES[victoryType];
  const definitions = getDefinitions(profile);
  for (let i = 0; i < definitions.length; i++) {
    const def = definitions[i];
    if (def) {
      score += computeFactorPoints(i, factors[def.key], profile);
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
export function computeFactorPoints(
  factorIndex: number,
  rawValue: number,
  profile: RankScoringProfile = "vanilla",
): number {
  const def = getDefinitions(profile)[factorIndex];
  if (!def) {
    throw new Error(`Invalid factor index: ${factorIndex}`);
  }
  return resolveThresholdPoints(rawValue, def.thresholds, def.points);
}

/** Get the factor definitions array (for UI rendering). */
export function getFactorDefinitions(profile: RankScoringProfile = "vanilla"): Array<{
  name: string;
  key: keyof RankFactors;
  thresholds: number[];
  points: number[];
}> {
  return getDefinitions(profile).map((def) => ({
    name: def.name,
    key: def.key,
    thresholds: [...def.thresholds],
    points: [...def.points],
  }));
}

// ── Internal helpers ───────────────────────────────────────────────────────

function getDefinitions(profile: RankScoringProfile): readonly FactorDefinition[] {
  return FACTOR_DEFINITIONS_BY_PROFILE[profile];
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
