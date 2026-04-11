import type { EngineConfig } from "./config.ts";
import { setConfig } from "./config.ts";
import { initializeSuggestionBuffersBrowser } from "./initialize-buffers-browser.ts";
import { DEFAULT_MOD, type ModId } from "./mods.ts";
import { mulberry32 } from "./mulberry32.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "./scoring/delta-evaluator.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import type { OptBuffers } from "./types/buffers.ts";
import type { BridgeGameData } from "./worker/messages.ts";

export interface DeckSwapSuggestion {
  removedCardId: number;
  improvement: number;
}

export interface FindBestDeckSwapSuggestionOptions {
  addedCardId: number;
  config: EngineConfig;
  currentDeckScore?: number | null;
  deck: number[];
}

interface RankedCandidate {
  removedCardId: number;
  sampledDelta: number;
  slotIndex: number;
}

const TOP_EXACT_CANDIDATES = 2;
const SUGGESTION_SEED = 42;

/**
 * Rank all one-for-one swaps by sampled delta, then exact-score a small shortlist.
 * This keeps the worker fast enough for inline UX while still picking the final
 * suggestion by real score instead of the sampled estimate alone.
 */
export function findBestDeckSwapSuggestion(
  options: FindBestDeckSwapSuggestionOptions,
  modId: ModId = DEFAULT_MOD,
  gameData?: BridgeGameData,
): DeckSwapSuggestion | null {
  const { addedCardId, config, currentDeckScore, deck } = options;
  if (deck.length !== config.deckSize) {
    return null;
  }

  setConfig(config);
  const buf = initializeSuggestionBuffersBrowser(mulberry32(SUGGESTION_SEED), modId, gameData);
  if (!config.useEquipment) buf.equipCompat.fill(0);

  buf.cardCounts.fill(0);
  for (let i = 0; i < deck.length; i++) {
    const cardId = deck[i] ?? 0;
    buf.deck[i] = cardId;
    buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
  }
  for (let i = deck.length; i < buf.deck.length; i++) {
    buf.deck[i] = 0;
  }

  const scorer = new FusionScorer();
  computeInitialScores(buf, scorer);
  const ranked = rankCandidates(buf, scorer, addedCardId);
  if (ranked.length === 0) return null;

  const exactCurrentDeckScore = currentDeckScore ?? exactScore(buf, scorer);
  let bestSuggestion: DeckSwapSuggestion | null = null;

  for (const candidate of ranked.slice(0, TOP_EXACT_CANDIDATES)) {
    const removedCardId = buf.deck[candidate.slotIndex] ?? 0;
    buf.deck[candidate.slotIndex] = addedCardId;
    const improvement = exactScore(buf, scorer) - exactCurrentDeckScore;
    buf.deck[candidate.slotIndex] = removedCardId;

    if (improvement > 0 && (bestSuggestion === null || improvement > bestSuggestion.improvement)) {
      bestSuggestion = { removedCardId: candidate.removedCardId, improvement };
    }
  }

  return bestSuggestion;
}

function rankCandidates(
  buf: OptBuffers,
  scorer: FusionScorer,
  addedCardId: number,
): RankedCandidate[] {
  const deltaEvaluator = new DeltaEvaluator();
  const rankedByRemoved = new Map<number, RankedCandidate>();

  for (let slotIndex = 0; slotIndex < buf.scoringSlots; slotIndex++) {
    const removedCardId = buf.deck[slotIndex] ?? 0;
    if (removedCardId === addedCardId) continue;

    buf.deck[slotIndex] = addedCardId;
    buf.cardCounts[removedCardId] = (buf.cardCounts[removedCardId] ?? 0) - 1;
    buf.cardCounts[addedCardId] = (buf.cardCounts[addedCardId] ?? 0) + 1;
    const sampledDelta = deltaEvaluator.computeDelta(slotIndex, buf, scorer);
    buf.deck[slotIndex] = removedCardId;
    buf.cardCounts[removedCardId] = (buf.cardCounts[removedCardId] ?? 0) + 1;
    buf.cardCounts[addedCardId] = (buf.cardCounts[addedCardId] ?? 0) - 1;

    const current = rankedByRemoved.get(removedCardId);
    if (!current || sampledDelta > current.sampledDelta) {
      rankedByRemoved.set(removedCardId, { removedCardId, sampledDelta, slotIndex });
    }
  }

  return Array.from(rankedByRemoved.values()).sort(
    (left, right) => right.sampledDelta - left.sampledDelta,
  );
}
