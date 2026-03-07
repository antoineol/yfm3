import type { AttackValue } from "../data/card-model.ts";
import type { OptBuffers } from "./buffers.ts";
import type { SlotIndex } from "./constants.ts";

/**
 * Evaluates a single 5-card hand and returns the best attack achievable.
 *
 * Contracts:
 *   - Deterministic and pure (same hand + same buf = same result).
 *   - Returns 0 for an empty or all-zero hand.
 *   - Result >= max base ATK in the hand (fusions can only increase it).
 */
export interface IScorer {
  evaluateHand(hand: Uint16Array, buf: OptBuffers): AttackValue;
}

/**
 * Computes the score change (delta) when a single deck slot is swapped,
 * by re-evaluating only the hands that reference that slot.
 *
 * Key concepts:
 *   - A "slot" is a position (0..39) in the deck array. Hands are stored as
 *     slot indices, not card IDs — so when a slot's card changes, every hand
 *     referencing that slot automatically sees the new card (CRN technique).
 *   - The "affected hands" reverse lookup (affectedHandIds/Offsets/Counts in
 *     OptBuffers) maps each slot to the ~1,875 hands that reference it,
 *     avoiding a full rescore of all 15,000 hands.
 *
 * Two-phase commit so that rejected swaps (the common case) pay zero writes:
 *   1. computeDelta() — stages new scores internally, returns total delta.
 *      Must NOT write to buf.handScores.
 *   2. commitDelta() — flushes staged scores into buf.handScores.
 *      Call ONLY after accepting a move.
 */
export interface IDeltaEvaluator {
  /**
   * Re-scores only the hands that reference the given deck slot and returns
   * the total score change. New scores are staged internally, not yet committed.
   */
  computeDelta(slotIndex: SlotIndex, buf: OptBuffers, scorer: IScorer): number;
  /** Flushes staged scores into handScores. Call only after accepting a swap. */
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
