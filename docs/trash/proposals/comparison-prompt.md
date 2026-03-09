# Prompt: Compare three optimizer architecture proposals

You are evaluating three architecture proposals for a deck optimizer in a "Yu-Gi-Oh! Forbidden Memories" game, "Remastered Perfected" mod. Fetch online context and rules, read the context below and all three proposals below, then provide your recommendation.

## Context

**Goal:** Build a deck optimizer that, given a player's card collection, produces an optimal 40-card deck maximizing the expected value of the highest attack achievable from a random 5-card opening hand, considering fusion chains.

**Tech stack:** TypeScript on Bun runtime. Web Workers available for parallelism. No WASM or native code. Browser-compatible (Vite build).

**Game parameters:**
- 722 distinct cards in the game, each with attack, defense, one or more kinds (Dragon, Warrior, etc.), and optional color
- Player owns up to 3 copies of each card (worst case: 2,166 total cards)
- Deck: exactly 40 cards
- Hand: 5 cards drawn without replacement
- Fusions: two cards combine into a stronger card. Matched by name, kind, or color-qualified kind, with priority (name > kind). Fusion chains up to 3 deep (4 materials consumed from a 5-card hand).
- Strict improvement rule: fusion only happens if result ATK > both materials' ATK
- Fusion results can re-fuse by name only, not by their own kind

**Performance baseline (estimated):**
- Fusion table: `Int16Array(722 × 722)` ≈ 1 MB, fits L2 cache
- Hand evaluation (DFS over fusion chains, max depth 3): ~1μs per hand in optimized TypeScript
- Total hands in a deck: C(40,5) = 658,008
- Total budget: 60 seconds wall clock

**Scoring formula:**
```
Score = Σ over all achievable ATK values A:
    A × P(A is the maximum achievable ATK in a random 5-card hand)

Where:
    P(A is max) = P(can achieve A) × Π over all A' > A: (1 - P(can achieve A'))
```

All probabilities follow from drawing 5 cards without replacement from a 40-card deck.

---

## Proposal A: Monte Carlo CRN Exploration + Exact Refinement

**Approach:** Sample 15,000 random hands upfront as deck-slot indices. Use Common Random Numbers (CRN) for fast approximate delta scoring during optimization, then verify top candidates with exact enumeration.

**Pre-computation (<1s):**
- Build fusion table and ATK lookups
- Sample 15,000 random 5-card hands stored as slot indices (0..39), not card IDs
- Build reverse lookup (CSR): each slot maps to ~1,875 hands that reference it (15,000 × 5 / 40)

**Exploration (0–55s):**
- Algorithm: Hill climbing or Simulated Annealing
- Per swap: rescore only ~1,875 affected hands → ~2ms
- CRN: same random draws for before/after comparison → low-variance deltas
- Single thread: ~27,500 swaps in 55s
- With 4 workers: ~110,000 | With 8 workers: ~220,000

**Refinement (55–60s):**
- Enumerate all C(40,5) = 658,008 hands for top candidates
- ~660ms per deck → can verify ~7 decks in 5s

**Strengths:** Fast iterations, simple implementation, CRN reduces delta noise, closest to existing code.

**Weaknesses:** MC noise causes false negatives on small deltas (especially late in optimization). Random swaps are undirected. Sampling with replacement ≠ true hypergeometric.

---

## Proposal B: Tier-DP Exact Exploration + MC Refinement

**Approach:** Use an analytical scorer (dynamic programming over hypergeometric probabilities) for exact delta evaluation during optimization. Rank final candidates with MC.

**Pre-computation (<2s):**
- Build fusion table and ATK lookups
- Enumerate all attack paths (direct plays, 2/3/4-material fusions) and index them by card ID

**Exploration (0–55s):**
- Algorithm: Hill climbing + tabu list
- Per swap: only recompute paths involving old/new card (~100-500 affected paths). Recompute hypergeometric probabilities per path. Estimated ~0.1-2.5ms per swap.
- Multi-start: 20–50 independent runs from different initial decks
- Every accept/reject decision is based on exact score delta

**Refinement (55–60s):**
- Re-score top ~100 decks via MC (20k samples each) = ~2s total

**Strengths:** No false negatives — every decision is exact. Multi-start + tabu for better coverage. Exactness where it matters (decisions), approximation where it doesn't (ranking).

**Weaknesses:** Hardest to implement. Must handle multi-material fusion paths with shared cards (inclusion-exclusion for overlapping paths to the same ATK). Delta cost uncertain — fusion-dense decks may have thousands of paths per card. No reference implementation exists.

---

## Proposal C: Kind-Abstraction Coarse Search + Exact Delta Simulated Annealing

**Approach:** First optimize at the abstract Kind/Color level (tiny search space), then instantiate with concrete cards and refine with exact combinatorial delta scoring.

**Phase 1 — Kind-Abstraction (0–10s):**
- Represent deck as (Kind, Color) ratios, not specific cards
- Search space: "ratios of 22 types × 5 color slots" — exponentially smaller
- Score using representative cards (highest-ATK per type)
- Output: abstract type distribution for the deck

**Phase 2 — Exact SA Refinement (10–60s):**
- Seed: fill kind deck with highest-ATK concrete cards
- Per swap: rescore C(39,4) = 82,251 hands that include the swapped slot → ~82ms
- Single thread: ~600 swaps in 50s
- With 4 workers: ~2,400 | With 8 workers: ~4,800

**Strengths:** Kind-abstraction narrows search space. Exact scoring — every decision is perfect. SA escapes local optima.

**Weaknesses:** Low iteration budget is the critical risk (~600 per worker). Kind-abstraction seed quality is load-bearing — if wrong, Phase 2 can't recover. 82ms/swap may be optimistic in TS. 82k hands per swap stresses L3 cache.

---

## Your task

Compare proposals A, B, and C on:
1. **Optimization quality:** likelihood of producing a near-optimal deck within 60s
2. **Implementation complexity and risk:** what could go wrong, how hard to build
3. **Robustness:** does it degrade gracefully for fusion-dense vs fusion-sparse collections?

Recommend one proposal, or propose a concrete hybrid if warranted. Justify with numbers from the estimates above. Do not hand-wave — if you think an estimate is wrong, say why and give your own.
