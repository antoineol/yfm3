# P2: Hand Fusion Calculator (Core Copilot Feature)

**Priority:** P1 — This is the most impactful feature for a game copilot.

**Why:** During gameplay, the player draws 5 cards and needs to instantly know the best fusion to play. This turns the optimizer from a pre-game tool into a real-time gameplay aid.

## What It Does

1. Player builds a 5-card hand (from their deck or all cards)
2. App shows all possible fusions from that hand in real-time, sorted by ATK
3. Each fusion shows the chain: which cards to fuse, in what order, and the result
4. Player can "play" a fusion — consuming the materials from the hand and adding the result

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

### Step 1: User-Facing Fusion Chain Finder (Engine Module)

Create a new module separate from the hot-path `FusionScorer`. This one returns full chain details, not just max ATK.

**New file:** `src/engine/fusion-chain-finder.ts`

**Input:** Array of 5 CardIds + fusion table + card metadata
**Output:** Array of `FusionChainResult` sorted by ATK descending

```typescript
type FusionChainResult = {
  resultCardId: number;
  resultAtk: number;
  resultDef: number;
  resultName: string;
  // Ordered steps: step[0] is the first fusion, step[n] is the final
  steps: FusionStep[];
  // All material card IDs consumed (hand indices or card IDs)
  materialCardIds: number[];
};

type FusionStep = {
  material1CardId: number;
  material2CardId: number;
  resultCardId: number;
};
```

**Algorithm:** Similar to YFM2's `calculateFusionChains` but simplified:
- Enumerate all pairs in hand → check fusion table
- For each fusion result, recurse: try fusing result with remaining cards
- Max depth = fusionDepth config (default 3)
- Deduplicate results by resultCardId (keep chain with fewest steps)
- Sort by ATK descending

**Key difference from `FusionScorer`:** This uses standard arrays and objects (not typed arrays), since it runs once on user action, not millions of times in SA.

### Step 2: UI Navigation (Tabs)

Add lightweight tab navigation to switch between "Deck" and "Fusions" views.

**Modify:** `src/ui/App.tsx`
- Add a tab bar: "Deck" | "Fusions"
- "Deck" shows current layout (Collection, Deck, Results)
- "Fusions" shows the Hand Fusion Calculator

Use Jotai atom for active tab — no routing library needed.

### Step 3: Hand State (Convex Integration)

The `hand` table and mutations already exist in Convex (`convex/hand.ts`):
- `addToHand`, `removeFromHand`, `removeMultipleFromHand`, `clearHand`, `getHand`

**New hooks needed:** `src/ui/db/use-hand.ts`
- `useHand()` — returns current hand cards from Convex
- Add/remove mutations wired up

### Step 4: Hand Display Component

**New file:** `src/ui/components/hand/HandDisplay.tsx`

- Grid of up to 5 card tiles
- Each tile shows: name, ATK/DEF, card type
- Remove button (×) on each tile
- Empty slots shown as dashed outlines

### Step 5: Card Selector for Hand

**New file:** `src/ui/components/hand/HandCardSelector.tsx`

- Autocomplete input filtered to deck cards (default) or all cards
- Disabled when hand is full (5 cards)
- On select: calls `addToHand` mutation

This requires the `CardAutocomplete` component (built in P5). For this step, a simple dropdown or text filter suffices as MVP.

### Step 6: Fusion Results Display

**New file:** `src/ui/components/hand/FusionResultsList.tsx`

- Calls `findFusionChains(handCardIds, ...)` on every hand change
- Lists all achievable fusions sorted by ATK
- Each item shows:
  - Result card name + ATK/DEF
  - Chain steps: "Card A + Card B → Result X" (multi-line for chains)
  - "Play Fusion" button

### Step 7: Play Fusion Action

"Play Fusion" button:
1. Removes material cards from hand (`removeMultipleFromHand`)
2. Adds fusion result to hand (`addToHand`)
3. UI updates reactively via Convex subscription

### Step 8: Tests

- Unit tests for `findFusionChains` with known card combinations
- Test edge cases: no fusions possible, multi-step chains, hand full after fusion

## Dependencies

- Card metadata (`CardDb` context) — already exists
- Fusion table data — already loaded by engine, need to expose to UI context
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
| Modify | `src/ui/App.tsx` (add tab navigation) |
| Modify | `src/ui/lib/atoms.ts` (add activeTabAtom) |
