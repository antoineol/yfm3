import { setConfig } from "./config.ts";
import type { Collection } from "./data/card-model.ts";
import { initializeBuffers, mulberry32 } from "./initialize-buffers.ts";
import { SAOptimizer } from "./optimizer/sa-optimizer.ts";
import { computeInitialScores } from "./scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "./scoring/delta-evaluator.ts";
import { exactScore } from "./scoring/exact-scorer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH, HAND_SIZE, MAX_FUSION_DEPTH } from "./types/constants.ts";

/** Default time limit for the full optimization pipeline (ms). */
const DEFAULT_TIME_LIMIT = 60_000;
/** Reserve time for exact scoring at the end (ms). */
const EXACT_SCORING_RESERVE = 5_000;

export interface OptimizeDeckResult {
  deck: number[];
  expectedAtk: number;
  initialScore: number;
  improvement: number;
  elapsedMs: number;
}

/**
 * Optimize a monster deck for the highest expected opening-hand ATK.
 *
 * Pipeline:
 *   1. Initialize buffers (parse game data, build fusion table, greedy initial deck)
 *   2. Score all sampled hands for the initial deck
 *   3. Run SA optimizer until deadline
 *   4. Exact-score the best deck for accurate reporting
 *
 * @param collection  cardId → number of copies the player owns
 * @param options.timeLimit  total wall-clock budget in ms (default 60s)
 * @param options.deckSize  number of cards in the deck (default 40)
 * @param options.fusionDepth  max fusion chain depth (default 3)
 * @throws if the collection has fewer than deckSize total cards
 */
export function optimizeDeck(
  collection: Collection,
  options?: { timeLimit?: number; deckSize?: number; fusionDepth?: number },
): OptimizeDeckResult {
  const timeLimit = options?.timeLimit ?? DEFAULT_TIME_LIMIT;
  const deckSize = options?.deckSize ?? DECK_SIZE;
  const fusionDepth = options?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
  const start = performance.now();

  if (deckSize < HAND_SIZE || deckSize > DECK_SIZE) {
    throw new Error(`Deck size must be between ${HAND_SIZE} and ${DECK_SIZE}, got ${deckSize}.`);
  }
  if (fusionDepth < 1 || fusionDepth > MAX_FUSION_DEPTH) {
    throw new Error(`Fusion depth must be between 1 and ${MAX_FUSION_DEPTH}, got ${fusionDepth}.`);
  }

  // Validate collection has enough cards
  let totalCards = 0;
  for (const count of collection.values()) {
    totalCards += count;
  }
  if (totalCards < deckSize) {
    throw new Error(
      `Collection has only ${totalCards} total cards, but a deck requires ${deckSize}.`,
    );
  }

  setConfig({ deckSize, fusionDepth });

  // 1. Initialize buffers
  const rand = mulberry32(42);
  const buf = initializeBuffers(collection, rand);

  // 2. Compute initial scores
  const scorer = new FusionScorer();
  computeInitialScores(buf, scorer);
  const initialScore = exactScore(buf, scorer);

  // 3. Run SA optimizer
  const deadline = start + timeLimit - EXACT_SCORING_RESERVE;
  const deltaEvaluator = new DeltaEvaluator();
  const optimizer = new SAOptimizer();
  optimizer.run(buf, scorer, deltaEvaluator, deadline);

  // 4. Exact-score the best deck
  const expectedAtk = exactScore(buf, scorer);

  const elapsedMs = performance.now() - start;

  return {
    deck: Array.from(buf.deck.subarray(0, buf.scoringSlots)),
    expectedAtk,
    initialScore,
    improvement: expectedAtk - initialScore,
    elapsedMs,
  };
}
