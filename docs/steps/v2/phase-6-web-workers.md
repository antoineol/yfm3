# Phase 6 (V2): Web Workers (DONE)

This phase is an optional V2 enhancement to the plan in PLAN.md file.

**Goal:** Move SA search off the main thread to keep the UI responsive and parallelize across 4-8 Web Workers for ~4x more exploration. The current single-threaded `optimizeDeck` blocks the main thread for ~15 seconds, freezing the page completely (no cancel button, no progress, no animations). Workers solve both problems at once.

**Depends on:** Phase 4 (SA optimizer with deadline), Phase 5 (public API), Phase 1-UI (browser entry point).

**Risk addressed:** Single-threaded SA may miss global optima on collections with many local optima or complex fusion chains. Additionally, main-thread blocking creates a terrible user experience.

**Note:** This phase introduces `async` and `AbortSignal` support via a new `optimizeDeckParallel` export. The existing synchronous `optimizeDeck` in both `index.ts` (Node/Bun) and `index-browser.ts` (browser) stays untouched — it's still useful for small collections and testing.

---

## 6.1 Import Chain Constraint

Workers must only import from the browser-safe module graph:

```
sa-worker.ts
  -> initialize-buffers-browser.ts  (uses Vite ?raw CSV imports)
     -> data/load-game-data-core.ts (pure logic, no fs/path)
  -> mulberry32.ts                  (extracted to avoid Node chain)
  -> optimizer/sa-optimizer.ts
  -> scoring/*
```

Never import from `initialize-buffers.ts`, `load-game-data.ts`, or `index.ts` — these pull in Node-only `fs.readFileSync`.

---

## 6.2 Message Protocol

Each worker initializes its own buffers from the collection. This avoids transferring large typed arrays and eliminates any need for `SharedArrayBuffer` (which requires COOP/COEP headers that can break Convex's WebSocket connection).

**Main -> Worker:**

```ts
type WorkerInit = {
  type: 'INIT'
  collection: Record<number, number>  // cardId -> quantity
  seed: number
  timeBudgetMs: number
}
```

**Worker -> Main:**

```ts
type WorkerResult = {
  type: 'RESULT'
  bestDeck: number[]
  bestScore: number
  iterations: number
}
```

---

## 6.3 Worker Entry Point

Each worker:
1. Receives `INIT` with collection, seed, and time budget
2. Calls `initializeBuffersBrowser(collection, mulberry32(seed))` to build its own buffers (~10ms, negligible vs SA budget)
3. Calls `computeInitialScores(buf, scorer)` to populate `buf.handScores`
4. Runs SA loop with `deadline = performance.now() + timeBudgetMs`
5. Posts `RESULT` with best deck + score

```ts
// sa-worker.ts
import { initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { SAOptimizer } from "../optimizer/sa-optimizer.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";

self.onmessage = (e) => {
  const { collection, seed, timeBudgetMs } = e.data;
  const collectionMap = new Map(
    Object.entries(collection).map(([id, qty]) => [Number(id), qty])
  );
  const rand = mulberry32(seed);
  const buf = initializeBuffersBrowser(collectionMap, rand);
  const scorer = new FusionScorer(/* ... */);
  computeInitialScores(buf, scorer);
  const optimizer = new SAOptimizer();
  optimizer.run(buf, scorer, new DeltaEvaluator(), performance.now() + timeBudgetMs);
  self.postMessage({
    type: 'RESULT',
    bestDeck: Array.from(buf.deck),
    bestScore: buf.bestScore,
    iterations: buf.iterations,
  });
};
```

---

## 6.4 Orchestrator

A new `optimizeDeckParallel` async function coordinates workers. The existing synchronous `optimizeDeck` is unchanged.

```
async function optimizeDeckParallel(collection, options?: { timeLimit?, signal? }):
  numWorkers = navigator.hardwareConcurrency || 4
  timeBudget = timeLimit - 5000

  // Score current deck on main thread while workers run SA in parallel
  currentDeckScore = exactScore(currentDeck)

  for i = 0 to numWorkers-1:
    worker = new Worker(new URL('./sa-worker.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ type: 'INIT', collection, seed: i, timeBudgetMs: timeBudget })

  if signal: signal.addEventListener('abort', () => workers.forEach(w => w.terminate()))

  results = await Promise.all(workers.map(waitForResult))
  bestDeck = results with highest bestScore
  exactBestScore = exactScore(bestDeck)
  return { bestDeck, exactBestScore, currentDeckScore }
```

Note the Vite-specific worker syntax: `new Worker(new URL('./sa-worker.ts', import.meta.url), { type: 'module' })`. A bare `new Worker('sa-worker.ts')` won't work with Vite's bundler.

---

## 6.5 No SharedArrayBuffer

The plan deliberately avoids `SharedArrayBuffer`. Each worker initializes its own buffers (~2MB each, negligible memory overhead). This means the page does **not** need cross-origin isolation headers (`Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`), which would risk breaking Convex's WebSocket connection.

---

## 6.6 Files to Create

| File | Purpose |
|------|---------|
| `src/engine/worker/sa-worker.ts` | Web Worker entry point |
| `src/engine/worker/orchestrator.ts` | Main thread worker management, `optimizeDeckParallel` |
| `src/engine/worker/messages.ts` | Typed message protocol |

---

## 6.7 Performance Impact

| Metric | V1 (single-threaded) | V2 (4 workers) |
|--------|---------------------|----------------|
| UI blocked | ~15s | 0s |
| Total swaps | ~27,500 | ~110,000 |
| Swap space coverage | ~97% | ~99.97% |
| Fusion-dense coverage | ~75% | ~98% |