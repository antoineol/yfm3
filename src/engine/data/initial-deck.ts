import type { OptBuffers } from "../types/buffers.ts";
import { MAX_COPIES } from "../types/constants.ts";
import type { CardSpec } from "./card-model.ts";

/**
 * Greedy initial deck: sort all cards by attack descending, then greedily pick
 * the strongest cards the player owns (up to MAX_COPIES each) until all slots are filled.
 * If fewer than deckSize distinct×MAX_COPIES cards are available, relaxes the copy limit
 * to fill remaining slots (consistent with the SA optimizer's availableCounts bound).
 */
export function buildInitialDeck(buf: OptBuffers, cards: readonly CardSpec[]): void {
  const sorted = [...cards].sort((a, b) => b.attack - a.attack);
  buf.cardCounts.fill(0);
  let deckIdx = 0;

  // Pass 1: respect MAX_COPIES to prefer diversity
  for (const card of sorted) {
    if (deckIdx >= buf.deck.length) break;
    const count = buf.cardCounts[card.id] ?? 0;
    const availableCopies = buf.availableCounts[card.id] ?? 0;
    if (count < MAX_COPIES && count < availableCopies) {
      buf.deck[deckIdx] = card.id;
      buf.cardCounts[card.id] = count + 1;
      deckIdx++;
    }
  }

  // Pass 2+: if deck not full, relax MAX_COPIES and keep adding
  while (deckIdx < buf.deck.length) {
    let added = false;
    for (const card of sorted) {
      if (deckIdx >= buf.deck.length) break;
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
