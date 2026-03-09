# Proposal B: Tier-DP Exact Exploration + MC Refinement

**Source:** External architecture review

## Summary

Use an analytical/DP-based scorer for exact delta evaluation during optimization
(no sampling noise), then rank final candidates with Monte Carlo. Puts exactness
where decisions are made, approximation where it's just ranking.

## Shared assumptions

- **Runtime:** TypeScript on Bun, Web Workers for parallelism
- **Worst case:** 722 distinct cards × 3 copies = 2,166 cards in collection
- **Fusion table:** `Int16Array(722 × 722)` ≈ 1 MB — fits L2 cache
- **Hand eval cost:** ~1μs per 5-card hand (DFS fusion chains, max 3 fusions deep)
- **Total budget:** 60 seconds wall clock

## Architecture

### Pre-computation (<2s)

- Build fusion table and card ATK lookups (same as Proposal A)
- **Enumerate all attack paths** in the current deck: for each distinct achievable
  ATK value, record which card subsets produce it (direct play, 2-material fusion,
  3-material chain, 4-material chain)
- **Index paths by card ID:** for each card, which attack paths does it participate
  in? Enables fast delta: swap a card → only recompute paths involving old/new card.

### Exploration (0–55s)

- **Algorithm:** Hill climbing + tabu list (avoid revisiting recent swaps)
- **Scoring:** Tier-DP — compute P(max ATK = A) for each attack value A using
  hypergeometric probabilities over the path set. Score = Σ A × P(A is max).
- **Delta cost:** When swapping one card, only paths involving the old or new card
  change. Estimate ~100-500 affected paths per swap. Recomputing hypergeometric
  probabilities per path: ~1-5μs each. **Per swap: ~0.1-2.5ms.**
- **Multi-start:** 20–50 independent runs from different initial decks
- **Single thread:** ~400-10,000 swaps/sec → highly dependent on path density
- **With 4 workers:** 4× throughput, each running independent multi-start chains

### Refinement (55–60s)

- Re-score top ~100 decks via MC (20k samples each)
- 100 × 20,000 × 1μs = **2s** — comfortably fits in 5s
- Optional: short evolutionary crossover between top decks

## Strengths

- No false negatives during optimization — every delta decision is exact
- Multi-start + tabu gives better search space coverage
- MC refinement is cheap and only used for final ranking
- Exactness where it matters (decisions), approximation where it doesn't (ranking)

## Weaknesses

- **Hardest to implement.** Tier-DP scorer is a novel, complex component: must handle
  multi-material fusion paths with shared cards, inclusion-exclusion for overlapping
  paths to the same ATK value, and hypergeometric probability computation.
- **Path interaction complexity:** multiple paths to the same ATK value share cards,
  so P(can achieve A) ≠ sum of individual path probabilities. Requires
  inclusion-exclusion or approximation (e.g., max-path lower bound).
- **Delta cost is uncertain.** If fusion-dense decks produce thousands of paths per
  card, the 0.1-2.5ms estimate could blow up to 10ms+, shrinking iteration budget.
- **Unproven:** no reference implementation exists for this domain — risk of
  discovering fundamental issues mid-implementation.
