# Phase 3: CRN Delta Evaluator & Initial Scoring

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Build the CRN-based delta evaluator that efficiently rescores only the ~1,875 affected hands when a single deck slot is swapped, and wire up initial score computation. This is the key to making each optimizer iteration O(1,875) instead of O(15,000).

**Depends on:** Phase 1 (buffers, CSR reverse lookup), Phase 2 (FusionScorer).

---

## 3.1 Delta Evaluator Design

The delta evaluator uses the Correlated Random Numbers (CRN) technique: the same 15,000 pre-sampled hands are reused across all iterations. When a deck slot changes, only hands containing that slot need rescoring.

### Two-Phase Commit

Separating `computeDelta` and `commitDelta` means rejected moves cost zero writes:

1. **`computeDelta`**: Iterate affected hands, compute new scores, store in pending buffer, return total delta.
2. **`commitDelta`**: Write pending scores into `handScores`. Only called on accepted moves.
3. **Reject path**: Do nothing — `handScores` remains unchanged.

### Pre-Allocated Internal Buffers

```ts
pendingScores: Int16Array(NUM_HANDS)  // new score per affected hand
pendingIds: Uint16Array(NUM_HANDS)     // which hand IDs were updated
pendingCount: number                    // how many pending
handBuf: Uint16Array(5)                // reusable hand buffer for scorer
```

All allocated once in constructor, reused forever.

### Algorithm

```
computeDelta(deck, slotIndex, handSlots, handScores,
             affectedHandIds, affectedHandOffsets, affectedHandCounts,
             fusionTable, cardAtk, scorer) -> delta:

  offset = affectedHandOffsets[slotIndex]
  count = affectedHandCounts[slotIndex]
  delta = 0
  pendingCount = 0

  for i = 0 to count-1:
    handId = affectedHandIds[offset + i]

    // Fill hand buffer from deck using hand slot indices
    base = handId * 5
    for j = 0 to 4:
      handBuf[j] = deck[handSlots[base + j]]

    newScore = scorer.evaluateHand(handBuf, fusionTable, cardAtk)
    oldScore = handScores[handId]
    delta += (newScore - oldScore)

    pendingIds[pendingCount] = handId
    pendingScores[pendingCount] = newScore
    pendingCount++

  return delta

commitDelta(handScores):
  for i = 0 to pendingCount-1:
    handScores[pendingIds[i]] = pendingScores[i]
  pendingCount = 0
```

---

## 3.2 Initial Score Computation

After the deck and hand pool are built, compute initial `handScores`:

```
for h = 0 to NUM_HANDS - 1:
  fill handBuf[0..4] = deck[handSlots[h*5 + j]] for j in 0..4
  handScores[h] = scorer.evaluateHand(handBuf, fusionTable, cardAtk)
```

This is called once at initialization and again if the deck is ever fully reset (e.g., restart strategy).

---

## 3.3 Files to Create

| File | Purpose |
|------|---------|
| `src/engine/scoring/delta-evaluator.ts` | CRN delta evaluator implementing `IDeltaEvaluator` |
| `src/engine/scoring/compute-initial-scores.ts` | Initial handScores computation |

---

## 3.4 Tests

| Test | Validates |
|------|-----------|
| `zero delta on identity swap` | Swapping a card with itself → delta === 0 |
| `commit updates handScores` | After commitDelta, affected entries match new values |
| `no mutation on reject` | Skipping commitDelta → handScores unchanged |
| `delta magnitude` | Known swap with known ATK difference → expected delta |
| `only affected hands rescored` | Hands not containing the swapped slot remain unchanged |
| `pendingCount reset after commit` | Second computeDelta doesn't carry stale pending state |
| `initial scores match full rescore` | Initial computation matches hand-by-hand verification |

---

## 3.5 Success Criteria

1. All tests pass.
2. Delta evaluation correctly handles ~1,875 affected hands per swap.
3. Two-phase commit: rejected moves produce zero writes.
4. Zero allocations in hot path.
5. `computeDelta` at >5K ops/sec (target for optimizer throughput).
6. Implements `IDeltaEvaluator` — works with any `IScorer`.
