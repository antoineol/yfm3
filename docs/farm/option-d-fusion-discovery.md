# Option D: Fusion Discovery

## What it answers

"What fusions could I unlock by farming, and which duelist should I farm to unlock the most valuable ones?"

## Approach

### Step 1 — Find unlockable fusions

Scan all fusions in the mod's fusion table. Keep a fusion `(A, B) → Result` when:

- `Result.atk > currentDeckScore` (the fusion could potentially improve the deck)
- At least one of A or B is **not** in the player's collection (the fusion isn't already achievable)
- Every missing material is droppable by at least one unlocked duelist

This naturally covers all cases — whether one or both materials are missing — without special-casing.

### Step 2 — Annotate drop sources

For each missing material in a kept fusion, record which unlocked duelists drop it and at what probability (from the selected drop table per Option C).

### Step 3 — Aggregate per duelist

Group results by duelist: for each duelist, list the fusions they contribute a missing material to.

Rank duelists by the number or total ATK of fusions they unlock. The duelist that unlocks the most/best fusions is the recommended farm target.

### Output

Two complementary views:

1. **Fusion list**: ranked by result ATK, showing materials (owned vs missing), drop sources per missing material.
2. **Duellist ranking**: each duelist scored by the fusions they help unlock, with the fusion list as drill-down.

## Budget estimate

- Scan fusion table + filter: O(F) where F = number of fusions in the mod ≈ under 10ms
- Annotate + aggregate: trivial
- **Total: well under 100ms**

## Strengths

- Highly actionable output: "farm X to get Y, which fuses with your Z into W (3200 ATK)"
- Computationally trivial — orders of magnitude under the 15s budget
- Captures the dominant game mechanic (fusions)
- Doesn't require a pre-optimized deck — only the deck score as a threshold
- Simple algorithm, easy to test and reason about

## Weaknesses

- Only considers single-step fusions (2 materials). Fusion chains (A+B→X, X+C→Y) are missed. Could be addressed in a later pass.
- Doesn't account for deck/hand context: drawing both materials in a 5-card hand is not guaranteed.
- Standalone high-ATK droppable cards (no fusion needed) are invisible to this approach.

## Resolved questions

- **Fusion chains**: Yes, explored up to `fusionDepth` (default 3, max 4), reusing the existing engine parameter.
- **ATK threshold**: Always derived from `currentDeckScore` (not configurable).
- **Standalone high-ATK droppable cards**: Included as "depth-0 fusions" — same data structure, same list. Not a separate category.
- **Drop mode**: POW (default) combines `saPow` + `bcd` weights. TEC uses `saTec` only. Simple 2-way toggle.
- **Display**: 4th panel on the Deck page, with its own mobile sub-tab.
