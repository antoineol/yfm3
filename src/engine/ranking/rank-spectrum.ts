// ---------------------------------------------------------------------------
// Rank spectrum bar positioning utilities
//
// Maps rank scores to visual positions on a 5-segment equal-width bar.
// Each segment occupies 20% of the bar, regardless of its score range width.
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
 * Visual bounds for edge segments with infinite score ranges.
 * - S-TEC: uses visual range [-10, 9]
 * - S-POW: uses visual range [90, 110]
 */
const VISUAL_BOUNDS: readonly [number, number][] = [
  [-10, 9], // S-TEC
  [10, 19], // A-TEC
  [20, 79], // BCD
  [80, 89], // A-POW
  [90, 110], // S-POW
];

/** Width of each segment on the 0–1 bar. */
const SEGMENT_WIDTH = 0.2;

// ── Public API (reading order: callers before callees) ───────────────────

/**
 * Map a score to a 0–1 position on the 5-segment equal-width bar.
 * Each segment occupies 20% of the bar (0.2). Within a segment, the
 * position is linearly interpolated between the segment's score range.
 *
 * For edge segments (S-TEC and S-POW) which have infinite bounds,
 * we use reasonable visual bounds for interpolation:
 * - S-TEC: uses visual range [-10, 9] (scores below -10 clamp to left edge)
 * - S-POW: uses visual range [90, 110] (scores above 110 clamp to right edge)
 *
 * Returns: clamped to [0, 1].
 */
export function scoreToPosition(score: number): number {
  const segIdx = scoreToSegmentIndex(score);
  const bounds = VISUAL_BOUNDS[segIdx];
  if (!bounds) return 0;
  const [lo, hi] = bounds;
  const range = hi - lo;
  const t = range === 0 ? 0.5 : (score - lo) / range;
  const clamped = Math.max(0, Math.min(1, t));
  const position = segIdx * SEGMENT_WIDTH + clamped * SEGMENT_WIDTH;
  return Math.max(0, Math.min(1, position));
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
