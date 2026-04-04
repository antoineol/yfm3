import { getConfig } from "../config.ts";
import type { ModId } from "../mods.ts";
import type {
  BridgeGameData,
  WorkerInit,
  WorkerProgress,
  WorkerResponse,
  WorkerResult,
} from "./messages.ts";

/** Minimum relative improvement to reset the convergence timer. */
const CONVERGENCE_MIN_IMPROVEMENT = 0.001;

export interface SaPoolConfig {
  collectionRecord: Record<number, number>;
  initialDecks: Array<number[] | undefined>;
  timeBudgetMs: number;
  convergenceTimeout: number;
  modId: ModId;
  gameData?: BridgeGameData;
  signal?: AbortSignal;
  /** Called on each PROGRESS message with the global best score and deck. */
  onProgress?: (globalBest: number, globalBestDeck: number[]) => void;
}

/**
 * Spawn SA workers in parallel with convergence-based early termination.
 * Each worker receives a different seed and optional initial deck.
 * Returns all worker results once every worker finishes or converges.
 */
export async function runSaWorkerPool(config: SaPoolConfig): Promise<WorkerResult[]> {
  const { collectionRecord, initialDecks, timeBudgetMs, convergenceTimeout, modId, gameData } =
    config;
  const numWorkers = initialDecks.length;

  const workers: Worker[] = [];
  const promises: Promise<WorkerResult>[] = [];
  const resolvers: Array<(result: WorkerResult) => void> = [];
  const resolved: boolean[] = [];
  const latestProgress: Array<WorkerProgress | null> = [];
  // Per-worker convergence: each worker's timer resets only when it surpasses
  // the global best (not its own previous best). This prevents random-start
  // workers' catch-up improvements from delaying termination.
  let globalBest = -Infinity;
  let globalBestDeck: number[] = [];
  const workerLastImprovedAt: number[] = [];

  function terminateAll() {
    for (let j = 0; j < numWorkers; j++) {
      if (!resolved[j]) {
        resolved[j] = true;
        const progress = latestProgress[j];
        resolvers[j]?.({
          type: "RESULT",
          bestDeck: progress?.bestDeck ?? [],
          bestScore: progress?.bestScore ?? -Infinity,
          iterations: progress?.iterations ?? 0,
        });
      }
      workers[j]?.terminate();
    }
  }

  function allConverged(): boolean {
    const now = performance.now();
    for (let j = 0; j < numWorkers; j++) {
      if (resolved[j]) continue;
      if (latestProgress[j] === null) return false;
      if (now - (workerLastImprovedAt[j] ?? now) <= convergenceTimeout) return false;
    }
    return true;
  }

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(new URL("./sa-worker.ts", import.meta.url), { type: "module" });
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
          return;
        }
        latestProgress[i] = msg;
        // Hybrid convergence: a worker's timer resets only when it
        // surpasses the global best, not its own previous best.
        if (msg.bestScore > globalBest) {
          const isSignificant =
            globalBest <= 0 ||
            (msg.bestScore - globalBest) / globalBest >= CONVERGENCE_MIN_IMPROVEMENT;
          globalBest = msg.bestScore;
          globalBestDeck = msg.bestDeck;
          if (isSignificant) {
            workerLastImprovedAt[i] = performance.now();
          }
        }
        config.onProgress?.(globalBest, globalBestDeck);
        if (allConverged()) terminateAll();
      };
      worker.onerror = (e) => reject(new Error(`Worker ${i} error: ${e.message}`));
    });
    promises.push(promise);

    const init: WorkerInit = {
      type: "INIT",
      collection: collectionRecord,
      seed: i,
      timeBudgetMs,
      initialDeck: initialDecks[i],
      config: getConfig(),
      modId,
      gameData,
    };
    worker.postMessage(init);
  }

  if (config.signal) {
    config.signal.addEventListener("abort", () => terminateAll(), { once: true });
  }

  const results = await Promise.all(promises);
  for (const w of workers) w.terminate();
  return results;
}
