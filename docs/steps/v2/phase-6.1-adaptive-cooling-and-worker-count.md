# Phase 6.1 (V2): Adaptive Cooling Rate & Worker Count Heuristic (DONE)

**Goal:** Fix the broken cooling schedule in multi-worker mode and apply a sensible worker count heuristic.

**Depends on:** Phase 6 (Web Workers).

**Problem:** The cooling rate (0.99963) is hardcoded for the V1 single-threaded 55s run (~27,500 iterations). In V2, each worker only gets 10s (~5,000 iterations) but uses the same cooling rate. Workers terminate while the temperature is still high (T0 x 0.157) -- they never reach the exploitation or greedy phases. Every worker runs a truncated, exploration-only search.

| Budget | Iterations (~500/s) | Final temp (T0=500) | Phase reached |
|--------|---------------------|---------------------|---------------|
| 55s (V1) | ~27,500 | 0.1 (floor) | Full schedule |
| 10s (V2) | ~5,000 | ~78.5 | Exploration only |
| 20s | ~10,000 | ~12.3 | Partial cooldown |

---

## 6.1.1 Adaptive Cooling Rate

Replace the hardcoded `COOLING_RATE` constant with a per-run computed value that ensures the temperature reaches the floor by the end of the time budget.

**Approach:** Estimate the number of iterations from the time budget, then compute the cooling rate needed to reach `TEMP_FLOOR` from `T0`:

```
expectedIterations = timeBudgetMs / 2   // ~2ms per swap = ~500 swaps/s
coolingRate = exp(ln(TEMP_FLOOR / t0) / expectedIterations)
```

This guarantees every worker completes the full anneal (exploration -> exploitation -> greedy) regardless of time budget. Shorter budgets cool faster with coarser temperature steps; longer budgets cool slower with finer steps.

**Changes:**
- `sa-optimizer.ts`: Remove `COOLING_RATE` constant. Accept `deadline` as today, but compute `coolingRate` after `calibrateTemp` using the remaining time budget. Extract `TEMP_FLOOR = 0.1` as a named constant (it's already hardcoded in the acceptance check).
- The iteration estimate is conservative (~500/s). If actual throughput is higher, the temperature reaches the floor early and the remaining iterations are greedy -- this is fine (same as V1 behavior).

**Interface change:** `SAOptimizer.run()` already receives `deadline`. It can derive the budget internally as `deadline - performance.now()` right after calibration (calibration is ~50 swaps, negligible time). No signature change needed.

---

## 6.1.2 Worker Count Heuristic

Replace `navigator.hardwareConcurrency || 4` with a capped formula that reserves one core for the main thread.

```ts
const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
const numWorkers = Math.max(1, Math.min(cores - 1, MAX_WORKERS));

// cores=1 -> 1 worker (degenerate but functional)
// cores=2 -> 1 worker
// cores=4 -> 3 workers
// cores=8 -> 7 workers
// cores=16 -> 15 workers
// cores=64 -> 32 workers (cap)
```

**Why `cores - 1`:** Reserves one logical core for the browser main thread, OS, and background services. Unlike `cores / 2`, this is correct on both SMT (Intel/AMD) and non-SMT (Apple Silicon, ARM) architectures. Halving physical core count on non-SMT chips wastes half the CPU.

**Why cap at 32:** Safety net for exotic hardware. The search space is large enough that each additional worker with a different seed explores a genuinely independent region — no demonstrated diminishing returns. Each worker adds ~200ms init overhead and ~2MB memory, both negligible at realistic browser core counts (4–24).

**One-line change in `orchestrator.ts`.**

---

## 6.1.3 Benchmark (optional, post-merge)

Run 2/4/6/8 workers with adaptive cooling on a representative collection and measure:
- Best exact score (quality)
- Score variance across 5 runs (stability)
- Wall-clock time

This validates the cap value with data rather than theory.

---

## Files Changed

| File | Change |
|------|--------|
| `src/engine/optimizer/sa-optimizer.ts` | Compute cooling rate from remaining time budget after calibration. Extract `TEMP_FLOOR` constant. |
| `src/engine/worker/orchestrator.ts` | Worker count: `Math.min(cores - 1, MAX_WORKERS)` |

## Tests

- SA optimizer: verify that with a short deadline (e.g. 2s), the temperature still reaches the floor (assert final temp <= TEMP_FLOOR). This confirms adaptive cooling works.
- SA optimizer: verify iteration count is reasonable (not zero, not absurdly high).
- Orchestrator: verify worker count mapping for hardwareConcurrency values 1, 2, 4, 8, 16.

## Success Criteria

- `bun typecheck`, `bun lint`, `bun run test` pass.
- SA workers complete the full cooling schedule regardless of time budget.
- No regression on existing integration tests.
