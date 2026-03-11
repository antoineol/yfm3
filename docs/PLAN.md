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
| 6.1 (V2): Adaptive Cooling & Worker Count (DONE) | `docs/steps/phase-6.1-adaptive-cooling-and-worker-count.md` | Fix truncated cooling schedule, cap worker count |
| 6.5 (V2): Early Termination (DONE) | `docs/steps/phase-6.5-early-termination.md` | Progress reporting + convergence detection |
| 6.6 (V2): Offload Exact Scoring (DONE) | `docs/steps/phase-6.6-offload-exact-scoring.md` | Move exact scoring off main thread |
| 7 (V2): Multi-Start (DONE) | `docs/steps/phase-7-multi-start.md` | Different initial decks per worker |
| 8.1: Configuration UI (DONE) | `docs/steps/phase-8.1-configuration-ui-including-deck-size.md` | Global config module, persisted preferences, ConfigPanel UI |
| 9: Configurable Fusion Depth (DONE) | `docs/steps/phase-9-accept-different-depth.md` | Configurable fusion chain depth (1–4), threaded through config/workers/UI |
| **Port YFM2 Features** | [`docs/steps/p1-port-yfm2-features.md`](steps/p1-port-yfm2-features.md) | Overview & feature gap analysis |
| P0a: Authentication (DONE) | [`docs/steps/p1.1-auth.md`](steps/p1.1-auth.md) | Convex Auth + Google OAuth, replace manual userId with real cross-device auth |
| P0b: Baseline UX Polish (DONE) | [`docs/steps/p1.5-baseline-ux-polish.md`](steps/p1.5-baseline-ux-polish.md) | Fix broken config inputs, visual hierarchy, card display |
| P0c: Shared Infrastructure (DONE) | [`docs/steps/p1.9-shared-infrastructure.md`](steps/p1.9-shared-infrastructure.md) | FusionTable context, CardAutocomplete, tab navigation shell |
| P1: Hand Fusion Calculator (DONE) | [`docs/steps/p2-hand-fusion-calculator.md`](steps/p2-hand-fusion-calculator.md) | 5-card hand simulation, real-time fusion chains, play fusion |
| P2: Optimization UX (DONE) | [`docs/steps/p3-optimization-ux.md`](steps/p3-optimization-ux.md) | Progress bar, cancel, accept/reject/re-run |
| P3: Deck Intelligence (DONE) | [`docs/steps/p4-deck-intelligence.md`](steps/p4-deck-intelligence.md) | Deck fusion list, score explanation with probabilities |
| P4: Collection & Deck Editing (DONE) | [`docs/steps/p5-collection-ux.md`](steps/p5-collection-ux.md) | Last-added hint, collection actions, manual deck add/remove |
| P4.5: Animate Generated Deck (DONE) | [`docs/steps/p5.5-animate-generated-deck.md`](steps/p5.5-animate-generated-deck.md) | Live deck preview with auto-animate during optimization |
| P5: Fusion Reference | [`docs/steps/p6-fusion-reference.md`](steps/p6-fusion-reference.md) | Fusion lookup tool, browsable fusion database |
