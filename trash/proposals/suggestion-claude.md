# Recommendation: Proposal A (Enhanced) — MC CRN + SA + Targeted Swaps

**Date:** 2025-03-03
**Basis:** Comparison of proposals A, B, C against SPEC.md, existing codebase, and performance constraints.

---

## 1. Executive Summary

**Proposal A wins decisively.** It has 40–90× the iteration budget of C, lower implementation risk than B, and perfect alignment with the existing codebase. Its two real weaknesses (MC noise on marginal swaps, undirected search) are fixable with small enhancements borrowed from B.

Proposal B is intellectually elegant but amounts to a research project — the Tier-DP scorer has no reference implementation and its delta cost is unknowable until built. Proposal C's exact scoring is wasted on a fatally low iteration budget.

---

## 2. Quantitative Comparison

### 2.1 Iteration Budget (the decisive metric)

All proposals agree on ~1μs per hand evaluation. The difference is how many hands per swap:

| | A (MC CRN) | B (Tier-DP) | C (Exact Delta) |
|---|---|---|---|
| Hands re-scored per swap | 1,875 | N/A (path-based) | 82,251 |
| Cost per swap | **~2 ms** | 0.1–10 ms (uncertain) | **~82 ms** |
| Swaps/sec (1 thread) | ~500 | 100–10,000 | ~12 |
| Swaps in 55s (4 workers) | **~110,000** | 22,000–2,200,000 | **~2,400** |
| Swaps in 55s (8 workers) | **~220,000** | 44,000–4,400,000 | **~4,800** |

The swap search space is ~28,880 (40 slots × ~722 candidates). To cover it statistically with random sampling requires ~3–5× that = **90,000–145,000 swaps**.

- **A:** 110k–220k swaps = **1.2–2.4 full scans.** Comfortable for SA.
- **B:** Best case 2.2M = 24 scans (incredible). Worst case 22k = 0.24 scans (worse than A).
- **C:** 2,400–4,800 = **0.03–0.05 scans.** Cannot even visit each possible swap once. SA needs thousands of iterations per chain to converge; C gives ~600 per worker.

### 2.2 Impact of MC Noise in Proposal A

The concern: CRN-based delta scoring has sampling noise. Does this matter?

**Noise analysis with CRN:** When a swap changes deck[slot], the 1,875 affected hands all see the new card (same slot indices, different card). The delta per hand is the *difference* in score before vs after. Because CRN uses identical draws:

- **Large improvements** (early optimization, delta > 50 ATK total): Signal-to-noise ratio is high. These are never missed. This is where 90%+ of score improvement happens.
- **Small improvements** (late optimization, delta 1–10 ATK total): Some get missed as false negatives. But these contribute marginally to final score — missing a +2 ATK improvement on a 2000+ ATK expected score is a ~0.1% loss.
- **The exact refinement phase catches systematic errors:** Re-scoring top candidates with all 658,008 hands (660ms each, ~7 decks in 5s) means the final selection is exact.

**Bottom line:** MC noise costs ~0.1–0.5% of score at worst. The 40× iteration advantage over C more than compensates.

### 2.3 Degradation on Fusion-Dense vs Fusion-Sparse Decks

| Scenario | A | B | C |
|---|---|---|---|
| Fusion-sparse (few fusions) | Hand eval fast (~0.5μs). More swaps. | Few paths, fast delta. Works well. | Hand eval fast, but still 82k hands. Still slow. |
| Fusion-dense (many fusions) | Hand eval slower (~2–3μs). Swap cost ~4–6ms. Still ~100 swaps/sec. | Path explosion: thousands of paths per card. Delta cost could hit 10ms+. **Iteration budget collapses.** | Hand eval slower. Swap cost ~160–250ms. ~4 swaps/sec. **Unusable.** |

A degrades gracefully (2–3× slowdown). B's failure mode is unpredictable. C's is catastrophic.

---

## 3. Implementation Complexity

### 3.1 What Already Exists (codebase inventory)

The current codebase implements Proposal A's Phase 1 almost entirely:

| Component | File | Status |
|---|---|---|
| `OptBuffers` (10 typed arrays) | `src/engine/types/buffers.ts` | Done |
| `IScorer`, `IDeltaEvaluator`, `IOptimizer` | `src/engine/types/interfaces.ts` | Done |
| Constants (722 cards, 40 deck, 15k hands) | `src/engine/types/constants.ts` | Done |
| Fusion table + ATK lookup builder | `src/engine/data/build-fusion-table.ts` | Done |
| CSV parsers (cards + fusions) | `src/engine/data/*.ts` | Done |
| `MaxAtkScorer` (no fusions yet) | `src/engine/scoring/max-atk-scorer.ts` | Placeholder — needs fusion DFS |
| `DeltaEvaluator` (CRN-based, two-phase commit) | `src/engine/scoring/delta-evaluator.ts` | Done |
| `RandomSwapOptimizer` (greedy hill climb) | `src/engine/optimizer/random-swap-optimizer.ts` | Done — needs SA upgrade |
| `initializeOptimizer` pipeline | `src/engine/initialize-buffers.ts` | Done |
| CSR reverse lookup builder | `src/engine/initialize-buffers.ts` | Done |
| 13 test files | `src/engine/**/*.test.ts` | Done |

**~38 files, ~3,600 lines already written.** All typed-array, zero-allocation architecture.

### 3.2 Remaining Work Per Proposal

