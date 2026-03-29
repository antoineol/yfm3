# Farm Spot Recommender — Plan Index

## Problem

Given a player's current collection and unlocked duellists, which duellist should they farm to improve their deck the fastest?

## Constraints

- **Time budget**: 15 seconds (same as deck optimization, see `orchestrator.ts:DEFAULT_TIME_LIMIT`)
- **Available data**: card stats, fusion table (9002 entries), duellist drop pools (3 tables × 39 duellists), player collection, optionally a pre-optimized deck + score

## Options

### [Option A: Deck-Swap Delta](option-a-deck-swap-delta.md)

Reuse the existing delta evaluator to measure expected deck score improvement per duel for each duellist. Mathematically principled but output is abstract — the player sees a number, not an explanation. **~300ms–10s** depending on whether exact scoring is used.

### [Option B: Fusion-Unlock Value](option-b-fusion-unlock-value.md)

Score each droppable card by the fusion ATK uplift it enables with cards already in collection. Fast (**<50ms**) and concrete output, but ignores deck context and fusion chains. Superseded by Option D as a standalone approach; still valuable as an explainability layer.

### [Option C: Rank-Conditional](option-c-rank-conditional.md)

Not standalone — a required parameter for any approach. Selects which drop table (BCD vs S/A POW vs S/A TEC) to use per duellist. Default to BCD (conservative). **Zero cost.**

### [Option D: Fusion Discovery](option-d-fusion-discovery.md)

Pool the collection with all droppable cards, discover all reachable-but-not-yet-unlocked fusions, filter to those with droppable missing materials, rank by ATK × accessibility. Output is a ranked list of actionable fusion targets with where to farm each missing material. **<100ms.**

## Approaches discarded

| Approach | Why discarded |
|----------|--------------|
| Expected Drop ATK | Ignores fusions, ignores what you own. Useless. |
| New Unique Cards count | Doesn't tell you if new cards are useful. |
| Monte Carlo Farm Trajectory | Multiple re-optimizations, way over 15s budget. |
| Win Probability Estimation | Too complex, low value — player knows who they can beat. |
| Dream Deck Gap Analysis | Requires extra 15s SA run just for unconstrained optimization. |
| Multi-Step Farming Plan | Combinatorial explosion. Academic interest only. |
| Weighted Composite Heuristic | Arbitrary weights, inferior to principled approaches. |

## Recommendation

**Option D (Fusion Discovery) + Option C (Rank-Conditional).**

Scan the mod's fusion table for fusions with result ATK above the current deck score, where at least one material is missing from collection and all missing materials are droppable. Annotate drop sources, then aggregate per duellist to answer "who should I farm."

- Trivial compute (<100ms vs 15s budget)
- Actionable output ("farm X to get Y, fuses with your Z into W")
- No pre-optimized deck needed — only the deck score as a relevance threshold

Option A (delta evaluation) remains available as a validation layer if needed later.

## Open design questions

1. Should fusion chains (depth > 1) be explored in a second pass?
2. Should standalone high-ATK droppable cards be included as a supplementary check?
