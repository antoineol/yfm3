import type { OptBuffers } from "../types/buffers.ts";
import { HAND_SIZE } from "../types/constants.ts";
import type { IScorer } from "../types/interfaces.ts";

/**
 * Compute handScores for all NUM_HANDS sampled hands.
 *
 * Resolves each hand's slot indices into card IDs from the current deck,
 * then evaluates via the provided scorer. Called once at initialization
 * and again if the deck is ever fully reset.
 *
 * Returns the total score (sum of all hand scores).
 */
export function computeInitialScores(buf: OptBuffers, scorer: IScorer): number {
  const handBuf = new Uint16Array(HAND_SIZE);
  let totalScore = 0;

  const numHands = buf.handScores.length;
  for (let h = 0; h < numHands; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      handBuf[j] = buf.deck[buf.handSlots[base + j] ?? 0] ?? 0;
    }
    const score = scorer.evaluateHand(handBuf, buf);
    buf.handScores[h] = score;
    totalScore += score;
  }

  return totalScore;
}
