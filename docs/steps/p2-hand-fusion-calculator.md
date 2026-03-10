# P2: Hand Fusion Calculator (Core Copilot Feature)

**Why:** During gameplay, the player draws 5 cards and needs to instantly know the best fusion to play. This turns the optimizer from a pre-game tool into a real-time gameplay aid.

**Depends on:** P1.9 (FusionTable context, CardAutocomplete, tab navigation)

## What It Does

1. Player builds a 5-card hand (either from their deck or all cards - from a setting)
2. App shows all possible fusions from that hand in real-time, sorted by ATK
3. Each fusion shows the chain: which cards to fuse, in what order, and the result
4. Player can "play" a fusion — consuming the material cards from the hand (the fusion result goes to the field, not back to the hand)

## UX Flow

```
┌─────────────────────────────────────────┐
│ Hand Fusion Calculator                   │
│                                          │
│ [Card autocomplete from deck/all cards]  │
│                                          │
│ Your Hand (3/5):                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ Dragon   │ │ Beast    │ │ Warrior  │  │
│ │ ATK 1200 │ │ ATK 800  │ │ ATK 1000 │  │
│ │    [×]   │ │    [×]   │ │    [×]   │  │
│ └──────────┘ └──────────┘ └──────────┘  │
│                                          │
│ Possible Fusions:                        │
│ ┌──────────────────────────────────────┐ │
│ │ Dragon Knight (ATK 2100)             │ │
│ │ Dragon + Warrior → Dragon Knight     │ │
│ │                        [Play Fusion] │ │
│ ├──────────────────────────────────────┤ │
│ │ Beast Dragon (ATK 1500)              │ │
│ │ Dragon + Beast → Beast Dragon        │ │
│ │                        [Play Fusion] │ │
│ └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Implementation Plan

Use your frontend design skill to produce the best UX.

### Step 1: User-Facing Fusion Chain Finder (Engine Module)

Create a new module separate from the hot-path `FusionScorer`. This one returns full chain details, not just max ATK.

**New file:** `src/engine/fusion-chain-finder.ts`

**Input:** Array of up to 5 CardIds + fusionTable (from FusionTableContext) + CardDb (for names/stats)
**Output:** Array of `FusionChainResult` sorted by ATK descending

```typescript
type FusionChainResult = {
  resultCardId: number;
  resultAtk: number;
  resultDef: number;
  resultName: string;
  // Ordered steps: step[0] is the first fusion, step[n] is the final
  steps: FusionStep[];
  // All material card IDs consumed from the hand
  materialCardIds: number[];
};

type FusionStep = {
  material1CardId: number;
  material2CardId: number;
  resultCardId: number;
};
```

**Algorithm:** Similar to `FusionScorer` DFS but returns chain details:
- Enumerate all pairs in hand → check fusionTable[a*722+b]
- For each fusion result, recurse: try fusing result with remaining cards
- Max depth = fusionDepth config (default 3)
- Deduplicate results by resultCardId (keep chain with fewest steps)
- Sort by ATK descending

**Key difference from `FusionScorer`:** Uses standard arrays and objects (not typed arrays), since it runs once on user action, not millions of times in SA.

### Step 2: Hand State (Convex Integration)

The `hand` table and mutations already exist in Convex (`convex/hand.ts`):
- `addToHand`, `removeFromHand`, `removeMultipleFromHand`, `clearHand`, `getHand`

**New hook:** `src/ui/db/use-hand.ts`
- `useHand()` — returns current hand cards from Convex, sorted by `order` field
- Exposes add/remove/clear mutations

### Step 3: Hand Display Component

**New file:** `src/ui/components/hand/HandDisplay.tsx`

- Grid of up to 5 card tiles
- Each tile shows: name, ATK/DEF, card type
- Remove button (×) on each tile
- Empty slots shown as dashed outlines

### Step 4: Card Selector for Hand

**New file:** `src/ui/components/hand/HandCardSelector.tsx`

- Uses `CardAutocomplete` from P1.9 with cards filtered to deck cards (default) or all cards
- Disabled when hand is full (5 cards)
- On select: calls `addToHand` mutation

### Step 5: Fusion Results Display

**New file:** `src/ui/components/hand/FusionResultsList.tsx`

- Calls `findFusionChains(handCardIds, ...)` on every hand change
- Lists all achievable fusions sorted by ATK
- Each item shows:
  - Result card name + ATK/DEF
  - Chain steps: "Card A + Card B → Result X" (multi-line for chains)
  - "Play Fusion" button

### Step 6: Play Fusion Action

"Play Fusion" button:
1. Removes material cards from hand via `removeMultipleFromHand`
2. The fusion result goes to the field — it is NOT added back to the hand
3. UI updates reactively via Convex subscription
4. Remaining hand cards are still available for further fusions or direct play

### Step 7: Hand Fusion Calculator Page

**New file:** `src/ui/components/hand/HandFusionCalculator.tsx`

Assembles HandCardSelector + HandDisplay + FusionResultsList + Clear Hand button.
Rendered inside the "Hand" tab (shell from P1.9).

### Step 8: Tests

- Unit tests for `findFusionChains` with known card combinations
- Test edge cases: no fusions possible, multi-step chains, duplicate cards in hand
- Test play fusion: materials removed, result NOT added to hand

## Dependencies

- `FusionTableContext` (P1.9) — provides fusionTable + cardAtk to the chain finder
- `CardAutocomplete` (P1.9) — reused for hand card selector
- Tab navigation (P1.9) — "Hand" tab shell already in place
- `CardDb` context — already exists, provides card names/stats
- Convex hand mutations — already exist

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/engine/fusion-chain-finder.ts` |
| Create | `src/engine/fusion-chain-finder.test.ts` |
| Create | `src/ui/components/hand/HandDisplay.tsx` |
| Create | `src/ui/components/hand/HandCardSelector.tsx` |
| Create | `src/ui/components/hand/FusionResultsList.tsx` |
| Create | `src/ui/components/hand/HandFusionCalculator.tsx` |
| Create | `src/ui/db/use-hand.ts` |
