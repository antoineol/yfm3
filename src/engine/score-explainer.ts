import type { OptBuffers } from "./types/buffers.ts";
import { CHOOSE_5 } from "./types/constants.ts";
import type { IScorer } from "./types/interfaces.ts";

export type AtkBucket = {
  atk: number;
  /** Number of hands where this ATK is the maximum achievable. */
  count: number;
  /** Fraction of all hands where this ATK is the maximum. */
  probabilityMax: number;
};

export type ScoreExplanation = {
  expectedAtk: number;
  /** ATK distribution sorted by ATK descending. */
  distribution: AtkBucket[];
};

/**
 * Exhaustively evaluate all C(deckSize, 5) hands and build an ATK distribution.
 *
 * Returns the expected ATK and for each achievable ATK value, how many hands
 * produce that value as the maximum. Designed to run in a Web Worker (~1-2s).
 */
export function explainScore(buf: OptBuffers, scorer: IScorer): ScoreExplanation {
  const deckSize = buf.deck.length;
  const totalHands = CHOOSE_5[deckSize] ?? 0;
  if (totalHands === 0) return { expectedAtk: 0, distribution: [] };

  const atkCounts = collectAtkCounts(buf, scorer, deckSize);
  return buildExplanation(atkCounts, totalHands);
}

function collectAtkCounts(buf: OptBuffers, scorer: IScorer, deckSize: number): Map<number, number> {
  const hand = new Uint16Array(5);
  const deck = buf.deck;
  const counts = new Map<number, number>();

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
            const atk = scorer.evaluateHand(hand, buf);
            counts.set(atk, (counts.get(atk) ?? 0) + 1);
          }
        }
      }
    }
  }

  return counts;
}

function buildExplanation(atkCounts: Map<number, number>, totalHands: number): ScoreExplanation {
  let totalAtk = 0;
  const distribution: AtkBucket[] = [];

  for (const [atk, count] of atkCounts) {
    totalAtk += atk * count;
    distribution.push({
      atk,
      count,
      probabilityMax: count / totalHands,
    });
  }

  distribution.sort((a, b) => b.atk - a.atk);

  return {
    expectedAtk: totalAtk / totalHands,
    distribution,
  };
}
