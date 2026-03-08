# P6: Fusion Reference Tools

**Priority:** P5 — Reference tools for looking up fusions outside of gameplay.

**Why:** Players want to explore the fusion database to learn what's possible, plan strategies, and understand the game mechanics. Lower priority than gameplay features but adds depth.

## Features

### A. Fusion Lookup

Look up what two specific cards fuse into.

**UX:**
```
Fusion Lookup:
  Material 1: [Dragon ▼]
  Material 2: [Warrior ▼]

  Result: Dragon Knight
  ATK: 2100  DEF: 1800
  Types: Dragon, Warrior
```

- Two dropdowns (or autocomplete inputs) for selecting materials
- Shows fusion result or "No fusion exists" message
- Uses the fusion table from the engine

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

### Step 1: Fusion Lookup Service

**New file:** `src/engine/fusion-lookup.ts`

Simple wrapper around the fusion table:
```typescript
function lookupFusion(card1Id: number, card2Id: number, fusionTable: Int16Array): number | null
```

Also provide a function to get all fusions for a given card:
```typescript
function getFusionsForCard(cardId: number, fusionTable: Int16Array, maxCardId: number): { partnerId: number; resultId: number }[]
```

### Step 2: All Fusions Index

**New file:** `src/engine/fusion-index.ts`

Build an index of all fusions grouped by result card:
```typescript
type FusionEntry = {
  resultCardId: number;
  materialPairs: [number, number][]; // All material combinations
};

function buildFusionIndex(fusionTable: Int16Array, maxCardId: number): FusionEntry[]
```

Run once at app startup, cache in context.

### Step 3: Fusion Lookup Component

**New file:** `src/ui/components/fusion/FusionLookup.tsx`

- Two `CardAutocomplete` inputs (reuse from P5)
- Display result card details when both selected
- "No fusion" message if materials don't fuse

### Step 4: Fusion Browser Component

**New file:** `src/ui/components/fusion/FusionBrowser.tsx`

- Loads full fusion index
- Renders scrollable list (consider virtualization for 700+ entries)
- Search bar to filter by result card name
- Each entry shows result name, ATK/DEF, and material pairs

### Step 5: Integration with Tab Navigation

**Modify:** `src/ui/App.tsx`

Add a "Fusions" tab (from P2's tab navigation) containing:
- Fusion Lookup at the top
- Fusion Browser below

Or add as a sub-tab within the Fusions page alongside the Hand Calculator.

### Step 6: Tests

- Test fusion lookup returns correct results
- Test fusion index contains all expected entries
- Test edge cases: self-fusion, symmetric pairs

## Performance Notes

- Fusion table is already in memory (loaded by engine)
- Building the fusion index: O(maxCardId^2) iterations but only once at startup
- Rendering 700+ fusion entries: use virtual scrolling or lazy rendering

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/engine/fusion-lookup.ts` |
| Create | `src/engine/fusion-lookup.test.ts` |
| Create | `src/engine/fusion-index.ts` |
| Create | `src/engine/fusion-index.test.ts` |
| Create | `src/ui/components/fusion/FusionLookup.tsx` |
| Create | `src/ui/components/fusion/FusionBrowser.tsx` |
| Modify | `src/ui/App.tsx` (add Fusions tab content) |
