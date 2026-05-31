import { getConfig } from "../config.ts";
import type { ModId } from "../mods.ts";
import type {
  BridgeGameData,
  WorkerInit,
  WorkerProgress,
  WorkerResponse,
  WorkerResult,
} from "./messages.ts";

export interface SaPoolConfig {
  collectionRecord: Record<number, number>;
  initialDecks: Array<number[] | undefined>;
  timeBudgetMs: number;
  exactScoringReserveMs: number;
  modId: ModId;
  gameData?: BridgeGameData;
  signal?: AbortSignal;
  /** Called on each PROGRESS message with the global best score and deck. */
  onProgress?: (globalBest: number, globalBestDeck: number[]) => void;
}

/**
 * Spawn SA workers in parallel.
 * Each worker receives a different seed and optional initial deck.
 * Returns all worker results once every worker finishes or the run is aborted.
 */
export async function runSaWorkerPool(config: SaPoolConfig): Promise<WorkerResult[]> {
  const { collectionRecord, initialDecks, timeBudgetMs, exactScoringReserveMs, modId, gameData } =
    config;
  const numWorkers = initialDecks.length;

  const workers: Worker[] = [];
  const promises: Promise<WorkerResult>[] = [];
  const resolvers: Array<(result: WorkerResult) => void> = [];
  const rejecters: Array<(err: Error) => void> = [];
  const resolved: boolean[] = [];
  const latestProgress: Array<WorkerProgress | null> = [];
  let globalBest = -Infinity;
  let globalBestDeck: number[] = [];

  function terminateAll() {
    for (let j = 0; j < numWorkers; j++) {
      if (!resolved[j]) {
        const fallback = progressResult(latestProgress[j] ?? null) ?? globalProgressResult();
        if (fallback) {
          resolved[j] = true;
          resolvers[j]?.(fallback);
        } else {
          resolved[j] = true;
          rejecters[j]?.(new Error("Optimization ended before any worker reported progress."));
        }
      }
      workers[j]?.terminate();
    }
  }

  function globalProgressResult(): WorkerResult | null {
    if (!globalBestDeck.length || !Number.isFinite(globalBest)) return null;
    return {
      type: "RESULT",
      bestDeck: globalBestDeck,
      bestScore: globalBest,
      iterations: 0,
    };
  }

  function progressResult(progress: WorkerProgress | null): WorkerResult | null {
    if (!progress) return null;
    return {
      type: "RESULT",
      bestDeck: progress.bestDeck,
      bestScore: progress.bestScore,
      iterations: progress.iterations,
    };
  }

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(new URL("./sa-worker.ts", import.meta.url), { type: "module" });
    workers.push(worker);
    resolved.push(false);
    latestProgress.push(null);

    const promise = new Promise<WorkerResult>((resolve, reject) => {
      resolvers.push(resolve);
      rejecters.push(reject);
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
        if (msg.bestScore > globalBest) {
          globalBest = msg.bestScore;
          globalBestDeck = msg.bestDeck;
        }
        config.onProgress?.(globalBest, globalBestDeck);
      };
      worker.onerror = (e) => reject(new Error(`Worker ${i} error: ${e.message}`));
    });
    promises.push(promise);

    const init: WorkerInit = {
      type: "INIT",
      collection: collectionRecord,
      seed: i,
      timeBudgetMs,
      exactScoringReserveMs,
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
