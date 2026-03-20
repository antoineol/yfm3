import {
  CHOOSE_5,
  DEFAULT_FUSION_DEPTH,
  FUSION_NONE,
  MAX_CARD_ID,
} from "../engine/types/constants.ts";

/**
 * Reference hand scorer: exhaustive recursive search of every fusion path.
 *
 * Given 5 cards, returns the highest ATK achievable by playing one card —
 * either a raw card or one produced by chaining up to `maxDepth` fusions.
 *
 * Algorithm:
 * 1. Start with the highest raw ATK in the hand as baseline.
 * 2. Try every pair of cards as fusion materials.
 *    - `fusionTable` is a flattened 722x722 grid: `fusionTable[a * 722 + b]`
 *      gives the result card ID, or FUSION_NONE (-1) if they can't fuse.
 *    - Skip fusions where the result ATK doesn't strictly beat both materials.
 * 3. Replace the two materials with the fusion result, recurse (max depth configurable).
 * 4. Return the best ATK found across all paths.
 *
 * Search space: at most C(5,2) * C(4,2) * C(3,2) = 180 paths per hand (at depth 3).
 * Structurally independent from the production DFS scorer (plain arrays +
 * recursion vs. typed-array stack).
 */
export function referenceEvaluateHand(
  hand: number[],
  fusionTable: Int16Array,
  cardAtk: Int16Array,
  maxDepth: number = DEFAULT_FUSION_DEPTH,
): number {
  let maxAtk = 0;
  for (const id of hand) {
    const atk = cardAtk[id] ?? 0;
    if (atk > maxAtk) maxAtk = atk;
  }

  tryFusions(hand, 0);
  return maxAtk;

  function tryFusions(cards: number[], depth: number): void {
    if (cards.length < 2) return;
    if (depth >= maxDepth) return;

    for (let i = 0; i < cards.length - 1; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        // FM rule: after the first fusion, one material must be the previous
        // result (always the last element — see remaining.push below).
        if (depth > 0 && j !== cards.length - 1) continue;

        const a = cards[i] ?? 0;
        const b = cards[j] ?? 0;
        const result = fusionTable[a * MAX_CARD_ID + b] ?? FUSION_NONE;
        if (result === FUSION_NONE) continue;

        const resultAtk = cardAtk[result] ?? 0;
        if (resultAtk <= (cardAtk[a] ?? 0)) continue;
        if (resultAtk <= (cardAtk[b] ?? 0)) continue;

        if (resultAtk > maxAtk) maxAtk = resultAtk;

        // Remove materials, add fusion result, recurse
        const remaining: number[] = [];
        for (let k = 0; k < cards.length; k++) {
          if (k !== i && k !== j) remaining.push(cards[k] ?? 0);
        }
        remaining.push(result);
        tryFusions(remaining, depth + 1);
      }
    }
  }
}

/**
 * Reference deck scorer: enumerate all C(deckSize, 5) hands.
 * Returns the true expected max ATK — no sampling, no approximation.
 */
export function referenceScoreDeck(
  deck: number[],
  fusionTable: Int16Array,
  cardAtk: Int16Array,
): number {
  const deckSize = deck.length;
  const expectedCount = CHOOSE_5[deckSize] ?? 0;
  if (expectedCount === 0) return 0;

  const hand = new Array<number>(5);
  let totalAtk = 0;
  let count = 0;

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
            totalAtk += referenceEvaluateHand(hand, fusionTable, cardAtk);
            count++;
          }
        }
      }
    }
  }

  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} hands, got ${count}`);
  }

  return totalAtk / count;
}
