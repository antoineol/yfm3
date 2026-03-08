# Phase 6.5 (V2): Early Termination

This phase is an optional V2 enhancement that builds on Phase 6 (Web Workers).

**Goal:** Detect convergence across workers and terminate early when SA stops improving, turning workers from "same time, better results" into "better results, often faster."

**Depends on:** Phase 6 (Web Workers).

**Observation:** SA typically converges to near-optimal within 3-5 seconds. The remaining time is diminishing returns. With multiple workers racing independently, we can detect when all workers have plateaued and return early.

---

## 6.5.1 Progress Callback in SAOptimizer

`SAOptimizer.run()` is a monolithic synchronous call — the worker has no opportunity to post messages mid-run. Add an optional `onProgress` callback parameter, invoked from the existing `TIME_CHECK_INTERVAL` check (every 64 iterations) when enough wall-clock time has elapsed (~500ms):

```ts
run(
  buf: OptBuffers,
  scorer: IScorer,
  deltaEvaluator: IDeltaEvaluator,
  deadline: number,
  onProgress?: (bestScore: number, bestDeck: Int16Array) => void,
): number
```

The worker wires it up to post a `PROGRESS` message:

```ts
optimizer.run(buf, scorer, de, deadline, (score, deck) => {
  self.postMessage({
    type: 'PROGRESS',
    bestScore: score,
    bestDeck: Array.from(deck),
    iterations: optimizer.iterations,
  });
});
```

---

## 6.5.2 Progress Message Type

```ts
type WorkerProgress = {
  type: 'PROGRESS'
  bestScore: number
  bestDeck: number[]   // needed so early termination can return a usable result
  iterations: number
}

export type WorkerResponse = WorkerResult | WorkerProgress;
```

`bestDeck` (40 ints) every ~500ms is negligible — structured clone of a small array is microseconds.

---

## 6.5.3 Convergence Detection

The orchestrator tracks each worker's latest progress as a fallback result (since `worker.terminate()` kills the worker instantly — it never posts `RESULT`, and `Promise.all` would hang on unresolved promises).

```
orchestrator:
  globalBest = -Infinity
  lastImprovedAt = now()
  latestProgress[i] = null   // per-worker fallback

  on PROGRESS from worker i:
    latestProgress[i] = progressData
    if score > globalBest:
      globalBest = score
      lastImprovedAt = now()
    if now() - lastImprovedAt > convergenceTimeout:
      // resolve each worker's promise from its last progress, then terminate
      for each worker i:
        if not yet resolved: resolveFrom(latestProgress[i])
        workers[i].terminate()

  on RESULT from worker i:
    resolve promise normally
```

Use a relative convergence timeout: `max(3s, budget * 0.3)`. The SA cooling schedule is adaptive (calibrated to reach TEMP_FLOOR by deadline), so a fixed timeout would disproportionately cut off the exploitation phase on longer budgets.

---

## 6.5.4 Trade-offs

- **Pro:** A 4-worker run that converges in 5 seconds beats a single-threaded 15-second run on both quality and speed.
- **Pro:** Progress messages enable UI progress indicators.
- **Con:** Periodic checks in the SA hot loop add a small per-iteration cost.
- **Con:** Convergence timeout is a tuning parameter — too aggressive and we cut off beneficial exploration.
