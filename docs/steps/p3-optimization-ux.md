# P3: Optimization UX Improvements

**Priority:** P2 — Better feedback during the optimizer's ~15s run.

**Depends on:** P1.9 (shared infrastructure — done)

**Why:** The optimizer runs for ~15 seconds. Without progress feedback, cancel ability, and a review step before accepting results, the experience feels unresponsive and risky.

## Current State

- Click "Optimize Deck" → wait → results appear in ResultPanel
- No progress indicator (just a shimmer animation)
- No cancel button
- No accept/reject flow — results are just displayed, not saved to the deck
- `acceptSuggestedDeck` Convex mutation exists but is not wired to the UI

## What Already Exists in the Engine

- **Worker progress messages:** SA workers already post `PROGRESS` messages every ~500ms with `bestScore`, `bestDeck`, and `iterations` (implemented in phase 6.5).
- **AbortSignal support:** `optimizeDeckParallel` already accepts an `options.signal` parameter and wires it to `terminateEarly()`, resolving with the best-so-far result.
- **Convergence detection:** The orchestrator already uses worker progress internally to detect convergence and early-terminate.

The missing piece is **surfacing this to the UI layer**.

## Target State

- Time-based progress bar (0-100%) during optimization, plus live best score
- Cancel button to abort early (returns best-so-far)
- Suggested deck shown with comparison to current deck
- Accept/Reject/Re-run buttons before applying changes

## Implementation Plan

### Step 1: Surface Progress to the UI

The orchestrator already receives worker `PROGRESS` messages for convergence detection. Add an `onProgress` callback to forward aggregated state to the caller.

**Modify:** `src/engine/orchestrator.ts`
- Add `onProgress?: (progress: number, bestScore: number) => void` to the options
- Compute `progress` as `elapsed / timeLimit` (time-based, honest about the known budget)
- Forward `globalBest` score so the UI can show the live improving score
- Call `onProgress` whenever a worker posts a `PROGRESS` message

### Step 2: Wire Cancel + Progress into useOptimize

**Modify:** `src/ui/features/optimize/use-optimize.ts`
- Create an `AbortController` ref; pass its `signal` to `optimizeDeckParallel`
- Pipe `onProgress` callback to update atoms
- Expose `cancel()` function that calls `abortController.abort()`

**Modify:** `src/ui/lib/atoms.ts`
- Add `optimizationProgressAtom` (0 to 1, time-based)
- Add `liveBestScoreAtom` (number, updated as workers improve)

### Step 3: Progress Bar + Cancel in ResultPanel

**Modify:** `src/ui/features/result/ResultPanel.tsx`

Replace the current shimmer loading state with a real progress view:
- Time-based progress bar (0-100%)
- Live best score displayed and updating as workers improve
- Cancel button (returns best result found so far)
- Elapsed time counter

Use the **frontend-design** skill for the progress bar — smooth animation, gold accent color.

### Step 4: Accept/Reject/Re-run Flow

**Create:** `src/ui/features/result/SuggestedDeckComparison.tsx`

When optimization completes, show a comparison view:

```
┌─────────────────────────────────────┐
│ Optimization Complete!               │
│                                      │
│ Current Score:  1850.3 ATK           │
│ Suggested:      2105.7 ATK          │
│ Improvement:    ▲ 255.4 (+13.8%)    │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Suggested Deck (40 cards)      │   │
│ │ sorted by ATK descending...    │   │
│ └────────────────────────────────┘   │
│                                      │
│ [Accept Deck]  [Reject]  [Re-run]   │
└─────────────────────────────────────┘
```

- **Accept:** Calls existing `acceptSuggestedDeck` mutation → saves to Convex → DeckPanel auto-updates via reactivity → show toast confirmation
- **Reject:** Clears `resultAtom`, keeps current deck unchanged
- **Re-run:** Calls `optimize()` again, clears previous result

**Modify:** `src/ui/features/result/ResultPanel.tsx`
- Integrate `SuggestedDeckComparison` for the completed state

### Step 5: Tests

- Test `onProgress` callback receives increasing values 0→1 with score
- Test cancel aborts and returns partial result (not null)
- Test accept calls `acceptSuggestedDeck` mutation with correct card IDs
- Test reject clears result atom
- Test re-run triggers new optimization

## Files Changed/Created

| Action | File |
|--------|------|
| Modify | `src/engine/orchestrator.ts` (add `onProgress` callback forwarding) |
| Modify | `src/ui/features/optimize/use-optimize.ts` (AbortController, progress piping, cancel) |
| Modify | `src/ui/lib/atoms.ts` (add `optimizationProgressAtom`, `liveBestScoreAtom`) |
| Create | `src/ui/features/result/SuggestedDeckComparison.tsx` (comparison + accept/reject/re-run) |
| Modify | `src/ui/features/result/ResultPanel.tsx` (progress bar, cancel, comparison integration) |
