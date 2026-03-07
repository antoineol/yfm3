import { initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { SAOptimizer } from "../optimizer/sa-optimizer.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { WorkerInit, WorkerResult } from "./messages.ts";

self.onmessage = (e: MessageEvent<WorkerInit>) => {
  const { collection, seed, timeBudgetMs } = e.data;
  const collectionMap = new Map(
    Object.entries(collection).map(([id, qty]) => [Number(id), qty as number]),
  );
  const rand = mulberry32(seed);
  const buf = initializeBuffersBrowser(collectionMap, rand);
  const scorer = new FusionScorer();
  computeInitialScores(buf, scorer);

  const optimizer = new SAOptimizer(seed);
  const deadline = performance.now() + timeBudgetMs;
  const bestScore = optimizer.run(buf, scorer, new DeltaEvaluator(), deadline);

  const result: WorkerResult = {
    type: "RESULT",
    bestDeck: Array.from(buf.deck),
    bestScore,
    iterations: optimizer.iterations,
  };
  self.postMessage(result);
};
