import type { EngineConfig } from "./config.ts";
import { setConfig } from "./config.ts";
import type { Collection } from "./data/card-model.ts";
import { initializeBuffersBrowser } from "./initialize-buffers-browser.ts";
import { loadExplicitDeck } from "./load-explicit-deck.ts";
import { mulberry32 } from "./mulberry32.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import type { OptBuffers } from "./types/buffers.ts";
import type { SuggestionResponse } from "./worker/messages.ts";

export interface DeckSwapSuggestion {
  removedCardId: number;
  improvement: number;
}

export interface FindBestDeckSwapSuggestionOptions {
  addedCardId: number;
  collection: Record<number, number>;
  config: EngineConfig;
  deck: number[];
}

const SUGGESTION_SEED = 42;

export function findBestDeckSwapSuggestion(
  options: FindBestDeckSwapSuggestionOptions,
): DeckSwapSuggestion | null {
  const { addedCardId, collection, config, deck } = options;

  if ((collection[addedCardId] ?? 0) <= 0) {
    return null;
  }
  if (deck.length !== config.deckSize) {
    return null;
  }

  setConfig(config);

  const collectionMap = toCollectionMap(collection);
  const buf = initializeBuffersBrowser(collectionMap, mulberry32(SUGGESTION_SEED));
  loadExplicitDeck(buf, deck);

  const availableCopies = buf.availableCounts[addedCardId] ?? 0;
  const currentCopies = buf.cardCounts[addedCardId] ?? 0;
  if (currentCopies >= availableCopies) {
    return null;
  }

  const scorer = new FusionScorer();
  computeInitialScores(buf, scorer);
  const currentDeckScore = exactScore(buf, scorer);
  let bestSuggestion: DeckSwapSuggestion | null = null;
  const seenRemovedCardIds = new Set<number>();

  for (let slotIndex = 0; slotIndex < buf.deck.length; slotIndex++) {
    const removedCardId = buf.deck[slotIndex] ?? 0;
    if (removedCardId === addedCardId || seenRemovedCardIds.has(removedCardId)) {
      continue;
    }
    seenRemovedCardIds.add(removedCardId);

    const improvement =
      scoreCandidateDeckExactly(buf, scorer, slotIndex, addedCardId) - currentDeckScore;
    if (improvement <= 0) continue;

    if (bestSuggestion === null || improvement > bestSuggestion.improvement) {
      bestSuggestion = {
        removedCardId,
        improvement,
      };
    }
  }

  return bestSuggestion;
}

export function findBestDeckSwapSuggestionInWorker(
  options: FindBestDeckSwapSuggestionOptions,
  signal?: AbortSignal,
): Promise<DeckSwapSuggestion | null> {
  return new Promise<DeckSwapSuggestion | null>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Suggestion aborted"));
      return;
    }

    const worker = new Worker(new URL("./worker/suggestion-worker.ts", import.meta.url), {
      type: "module",
    });

    let settled = false;

    function finish(fn: () => void) {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", handleAbort);
      worker.terminate();
      fn();
    }

    function handleAbort() {
      finish(() => reject(new Error("Suggestion aborted")));
    }

    worker.onmessage = (event: MessageEvent<SuggestionResponse>) => {
      finish(() => resolve(event.data.suggestion));
    };
    worker.onerror = (event) => {
      finish(() => reject(new Error(`Suggestion worker error: ${event.message}`)));
    };

    signal?.addEventListener("abort", handleAbort, { once: true });
    worker.postMessage({ type: "SUGGEST", ...options });
  });
}

function scoreCandidateDeckExactly(
  buf: OptBuffers,
  scorer: FusionScorer,
  slotIndex: number,
  addedCardId: number,
): number {
  const removedCardId = buf.deck[slotIndex] ?? 0;
  buf.deck[slotIndex] = addedCardId;

  try {
    return exactScore(buf, scorer);
  } finally {
    buf.deck[slotIndex] = removedCardId;
  }
}

function toCollectionMap(collection: Record<number, number>): Collection {
  return new Map(Object.entries(collection).map(([id, qty]) => [Number(id), qty]));
}
