# P3: Optimization UX Improvements

**Priority:** P2 — Better feedback during the optimizer's ~15-60s run.

**Depends on:** P1.9 (CardAutocomplete for suggested deck editing)

**Why:** The optimizer runs for seconds to a minute. Without progress feedback, cancel ability, and a review step before accepting results, the experience feels unresponsive and risky.

## Current State (YFM3)

- Click "Optimize Deck" → wait → results appear in ResultPanel
- No progress indicator
- No cancel button
- No accept/reject flow — results are just displayed, not applied

## Target State

- Progress bar (0-100%) during optimization
- Cancel button to abort early
- Suggested deck shown with comparison to current deck
- **Manual fine-tuning of suggestion** — remove/swap cards before accepting
- Accept/Reject buttons before applying changes
- Re-run button to try again

## Implementation Plan

### Step 1: Progress Reporting from Workers

The orchestrator already has infrastructure for worker messages. Add progress reporting.

**Modify:** `src/engine/orchestrator.ts`
- Add a `onProgress` callback parameter to `optimizeDeckParallel`
- Aggregate progress from all SA workers (each reports its iteration count vs total)
- Call `onProgress(0..1)` periodically

**Modify:** `src/engine/worker/sa-worker.ts`
- Post `progress` messages back to main thread at regular intervals (every ~500ms)

### Step 2: Cancel Support

**Modify:** `src/engine/orchestrator.ts`
- Accept an `AbortSignal` parameter
- On abort: terminate all workers, resolve with best-so-far result (or null)

**Modify:** `src/ui/lib/use-optimize.ts`
- Store `AbortController` ref
- Expose `cancel()` function

### Step 3: Optimization State Atoms

**Modify:** `src/ui/lib/atoms.ts`

Expand state beyond `isOptimizingAtom` and `resultAtom`:

```typescript
// Progress: 0 to 1
const optimizationProgressAtom = atom(0);

// Is cancellation in progress
const isCancellingAtom = atom(false);
```

### Step 4: Suggested Deck View

**New file:** `src/ui/components/SuggestedDeckView.tsx`

When optimization completes, show a comparison view:

```
┌─────────────────────────────────────┐
│ Optimization Complete!               │
│                                      │
│ Current Score:  1850.3 ATK           │
│ Suggested:      2105.7 ATK          │
│ Improvement:    +255.4 (+13.8%)     │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Suggested Deck (40 cards)      │   │
│ │ sorted by ATK descending...    │   │
│ └────────────────────────────────┘   │
│                                      │
│ [Accept Deck]  [Reject]  [Re-run]   │
└─────────────────────────────────────┘
```

- **Accept:** Calls `acceptSuggestedDeck` mutation (already exists in Convex)
- **Reject:** Clears result, keeps current deck
- **Re-run:** Starts optimization again

### Step 5: Manual Fine-Tuning of Suggested Deck

The suggested deck is editable before accepting — the player can swap out cards they dislike or force-include cards they want.

**UX:**
```
┌─────────────────────────────────────┐
│ Suggested Deck (40 cards)            │
│                                      │
│  Dragon Knight  ATK 2100  [×]       │  ← remove from suggestion
│  Great Moth     ATK 1800  [×]       │
│  ...                                 │
│                                      │
│  [+ Add card from collection]       │  ← add a card to suggestion
│                                      │
│  ⚠ Score is stale (deck modified)   │
│  [Accept Deck]  [Reject]  [Re-run]  │
└─────────────────────────────────────┘
```

**Behavior:**
- Each card in the suggested deck has a **remove (×)** button
- Removing a card decreases the count; the card returns to the available pool
- A **"+ Add card"** autocomplete (filtered to collection cards not already at max copies in the suggestion) lets the player insert cards
- The suggestion is stored as local state (Jotai atom), not in Convex, until accepted
- When the suggestion is manually edited, the displayed score is marked as **stale** (since it was computed for the original suggestion)
- Player can still Accept (applies the modified deck), Reject, or Re-run
- Re-run discards edits and starts a fresh optimization

**State:**
- `suggestedDeckAtom` — mutable `number[]` of card IDs, initialized from optimizer result
- `isSuggestionModifiedAtom` — derived atom, `true` if deck differs from original result

### Step 6: Progress Bar in CollectionPanel

**Modify:** `src/ui/components/CollectionPanel.tsx` or extract to new component

During optimization:
- Show progress bar (0-100%)
- Show cancel button
- Disable "Optimize Deck" button

### Step 7: Update ResultPanel

**Modify:** `src/ui/components/ResultPanel.tsx`

- Integrate with `SuggestedDeckView`
- Show progress during optimization
- Show comparison after completion
- Handle cancel state

### Step 8: Tests

- Test progress callback receives values 0→1
- Test cancel aborts and returns partial result or null
- Test accept/reject flows update state correctly
- Test manual fine-tuning: remove card from suggestion, add card, stale flag toggling

## Files Changed/Created

| Action | File |
|--------|------|
| Modify | `src/engine/orchestrator.ts` (progress callback, abort signal) |
| Modify | `src/engine/worker/sa-worker.ts` (progress messages) |
| Modify | `src/ui/lib/use-optimize.ts` (progress, cancel) |
| Modify | `src/ui/lib/atoms.ts` (progress, cancelling, suggestedDeck, isSuggestionModified atoms) |
| Create | `src/ui/components/SuggestedDeckView.tsx` (comparison + manual fine-tuning) |
| Modify | `src/ui/components/CollectionPanel.tsx` (progress bar, cancel) |
| Modify | `src/ui/components/ResultPanel.tsx` (suggested deck integration) |
