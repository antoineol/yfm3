# Phase 6.5 (V2): Early Termination

This phase is an optional V2 enhancement that builds on Phase 6 (Web Workers).

**Goal:** Detect convergence across workers and terminate early when SA stops improving, turning workers from "same time, better results" into "better results, often faster."

**Depends on:** Phase 6 (Web Workers).

**Observation:** SA typically converges to near-optimal within 3-5 seconds. The remaining time is diminishing returns. With multiple workers racing independently, we can detect when all workers have plateaued and return early.

---

## 6.5.1 Progress Message

Workers periodically post their current best score (e.g. every 500ms):

```ts
type WorkerProgress = {
  type: 'PROGRESS'
  bestScore: number
  iterations: number
}
```

This requires adding a periodic check in the SA hot loop (e.g. every N iterations, check elapsed time and post progress if interval has passed).

---

## 6.5.2 Convergence Detection

The orchestrator tracks the best score seen across all workers. If the global best hasn't improved for N seconds (e.g. 3-5s), it terminates all workers and returns the best result.

```
orchestrator:
  globalBest = -Infinity
  lastImprovedAt = now()

  on PROGRESS from any worker:
    if score > globalBest:
      globalBest = score
      lastImprovedAt = now()
    if now() - lastImprovedAt > convergenceTimeout:
      terminate all workers
      return best result
```

---

## 6.5.3 Trade-offs

- **Pro:** A 4-worker run that converges in 5 seconds beats a single-threaded 15-second run on both quality and speed.
- **Pro:** Progress messages enable UI progress indicators.
- **Con:** Periodic checks in the SA hot loop add a small per-iteration cost.
- **Con:** Convergence timeout is a tuning parameter — too aggressive and we cut off beneficial exploration.
