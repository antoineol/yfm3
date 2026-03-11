# P5: Collection & Deck Editing UX

**Priority:** P4 — Faster collection management and manual deck editing.

**Depends on:** P3 (accept flow gives the player a committed deck to edit)

**Why:** Players frequently add cards after winning duels. Manual deck add/remove lets players tweak the optimizer's output or build a deck by hand.

## Current State

- CollectionPanel shows owned cards with name, ATK, quantity
- CardAutocomplete exists for adding cards to the collection (done in P1.9)
- No +/- buttons on collection cards
- No way to manually add/remove cards from the deck
- DeckPanel is read-only

## Target Features

### A. Last Added Card Hint

After adding a card, show a persistent hint for quick repeat actions.

**UX:**
```
Last added: Blue-Eyes White Dragon (2/3)
[+ Add Another]  [- Remove One]
```

- Quick add/remove buttons for rapid bulk entry after winning duels
- Disappears when switching context

### B. Collection Item Actions

Each card in the collection list gets action buttons:

- **+** Add another copy (disabled at 3)
- **-** Remove one copy
- **→** Add to deck (calls `addToDeck` mutation)

### C. Manual Deck Add/Remove

The player can manually adjust their current deck without running the optimizer:

- **Each collection card** has an icon button to add one copy to the deck
- **Each deck card** has an icon button to remove one copy from the deck
- Show deck size indicator (e.g. "38/40") with warning color if under/over configured size
- No autocomplete needed — just icon buttons on existing card rows

This is the simple, direct approach: see a card → tap to add/remove. The optimizer handles the complex decisions; manual editing is for small tweaks.

## Implementation Plan

### Step 1: Last Added Card Hint

**New file:** `src/ui/features/collection/LastAddedCardHint.tsx`

- Query `userPreferences.lastAddedCard` from Convex (query exists: `getLastAddedCard`)
- Show card name + quantity + quick action buttons
- Create hook `src/ui/db/use-last-added-card.ts`

### Step 2: Collection Item Actions

**Modify:** `src/ui/features/collection/CollectionPanel.tsx`

- Add +/- icon buttons per card row in CardTable
- Add "→ deck" icon button per card row
- Wire to existing Convex mutations: `addCard`, `removeCard`, `addToDeck`
- May need to extend `CardTable` to accept an actions column, or use a variant

### Step 3: Deck Manual Editing

**Modify:** `src/ui/features/deck/DeckPanel.tsx`

- Add "remove" icon button per card row → calls `removeFromDeck` mutation (already exists in `convex/deck.ts`)
- Show deck size indicator (e.g. "38/40") with warning color if under/over configured size

### Step 4: Tests

- Test add/remove icon buttons call correct mutations
- Test deck size indicator shows correct count and warning state

## Dependencies

- `CardDb` context for full card list — already exists
- Convex collection mutations (`addCard`, `removeCard`) — already exist
- Convex deck mutations (`addToDeck`, `removeFromDeck`) — already exist

## Files Changed/Created

| Action | File |
|--------|------|
| Create | `src/ui/features/collection/LastAddedCardHint.tsx` |
| Create | `src/ui/db/use-last-added-card.ts` |
| Modify | `src/ui/features/collection/CollectionPanel.tsx` (item action buttons) |
| Modify | `src/ui/features/deck/DeckPanel.tsx` (remove button, size indicator) |
| Modify | `src/ui/components/CardTable.tsx` (optional actions column) |
