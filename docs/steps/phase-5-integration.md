# Phase 5: Exact Refinement & Integration

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Score the SA result with exhaustive combinatorial evaluation for accurate reporting, and wire everything into the public API.

**Depends on:** Phase 3 (scorer), Phase 4 (SA optimizer).

---

## 5.1 Exact Combinatorial Scoring

MC scores have sampling noise (~2.3% sample of all hands). The exact evaluator eliminates this by scoring every possible hand, giving the user an accurate expected ATK.

```
function exactScore(deck[40], scorer, fusionTable, cardAtk) -> number:
  totalAtk = 0
  for a = 0 to 35:
    for b = a+1 to 36:
      for c = b+1 to 37:
        for d = c+1 to 38:
          for e = d+1 to 39:
            hand = [deck[a], deck[b], deck[c], deck[d], deck[e]]
            totalAtk += scorer.evaluateHand(hand, fusionTable, cardAtk)
  return totalAtk / 658_008
```

All C(40,5) = 658,008 hands. At ~1us/hand → ~660ms per deck.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/scoring/exact-scorer.ts` | Exhaustive combinatorial deck scorer |

---

## 5.2 Public API

```ts
export async function optimizeDeck(
  collection: Collection,
  options?: { timeLimit?: number; signal?: AbortSignal }
): Promise<{
  deck: number[]
  expectedAtk: number
  initialScore: number
  improvement: number
  elapsedMs: number
}>
```

Entry point that:
1. Initializes buffers (Phase 1)
2. Computes initial scores (Phase 3)
3. Runs SA optimizer (Phase 4) with `AbortSignal.timeout(timeLimit - 5000)`
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
| Collection < 40 total cards | Return error |
| Cancellation (AbortSignal) | Return best valid deck found so far |

---

## 5.4 Tests

| Test | Validates |
|------|-----------|
| `exact scorer counts all hands` | Returns exactly 658,008 evaluations |
| `exact scorer matches reference deck scorer` | Production exact scorer agrees with Phase 2 reference deck scorer |
| `exact scorer determinism` | Same deck → same score |
| `public API valid output` | 40 cards, within collection, valid IDs |
| `public API respects time limit` | Completes within specified time |
| `public API non-regression` | Output score >= initial score |
| `cancellation returns best so far` | Abort mid-run → still valid deck |
| **SPEC validation matrix** | |
| `S1: zero deck` | Empty deck scores 0 |
| `S2: single card type` | 40x same card → score = card ATK |
| `S3: score bounds` | min_ATK <= score <= max_achievable_ATK |
| `S6: determinism` | Same input → same output |
| `O1: valid output` | 40 cards, within bounds, valid IDs |
| `O2: non-regression` | finalScore >= initialScore |
| `O3: improves weak decks` | Bad deck + good collection → improvement |
| `O4: respects collection` | Never exceeds owned quantities |
| `F1: name priority` | Name-name > kind-kind |
| `F2: strict improvement` | No fusion if result ATK <= material ATK |
| `F3: commutativity` | fuse(A,B) == fuse(B,A) |
| `F4: chain depth limit` | Max 3 fusions (4 materials) |
| `F5: fusion results are regular` | Fusion results can re-fuse using all attributes (name, kinds, color) |

---

## 5.5 Success Criteria

1. All tests pass, including full SPEC validation matrix.
2. Exact scorer completes in <700ms per deck.
3. Exact scorer matches reference deck scorer (Phase 2) on all deck fixtures.
4. Public API produces valid, optimized decks.
5. End-to-end completes within 60s.
6. `bun lint` and `bun test` pass.
