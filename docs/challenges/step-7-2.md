# Phase 7 Review: Issues to Address Before Implementation

## 1. Refinement pipeline assumes main-thread exact scoring

Section 7.3 describes scoring top ~7 decks sequentially at ~660ms each (~5s total). Phase 6.6 already introduced `scoreInWorker` which offloads exact scoring to dedicated workers. The refinement step should use `Promise.all` over scorer workers to parallelize the scoring of unique SA results, reducing wall-clock time from ~5s to ~660ms.

## 2. Worker message protocol changes not specified

`WorkerInit` currently has `{ collection, seed, timeBudgetMs }`. The doc doesn't specify how the orchestrator communicates which seed strategy a worker should use. Two options:

- **Option A:** Add a `seedStrategy` field to `WorkerInit` and implement strategy logic in the worker.
- **Option B (simpler):** Add an optional `initialDeck: number[]` field to `WorkerInit`. The orchestrator builds the deck per strategy and sends it. Workers just override `buf.deck` if provided.

Option B keeps strategy logic centralized in the orchestrator and avoids duplicating it in the worker bundle.

## 3. `initializeBuffersBrowser` always builds a greedy deck

`buildInitialDeck` is called inside `initializeBuffersBrowser` (line 21). For non-greedy strategies, the deck would be built greedy and then immediately overwritten. Two approaches:

- **Split approach:** Extract deck building from `initializeBuffersBrowser` so callers choose when/how to build the deck.
- **Override approach:** Apply the strategy after init by mutating `buf.deck` and `buf.cardCounts`. Wastes a few microseconds on the greedy build but requires zero refactoring.

The override approach is simpler and the wasted work is negligible (~0.1ms vs ~10s SA budget).

## 4. Convergence detection interacts badly with random starts

Workers starting from random decks begin with much lower scores and improve rapidly as they climb toward a local optimum. Each improvement resets `lastImprovedAt` in the orchestrator (orchestrator.ts:153), which can delay early termination for all workers — even greedy-start workers that have already converged.

The existing `CONVERGENCE_MIN_IMPROVEMENT` threshold (0.1%) may not be sufficient to filter out random-start "catch-up" improvements. Consider either:

- Tracking convergence per-worker rather than globally, and terminating only when all workers have individually plateaued.
- Raising the improvement threshold.
- Using absolute score thresholds rather than relative improvement (e.g., only reset the timer when a worker exceeds the current global best, not just its own previous best — which is already the case, but early random-start improvements can still exceed a low global best repeatedly).

## 5. Dependencies are incomplete

The doc says "Depends on: Phase 6 (Web Workers)" but should include Phase 6.5 (convergence detection, progress messages) and Phase 6.6 (scorer workers), since:

- The refinement pipeline should use `scoreInWorker` from Phase 6.6.
- The convergence interaction (issue #4) requires awareness of Phase 6.5's design.

## 6. Perturbation count is arbitrary

"Worker 1: Greedy seed + 10 random perturbations" — 10 swaps on a 40-card deck is 25% perturbation. The rationale isn't stated. Consider parameterizing as `Math.floor(DECK_SIZE * perturbationRatio)` and documenting why 25% is the right balance between staying near the greedy optimum and exploring.

## 7. Top-7 cap is unnecessary

With early termination, workers often converge to similar decks. After deduplication, there are typically only 2-3 unique decks (at most `numWorkers`). The "top ~7" cap adds complexity for no benefit. Simpler approach: exact-score all unique SA results via parallel scorer workers, pick best.
