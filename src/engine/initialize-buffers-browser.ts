import cardsCsvRaw from "../../data/from-binary/cards-from-bin.csv?raw";
import fusionsCsvRaw from "../../data/from-binary/fusions-from-bin.csv?raw";
import type { Collection } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import { loadGameDataFromStrings } from "./data/load-game-data-core.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";

/**
 * Browser-compatible initialization pipeline.
 * Uses Vite ?raw imports for CSV data instead of fs.readFileSync.
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
