# P4: Deck Intelligence (Fusions & Score Explanation)

**Priority:** P3 — Helps the player understand their deck's strengths before a duel.

**Depends on:** P3 (accept flow so the player has a committed deck to analyze)

**Why:** Knowing which fusions are possible in your deck and why the optimizer chose certain cards builds player confidence and game knowledge.

## What Already Exists

- `FusionTableContext` provides the loaded `fusionTable` (Int16Array[722×722]) and `cardAtk` lookup.
- `findFusionChains()` in `src/engine/fusion-chain-finder.ts` does DFS fusion-chain exploration for a given set of cards (used by the Hand Fusion Calculator).
- `CardDb` context provides card names, ATK/DEF, and kinds.
- Exact scorer infrastructure (`scorer-worker.ts`) can score any deck off the main thread.

## Features

### A. Deck Fusion List

Show all possible fusions achievable from the current 40-card deck.

**UX:**
```
Possible Fusions in Your Deck:

2-Material Fusions (12):
  Dragon Knight (ATK 2100) ← Dragon + Warrior
  Beast Dragon (ATK 1500) ← Dragon + Beast
  ...

3-Material Fusions (5):
  Ultimate Dragon (ATK 3200) ← Dragon Knight + Dragon
  ...
```

- Grouped by material count (2-material = direct fusion, 3+ = chain)
- Sorted by ATK within each group
- Shows which cards from your deck are the materials

### B. Score Explanation

Detailed breakdown of why a deck scores what it does.

**UX:**
```
Deck Score: 2105.7 Expected ATK

Attack Distribution:
  ATK 3200  →  2.3% chance (max in 1.8% of hands)
  ATK 2100  → 15.6% chance (max in 12.1% of hands)
  ATK 1800  → 28.4% chance (max in 18.7% of hands)
  ATK 1500  → 45.2% chance (max in 32.0% of hands)
  ...

Top Paths:
  ATK 2100 via Dragon + Warrior → Dragon Knight (2 copies each)
  ATK 1800 via direct play of Great Moth (1 copy)
  ...
```

## Implementation Plan

### Step 1: Deck Fusion Finder

**New file:** `src/engine/deck-fusion-finder.ts`

Reuse the fusion table to find all fusions achievable from a given deck's card set.

**Algorithm:**
- For each unique pair of cards in the deck, check fusion table
- For chain fusions (3+ materials): find pairs that fuse, then check if result fuses with another deck card
- Limit depth to fusionDepth config
- Deduplicate and group by material count

**Output:**
```typescript
type DeckFusion = {
  resultCardId: number;
  resultAtk: number;
  materialCount: number; // 2, 3, 4...
  materialPaths: number[][]; // card IDs for each path
};
```

### Step 2: Score Explanation Engine

**New file:** `src/engine/score-explainer.ts`

For a given deck, enumerate all C(40,5) = 658,008 hands and compute:
- For each achievable ATK value: probability of being the max in a hand
- For each ATK value: which card(s)/fusion path(s) produce it
- Aggregate into a sorted distribution

**Must run in a Web Worker** (~1-2s). Reuse the scorer worker pattern.

**Output:**
```typescript
type ScoreExplanation = {
  expectedAtk: number;
  distribution: {
    atk: number;
    probabilityMax: number; // P(this ATK is the highest in hand)
    paths: { materialIds: number[]; resultId: number }[];
  }[];
};
```

### Step 3: Deck Fusion List Component

**New file:** `src/ui/features/deck/DeckFusionList.tsx`

- "Calculate Fusions" button (compute on demand, not on every render)
- Grouped display by material count
- Each fusion shows result name, ATK, and material chain

### Step 4: Score Explanation Component

**New file:** `src/ui/features/deck/ScoreExplanation.tsx`

- "Explain Score" button (triggers worker computation)
- Table: ATK value | P(max) | Materials
- Shows top-N paths with card names

### Step 5: Integration with DeckPanel

**Modify:** `src/ui/features/deck/DeckPanel.tsx`

Add collapsible sections below the deck list:
- "Possible Fusions" (compute on demand)
- "Score Breakdown" (compute on demand, shows loading while worker runs)

### Step 6: Tests

- Unit tests for deck fusion finder with known deck compositions
- Unit tests for score explainer against known expected values
- Verify distribution probabilities sum to 1

## Performance Notes

- Deck fusion finder: O(n^2) pairs for n unique cards in deck (~800 pairs for 40 cards). Fast, runs on main thread.
- Score explanation: All 658,008 hands (~1-2s). **Must run in a Web Worker.** Show loading state on the "Explain Score" button while computing.

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/engine/deck-fusion-finder.ts` |
| Create | `src/engine/deck-fusion-finder.test.ts` |
| Create | `src/engine/score-explainer.ts` |
| Create | `src/engine/score-explainer.test.ts` |
| Create | `src/ui/features/deck/DeckFusionList.tsx` |
| Create | `src/ui/features/deck/ScoreExplanation.tsx` |
| Modify | `src/ui/features/deck/DeckPanel.tsx` |
