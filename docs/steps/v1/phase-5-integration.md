# Phase 5: Exact Refinement & Integration

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Score the SA result with exhaustive combinatorial evaluation for accurate reporting, and wire everything into the public API.

**Depends on:** Phase 3 (scorer), Phase 4 (SA optimizer).

---

## 5.1 Exact Combinatorial Scoring

MC scores have sampling noise (~2.3% sample of all hands). The exact evaluator eliminates this by scoring every possible hand, giving the user an accurate expected ATK.

Uses the same 5-nested-loop structure as `referenceScoreDeck` (Phase 2), but calls `FusionScorer.evaluateHand` instead of `referenceEvaluateHand`. Since `FusionScorer` was validated against the reference in Phase 3, this avoids duplicating evaluator logic. Tested by comparing output against `referenceScoreDeck` on the same decks.

```
function exactScore(deck[40], buf) -> number:
  totalAtk = 0
  for a = 0 to 35:
    for b = a+1 to 36:
      for c = b+1 to 37:
        for d = c+1 to 38:
          for e = d+1 to 39:
            hand = [deck[a], deck[b], deck[c], deck[d], deck[e]]
            totalAtk += scorer.evaluateHand(hand, buf)
  return totalAtk / 658_008
```

All C(40,5) = 658,008 hands. At ~1us/hand → ~660ms per deck.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/scoring/exact-scorer.ts` | Exhaustive combinatorial deck scorer using `FusionScorer` |

---

## 5.2 Public API

V1 is fully synchronous — nothing in the pipeline requires async. Phase 6 (Web Workers) will introduce async when there's actually an event loop to coordinate workers.

`AbortSignal` is also deferred to Phase 6: the SA optimizer uses `deadline: number` checked via `performance.now()` every 64 iterations, and `AbortSignal` cannot fire during synchronous tight loops in Bun/V8.

```ts
export function optimizeDeck(
  collection: Collection,
  options?: { timeLimit?: number }
): {
  deck: number[]
  expectedAtk: number
  initialScore: number
  improvement: number
  elapsedMs: number
}
```

Entry point that:
1. Initializes buffers (Phase 1)
2. Computes initial scores (Phase 3)
3. Runs SA optimizer (Phase 4) with `deadline = performance.now() + timeLimit - 5000`
4. Exact-scores the best deck (§5.1) for accurate reporting
5. Returns the best deck

### File to Modify

| File | Purpose |
|------|---------|
| `src/engine/index.ts` | Public API entry point |

---

## 5.3 Edge Case Handling

Per SPEC §6.5 and §7.2:

| Edge Case | Handling |
|-----------|----------|
| Empty initial deck | Auto-generate via greedy sort |
| Wrong-sized initial deck | Discard and auto-generate |
| Collection = exactly 40 cards | One valid deck, return immediately |
| Only one card type | Fill deck with max copies + next-best |
| No fusions possible | Scoring degenerates to max base ATK |
| All cards ATK 0 | Score = 0, return valid deck |
| Collection < 40 total cards | Throw error (precondition violation) |

---

## 5.4 Tests

F1–F5 (fusion rules) and S6 (determinism) are already covered by `fusion-scorer.test.ts` and `reference-scorer.test.ts` in Phases 2–3. Phase 5 tests focus on the new code: exact scorer and public API integration.

Note: `buf.handScores` is stale after `SAOptimizer.run()` returns (the best deck is restored but `handScores` reflects the last iteration's deck). This is fine because the exact scorer recomputes from scratch, but tests and future code must not rely on `handScores` post-SA.

| Test | Validates |
|------|-----------|
| `exact scorer counts all hands` | Returns exactly 658,008 evaluations |
| `exact scorer matches reference deck scorer` | Production exact scorer agrees with Phase 2 reference deck scorer |
| `exact scorer determinism` | Same deck → same score |
| `public API valid output (O1)` | 40 cards, within collection, valid IDs |
| `public API respects time limit` | Completes within specified time |
| `public API non-regression (O2)` | Output score >= initial score |
| `public API improves weak decks (O3)` | Bad deck + good collection → improvement |
| `public API respects collection (O4)` | Never exceeds owned quantities |
| `public API throws on < 40 cards` | Collection too small → error thrown |
| `S1: zero deck` | Empty deck scores 0 |
| `S2: single card type` | 40x same card → score = card ATK |
| `S3: score bounds` | min_ATK <= score <= max_achievable_ATK |

---

## 5.5 Success Criteria

1. All tests pass (no duplicated F1–F5/S6 tests from earlier phases).
2. Exact scorer completes in <700ms per deck.
3. Exact scorer matches reference deck scorer (Phase 2) on all deck fixtures.
4. Public API produces valid, optimized decks (synchronous, no AbortSignal).
5. End-to-end completes within 60s.
6. `bun typecheck`, `bun lint` and `bun run test` pass.

---

## Implementation Notes

**All criteria met.** 126 tests pass, typecheck and lint clean.

### Files Created
- `src/engine/scoring/exact-scorer.ts` — exhaustive C(40,5) scorer using FusionScorer
- `src/engine/scoring/exact-scorer.test.ts` — matches reference scorer, determinism
- `src/engine/index.test.ts` — integration tests (O1–O4, S1–S3, time limit, error)

### Files Modified
- `src/engine/index.ts` — public `optimizeDeck()` API replacing placeholder `ping()`
- `src/engine/smoke.test.ts` — updated to test new export
- `src/ui/App.tsx` — removed stale `ping()` import

### Bugs Fixed During Implementation
- **`buildInitialDeck` single-pass bug** (`src/engine/data/initial-deck.ts`): only visited each card once, leaving unfilled deck slots as card 0 with inconsistent `cardCounts` (Uint8Array underflow on swap). Added pass 2 that relaxes MAX_COPIES to fill remaining slots, consistent with the SA optimizer's `availableCounts` bound.
- **Noisy `console.warn` in `buildFusionTable`** (`src/engine/data/build-fusion-table.ts`): kind-based material gaps (e.g. `[blue]Reptile`, `MothInsect`) are expected when the RP mod lacks cards of that kind and are skipped. Name-based gaps follow the runtime rule: unresolved non-monster materials from the card CSV are ignored, while unresolved monster names still warn so real data issues stay visible.
