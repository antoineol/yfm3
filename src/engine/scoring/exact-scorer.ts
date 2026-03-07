import type { OptBuffers } from "../types/buffers.ts";
import type { IScorer } from "../types/interfaces.ts";

/** Total number of 5-card combinations from a 40-card deck: C(40,5) */
const TOTAL_HANDS = 658_008;

/**
 * Score a deck by exhaustively evaluating every possible 5-card hand.
 *
 * Enumerates all C(40,5) = 658,008 combinations and returns the true
 * expected max ATK — no sampling, no approximation.
 *
 * Uses a reusable Uint16Array buffer to avoid allocations in the inner loop.
 */
export function exactScore(buf: OptBuffers, scorer: IScorer): number {
  const hand = new Uint16Array(5);
  const deck = buf.deck;
  let totalAtk = 0;

  for (let a = 0; a < 36; a++) {
    hand[0] = deck[a] ?? 0;
    for (let b = a + 1; b < 37; b++) {
      hand[1] = deck[b] ?? 0;
      for (let c = b + 1; c < 38; c++) {
        hand[2] = deck[c] ?? 0;
        for (let d = c + 1; d < 39; d++) {
          hand[3] = deck[d] ?? 0;
          for (let e = d + 1; e < 40; e++) {
            hand[4] = deck[e] ?? 0;
            totalAtk += scorer.evaluateHand(hand, buf);
          }
        }
      }
    }
  }

  return totalAtk / TOTAL_HANDS;
}
