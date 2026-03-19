import type { Collection } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import { loadGameDataFromStrings } from "./data/load-game-data-core.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";

let cardsCsvRaw: string;
let fusionsCsvRaw: string;
let csvLoaded = false;

/** Fetch CSV game data. Safe to call multiple times — only fetches once. */
export async function ensureCsvLoaded(): Promise<void> {
  if (csvLoaded) return;
  [cardsCsvRaw, fusionsCsvRaw] = await Promise.all([
    fetch("/data/cards.csv").then((r) => r.text()),
    fetch("/data/fusions.csv").then((r) => r.text()),
  ]);
  csvLoaded = true;
}

/**
 * Browser-compatible initialization pipeline.
 * Caller must `await ensureCsvLoaded()` before calling this.
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
