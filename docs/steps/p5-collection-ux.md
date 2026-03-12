# P5: Collection & Deck Editing UX

**Priority:** P4 — Faster collection management and manual deck editing.

**Depends on:** P3 (accept flow gives the player a committed deck to edit)

**Why:** Players frequently add cards after winning duels. Manual deck add/remove lets players tweak the optimizer's output or build a deck by hand.

## Current State (DONE)

- LastAddedCardHint shows card name, quantity, and quick +/- buttons after adding a card
- CollectionPanel has +/- and → deck action buttons per card row
- DeckPanel has remove button per card row and deck size indicator with warning color
- CardTable extended with optional `actions` render prop
- New `removeOneByCardId` mutation in convex/deck.ts for deck removal by cardId
- All features covered by tests
- Icon-only and symbol-based collection/deck action buttons now use flex centering for reliable vertical/horizontal alignment

## Current Step

- Monitor collection/deck action button UX polish and keep shared button primitives consistent.

## Next Step

- Reuse the same centering approach for any future icon-only action buttons to avoid per-screen alignment drift.

### Collection-Deck Consistency Guards

- `removeCard` mutation: prevents removing a collection copy when all copies are committed to the deck
- `addToDeck` mutation: verifies card exists in collection and has available (non-deck) copies
- `LastAddedCardHint` "−" button: disabled when no available copies (all in deck)
- CollectionPanel "−" button was already guarded via display-qty subtraction

## Target Features

### A. Last Added Card Hint

After adding a card, show a persistent hint for quick repeat actions.

**UX:**
```
Last added: Blue-Eyes White Dragon (2/3)
[+ Add Another]  [- Remove One]
```

- Quick add/remove for rapid bulk entry after winning duels
- Disappears when switching context

### B. Collection Item Actions

Each card in the collection list gets actions:

- **+** Add another copy (disabled at 3)
- **-** Remove one copy
- **→** Add to deck (calls `addToDeck` mutation)

Add/remove: you choose the best UX.

### C. Manual Deck Add/Remove

The player can manually adjust their current deck without running the optimizer:

- **Each collection card** has an action to add one copy to the deck
- **Each deck card** has an action to remove one copy from the deck
- Show deck size indicator (e.g. "38/40") with warning color if under/over configured size
- No autocomplete needed — just actions on existing card rows

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
