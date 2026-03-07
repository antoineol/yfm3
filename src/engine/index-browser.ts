import type { Collection } from "./data/card-model.ts";
import { initializeBuffersBrowser } from "./initialize-buffers-browser.ts";
import { mulberry32 } from "./mulberry32.ts";
import { SAOptimizer } from "./optimizer/sa-optimizer.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "./scoring/delta-evaluator.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import { DECK_SIZE } from "./types/constants.ts";

export interface OptimizeDeckResult {
  deck: number[];
  expectedAtk: number;
  currentDeckScore: number | null;
  improvement: number | null;
  elapsedMs: number;
}

/** Default time limit for browser usage (ms). */
const DEFAULT_TIME_LIMIT = 15_000;
/** Reserve time for exact scoring at the end (ms). */
const EXACT_SCORING_RESERVE = 5_000;

/**
 * Browser-compatible version of optimizeDeck.
 * Uses Vite ?raw CSV imports instead of fs.readFileSync.
 *
 * @param options.currentDeck  card IDs of the current deck to score for comparison
 */
export function optimizeDeck(
  collection: Collection,
  options?: { timeLimit?: number; currentDeck?: number[] },
): OptimizeDeckResult {
  const timeLimit = options?.timeLimit ?? DEFAULT_TIME_LIMIT;
  const start = performance.now();

  let totalCards = 0;
  for (const count of collection.values()) {
    totalCards += count;
  }
  if (totalCards < DECK_SIZE) {
    throw new Error(
      `Collection has only ${totalCards} total cards, but a deck requires ${DECK_SIZE}.`,
    );
  }

  const scorer = new FusionScorer();

  // Score the current deck if provided
  let currentDeckScore: number | null = null;
  if (options?.currentDeck && options.currentDeck.length === DECK_SIZE) {
    const scoreBuf = initializeBuffersBrowser(collection, mulberry32(42));
    for (let i = 0; i < DECK_SIZE; i++) {
      scoreBuf.deck[i] = options.currentDeck[i] ?? 0;
    }
    currentDeckScore = exactScore(scoreBuf, scorer);
  }

  // Run SA optimization
  const buf = initializeBuffersBrowser(collection, mulberry32(42));
  computeInitialScores(buf, scorer);

  const deadline = start + timeLimit - EXACT_SCORING_RESERVE;
  const deltaEvaluator = new DeltaEvaluator();
  const optimizer = new SAOptimizer();
  optimizer.run(buf, scorer, deltaEvaluator, deadline);

  const expectedAtk = exactScore(buf, scorer);
  const elapsedMs = performance.now() - start;

  return {
    deck: Array.from(buf.deck),
    expectedAtk,
    currentDeckScore,
    improvement: currentDeckScore != null ? expectedAtk - currentDeckScore : null,
    elapsedMs,
  };
}
