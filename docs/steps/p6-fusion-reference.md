# P6: Fusion Reference Tools

**Priority:** P5 — Reference tools for looking up fusions outside of gameplay.

**Depends on:** P1.9 (FusionTable context, CardAutocomplete, tab navigation — all done)

**Why:** Players want to explore the fusion database to learn what's possible, plan strategies, and understand the game mechanics. Lower priority than gameplay features but adds depth.

## What Already Exists

- `FusionTableContext` provides the loaded `fusionTable` (Int16Array[722×722]), `cardAtk`, and `CardDb`.
- `CardAutocomplete` component exists for card selection.
- Tab navigation shell exists (`App.tsx` uses Base UI Tabs with "deck" and "hand" tabs).
- `findFusionChains()` in `src/engine/fusion-chain-finder.ts` does DFS fusion-chain exploration.

## Features

### A. Fusion Lookup

Look up what two specific cards fuse into.

**UX:**
```
Fusion Lookup:
  Material 1: [type to search...]
  Material 2: [type to search...]

  Result: Dragon Knight
  ATK: 2100  DEF: 1800
```

- Two `CardAutocomplete` inputs for selecting materials
- Shows fusion result or "No fusion exists" message
- Uses the fusion table directly: `fusionTable[card1 * 722 + card2]`

### B. Fusion Database Browser

Browse all fusions in the game.

**UX:**
```
All Fusions (247):
┌──────────────────────────────────────┐
│ Dragon Knight (ATK 2100)              │
│ Materials: Dragon + Warrior           │
│            Dragon + Knight            │
├──────────────────────────────────────┤
│ Beast Dragon (ATK 1500)               │
│ Materials: Dragon + Beast             │
└──────────────────────────────────────┘
```

- Full list of all fusion results in the game
- Each entry shows result card + all material combinations that produce it
- Sorted by ATK descending
- Search/filter by result name

## Implementation Plan

### Step 1: Fusion Index Builder

**New file:** `src/engine/fusion-index.ts`

Build an index of all fusions grouped by result card:

```typescript
type FusionEntry = {
  resultCardId: number;
  materialPairs: [number, number][]; // All material combinations
};

function buildFusionIndex(fusionTable: Int16Array, maxCardId: number): FusionEntry[]
```

Run once at app startup, cache in `FusionTableContext`.

The fusion lookup itself is trivial (`fusionTable[a * 722 + b]`) and doesn't need a separate module.

### Step 2: Fusion Lookup Component

**New file:** `src/ui/features/fusion/FusionLookup.tsx`

- Two `CardAutocomplete` inputs (reuse existing component)
- Display result card details when both selected
- "No fusion" message if materials don't fuse

### Step 3: Fusion Browser Component

**New file:** `src/ui/features/fusion/FusionBrowser.tsx`

- Loads full fusion index
- Renders scrollable list (consider virtualization for 700+ entries)
- Search bar to filter by result card name
- Each entry shows result name, ATK/DEF, and material pairs

### Step 4: Integration with Tab Navigation

**Modify:** `src/ui/App.tsx`

Add a "Fusions" tab containing:
- Fusion Lookup at the top
- Fusion Browser below

### Step 5: Tests

- Test fusion index contains all expected entries
- Test edge cases: symmetric pairs (a+b = b+a should not duplicate)
- Test lookup returns correct result or null for non-fusing pairs

## Performance Notes

- Fusion table is already in memory (loaded by `FusionTableContext`)
- Building the fusion index: O(maxCardId^2) iterations (~520K checks) but only once at startup
- Rendering 700+ fusion entries: consider virtual scrolling or lazy rendering

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/engine/fusion-index.ts` |
| Create | `src/engine/fusion-index.test.ts` |
| Create | `src/ui/features/fusion/FusionLookup.tsx` |
| Create | `src/ui/features/fusion/FusionBrowser.tsx` |
| Modify | `src/ui/App.tsx` (add Fusions tab) |
| Modify | `src/ui/lib/fusion-table-context.tsx` (cache fusion index) |
