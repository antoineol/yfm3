import type { EngineConfig } from "./config.ts";
import { setConfig } from "./config.ts";
import type { Collection } from "./data/card-model.ts";
import { initializeBuffersBrowser } from "./initialize-buffers-browser.ts";
import { loadExplicitDeck } from "./load-explicit-deck.ts";
import { mulberry32 } from "./mulberry32.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "./scoring/delta-evaluator.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import type { OptBuffers } from "./types/buffers.ts";
import type { SuggestionResponse } from "./worker/messages.ts";

export interface DeckSwapSuggestion {
  addedCardId: number;
  removedCardId: number;
  currentDeckScore: number;
  suggestedScore: number;
  improvement: number;
}

export interface FindBestDeckSwapSuggestionOptions {
  addedCardId: number;
  collection: Record<number, number>;
  config: EngineConfig;
  currentDeckScore?: number | null;
  deck: number[];
}

interface RankedCandidate {
  removedCardId: number;
  sampledDelta: number;
  slotIndex: number;
}

const SUGGESTION_SEED = 42;

export function findBestDeckSwapSuggestion(
  options: FindBestDeckSwapSuggestionOptions,
): DeckSwapSuggestion | null {
  const { addedCardId, collection, config, currentDeckScore, deck } = options;

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

  const ranked = rankCandidates(buf, scorer, addedCardId);
  if (ranked.length === 0) {
    return null;
  }

  const exactCurrentScore = currentDeckScore ?? exactScore(buf, scorer);
  let bestSuggestion: DeckSwapSuggestion | null = null;
  let bestSampledDelta = -Infinity;

  for (const candidate of ranked) {
    const suggestedScore = scoreCandidateDeckExactly(buf, scorer, candidate.slotIndex, addedCardId);
    const improvement = suggestedScore - exactCurrentScore;

    if (improvement <= 0) continue;

    if (
      bestSuggestion === null ||
      improvement > bestSuggestion.improvement ||
      (improvement === bestSuggestion.improvement &&
        (candidate.sampledDelta > bestSampledDelta ||
          (candidate.sampledDelta === bestSampledDelta &&
            candidate.removedCardId < bestSuggestion.removedCardId)))
    ) {
      bestSuggestion = {
        addedCardId,
        removedCardId: candidate.removedCardId,
        currentDeckScore: exactCurrentScore,
        suggestedScore,
        improvement,
      };
      bestSampledDelta = candidate.sampledDelta;
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

function rankCandidates(
  buf: OptBuffers,
  scorer: FusionScorer,
  addedCardId: number,
): RankedCandidate[] {
  const deltaEvaluator = new DeltaEvaluator();
  const rankedByRemoved = new Map<number, RankedCandidate>();

  for (let slotIndex = 0; slotIndex < buf.deck.length; slotIndex++) {
    const removedCardId = buf.deck[slotIndex] ?? 0;
    if (removedCardId === addedCardId) continue;

    buf.deck[slotIndex] = addedCardId;
    buf.cardCounts[removedCardId] = (buf.cardCounts[removedCardId] ?? 0) - 1;
    buf.cardCounts[addedCardId] = (buf.cardCounts[addedCardId] ?? 0) + 1;
    const sampledDelta = deltaEvaluator.computeDelta(slotIndex, buf, scorer);
    buf.deck[slotIndex] = removedCardId;
    buf.cardCounts[removedCardId] = (buf.cardCounts[removedCardId] ?? 0) + 1;
    buf.cardCounts[addedCardId] = (buf.cardCounts[addedCardId] ?? 0) - 1;

    const existing = rankedByRemoved.get(removedCardId);
    if (
      !existing ||
      sampledDelta > existing.sampledDelta ||
      (sampledDelta === existing.sampledDelta && slotIndex < existing.slotIndex)
    ) {
      rankedByRemoved.set(removedCardId, { removedCardId, sampledDelta, slotIndex });
    }
  }

  return Array.from(rankedByRemoved.values()).sort(
    (a, b) => b.sampledDelta - a.sampledDelta || a.removedCardId - b.removedCardId,
  );
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
