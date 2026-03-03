import type { OptBuffers } from "./buffers.ts";

/**
 * Evaluates a single 5-card hand and returns the best attack achievable.
 *
 * Contracts:
 *   - Deterministic and pure (same hand + same buf = same result).
 *   - Returns 0 for an empty or all-zero hand.
 *   - Result >= max base ATK in the hand (fusions can only increase it).
 */
export interface IScorer {
  evaluateHand(hand: Uint16Array, buf: OptBuffers): number;
}

/**
 * Computes the score change (delta) when a single deck slot is swapped,
 * by re-evaluating only the hands that reference that slot.
 *
 * Two-phase commit so that rejected swaps (the common case) pay zero writes:
 *   1. computeDelta() — stages new scores internally, returns total delta.
 *      Must NOT write to buf.handScores.
 *   2. commitDelta() — flushes staged scores into buf.handScores.
 *      Call ONLY after accepting a move.
 */
export interface IDeltaEvaluator {
  computeDelta(slotIndex: number, buf: OptBuffers, scorer: IScorer): number;
  commitDelta(handScores: Int16Array): void;
}

/**
 * Iteratively improves a deck by swapping cards and keeping beneficial changes.
 *
 * Contracts:
 *   - Monotonic: returned totalScore >= initial totalScore (never makes things worse).
 *   - Mutates buf.deck, buf.cardCounts, and buf.handScores in place.
 *   - Respects collection bounds: cardCounts[id] <= availableCounts[id] at all times.
 *   - maxIterations=0 returns immediately with the current totalScore.
 */
export interface IOptimizer {
  run(
    buf: OptBuffers,
    scorer: IScorer,
    deltaEvaluator: IDeltaEvaluator,
    maxIterations: number,
  ): number;
}
