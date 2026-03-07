# Phase 6 (V2): Web Workers

This phase is an optional V2 enhancement to the plan in PLAN.md file.

**Goal:** Parallelize SA search across 4–8 Web Workers for ~4× more exploration. Critical for fusion-dense decks where per-swap cost degrades to ~5ms, reducing single-threaded coverage from ~27,500 to ~11,000 swaps.

**Depends on:** Phase 4 (SA optimizer with deadline), Phase 5 (public API).

**Risk addressed:** Single-threaded SA may miss global optima on collections with many local optima or complex fusion chains.

**Note:** This phase introduces `async` and `AbortSignal` support to the public API. Phase 5 (V1) is fully synchronous because there's no event loop to check signals during tight SA loops. With Web Workers, the orchestrator awaits worker results, making `async` necessary, and `AbortSignal` can terminate workers via `worker.terminate()`.

---

## 6.1 Message Protocol

**Main → Worker:**

```ts
type WorkerInit = {
  type: 'INIT'
  fusionTable: Int16Array
  cardAtk: Int16Array
  handSlots: Uint8Array
  affectedHandIds: Uint16Array
  affectedHandOffsets: Uint32Array
  affectedHandCounts: Uint16Array
  initialDeck: Int16Array
  availableCounts: Uint8Array
  seed: number
  timeBudgetMs: number
}
```

**Worker → Main:**

```ts
type WorkerResult = {
  type: 'RESULT'
  bestDeck: Int16Array
  bestScore: number
  iterations: number
}
```

---

## 6.2 Worker Entry Point

Each worker:
1. Receives `INIT`, unpacks buffers
2. Creates scorer, delta evaluator, SA optimizer instances
3. Computes initial `handScores` from the provided deck
4. Runs SA loop with `deadline = performance.now() + timeBudgetMs`
5. Posts `RESULT` with best deck + score

---

## 6.3 Orchestrator

The public API becomes `async` here (was synchronous in Phase 5) because worker coordination requires `await`. `AbortSignal` support is also added: the orchestrator listens for abort and calls `worker.terminate()` on all workers.

```
async function optimizeDeck(collection, options?: { timeLimit?, signal? }):
  buffers = initializeBuffers(collection, rand)

  numWorkers = navigator.hardwareConcurrency || 4
  timeBudget = timeLimit - 5000
  for i = 0 to numWorkers-1:
    worker = new Worker('sa-worker.ts')
    worker.postMessage({ type: 'INIT', ...buffers, seed: i, timeBudgetMs: timeBudget })

  if signal: signal.addEventListener('abort', () => workers.forEach(w => w.terminate()))

  results = await Promise.all(workers.map(waitForResult))
  bestDeck = results with highest bestScore
  exactScore bestDeck
  return result
```

---

## 6.4 Transfer Strategy

Read-only tables (`fusionTable`, `cardAtk`, `handSlots`, CSR arrays) use `SharedArrayBuffer` if available, otherwise structured clone copies. Mutable state (`deck`, `handScores`, `cardCounts`) is always per-worker.

---

## 6.5 Files to Create

| File | Purpose |
|------|---------|
| `src/engine/worker/sa-worker.ts` | Web Worker entry point |
| `src/engine/worker/orchestrator.ts` | Main thread worker management |
| `src/engine/worker/messages.ts` | Typed message protocol |

---

## 6.6 Performance Impact

| Metric | V1 (single-threaded) | V2 (4 workers) |
|--------|---------------------|----------------|
| Total swaps | ~27,500 | ~110,000 |
| Swap space coverage | ~97% | ~99.97% |
| Fusion-dense coverage | ~75% | ~98% |
