import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, MAX_CARD_ID } from "../types/constants.ts";
import type { IDeltaScorer, IOptimizer, IScorer } from "../types/interfaces.ts";

/**
 * Hill-climbing optimizer using random card swaps.
 *
 * Each iteration:
 *   1. Pick a random deck slot and a random candidate card
 *   2. Skip if same card or player doesn't own enough copies
 *   3. Tentatively swap, compute score delta (only re-scoring affected hands)
 *   4. If delta > 0, keep (greedy accept); otherwise revert
 *
 * No simulated annealing — never accepts worse moves.
 * Guarantees monotonic improvement (non-regression invariant).
 */
export class RandomSwapOptimizer implements IOptimizer {
  run(buf: OptBuffers, scorer: IScorer, deltaScorer: IDeltaScorer, maxIterations: number): number {
    const { deck, cardCounts, availableCounts, handScores } = buf;

    // Compute baseline total score from pre-scored hands
    let totalScore = 0;
    for (let i = 0; i < handScores.length; i++) {
      totalScore += handScores[i] ?? 0;
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      // Pick a random deck slot (0..39) and a random candidate card (0..721)
      const slot = (Math.random() * DECK_SIZE) | 0;
      const oldCard = deck[slot] ?? 0;

      const newCard = (Math.random() * MAX_CARD_ID) | 0;
      if (newCard === oldCard) continue;
      // Reject if we'd exceed the player's owned copies of newCard
      if ((cardCounts[newCard] ?? 0) >= (availableCounts[newCard] ?? 0)) continue;

      // Tentatively apply the swap
      deck[slot] = newCard;
      cardCounts[oldCard] = (cardCounts[oldCard] ?? 1) - 1;
      cardCounts[newCard] = (cardCounts[newCard] ?? 0) + 1;

      // Compute score delta by re-evaluating only hands that reference this slot
      const delta = deltaScorer.computeDelta(slot, buf, scorer);

      if (delta > 0) {
        // Accept: commit the new hand scores
        deltaScorer.commitDelta(handScores);
        totalScore += delta;
      } else {
        // Reject: revert the deck and counts
        deck[slot] = oldCard;
        cardCounts[newCard] = (cardCounts[newCard] ?? 1) - 1;
        cardCounts[oldCard] = (cardCounts[oldCard] ?? 0) + 1;
      }
    }

    return totalScore;
  }
}
