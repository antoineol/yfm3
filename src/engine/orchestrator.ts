import { getConfig, setConfig } from "./config.ts";
import type { Collection } from "./data/card-model.ts";
import { DEFAULT_MOD, MODS, type ModId } from "./mods.ts";
import { mulberry32 } from "./mulberry32.ts";
import { generateInitialDecks } from "./optimizer/seed-strategies.ts";
import {
  CHOOSE_5,
  DECK_SIZE,
  DEFAULT_FUSION_DEPTH,
  HAND_SIZE,
  MAX_FUSION_DEPTH,
  NUM_HANDS,
} from "./types/constants.ts";
import type { BridgeGameData, ScorerInit, ScorerResponse } from "./worker/messages.ts";
import { runSaWorkerPool } from "./worker/sa-worker-pool.ts";

export interface OptimizeDeckParallelResult {
  deck: number[];
  expectedAtk: number;
  currentDeckScore: number | null;
  improvement: number | null;
  elapsedMs: number;
}

/** Reserve time for exact scoring in a worker after SA finishes (ms). */
const EXACT_SCORING_RESERVE = 2_000;
/** Default time limit for the parallel optimization pipeline (ms). */
const DEFAULT_TIME_LIMIT = 15_000;
/** Safety cap for worker count (prevents runaway on exotic hardware). */
const MAX_WORKERS = 32;
/** Minimum convergence timeout (ms). */
const MIN_CONVERGENCE_TIMEOUT = 3_000;
/** Convergence timeout as a fraction of the SA time budget. */
const CONVERGENCE_TIMEOUT_RATIO = 0.3;
/** PRNG seed used by the orchestrator for generating initial decks. */
const SEED_STRATEGY_SEED = 42;

/**
 * Spawn a scorer worker to exact-score a deck off the main thread.
 * Returns a Promise that resolves with the expected ATK value.
 */
function scoreInWorker(
  collectionRecord: Record<number, number>,
  deck: number[],
  modId: ModId,
  gameData?: BridgeGameData,
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const worker = new Worker(new URL("./worker/scorer-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e: MessageEvent<ScorerResponse>) => {
      resolve(e.data.expectedAtk);
      worker.terminate();
    };
    worker.onerror = (e) => {
      reject(new Error(`Scorer worker error: ${e.message}`));
      worker.terminate();
    };
    const config = getConfig();
    const msg: ScorerInit = {
      type: "SCORE",
      collection: collectionRecord,
      deck,
      config,
      modId,
      gameData,
    };
    worker.postMessage(msg);
  });
}

/**
 * Run SA optimization across multiple Web Workers in parallel.
 *
 * Each worker runs SA with a different seed and initial deck (multi-start).
 * The orchestrator picks the best result by sampled score and exact-scores it.
 *
 * @param collection  cardId → number of copies the player owns
 * @param options.timeLimit  total wall-clock budget in ms (default 15s)
 * @param options.signal  AbortSignal to cancel workers early
 * @param options.currentDeck  card IDs of the current deck to score for comparison
 * @param options.currentDeckScore  pre-computed exact expected ATK of the current deck (skips redundant scoring)
 * @param options.deckSize  number of cards in the optimized deck (default 40)
 * @param options.fusionDepth  max fusion chain depth (default 3)
 * @param options.terrain  terrain ID for field power bonuses (0 = none, 1–6)
 */
export async function optimizeDeckParallel(
  collection: Collection,
  options?: {
    timeLimit?: number;
    signal?: AbortSignal;
    currentDeck?: number[];
    currentDeckScore?: number | null;
    deckSize?: number;
    fusionDepth?: number;
    useEquipment?: boolean;
    terrain?: number;
    modId?: ModId;
    gameData?: BridgeGameData;
    onProgress?: (progress: number, bestScore: number, bestDeck: number[]) => void;
  },
): Promise<OptimizeDeckParallelResult> {
  const timeLimit = options?.timeLimit ?? DEFAULT_TIME_LIMIT;
  const deckSize = options?.deckSize ?? DECK_SIZE;
  const fusionDepth = options?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
  const useEquipment = options?.useEquipment ?? true;
  const terrain = options?.terrain ?? 0;
  const modId = options?.modId ?? DEFAULT_MOD;
  const gameData = options?.gameData;
  const start = performance.now();

  if (deckSize < HAND_SIZE || deckSize > DECK_SIZE) {
    throw new Error(`Deck size must be between ${HAND_SIZE} and ${DECK_SIZE}, got ${deckSize}.`);
  }
  if (fusionDepth < 1 || fusionDepth > MAX_FUSION_DEPTH) {
    throw new Error(`Fusion depth must be between 1 and ${MAX_FUSION_DEPTH}, got ${fusionDepth}.`);
  }

  let totalCards = 0;
  for (const count of collection.values()) totalCards += count;
  if (totalCards < deckSize) {
    throw new Error(
      `Collection has only ${totalCards} total cards, but a deck requires ${deckSize}.`,
    );
  }

  setConfig({ deckSize, fusionDepth, useEquipment, megamorphId: MODS[modId].megamorphId, terrain });

  const collectionRecord: Record<number, number> = {};
  for (const [id, qty] of collection) collectionRecord[id] = qty;

  // 1. Resolve current-deck score: reuse pre-computed value or fire a worker
  let currentDeckPromise: Promise<number | null> = Promise.resolve(null);
  if (options?.currentDeckScore != null) {
    currentDeckPromise = Promise.resolve(options.currentDeckScore);
  } else if (options?.currentDeck && options.currentDeck.length === deckSize) {
    currentDeckPromise = scoreInWorker(collectionRecord, options.currentDeck, modId, gameData);
  }

  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const numWorkers = Math.max(1, Math.min(cores - 1, MAX_WORKERS));
  const timeBudgetMs = timeLimit - EXACT_SCORING_RESERVE;
  const convergenceTimeout = Math.max(
    MIN_CONVERGENCE_TIMEOUT,
    timeBudgetMs * CONVERGENCE_TIMEOUT_RATIO,
  );
  const numHands = Math.min(NUM_HANDS, CHOOSE_5[deckSize] ?? 0);

  const rand = mulberry32(SEED_STRATEGY_SEED);
  const initialDecks = generateInitialDecks(collectionRecord, numWorkers, rand);

  // 2. Run SA workers in parallel with convergence detection
  const results = await runSaWorkerPool({
    collectionRecord,
    initialDecks,
    timeBudgetMs,
    convergenceTimeout,
    modId,
    gameData,
    signal: options?.signal,
    onProgress: options?.onProgress
      ? (globalBest, globalBestDeck) => {
          const elapsed = performance.now() - start;
          const progress = Math.min(elapsed / timeBudgetMs, 1);
          const approxExpectedAtk = numHands > 0 ? globalBest / numHands : 0;
          options.onProgress?.(progress, approxExpectedAtk, globalBestDeck);
        }
      : undefined,
  });

  // 3. Pick best result by sampled score, then exact-score it
  let best = results[0];
  for (let i = 1; i < results.length; i++) {
    const r = results[i];
    if (r && best && r.bestScore > best.bestScore) best = r;
  }

  // 4. Exact-score best deck + await current deck score (both in parallel)
  const [expectedAtk, currentDeckScore] = await Promise.all([
    scoreInWorker(collectionRecord, best?.bestDeck ?? [], modId, gameData),
    currentDeckPromise,
  ]);

  return {
    deck: best?.bestDeck ?? [],
    expectedAtk,
    currentDeckScore,
    improvement: currentDeckScore != null ? expectedAtk - currentDeckScore : null,
    elapsedMs: performance.now() - start,
  };
}
