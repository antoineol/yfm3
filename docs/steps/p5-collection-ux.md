# P5: Collection UX Improvements

**Priority:** P4 — Faster, smoother collection management.

**Depends on:** P1.9 (CardAutocomplete — already built, reused here)

**Why:** Players frequently add cards after winning duels. Fast card entry and clear collection-to-deck flow reduce friction.

## Current State (YFM3)

- CollectionPanel shows a sorted list of owned cards with name, ATK, quantity
- No search/filter
- No way to add cards from the UI (must use Convex dashboard or scripts)
- No visual feedback on recent additions

## Target Features

### A. Card Autocomplete Search

Search cards by name to add them to the collection.

**UX:**
```
┌────────────────────────────────┐
│ Add Card: [type to search...] │
│ ┌────────────────────────────┐ │
│ │ Blue-Eyes White Dragon (0) │ │
│ │ Blue Medicine (2)          │ │
│ │ Blue-Winged Crown (1)     │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

- Filters all game cards by name (case-insensitive substring match)
- Shows current quantity owned next to each result
- Disabled if card already has 3 copies
- On select: calls `addToCollection` mutation

### B. Last Added Card Hint

After adding a card, show a persistent hint for quick repeat actions.

**UX:**
```
Last added: Blue-Eyes White Dragon (2/3)
[+ Add Another]  [- Remove One]
```

- Uses `lastAddedCard` from `userPreferences` (already tracked in Convex)
- Quick add/remove buttons for rapid bulk entry
- Disappears when switching context

### C. Collection Item Actions

Each card in the collection list gets action buttons:

- **+** Add another copy (disabled at 3)
- **-** Remove one copy
- **→** Move to deck (calls `addToDeck` + decrements collection available count)

### D. Manual Deck Fine-Tuning (Add/Remove Cards)

The player can manually adjust their current deck without running the optimizer:

- **Collection → Deck:** Each collection card has a "→ Deck" button to add it to the current deck
- **Deck → Collection:** Each deck card has a "Remove" button to move it back to the available collection pool
- **Add to Deck from search:** The DeckPanel gets a "+" button / autocomplete to add any collection card directly to the deck (useful when the player knows exactly which card they want)

This complements P3's suggested-deck editing: P3 handles editing a suggestion *before accepting*, while this handles editing the *current committed deck* directly.

Note: deck size validation — warn if deck goes over/under the configured deck size after manual edits.

## Implementation Plan

### Step 1: Add to Collection Flow

`CardAutocomplete` component already exists from P1.9. Reuse it here.

**Modify:** `src/ui/components/CollectionPanel.tsx`

- Add `CardAutocomplete` at the top
- On card selection: call `addToCollection` mutation (already exists)
- Auto-focus back to search after adding

### Step 2: Last Added Card Hint

**New file:** `src/ui/components/LastAddedCardHint.tsx`

- Query `userPreferences.lastAddedCard` from Convex (query already exists: `getLastAddedCard`)
- Show card name + quantity + quick action buttons
- Create hook `useLastAddedCard()` in `src/ui/db/`

### Step 3: Collection Item Actions

**Modify:** `src/ui/components/CollectionPanel.tsx`

- Add +/- buttons per card row
- Add "→ Deck" button per card row
- Wire to existing Convex mutations: `addCard`, `removeCard`, `addToDeck`

### Step 4: Deck Manual Editing

**Modify:** `src/ui/components/DeckPanel.tsx`

- Add "Remove" button per card row → calls `removeFromDeck` mutation (already exists)
- Add "+" button / inline autocomplete to add a collection card to the deck → calls `addToDeck` mutation (already exists)
- Show deck size indicator (e.g. "38/40") with warning color if under/over configured size
- Available cards for adding = collection cards not already at max copies in deck

### Step 5: Tests

- Test autocomplete filtering logic
- Test add/remove/move flows update state correctly

## Dependencies

- `CardDb` context for full card list — already exists
- Convex collection mutations — already exist
- Convex deck mutations — already exist
- `getLastAddedCard` query — already exists

## Files Changed/Created

| Action | File |
|--------|------|
| Reuse  | `src/ui/components/CardAutocomplete.tsx` (from P1.9) |
| Create | `src/ui/components/LastAddedCardHint.tsx` |
| Create | `src/ui/db/use-last-added-card.ts` |
| Modify | `src/ui/components/CollectionPanel.tsx` |
| Modify | `src/ui/components/DeckPanel.tsx` |