| Work Item | A (Enhanced) | B (Tier-DP) | C (Kind-Abstraction) |
|---|---|---|---|
| Fusion-chain hand evaluator (DFS) | ~100 LOC (shared) | ~100 LOC (shared) | ~100 LOC (shared) |
| SA acceptance + cooling schedule | ~50 LOC | — | ~50 LOC |
| Tabu list | ~30 LOC | ~30 LOC | — |
| Multi-start seeding | ~20 LOC | ~20 LOC | — |
| Web Worker infrastructure | ~150 LOC (shared) | ~150 LOC (shared) | ~150 LOC (shared) |
| Exact refinement (all C(40,5) hands) | ~80 LOC | — | — |
| Tier-DP scorer (path enum + hypergeometric + inclusion-exclusion) | — | **~600–1000 LOC** | — |
| Path index (card → affected paths) | — | **~200 LOC** | — |
| Kind-abstraction phase | — | — | **~300 LOC** |
| New buffer layout (82k reverse lookup) | — | — | **~100 LOC** |
| **Total new code** | **~430 LOC** | **~1,100–1,500 LOC** | **~700 LOC** |
| **Existing code discarded** | None | ~200 LOC (scorer, delta eval, optimizer) | ~200 LOC (delta eval, optimizer, CSR) |

### 3.3 Risk Assessment

**Proposal B's Tier-DP scorer is the hardest component in any proposal.** It must:
1. Enumerate all attack paths (direct, 2-mat, 3-mat, 4-mat fusions) for the deck
2. For each achievable ATK value, compute P(can achieve A) from the union of paths that produce it
3. Handle overlapping paths: two paths to ATK=2500 may share cards, so P(A) ≠ P(path1) + P(path2). Requires inclusion-exclusion over path subsets, which is exponential in the number of overlapping paths
4. Compute hypergeometric probabilities for card subsets drawn from a 40-card deck
5. Incrementally update all of this when one card is swapped

This is a research-grade problem with no known reference implementation in this domain. The inclusion-exclusion step alone could make the "exact" scorer intractable for fusion-dense decks (where many paths to the same ATK share materials).

**Proposal C's kind-abstraction is speculative.** The assumption that optimizing type ratios first produces a good seed for Phase 2 is untested. Fusion value depends on *specific card combinations*, not just type counts. A deck with 10 Dragons and 10 Thunders might score worse than one with 8 Dragons, 7 Thunders, and 5 targeted Plants that enable a high-value chain. The abstraction discards exactly the information that matters.

**Proposal A's remaining work is well-understood.** DFS hand evaluation, simulated annealing, and web workers are all standard algorithms with abundant reference implementations.

---

## 4. Proposed Enhancements to Proposal A

### 4.1 Simulated Annealing (already in PLAN.md)

Replace greedy accept (`delta > 0`) with SA acceptance:

```
if delta > 0:
    accept
else:
    accept with probability exp(delta / temperature)

temperature starts at 500, multiplied by 0.9999 every 50 iterations
```

With 27,500 swaps per worker, temperature hits near-zero by iteration ~23,000, leaving the last ~4,500 iterations as greedy polishing. This is a textbook SA schedule.

### 4.2 Multi-Start (from Proposal B)

Each of the 4–8 workers starts from a different initial deck:
- Worker 0: greedy seed (highest ATK cards, current behavior)
- Worker 1: greedy seed + random perturbation (swap 10 random cards)
- Worker 2–N: fully random valid decks from the collection

This gives search-space diversity without any change to the per-worker algorithm.

### 4.3 Tabu List (from Proposal B)

Per-slot `Uint16Array` ring buffer tracking the last 8 cards tried in each slot. Skip a swap if the candidate was recently tried and rejected. Reduces wasted iterations by ~20–30% in late optimization when most swaps are rejected.

### 4.4 Smarter Candidate Selection

Instead of uniform random card selection, bias toward:
- Cards with high base ATK (direct play value)
- Cards that fuse with many cards already in the deck (fusion synergy)

Pre-compute a "fusion partner count" per card: `partnerCount[c] = number of cards in current deck that fuse with c`. Recompute lazily. Select candidates with probability proportional to `baseATK + α × partnerCount`. This is ~30 LOC and makes each iteration more likely to find improvements.

---

## 5. Architecture Overview (Enhanced Proposal A)

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
                                       Pick candidate (biased)
                                       Skip if tabu
                                       Swap deck[slot]
                                       Delta = rescore 1,875 hands
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

## 6. Comparison Summary

| Criterion | A (Enhanced) | B (Tier-DP) | C (Kind-Abstraction) |
|---|---|---|---|
| **Iteration budget** | 110k–220k | 22k–4.4M (uncertain) | 2,400–4,800 |
| **Covers swap space?** | 1.2–2.4× | 0.2–50× | 0.03–0.05× |
| **Decision quality** | Good (CRN + exact refinement) | Perfect | Perfect but too few decisions |
| **Optimization quality** | High | High if delta cost is low, poor if high | Low (too few iterations) |
| **Implementation effort** | ~430 LOC, all standard | ~1,100–1,500 LOC, research-grade | ~700 LOC, speculative |
| **Codebase compatibility** | Uses everything built | Discards scoring + optimizer | Discards delta eval + optimizer |
| **Fusion-dense robustness** | Graceful (2–3× slower) | Unpredictable (path explosion) | Catastrophic (unusable) |
| **Risk of fundamental blocker** | Very low | High (inclusion-exclusion, path explosion) | Medium (seed quality) |

---

## 7. Verdict

**Build Enhanced Proposal A.** It is the only proposal where the iteration budget, implementation complexity, codebase compatibility, and risk profile all point in the same direction.

The two ideas worth borrowing:
- **From B:** Multi-start + tabu list (~50 LOC total, no architectural change)
- **From PLAN.md (already planned):** Simulated annealing (~50 LOC, replaces greedy acceptance)

Everything else — Tier-DP scoring, kind-abstraction phases, exact delta over 82k hands — adds complexity without proportional benefit within the 60-second constraint.
