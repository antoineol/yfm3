# Proposal A: Monte Carlo CRN Exploration + Exact Refinement

**Source:** Current PLAN.md

## Summary

Use Monte Carlo sampling with Common Random Numbers (CRN) for fast approximate
delta scoring during optimization, then correct for MC noise with exact
combinatorial scoring on the top candidates.

## Shared assumptions

- **Runtime:** TypeScript on Bun, Web Workers for parallelism
- **Worst case:** 722 distinct cards × 3 copies = 2,166 cards in collection
- **Fusion table:** `Int16Array(722 × 722)` ≈ 1 MB — fits L2 cache
- **Hand eval cost:** ~1μs per 5-card hand (DFS fusion chains, max 3 fusions deep,
  ~30-250 fusion table lookups depending on deck density)
- **Total budget:** 60 seconds wall clock

## Architecture

### Pre-computation (<1s)

- Build fusion table and card ATK lookup from CSV data
- Sample 15,000 random 5-card hands as **slot indices** (0..39), not card IDs
- Build reverse lookup (CSR): for each deck slot, which hands reference it
  (~1,875 on average = 15,000 × 5 / 40)
- Score all 15,000 hands for the initial deck: 15,000 × 1μs = ~15ms

### Exploration (0–55s)

- **Algorithm:** Hill climbing (current) or Simulated Annealing (planned)
- **Scoring:** MC approximate — rescore only the ~1,875 affected hands per swap
- **CRN trick:** Hands are stored as slot positions, so swapping `deck[slot]`
  automatically updates all hands referencing that slot. Same random draws for
  before/after → low-variance delta estimates.
- **Per swap:** 1,875 × 1μs ≈ **2ms**
- **Single thread:** ~500 swaps/sec → ~27,500 swaps in 55s
- **With 4 workers:** ~110,000 swaps total
- **With 8 workers:** ~220,000 swaps total

### Refinement (55–60s)

- Halt workers, collect best decks
- Re-score top candidates by enumerating all C(40,5) = 658,008 hands
- 658,008 × 1μs ≈ **660ms per deck** → can verify ~7 decks in 5s
- Pick the true best

## Strengths

- Very fast iterations (~2ms each) — explores many swaps
- CRN reduces delta noise significantly vs independent MC estimates
- Simple implementation: typed arrays, no complex math
- Closest to what's already built (delta evaluator, optimizer, buffers all exist)

## Weaknesses

- MC noise causes false negatives (rejecting good swaps with small deltas),
  especially late in optimization when improvements are marginal
- Random swaps are undirected — many iterations wasted on invalid/useless swaps
- Exact refinement can only verify ~7 decks, so it relies on workers finding good
  candidates via noisy scoring
- Sampling with replacement is not true hypergeometric — slight distributional bias
