import type { OptBuffers } from "../types/buffers.ts";
import type { CardSpec } from "./card-model.ts";

/**
 * Greedy initial deck: sort all cards by attack descending, then greedily pick
 * the strongest cards the player owns (up to each card's per-card cap) until
 * all slots are filled. If fewer than that many distinct × cap cards are
 * available, relaxes the copy limit to fill remaining slots (consistent with
 * the SA optimizer's availableCounts bound).
 */
export function buildInitialDeck(buf: OptBuffers, cards: readonly CardSpec[]): void {
  const sorted = [...cards].sort((a, b) => b.attack - a.attack);
  buf.cardCounts.fill(0);
  let deckIdx = 0;

  // Pass 1: respect per-card cap to prefer diversity
  for (const card of sorted) {
    if (deckIdx >= buf.scoringSlots) break;
    const count = buf.cardCounts[card.id] ?? 0;
    const availableCopies = buf.availableCounts[card.id] ?? 0;
    const cap = buf.maxCopies[card.id] ?? 0;
    if (count < cap && count < availableCopies) {
      buf.deck[deckIdx] = card.id;
      buf.cardCounts[card.id] = count + 1;
      deckIdx++;
    }
  }

  // Pass 2+: if deck not full, relax the per-card cap and keep adding
  while (deckIdx < buf.scoringSlots) {
    let added = false;
    for (const card of sorted) {
      if (deckIdx >= buf.scoringSlots) break;
      const count = buf.cardCounts[card.id] ?? 0;
      const availableCopies = buf.availableCounts[card.id] ?? 0;
      if (count < availableCopies) {
        buf.deck[deckIdx] = card.id;
        buf.cardCounts[card.id] = count + 1;
        deckIdx++;
        added = true;
      }
    }
    if (!added) break;
  }
}
