# Proposal C: Kind-Abstraction Coarse Search + Exact Delta SA

**Source:** "Shadow Realm" architecture proposal

## Summary

Two-phase approach: first optimize at the abstract Kind/Color level to find
optimal type ratios (tiny search space), then instantiate with concrete cards
and refine via Simulated Annealing with exact combinatorial delta scoring.

## Shared assumptions

- **Runtime:** TypeScript on Bun, Web Workers for parallelism
- **Worst case:** 722 distinct cards × 3 copies = 2,166 cards in collection
- **Fusion table:** `Int16Array(722 × 722)` ≈ 1 MB — fits L2 cache
- **Hand eval cost:** ~1μs per 5-card hand (DFS fusion chains, max 3 fusions deep)
- **Total budget:** 60 seconds wall clock

## Architecture

### Pre-computation (<1s)

- Build fusion table and card ATK lookups (same as other proposals)
- Pre-enumerate all C(40,5) = 658,008 hand index combinations (fixed, deck-size
  dependent only). Store as a flat array of slot tuples.
- Build reverse lookup: for each slot, which of the 658,008 hands include it.
  Each slot appears in C(39,4) = **82,251 hands**.

### Phase 1 — Kind-Abstraction Coarse Search (0–10s)

- **Algorithm:** Greedy / hill climbing
- **Representation:** Deck slots are (Kind, Color) pairs, not specific cards.
  Optimize the ratio of types (e.g., how many Dragons vs Thunder vs Plants).
- **Why it helps:** The fusion graph is dominated by kind-based rules. The search
  space for "ratios of 22 types × 5 color slots" is exponentially smaller than
  "combinations of 722 cards."
- **Scoring:** Evaluate abstract decks using a representative card per type
  (highest-ATK card of that kind the player owns).
- **Output:** An abstract "kind deck" specifying how many slots for each type.

### Phase 2 — Concrete Instantiation + SA Refinement (10–60s)

- **Seed:** Fill the kind deck with the highest-ATK cards of each type.
- **Algorithm:** Parallel Simulated Annealing across Web Workers
- **Scoring:** Incremental **exact** enumeration. For a 1-card swap, rescore the
  82,251 hands that include the swapped slot.
- **Per swap:** 82,251 × 1μs ≈ **82ms**
- **Single thread:** ~12 swaps/sec → ~600 swaps in 50s
- **With 4 workers:** ~2,400 swaps total
- **With 8 workers:** ~4,800 swaps total

## Strengths

- Kind-abstraction phase narrows the search space before expensive exact scoring
- Exact delta scoring — no MC noise, every decision is perfectly informed
- SA allows escaping local optima
- Parallel workers for exploration diversity

## Weaknesses

- **Low iteration budget is the critical risk.** 2,400-4,800 exact swaps total
  across all workers. SA needs thousands of iterations *per chain* to converge —
  with only ~600 per worker, cooling schedule has very little room to explore.
- **Kind-abstraction seed quality is load-bearing.** If Phase 1 produces a poor type
  distribution, Phase 2 has too few iterations to recover (it swaps individual
  cards, not type allocations).
- **82ms per swap in TS is optimistic.** Assumes JIT-optimized typed array access at
  near-native speed. Realistic overhead (bounds checks, GC pauses, branch
  misprediction) could push it to 100-150ms, cutting iterations further.
- **Memory for reverse lookup:** 658,008 × 5 slot tuples = ~13 MB for hand
  combinations + 82,251 × 40 = ~13 MB for reverse lookup. Fits in RAM but
  stresses L3 cache, causing frequent cache misses during the 82k rescore loop.
