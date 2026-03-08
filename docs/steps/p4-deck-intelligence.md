# P4: Deck Intelligence (Fusions & Score Explanation)

**Priority:** P3 — Helps the player understand their deck's strengths before a duel.

**Why:** Knowing which fusions are possible in your deck and why the optimizer chose certain cards builds player confidence and game knowledge.

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

Reuse `findFusionChains` from P2 but applied to all possible 2-card combinations in the deck (not just a 5-card hand).

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
  resultName: string;
  materialCount: number; // 2, 3, 4...
  materialPaths: { cardId: number; name: string }[][];
};
```

### Step 2: Score Explanation Engine

**New file:** `src/engine/score-explainer.ts`

For a given 40-card deck, enumerate all C(40,5) = 658,008 hands and compute:
- For each achievable ATK value: probability of appearing, probability of being the max
- For each ATK value: which card(s)/fusion path(s) produce it
- Aggregate into a sorted distribution

This is computationally heavier but runs once on demand (not during SA). Can reuse the exact scorer infrastructure.

**Output:**
```typescript
type ScoreExplanation = {
  expectedAtk: number;
  distribution: {
    atk: number;
    probability: number;      // P(this ATK appears in hand)
    probabilityMax: number;   // P(this ATK is the highest in hand)
    paths: FusionPath[];      // How to achieve this ATK
  }[];
};
```

### Step 3: Deck Fusion List Component

**New file:** `src/ui/components/DeckFusionList.tsx`

- "Calculate Fusions" button (compute on demand, not on every render)
- Grouped display by material count
- Each fusion shows result name, ATK, and material chain

### Step 4: Score Explanation Component

**New file:** `src/ui/components/ScoreExplanation.tsx`

- "Explain Score" button
- Table: ATK value | Probability | P(max) | Materials
- Color-coded by probability
- Shows top-N paths with card names

### Step 5: Integration with DeckPanel

**Modify:** `src/ui/components/DeckPanel.tsx`

Add sections below the deck list:
- "Possible Fusions" (collapsible, compute on demand)
- "Score Breakdown" (collapsible, compute on demand)

### Step 6: Tests

- Unit tests for deck fusion finder with known deck compositions
- Unit tests for score explainer against known expected values
- Verify distribution probabilities sum to 1

## Performance Notes

- Deck fusion finder: O(n^2) pairs for n unique cards in deck (~800 pairs for 40 cards). Fast.
- Score explanation: All 658,008 hands. Use the existing exact scorer approach but track per-ATK stats. ~1-2s, run in a Web Worker if needed.

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/engine/deck-fusion-finder.ts` |
| Create | `src/engine/deck-fusion-finder.test.ts` |
| Create | `src/engine/score-explainer.ts` |
| Create | `src/engine/score-explainer.test.ts` |
| Create | `src/ui/components/DeckFusionList.tsx` |
| Create | `src/ui/components/ScoreExplanation.tsx` |
| Modify | `src/ui/components/DeckPanel.tsx` |
