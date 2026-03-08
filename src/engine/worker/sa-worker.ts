import { initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { SAOptimizer } from "../optimizer/sa-optimizer.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { WorkerInit, WorkerProgress, WorkerResult } from "./messages.ts";

self.onmessage = (e: MessageEvent<WorkerInit>) => {
  const { collection, seed, timeBudgetMs, initialDeck } = e.data;
  const collectionMap = new Map(
    Object.entries(collection).map(([id, qty]) => [Number(id), qty as number]),
  );
  const rand = mulberry32(seed);
  const buf = initializeBuffersBrowser(collectionMap, rand);

  // Override greedy deck with the provided initial deck if any
  if (initialDeck) {
    buf.cardCounts.fill(0);
    for (let i = 0; i < initialDeck.length; i++) {
      const cardId = initialDeck[i] ?? 0;
      buf.deck[i] = cardId;
      buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
    }
  }

  const scorer = new FusionScorer();
  computeInitialScores(buf, scorer);

  const optimizer = new SAOptimizer(seed);
  const deadline = performance.now() + timeBudgetMs;
  const bestScore = optimizer.run(buf, scorer, new DeltaEvaluator(), deadline, (score, deck) => {
    const progress: WorkerProgress = {
      type: "PROGRESS",
      bestScore: score,
      bestDeck: Array.from(deck),
      iterations: optimizer.iterations,
    };
    self.postMessage(progress);
  });

  const result: WorkerResult = {
    type: "RESULT",
    bestDeck: Array.from(buf.deck),
    bestScore,
    iterations: optimizer.iterations,
  };
  self.postMessage(result);
};
