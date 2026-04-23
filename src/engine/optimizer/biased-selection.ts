import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";

/** Weight multiplier for fusion partner count. A card with 10 fusion partners
 *  in the deck gets +2000 weight (comparable to a mid-range ATK). */
const ALPHA = 200;

/**
 * When the SA loop needs a replacement card for a deck slot, we don't pick
 * uniformly at random — that would waste most attempts on weak cards with no
 * fusion synergy. Instead, each card gets a selection weight:
 *
 *   weight(card) = baseATK + ALPHA × (# of current deck cards it fuses with
 *                                      OR is equip-compatible with)
 *
 * Higher-weight cards are picked proportionally more often.
 *
 * The weights are stored as a cumulative sum array (prefix sums), so picking
 * a weighted-random card is a single binary search: roll a random number in
 * [0, totalWeight), find where it lands in the cumulative array.
 *
 * Weights are recomputed lazily (every ~100 accepted swaps) because the deck
 * changes slowly — recomputing after every swap would be O(722 × 40) per
 * iteration, which is too expensive.
 */
export function createBiasedSelector() {
  const partnerCount = new Uint16Array(MAX_CARD_ID);
  const cumulativeWeights = new Float64Array(MAX_CARD_ID);

  /**
   * Recompute weights for all 722 cards based on the current deck.
   * Cost: O(722 × 40) = ~29k fusion table lookups. Called once at init
   * and every ~100 accepted swaps.
   */
  function recomputeWeights(buf: OptBuffers): void {
    const { deck, fusionTable, cardAtk, equipCompat } = buf;

    // For each card in the game, count how many current deck cards it
    // fuses with OR is equip-compatible with (equip boosts the deck card,
    // or a deck card equips this card).
    partnerCount.fill(0);
    for (let c = 0; c < MAX_CARD_ID; c++) {
      let count = 0;
      for (let s = 0; s < buf.deck.length; s++) {
        const deckCard = deck[s] ?? 0;
        if (
          fusionTable[c * MAX_CARD_ID + deckCard] !== FUSION_NONE ||
          equipCompat[c * MAX_CARD_ID + deckCard] ||
          equipCompat[deckCard * MAX_CARD_ID + c]
        ) {
          count++;
        }
      }
      partnerCount[c] = count;
    }

    // Build cumulative weight array (prefix sums) for binary-search selection
    let cumulative = 0;
    for (let c = 0; c < MAX_CARD_ID; c++) {
      const atk = cardAtk[c] ?? 0;
      const weight = atk + ALPHA * (partnerCount[c] ?? 0);
      cumulative += weight > 0 ? weight : 1; // floor at 1 so every card is selectable
      cumulativeWeights[c] = cumulative;
    }
  }

  /**
   * Pick a replacement card using weighted random selection.
   *
   * Rejection-sampling: roll a weighted random card, reject if it's the same
   * card we're replacing, if the player has no copies left, or if adding
   * another copy would exceed that card's deck-copy cap. Up to 20 attempts
   * before giving up (returns -1).
   */
  function selectCandidate(buf: OptBuffers, oldCard: number, rand: () => number): number {
    const { availableCounts, cardCounts, maxCopies } = buf;
    const totalWeight = cumulativeWeights[MAX_CARD_ID - 1] ?? 1;

    for (let attempt = 0; attempt < 20; attempt++) {
      const target = rand() * totalWeight;

      // Binary search: find smallest index where cumulativeWeights[index] > target
      let lo = 0;
      let hi = MAX_CARD_ID - 1;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if ((cumulativeWeights[mid] ?? 0) <= target) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }

      const candidate = lo;
      if (candidate === oldCard) continue;
      const cap = Math.min(availableCounts[candidate] ?? 0, maxCopies[candidate] ?? 0);
      if ((cardCounts[candidate] ?? 0) >= cap) continue;

      return candidate;
    }

    return -1;
  }

  return { recomputeWeights, selectCandidate };
}
