import type { EngineConfig } from "./config.ts";
import { setConfig } from "./config.ts";
import { initializeBuffersBrowser } from "./initialize-buffers-browser.ts";
import { mulberry32 } from "./mulberry32.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";

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
  if (deck.length !== config.deckSize || (collection[addedCardId] ?? 0) <= 0) {
    return null;
  }

  setConfig(config);
  const buf = initializeBuffersBrowser(
    new Map(Object.entries(collection).map(([cardId, quantity]) => [Number(cardId), quantity])),
    mulberry32(SUGGESTION_SEED),
  );

  buf.cardCounts.fill(0);
  for (let i = 0; i < deck.length; i++) {
    const cardId = deck[i] ?? 0;
    buf.deck[i] = cardId;
    buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
  }
  if ((buf.cardCounts[addedCardId] ?? 0) >= (buf.availableCounts[addedCardId] ?? 0)) return null;

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

    buf.deck[slotIndex] = addedCardId;
    const improvement = exactScore(buf, scorer) - currentDeckScore;
    buf.deck[slotIndex] = removedCardId;

    if (improvement > 0 && (bestSuggestion === null || improvement > bestSuggestion.improvement)) {
      bestSuggestion = {
        removedCardId,
        improvement,
      };
    }
  }

  return bestSuggestion;
}
