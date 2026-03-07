# IMPLEMENTATION PLAN: FM DECK OPTIMIZER

**Architecture:** Fixed-Index Correlated Monte Carlo (CRN) with Simulated Annealing and Exact Refinement.

**Target Environment:** TypeScript (Browser/Bun), Strict 60s Execution.

## Global Directives

- **Zero Allocations in Hot Loops:** No `new Array()`, `[]`, `.map()`, `.filter()` during the search phase.
- **Typed Arrays Only:** All state, lookups, and buffers use 1D typed arrays (`Int16Array`, `Uint8Array`, `Uint16Array`, `Uint32Array`).
- **Flatten Everything:** 2D arrays flattened into 1D with index offset calculations.

---

## Architecture Overview

```
Main Thread
───────────
Load CSVs → fusionTable, cardAtk
Build initial deck (greedy)
Sample 15,000 hands (slot indices)
Build CSR reverse lookup
Score all hands (initial handScores)

SA loop (55s):
  Pick random slot
  Pick biased candidate
  Skip if tabu
  Swap deck[slot]
  Delta = rescore ~1,875 hands
  Accept/reject (SA criterion)
  Update tabu list
  Cool temperature

Exact refinement:
  Score best deck via all C(40,5) = 658,008 hands
  (~660ms)

Return best deck + exact expected ATK
```

---

## Performance Budget

| Phase | Time | What Happens |
|---|---|---|
| Precompute | 0–1s | Load CSVs, build fusion table, sample hands, build CSR |
| SA search | 1–56s | Single-threaded SA, ~27,500 swaps, biased selection + tabu |
| Exact refinement | 56–57s | Score best deck via all 658,008 hands |

**Iteration budget:** ~27,500 swaps (single thread). Degrades to ~11,000 on fusion-dense decks (~5ms/swap).

**Per-swap cost:** ~1,875 hands × ~1μs/hand = ~2ms. Degrades to ~4–6ms on fusion-dense decks.

---

## Phases

| Phase | Step File | What It Builds |
|---|---|---|
| 1: Setup & Data (DONE) | `docs/steps/v1/phase-1-setup-and-data.md` | Tech stack, types, CSV parsers, fusion table, hand pool, initial deck |
| 2: Reference Tests (DONE) | `docs/steps/v1/phase-2-reference-tests.md` | Reference scorer, golden test fixtures |
| 3: Hand Evaluator (DONE) | `docs/steps/v1/phase-3-hand-evaluator.md` | Fusion-chain DFS scorer + initial scoring |
| 4: SA Optimizer (DONE) | `docs/steps/v1/phase-4-sa-optimizer.md` | SA + tabu + biased selection |
| 5: Integration (DONE) | `docs/steps/v1/phase-5-integration.md` | Exact refinement, public API |
| 1-UI: Convex + UI (DONE) | `docs/steps/phase-1-setup-convex.md` | Minimalist UI to test optimizer with Convex data |
| 6 (V2): Web Workers (DONE) | `docs/steps/phase-6-web-workers.md` | Parallelize SA across 4-8 workers, unblock UI |
| 6.5 (V2): Early Termination | `docs/steps/phase-6.5-early-termination.md` | Progress reporting + convergence detection |
| 7 (V2): Multi-Start | `docs/steps/phase-7-multi-start.md` | Different initial decks per worker |
