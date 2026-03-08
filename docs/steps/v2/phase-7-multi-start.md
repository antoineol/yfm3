# Phase 7 (V2): Multi-Start Seeding

This phase is an optional V2 enhancement to the plan in PLAN.md file.

**Goal:** Start each worker from a different initial deck for search-space diversity. Prevents all workers from getting stuck in the same local optimum near the greedy starting deck.

**Depends on:** Phase 6 (Web Workers), Phase 6.5 (convergence detection), Phase 6.6 (scorer workers).

**Risk addressed:** The greedy starting deck is a specific local optimum (high ATK, few fusions). Without multi-start, all workers explore the same neighborhood. Multi-start lets some workers discover fusion-synergy-rich regions that greedy misses entirely.

---

## 7.1 Seed Strategies

Each worker gets a different initial deck:

- **Worker 0:** Greedy seed (highest ATK cards) — the default from Phase 1
- **Worker 1:** Greedy seed + 10 random perturbations (swap 10 random slots with random available cards)
- **Workers 2-N:** Fully random valid decks from the collection (pick 40 random cards respecting MAX_COPIES)

Strategy logic runs in the **orchestrator**, which generates initial decks from the collection record alone (card IDs = keys, max copies = `min(values, MAX_COPIES)`). No CSV loading needed on the main thread — ATK values are only required for the greedy strategy, which `buildInitialDeck` already handles inside the worker.

---

## 7.2 Files to Change

| File | Change |
|------|--------|
| `src/engine/optimizer/seed-strategies.ts` | **New.** Functions to generate perturbed and random initial decks from the collection record. |
| `src/engine/worker/messages.ts` | Add optional `initialDeck?: number[]` to `WorkerInit`. |
| `src/engine/worker/sa-worker.ts` | After `initializeBuffersBrowser`, if `initialDeck` is provided, overwrite `buf.deck` and rebuild `buf.cardCounts` from it, then call `computeInitialScores`. The greedy deck built during init is wasted (~0.1ms) but avoids any refactoring of `initializeBuffersBrowser`. |
| `src/engine/worker/orchestrator.ts` | Call seed strategies to generate initial decks and pass them via `WorkerInit.initialDeck`. |

---

## 7.3 Per-Worker Convergence

The current convergence logic is global: any worker improving by >= 0.1% resets `lastImprovedAt`, delaying early termination for all workers. Random-start workers will have rapid "catch-up" improvements as they climb from a bad starting point, repeatedly resetting the timer even when greedy-start workers have already plateaued.

**Fix:** Track convergence per-worker. Each worker has its own `lastImprovedAt`. Early termination triggers only when **all** workers have individually plateaued (i.e., no worker has improved meaningfully within `convergenceTimeout`).

---

## 7.4 Refinement Pipeline Update

With multiple workers returning different best decks, the refinement step (Phase 5.1) expands:

1. **Deduplicate:** Sort card IDs in each deck, remove identical decks.
2. **Parallel exact scoring:** Score all unique decks via `scoreInWorker` (Phase 6.6) in parallel using `Promise.all`. Wall-clock time ~660ms regardless of candidate count.
3. **Select winner:** Return deck with highest exact expected ATK.

No top-N cap needed — after dedup there are at most `numWorkers` unique decks, and parallel scoring makes the count irrelevant.
