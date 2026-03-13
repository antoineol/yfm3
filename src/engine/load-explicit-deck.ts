import type { OptBuffers } from "./types/buffers.ts";

/**
 * Replace the optimizer's current deck with an explicit deck list and rebuild
 * per-card counts so scoring helpers see a consistent state.
 */
export function loadExplicitDeck(buf: OptBuffers, deck: readonly number[]): void {
  if (deck.length !== buf.deck.length) {
    throw new Error(
      `Deck length ${deck.length} does not match configured size ${buf.deck.length}.`,
    );
  }

  buf.cardCounts.fill(0);

  for (let i = 0; i < deck.length; i++) {
    const cardId = deck[i] ?? 0;
    buf.deck[i] = cardId;
    buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
  }
}
