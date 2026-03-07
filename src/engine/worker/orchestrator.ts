import type { Collection } from "../data/card-model.ts";
import { initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { exactScore } from "../scoring/exact-scorer.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import { DECK_SIZE } from "../types/constants.ts";
import type { WorkerInit, WorkerProgress, WorkerResponse, WorkerResult } from "./messages.ts";

export interface OptimizeDeckParallelResult {
  deck: number[];
  expectedAtk: number;
  currentDeckScore: number | null;
  improvement: number | null;
  elapsedMs: number;
}

/** Reserve time for exact scoring after workers finish (ms). */
const EXACT_SCORING_RESERVE = 5_000;
/** Default time limit for the parallel optimization pipeline (ms). */
const DEFAULT_TIME_LIMIT = 15_000;
/** Safety cap for worker count (prevents runaway on exotic hardware). */
const MAX_WORKERS = 32;
/** Minimum convergence timeout (ms). */
const MIN_CONVERGENCE_TIMEOUT = 3_000;
/** Convergence timeout as a fraction of the SA time budget. */
const CONVERGENCE_TIMEOUT_RATIO = 0.3;
/** Minimum relative improvement to reset the convergence timer. */
const CONVERGENCE_MIN_IMPROVEMENT = 0.001;

/**
 * Run SA optimization across multiple Web Workers in parallel.
 *
 * Each worker initializes its own buffers and runs SA with a different seed.
 * The orchestrator picks the best result and exact-scores it on the main thread.
 *
 * @param collection  cardId → number of copies the player owns
 * @param options.timeLimit  total wall-clock budget in ms (default 15s)
 * @param options.signal  AbortSignal to cancel workers early
 * @param options.currentDeck  card IDs of the current deck to score for comparison
 */
export async function optimizeDeckParallel(
  collection: Collection,
  options?: { timeLimit?: number; signal?: AbortSignal; currentDeck?: number[] },
): Promise<OptimizeDeckParallelResult> {
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

  // Score the current deck on the main thread while workers run SA
  let currentDeckScore: number | null = null;
  if (options?.currentDeck && options.currentDeck.length === DECK_SIZE) {
    const scoreBuf = initializeBuffersBrowser(collection, mulberry32(42));
    for (let i = 0; i < DECK_SIZE; i++) {
      scoreBuf.deck[i] = options.currentDeck[i] ?? 0;
    }
    currentDeckScore = exactScore(scoreBuf, scorer);
  }

  // Serialize collection for worker transfer (workers receive plain objects)
  const collectionRecord: Record<number, number> = {};
  for (const [id, qty] of collection) {
    collectionRecord[id] = qty;
  }

  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const numWorkers = Math.max(1, Math.min(cores - 1, MAX_WORKERS));
  const timeBudgetMs = timeLimit - EXACT_SCORING_RESERVE;

  const convergenceTimeout = Math.max(
    MIN_CONVERGENCE_TIMEOUT,
    timeBudgetMs * CONVERGENCE_TIMEOUT_RATIO,
  );

  const workers: Worker[] = [];
  const promises: Promise<WorkerResult>[] = [];
  const resolvers: Array<(result: WorkerResult) => void> = [];
  const resolved: boolean[] = [];
  const latestProgress: Array<WorkerProgress | null> = [];
  let globalBest = -Infinity;
  let lastImprovedAt = performance.now();

  function terminateEarly() {
    for (let j = 0; j < numWorkers; j++) {
      if (!resolved[j]) {
        const progress = latestProgress[j];
        if (progress) {
          resolved[j] = true;
          resolvers[j]?.({
            type: "RESULT",
            bestDeck: progress.bestDeck,
            bestScore: progress.bestScore,
            iterations: progress.iterations,
          });
        }
      }
      workers[j]?.terminate();
    }
  }

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(new URL("./sa-worker.ts", import.meta.url), { type: "module" });
    workers.push(worker);
    resolved.push(false);
    latestProgress.push(null);

    const promise = new Promise<WorkerResult>((resolve, reject) => {
      resolvers.push(resolve);
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === "RESULT") {
          if (!resolved[i]) {
            resolved[i] = true;
            resolve(msg);
          }
        } else {
          latestProgress[i] = msg;
          if (msg.bestScore > globalBest) {
            const isSignificant =
              globalBest <= 0 ||
              (msg.bestScore - globalBest) / globalBest >= CONVERGENCE_MIN_IMPROVEMENT;
            globalBest = msg.bestScore;
            if (isSignificant) {
              lastImprovedAt = performance.now();
            }
          }
          if (performance.now() - lastImprovedAt > convergenceTimeout) {
            terminateEarly();
          }
        }
      };
      worker.onerror = (e) => {
        reject(new Error(`Worker ${i} error: ${e.message}`));
      };
    });
    promises.push(promise);

    const init: WorkerInit = {
      type: "INIT",
      collection: collectionRecord,
      seed: i,
      timeBudgetMs,
    };
    worker.postMessage(init);
  }

  // Wire up abort signal to terminate all workers
  if (options?.signal) {
    options.signal.addEventListener(
      "abort",
      () => {
        terminateEarly();
      },
      { once: true },
    );
  }

  // Wait for all workers to finish (or be resolved early via convergence)
  const results = await Promise.all(promises);

  // Terminate workers (they've already posted their results)
  for (const w of workers) w.terminate();

  // Pick the best result by sampled score
  let best = results[0] as WorkerResult;
  for (let i = 1; i < results.length; i++) {
    const r = results[i] as WorkerResult;
    if (r.bestScore > best.bestScore) {
      best = r;
    }
  }

  // Exact-score the best deck on the main thread
  const scoreBuf = initializeBuffersBrowser(collection, mulberry32(42));
  for (let i = 0; i < DECK_SIZE; i++) {
    scoreBuf.deck[i] = best.bestDeck[i] ?? 0;
  }
  const expectedAtk = exactScore(scoreBuf, scorer);

  const elapsedMs = performance.now() - start;

  return {
    deck: best.bestDeck,
    expectedAtk,
    currentDeckScore,
    improvement: currentDeckScore != null ? expectedAtk - currentDeckScore : null,
    elapsedMs,
  };
}
