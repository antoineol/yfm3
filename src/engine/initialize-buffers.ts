import type { Collection } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import { loadGameData } from "./data/load-game-data.ts";

export { mulberry32 } from "./mulberry32.ts";

import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";

/**
 * Full initialization pipeline:
 *   1. Parse CSVs → build fusionTable and cardAtk
 *   2. Set the player's collection (populates availableCounts)
 *   3. Build greedy initial deck (highest-ATK cards first)
 *   4. Sample unique 5-card hands (Monte Carlo pool)
 *   5. Build reverse lookup (slot → affected hands) for delta scoring
 *
 * @param collection  cardId → number of copies owned by the player
 */
export function initializeBuffers(
  collection: Collection,
  rand: () => number,
  deckSize?: number,
): OptBuffers {
  const buf = createBuffers(deckSize);
  const cards = loadGameData(buf);
  for (const card of cards) {
    buf.availableCounts[card.id] = collection.get(card.id) ?? 0;
  }
  buildInitialDeck(buf, cards);
  generateHandSlots(buf, rand);
  buildReverseLookup(buf);
  return buf;
}
