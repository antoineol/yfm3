# Phase 6.5 Review: Early Termination

Issues and suggestions for `docs/steps/phase-6.5-early-termination.md` based on the current implementation.

---

## 1. SAOptimizer.run() is synchronous — no way to post progress

The plan says "add a periodic check in the SA hot loop" but `run()` is a monolithic synchronous call. The worker calls `optimizer.run(buf, scorer, de, deadline)` and only gets control back when it returns. There's no mechanism for the worker to post `PROGRESS` messages mid-run.

**Fix:** Add an optional `onProgress` callback parameter to `run()`. Piggyback on the existing `TIME_CHECK_INTERVAL` (every 64 iterations we already call `performance.now()`). When enough wall-clock time has elapsed since the last report (~500ms), invoke the callback with the current best score + deck. This is the minimal change — no restructuring of the loop.

```ts
run(buf, scorer, deltaEvaluator, deadline, onProgress?: (bestScore: number, bestDeck: Int16Array) => void): number
```

The worker wires it up:

```ts
optimizer.run(buf, scorer, de, deadline, (score, deck) => {
  self.postMessage({ type: 'PROGRESS', bestScore: score, bestDeck: Array.from(deck), iterations: optimizer.iterations });
});
```

---

## 2. worker.terminate() is destructive — Promise.all breaks

The plan's convergence flow is: detect plateau → terminate all workers → return best result. But `worker.terminate()` kills the worker instantly — it never posts `RESULT`. `Promise.all(promises)` hangs forever because some promises never resolve.

**Fix:** The orchestrator must track each worker's latest `PROGRESS` as a fallback result. On convergence, resolve each worker's promise from its last progress report, then terminate. Sketch:

```ts
// Per-worker state
const latestProgress: (WorkerProgress | null)[] = new Array(numWorkers).fill(null);

worker.onmessage = (e) => {
  if (e.data.type === 'PROGRESS') {
    latestProgress[i] = e.data;
    // convergence check...
  } else if (e.data.type === 'RESULT') {
    resolve(e.data);
  }
};

// On convergence: resolve from last progress, then terminate
for (let i = 0; i < numWorkers; i++) {
  if (!resolved[i]) resolveFrom(latestProgress[i]);
  workers[i].terminate();
}
```

---

## 3. WorkerProgress must include bestDeck

The plan defines `WorkerProgress` with only `bestScore` and `iterations`. But if we terminate before `RESULT`, we need the actual deck to exact-score it. Without `bestDeck`, early termination can detect convergence but can't return a usable result.

Including `bestDeck` (40 ints) every 500ms is negligible — structured clone of a small array is microseconds.

```ts
type WorkerProgress = {
  type: 'PROGRESS'
  bestScore: number
  bestDeck: number[]
  iterations: number
}
```

---

## 4. Convergence timeout should be relative to time budget

The plan suggests a fixed 3–5s timeout. With adaptive cooling (phase 6.1), the cooling schedule is compressed to fit the budget. For a 10s budget, the exploitation/greedy phase starts around 7–8s in. A fixed 3s timeout could kill workers mid-exploitation — right when they're doing their most precise polishing.

**Fix:** Use a relative timeout, e.g. `max(3s, budget * 0.3)`. This scales with the budget and avoids cutting off the most productive phase of the anneal.

| Budget | Fixed 3s timeout | Relative 30% timeout |
|--------|-------------------|----------------------|
| 10s    | 3s (cuts at 70%)  | 3s (same)            |
| 15s    | 3s (cuts at 80%)  | 4.5s (safer)         |
| 30s    | 3s (cuts at 90%)  | 9s (much safer)      |
| 60s    | 3s (cuts at 95%)  | 18s (appropriate)    |

---

## 5. WorkerResponse union type needs updating

`messages.ts` defines `WorkerResponse = WorkerResult`. It needs to include `WorkerProgress`:

```ts
export type WorkerResponse = WorkerResult | WorkerProgress;
```
