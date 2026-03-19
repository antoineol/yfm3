import type { Collection } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import { loadGameDataFromStrings } from "./data/load-game-data-core.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";

const [cardsCsvRaw, fusionsCsvRaw] = await Promise.all([
  fetch("/data/cards.csv").then((r) => r.text()),
  fetch("/data/fusions.csv").then((r) => r.text()),
]);

/**
 * Browser-compatible initialization pipeline.
 * Fetches CSV data from /public at module load time.
 */
export function initializeBuffersBrowser(collection: Collection, rand: () => number): OptBuffers {
  const { buf, cards } = initializeBrowserGameBuffers(rand);
  for (const card of cards) {
    buf.availableCounts[card.id] = collection.get(card.id) ?? 0;
  }
  buildInitialDeck(buf, cards);
  return buf;
}

export function initializeSuggestionBuffersBrowser(rand: () => number): OptBuffers {
  return initializeBrowserGameBuffers(rand).buf;
}

function initializeBrowserGameBuffers(rand: () => number) {
  const buf = createBuffers();
  const cards = loadGameDataFromStrings(buf, cardsCsvRaw, fusionsCsvRaw);
  generateHandSlots(buf, rand);
  buildReverseLookup(buf);
  return { buf, cards };
}
