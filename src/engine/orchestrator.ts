import { getConfig, setConfig } from "./config.ts";
import type { Collection } from "./data/card-model.ts";
import { mulberry32 } from "./mulberry32.ts";
import { generateInitialDecks } from "./optimizer/seed-strategies.ts";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH, HAND_SIZE, MAX_FUSION_DEPTH } from "./types/constants.ts";
import type {
  ScorerInit,
  ScorerResponse,
  WorkerInit,
  WorkerProgress,
  WorkerResponse,
  WorkerResult,
} from "./worker/messages.ts";

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
/** Minimum relative improvement to reset the convergence timer. */
const CONVERGENCE_MIN_IMPROVEMENT = 0.001;
/** PRNG seed used by the orchestrator for generating initial decks. */
const SEED_STRATEGY_SEED = 42;

/**
 * Spawn a scorer worker to exact-score a deck off the main thread.
 * Returns a Promise that resolves with the expected ATK value.
 */
function scoreInWorker(collectionRecord: Record<number, number>, deck: number[]): Promise<number> {
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
    const msg: ScorerInit = { type: "SCORE", collection: collectionRecord, deck, config };
    worker.postMessage(msg);
  });
}

/**
 * Run SA optimization across multiple Web Workers in parallel.
 *
 * Each worker initializes its own buffers and runs SA with a different seed
 * and a different initial deck (multi-start seeding).
 * The orchestrator picks the best result by sampled score and exact-scores it.
 *
 * @param collection  cardId → number of copies the player owns
 * @param options.timeLimit  total wall-clock budget in ms (default 15s)
 * @param options.signal  AbortSignal to cancel workers early
 * @param options.currentDeck  card IDs of the current deck to score for comparison
 * @param options.deckSize  number of cards in the optimized deck (default 40)
 * @param options.fusionDepth  max fusion chain depth (default 3)
 */
export async function optimizeDeckParallel(
  collection: Collection,
  options?: {
    timeLimit?: number;
    signal?: AbortSignal;
    currentDeck?: number[];
    deckSize?: number;
    fusionDepth?: number;
  },
): Promise<OptimizeDeckParallelResult> {
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

  // Serialize collection for worker transfer (workers receive plain objects)
  const collectionRecord: Record<number, number> = {};
  for (const [id, qty] of collection) {
    collectionRecord[id] = qty;
  }

  // 1. Fire current-deck scoring in a worker (non-blocking, parallel with SA)
  let currentDeckPromise: Promise<number | null> = Promise.resolve(null);
  if (options?.currentDeck && options.currentDeck.length === deckSize) {
    currentDeckPromise = scoreInWorker(collectionRecord, options.currentDeck);
  }

  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const numWorkers = Math.max(1, Math.min(cores - 1, MAX_WORKERS));
  const timeBudgetMs = timeLimit - EXACT_SCORING_RESERVE;

  const convergenceTimeout = Math.max(
    MIN_CONVERGENCE_TIMEOUT,
    timeBudgetMs * CONVERGENCE_TIMEOUT_RATIO,
  );

  // Generate multi-start initial decks
  const rand = mulberry32(SEED_STRATEGY_SEED);
  const initialDecks = generateInitialDecks(collectionRecord, numWorkers, rand);

  const workers: Worker[] = [];
  const promises: Promise<WorkerResult>[] = [];
  const resolvers: Array<(result: WorkerResult) => void> = [];
  const resolved: boolean[] = [];
  const latestProgress: Array<WorkerProgress | null> = [];
  // Per-worker convergence: each worker's timer resets only when it surpasses
  // the global best (not its own previous best). This prevents random-start
  // workers' catch-up improvements from delaying termination.
  let globalBest = -Infinity;
  const workerLastImprovedAt: number[] = [];

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

  function allWorkersConverged(): boolean {
    const now = performance.now();
    for (let j = 0; j < numWorkers; j++) {
      if (resolved[j]) continue;
      // Worker hasn't reported yet — not converged
      if (latestProgress[j] === null) return false;
      if (now - (workerLastImprovedAt[j] ?? now) <= convergenceTimeout) return false;
    }
    return true;
  }

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(new URL("./worker/sa-worker.ts", import.meta.url), {
      type: "module",
    });
    workers.push(worker);
    resolved.push(false);
    latestProgress.push(null);
    workerLastImprovedAt.push(performance.now());

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
          // Hybrid convergence: a worker's timer resets only when it
          // surpasses the global best, not its own previous best.
          // This prevents random-start catch-up from delaying termination.
          if (msg.bestScore > globalBest) {
            const isSignificant =
              globalBest <= 0 ||
              (msg.bestScore - globalBest) / globalBest >= CONVERGENCE_MIN_IMPROVEMENT;
            globalBest = msg.bestScore;
            if (isSignificant) {
              workerLastImprovedAt[i] = performance.now();
            }
          }
          if (allWorkersConverged()) {
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
      initialDeck: initialDecks[i],
      config: getConfig(),
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

  // 2. Wait for all SA workers to finish (or be resolved early via convergence)
  const results = await Promise.all(promises);

  // Terminate SA workers (they've already posted their results)
  for (const w of workers) w.terminate();

  // 3. Pick best result by sampled score, then exact-score it
  let best = results[0];
  for (let i = 1; i < results.length; i++) {
    const r = results[i];
    if (r && best && r.bestScore > best.bestScore) {
      best = r;
    }
  }

  // 4. Exact-score best deck + await current deck score (both in parallel)
  const [expectedAtk, currentDeckScore] = await Promise.all([
    scoreInWorker(collectionRecord, best?.bestDeck ?? []),
    currentDeckPromise,
  ]);

  const elapsedMs = performance.now() - start;

  return {
    deck: best?.bestDeck ?? [],
    expectedAtk,
    currentDeckScore,
    improvement: currentDeckScore != null ? expectedAtk - currentDeckScore : null,
    elapsedMs,
  };
}
