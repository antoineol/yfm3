// ---------------------------------------------------------------------------
// Rank spectrum bar positioning utilities
//
// Maps rank scores to visual positions on a linear bar.
// Each segment's width is proportional to its score range.
// ---------------------------------------------------------------------------

// ── Types ──────────────────────────────────────────────────────────────────

/** Target rank labels that users can select. */
export type TargetRank = "S-POW" | "A-POW" | "BCD" | "A-TEC" | "S-TEC";

/** Segment definition for the spectrum bar. */
export interface SpectrumSegment {
  label: TargetRank;
  minScore: number; // inclusive
  maxScore: number; // inclusive
  color: string; // CSS color
}

// ── Constants ──────────────────────────────────────────────────────────────

/** The 5 spectrum segments, ordered left to right (S-TEC to S-POW). */
export const SPECTRUM_SEGMENTS: readonly SpectrumSegment[] = [
  { label: "S-TEC", minScore: -Infinity, maxScore: 9, color: "var(--color-rank-s-tec)" },
  { label: "A-TEC", minScore: 10, maxScore: 19, color: "var(--color-rank-a-tec)" },
  { label: "BCD", minScore: 20, maxScore: 79, color: "var(--color-rank-bcd)" },
  { label: "A-POW", minScore: 80, maxScore: 89, color: "var(--color-rank-a-pow)" },
  { label: "S-POW", minScore: 90, maxScore: Infinity, color: "var(--color-rank-s-pow)" },
];

/** All target rank options, ordered for dropdown display (most common first). */
export const TARGET_RANK_OPTIONS: readonly TargetRank[] = [
  "S-POW",
  "A-POW",
  "BCD",
  "A-TEC",
  "S-TEC",
];

/**
 * Continuous boundary points for the linear bar.
 * The full visual range is [VISUAL_MIN, VISUAL_MAX].
 * Each segment spans from SEGMENT_BOUNDARIES[i] to SEGMENT_BOUNDARIES[i+1].
 */
const VISUAL_MIN = -10;
const VISUAL_MAX = 110;
const VISUAL_RANGE = VISUAL_MAX - VISUAL_MIN; // 120

const SEGMENT_BOUNDARIES = [VISUAL_MIN, 10, 20, 80, 90, VISUAL_MAX] as const;

/** Proportional width of each segment on the 0–1 bar (sums to 1). */
export const SEGMENT_WIDTHS: readonly number[] = SEGMENT_BOUNDARIES.slice(1).map((end, i) => {
  const start = SEGMENT_BOUNDARIES[i] ?? VISUAL_MIN;
  return (end - start) / VISUAL_RANGE;
});

// ── Public API (reading order: callers before callees) ───────────────────

/**
 * Map a score to a 0–1 position on the linear spectrum bar.
 * Segment widths are proportional to their score ranges.
 * Scores outside [VISUAL_MIN, VISUAL_MAX] are clamped.
 */
export function scoreToPosition(score: number): number {
  return Math.max(0, Math.min(1, (score - VISUAL_MIN) / VISUAL_RANGE));
}

/**
 * Get the segment index (0–4) that a score falls into.
 */
export function scoreToSegmentIndex(score: number): number {
  for (let i = 0; i < SPECTRUM_SEGMENTS.length; i++) {
    const seg = SPECTRUM_SEGMENTS[i];
    if (seg && score >= seg.minScore && score <= seg.maxScore) {
      return i;
    }
  }
  // Fallback: extreme values
  return score < 0 ? 0 : 4;
}

/**
 * Get the segment index for a target rank label.
 */
export function targetRankToSegmentIndex(target: TargetRank): number {
  const idx = SPECTRUM_SEGMENTS.findIndex((seg) => seg.label === target);
  return idx === -1 ? 0 : idx;
}

/**
 * Check whether a score is within a target rank's zone.
 */
export function isInTargetZone(score: number, target: TargetRank): boolean {
  const seg = SPECTRUM_SEGMENTS.find((s) => s.label === target);
  if (!seg) return false;
  return score >= seg.minScore && score <= seg.maxScore;
}

/**
 * Get the color CSS variable for a given score.
 */
export function scoreToColor(score: number): string {
  const idx = scoreToSegmentIndex(score);
  const seg = SPECTRUM_SEGMENTS[idx];
  return seg ? seg.color : "var(--color-rank-bcd)";
}
