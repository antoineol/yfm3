# IMPLEMENTATION PLAN: FM DECK OPTIMIZER

**Architecture:** Fixed-Index Correlated Monte Carlo (CRN) with Simulated Annealing and Exact Refinement.

**Target Environment:** TypeScript (Browser/Bun), Web Workers, Strict 60s Execution.

## Global Directives

- **Zero Allocations in Hot Loops:** No `new Array()`, `[]`, `.map()`, `.filter()` during the search phase.
- **Typed Arrays Only:** All state, lookups, and buffers use 1D typed arrays (`Int16Array`, `Uint8Array`, `Uint16Array`, `Uint32Array`).
- **Flatten Everything:** 2D arrays flattened into 1D with index offset calculations.

---

## Architecture Overview

```
Main Thread                          Workers (×4–8)
───────────                          ──────────────
Load CSVs → fusionTable, cardAtk
Build initial deck (greedy)
Sample 15,000 hands (slot indices)
Build CSR reverse lookup
Score all hands
                    ──► Spawn workers with:
                        - fusionTable, cardAtk (shared/copied)
                        - Different initial decks (multi-start)
                        - Different PRNG seeds

                                     SA loop (55s):
                                       Pick random slot
                                       Pick biased candidate
                                       Skip if tabu
                                       Swap deck[slot]
                                       Delta = rescore ~1,875 hands
                                       Accept/reject (SA criterion)
                                       Update tabu list
                                       Cool temperature

                    ◄── Return best deck + MC score

Collect best decks from all workers
Exact refinement: score top ~7 decks
  via all C(40,5) = 658,008 hands
  (~660ms each)
Return globally best deck
```

---

## Performance Budget

| Phase | Time | What Happens |
|---|---|---|
| Precompute | 0–1s | Load CSVs, build fusion table, sample hands, build CSR |
| SA search | 1–55s | 4–8 workers, ~27,500 swaps each, SA with cooling |
| Exact refinement | 55–60s | Score top ~7 decks via all 658,008 hands |

**Iteration budget:** ~110k swaps (4 workers) to ~220k swaps (8 workers), covering 1.2–2.4× the full swap search space (~28,880 possible swaps).

**Per-swap cost:** ~1,875 hands × ~1μs/hand = ~2ms. Degrades to ~4–6ms on fusion-dense decks.

---

## Phases

| Phase | Step File | What It Builds |
|---|---|---|
| 1: Setup & Data | `steps/phase-1-setup-and-data.md` | Tech stack, types, CSV parsers, fusion table, hand pool, initial deck |
| 2: Hand Evaluator | `steps/phase-2-hand-evaluator.md` | Fusion-chain DFS scorer (~100 LOC) |
| 3: Scoring & Delta | `steps/phase-3-scoring-and-delta.md` | CRN delta evaluator, initial scoring |
| 4: SA Optimizer | `steps/phase-4-sa-optimizer.md` | SA + tabu + multi-start + biased selection (~130 LOC) |
| 5: Workers & Integration | `steps/phase-5-workers-and-integration.md` | Web Workers, exact refinement, public API (~200 LOC) |
