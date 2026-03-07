import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, MAX_COPIES } from "../types/constants.ts";
import type { CardSpec } from "./card-model.ts";

/**
 * Greedy initial deck: sort all cards by attack descending, then greedily pick
 * the strongest cards the player owns (up to MAX_COPIES each) until 40 slots are filled.
 * This gives the optimizer a strong starting point before swaps begin.
 */
export function buildInitialDeck(buf: OptBuffers, cards: readonly CardSpec[]): void {
  const sorted = [...cards].sort((a, b) => b.attack - a.attack);
  buf.cardCounts.fill(0);
  let deckIdx = 0;
  for (const card of sorted) {
    if (deckIdx >= DECK_SIZE) break;
    const count = buf.cardCounts[card.id] ?? 0;
    const availableCopies = buf.availableCounts[card.id] ?? 0;
    if (count < MAX_COPIES && count < availableCopies) {
      buf.deck[deckIdx] = card.id;
      buf.cardCounts[card.id] = count + 1;
      deckIdx++;
    }
  }
}
