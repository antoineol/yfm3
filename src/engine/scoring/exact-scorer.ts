import type { OptBuffers } from "../types/buffers.ts";
import { CHOOSE_5 } from "../types/constants.ts";
import type { IScorer } from "../types/interfaces.ts";

/**
 * Score a deck by exhaustively evaluating every possible 5-card hand.
 *
 * Enumerates all C(deckSize, 5) combinations and returns the true
 * expected max ATK — no sampling, no approximation.
 *
 * Uses a reusable Uint16Array buffer to avoid allocations in the inner loop.
 */
export function exactScore(buf: OptBuffers, scorer: IScorer): number {
  const deckSize = buf.deck.length;
  const totalHands = CHOOSE_5[deckSize] ?? 0;
  if (totalHands === 0) return 0;

  const hand = new Uint16Array(5);
  const deck = buf.deck;
  let totalAtk = 0;

  for (let a = 0; a < deckSize - 4; a++) {
    hand[0] = deck[a] ?? 0;
    for (let b = a + 1; b < deckSize - 3; b++) {
      hand[1] = deck[b] ?? 0;
      for (let c = b + 1; c < deckSize - 2; c++) {
        hand[2] = deck[c] ?? 0;
        for (let d = c + 1; d < deckSize - 1; d++) {
          hand[3] = deck[d] ?? 0;
          for (let e = d + 1; e < deckSize; e++) {
            hand[4] = deck[e] ?? 0;
            totalAtk += scorer.evaluateHand(hand, buf);
          }
        }
      }
    }
  }

  return totalAtk / totalHands;
}
