# Proposal: MC CRN + Simulated Annealing + Exact Refinement

**Date:** 2026-03-03
**Status:** Approved

---

## 1. Summary

Monte Carlo scoring with Correlated Random Numbers (CRN) for fast delta evaluation, Simulated Annealing for global search, multi-start Web Workers for parallelism, and exact combinatorial refinement for final verification. ~430 LOC of new code on top of the existing ~3,600 LOC codebase.

---

## 2. Architecture

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

## 3. Performance Budget

| Phase | Time | What Happens |
|---|---|---|
| Precompute | 0–1s | Load CSVs, build fusion table, sample hands, build CSR |
| SA search | 1–55s | 4–8 workers, ~27,500 swaps each, SA with cooling |
| Exact refinement | 55–60s | Score top ~7 decks via all 658,008 hands |

**Iteration budget:** ~110k swaps (4 workers) to ~220k swaps (8 workers), covering 1.2–2.4× the full swap search space (~28,880 possible swaps). Comfortable for SA convergence.

**Per-swap cost:** ~1,875 hands × ~1μs/hand = ~2ms. Degrades to ~4–6ms on fusion-dense decks (2–3× slowdown, still viable).

---

## 4. Components to Build

### 4.1 Fusion-Chain Hand Evaluator (~100 LOC)

Replace the placeholder `MaxAtkScorer` with a DFS evaluator that finds the maximum ATK achievable from 5 cards, considering fusion chains up to 3 deep (4 materials).

- Pre-allocated `stackBuffer: Int16Array(5 * 5)` — flat buffer for up to 5 recursion levels, no allocations.
- At each level, try all pairs (i, j). If `fusionTable[card_i * 722 + card_j] !== -1` and the strict improvement rule holds, recurse with the fusion result replacing both materials.
- Fusion results can only re-fuse by name (never by own kind), per SPEC §4.
- Track and return the global `maxAtk` across all branches.

### 4.2 Simulated Annealing (~50 LOC)

Replace greedy accept (`delta > 0`) with SA acceptance in the optimizer:

```
if delta > 0:       accept
else:               accept with probability exp(delta / temperature)

temperature starts at 500, × 0.9999 every 50 iterations
```

Temperature reaches near-zero by iteration ~23,000, leaving the last ~4,500 iterations as greedy polishing.

### 4.3 Tabu List (~30 LOC)

Per-slot `Uint16Array` ring buffer tracking the last 8 cards tried in each slot. Skip a swap if the candidate was recently tried and rejected. Reduces wasted iterations by ~20–30% in late optimization when most swaps are rejected.

### 4.4 Multi-Start Seeding (~20 LOC)

Each worker starts from a different initial deck:
- Worker 0: greedy seed (highest ATK cards, current behavior)
- Worker 1: greedy seed + 10 random perturbations
- Workers 2–N: fully random valid decks from the collection

Search-space diversity without changing the per-worker algorithm.

### 4.5 Biased Candidate Selection (~30 LOC)

Pre-compute `partnerCount[c]` = number of cards in the current deck that fuse with card c. Select swap candidates with probability proportional to `baseATK + α × partnerCount`. Recompute lazily. Makes each iteration more likely to find improvements.

### 4.6 Web Worker Infrastructure (~150 LOC)

- Main thread spawns N workers (`navigator.hardwareConcurrency`)
- Each worker receives: fusionTable, cardAtk, initial deck, PRNG seed, hand indices, CSR lookup
- Workers run the SA loop independently for 55s
- Main thread sends `HALT` at 55s, workers return their best deck + score

### 4.7 Exact Refinement (~50 LOC)

After collecting worker results, score the top ~7 unique decks using exhaustive enumeration of all C(40,5) = 658,008 hands (~660ms per deck). This eliminates MC noise from the final selection. Return the globally best deck.

---

## 5. What Already Exists

| Component | File | Status |
|---|---|---|
| `OptBuffers` (typed arrays, CSR reverse lookup) | `src/engine/types/buffers.ts` | Done |
| `IScorer`, `IDeltaEvaluator`, `IOptimizer` | `src/engine/types/interfaces.ts` | Done |
| Constants (722 cards, 40 deck, 15k hands) | `src/engine/types/constants.ts` | Done |
| Fusion table + ATK lookup builder | `src/engine/data/build-fusion-table.ts` | Done |
| CSV parsers (cards + fusions) | `src/engine/data/*.ts` | Done |
| `MaxAtkScorer` (placeholder — no fusions) | `src/engine/scoring/max-atk-scorer.ts` | Replace with §4.1 |
| `DeltaEvaluator` (CRN-based, two-phase commit) | `src/engine/scoring/delta-evaluator.ts` | Done |
| `RandomSwapOptimizer` (greedy hill climb) | `src/engine/optimizer/random-swap-optimizer.ts` | Upgrade with §4.2–4.5 |
| `initializeOptimizer` pipeline | `src/engine/initialize-buffers.ts` | Done |
| 13 test files | `src/engine/**/*.test.ts` | Done |

No existing code is discarded. All new work builds on the current typed-array, zero-allocation architecture.

---

## 6. Remaining Work Summary

| Work Item | LOC | Depends On |
|---|---|---|
| Fusion-chain hand evaluator (§4.1) | ~100 | — |
| SA acceptance + cooling (§4.2) | ~50 | — |
| Tabu list (§4.3) | ~30 | — |
| Multi-start seeding (§4.4) | ~20 | — |
| Biased candidate selection (§4.5) | ~30 | §4.1 (needs fusion table populated) |
| Web Worker infrastructure (§4.6) | ~150 | §4.1–4.5 |
| Exact refinement (§4.7) | ~50 | §4.1 |
| **Total** | **~430** | |

All components use standard, well-understood algorithms with abundant reference implementations.
