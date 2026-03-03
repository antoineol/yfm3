# Phase 2: Zero-Allocation 5-Card Hand Evaluator

This phase is one of the implementation step of the plan in PLAN.md file.

**Goal:** Implement the real `IScorer` — the fusion-chain-aware hand evaluator that computes the maximum achievable ATK from any 5-card hand. This is the computational nucleus of the entire system. It must be **completely zero-allocation** in its hot path.

**Depends on:** Phase 0 (IScorer interface), Phase 1 (fusionTable, cardAtk, isFusionResult).

---

## 2.1 Architecture: Stack-Based DFS Without Recursion

The hand evaluator simulates all possible fusion chains up to depth 3 (consuming up to 4 cards). It uses a pre-allocated flat `Int16Array` as an explicit stack instead of function recursion to avoid stack frame allocations.

### Files to Create

| File | Purpose |
|------|---------|
| `src/scoring/fusion-scorer.ts` | `FusionScorer` implementing `IScorer` — the real hand evaluator |
| `src/scoring/fusion-delta-scorer.ts` | `FusionDeltaScorer` implementing `IDeltaScorer` — wraps FusionScorer for delta evaluation |

---

## 2.2 Pre-Allocated Stack Buffer

At construction time, `FusionScorer` allocates a flat buffer for DFS traversal:

```ts
// Pre-allocated at construction — NEVER reallocated
private readonly stackCards: Int16Array;     // card IDs at each DFS level
private readonly stackIsFused: Uint8Array;   // 1 if card at this position is a fusion result
private readonly handBuf: Uint16Array;       // reusable 5-element hand buffer
```

### Stack Layout

The DFS operates on shrinking "remaining cards" arrays at each fusion level:

| Level | Cards remaining | Slice in stackCards | Max pairs to check |
|-------|----------------|--------------------|--------------------|
| 0 (entry) | 5 cards | `[0..4]` | C(5,2) = 10 |
| 1 (after 1 fusion) | 4 cards | `[5..8]` | C(4,2) = 6 |
| 2 (after 2 fusions) | 3 cards | `[9..11]` | C(3,2) = 3 |
| 3 (after 3 fusions) | 2 cards | `[12..13]` | C(2,2) = 1 |

Total buffer: `Int16Array(14)` for card IDs, `Uint8Array(14)` for fused flags.

---

## 2.3 Evaluation Algorithm

```
evaluateHand(hand, fusionTable, cardAtk) -> number:

  // 1. Initialize level 0 with the 5 hand cards
  for i = 0 to 4:
    stackCards[i] = hand[i]
    stackIsFused[i] = 0

  maxAtk = 0

  // 2. Check base ATK of all 5 cards
  for i = 0 to 4:
    atk = cardAtk[stackCards[i]]
    if atk > maxAtk: maxAtk = atk

  // 3. DFS through fusion levels
  maxAtk = dfsLevel(0, 5, maxAtk, fusionTable, cardAtk)

  return maxAtk
```

### DFS at Each Level

```
dfsLevel(levelOffset, numCards, maxAtk, fusionTable, cardAtk) -> number:

  if numCards < 2: return maxAtk

  // Try all pairs (i, j) where i < j
  for i = 0 to numCards - 2:
    for j = i + 1 to numCards - 1:
      cardA = stackCards[levelOffset + i]
      cardB = stackCards[levelOffset + j]
      isFusedA = stackIsFused[levelOffset + i]
      isFusedB = stackIsFused[levelOffset + j]

      // Apply fusion result kind restriction (SPEC F5):
      // If cardA is a fusion result, it can only match by NAME.
      // If cardB is a fusion result, it can only match by NAME.
      // The fusionTable already encodes name+kind matches,
      // so we need a SEPARATE lookup that distinguishes match types.
      // (See Section 2.4 for the fusionMatchType approach.)

      resultId = lookupFusion(cardA, cardB, isFusedA, isFusedB, fusionTable)
      if resultId === FUSION_NONE: continue

      resultAtk = cardAtk[resultId]

      // Strict improvement check
      if resultAtk <= cardAtk[cardA] || resultAtk <= cardAtk[cardB]: continue

      if resultAtk > maxAtk: maxAtk = resultAtk

      // Build next level: copy remaining cards + fusion result
      nextOffset = levelOffset + numCards  // computed from level layout
      writeIdx = 0
      for k = 0 to numCards - 1:
        if k !== i && k !== j:
          stackCards[nextOffset + writeIdx] = stackCards[levelOffset + k]
          stackIsFused[nextOffset + writeIdx] = stackIsFused[levelOffset + k]
          writeIdx++
      stackCards[nextOffset + writeIdx] = resultId
      stackIsFused[nextOffset + writeIdx] = 1  // this is a fusion result
      writeIdx++

      // Recurse to next level
      maxAtk = dfsLevel(nextOffset, writeIdx, maxAtk, fusionTable, cardAtk)

  return maxAtk
```

---

## 2.4 Handling the Fusion Result Kind Restriction (SPEC F5)

This is the trickiest correctness issue. The fusionTable from Phase 1 encodes ALL fusions (name-name, name-kind, kind-kind) in a single flat lookup. But when a card is a fusion intermediate, it can only fuse via name-based matches (rules 1 and 2 from SPEC Section 4), NOT kind-kind.

### Approach: Dual Fusion Tables

Create **two** fusion tables during Phase 1:

1. **`fusionTableFull: Int16Array(722 * 722)`** — All fusions (name-name, name-kind, kind-kind). Used when NEITHER card is a fusion result.
2. **`fusionTableNameOnly: Int16Array(722 * 722)`** — Only name-name and name-kind fusions. Used when at LEAST ONE card is a fusion result.

The `lookupFusion` function then becomes:

```
lookupFusion(cardA, cardB, isFusedA, isFusedB):
  if isFusedA || isFusedB:
    return fusionTableNameOnly[cardA * 722 + cardB]
  else:
    return fusionTableFull[cardA * 722 + cardB]
```

This is a single branch + one typed array read — still O(1) and zero-allocation.

**Memory cost:** Two tables of `722 * 722 * 2 bytes = ~1 MB each`, ~2 MB total. Acceptable.

### Phase 1 Adjustment

Phase 1's fusion-db.ts must now build BOTH tables:
- `fusionTableFull`: all 3 priority passes.
- `fusionTableNameOnly`: only pass 1 (name-name) and pass 2 (name-kind).

---

## 2.5 FusionDeltaScorer (`src/scoring/fusion-delta-scorer.ts`)

Identical structure to `MaxAtkDeltaScorer` from Phase 0, but uses `FusionScorer` instead. This is a thin wrapper — the delta logic itself (iterate affected hands, compute new scores, track pending updates) is identical.

Consider making a generic `BaseDeltaScorer` that accepts any `IScorer` and implements `IDeltaScorer`. The dummy and fusion variants are then just `new BaseDeltaScorer(dummyScorer)` vs `new BaseDeltaScorer(fusionScorer)`.

---

## 2.6 Tests

### File to Create

| File | Purpose |
|------|---------|
| `tests/phase2.test.ts` | Exhaustive tests for the FusionScorer |

| Test | Validates |
|------|-----------|
| `No fusions: returns max base ATK` | Hand of 5 non-fusing cards returns highest ATK |
| `Single fusion: 2-material` | A+B fuse to X; returns X's ATK if X > A and X > B |
| `Strict improvement enforced` | A+B would fuse to X, but X.atk <= A.atk; no fusion occurs |
| `3-material chain` | A+B→X, X+C→Y; returns Y's ATK |
| `4-material chain` | A+B→X, X+C→Y, Y+D→Z; returns Z's ATK |
| `Chain depth limit` | No 5-material chain (only 4 cards can be consumed from a 5-card hand) |
| `Fusion result kind restriction` | X (fusion result) has kind Dragon; X+E should NOT fuse via kind-kind, only via name |
| `Commutativity` | evaluateHand([A,B,C,D,E]) == evaluateHand([B,A,C,D,E]) for all permutations |
| `Determinism` | Same hand, same tables → same result, every time |
| `Best chain selected` | When multiple chains exist, the one yielding highest ATK wins |
| `Name-name priority` | Name match overrides kind match for same pair |
| `Color-qualified match` | [Blue] Fairy ingredient only matches blue fairies |
| `IScorer interface compliance` | FusionScorer passes all Phase 0 IScorer contract tests |

### Known Edge Cases to Test

- Hand where all 5 cards can fuse in multiple orders — must find the global max.
- Hand where a 2-material fusion gives ATK 2000, but a 3-material chain gives ATK 2500 — must return 2500.
- Hand where a fusion result could re-fuse by kind (should be BLOCKED by F5).
- Hand where a fusion result re-fuses by name (should be ALLOWED by F5).

---

## 2.7 Benchmarks

Update `src/bench/bench-scorer.ts` to benchmark `FusionScorer` alongside `MaxAtkScorer`:

| Benchmark | Target |
|-----------|--------|
| `FusionScorer.evaluateHand` (no fusions possible) | >2M ops/sec |
| `FusionScorer.evaluateHand` (avg ~2 fusions per hand) | >500K ops/sec |
| `FusionScorer.evaluateHand` (dense fusions, 4-deep chains) | >200K ops/sec |
| `FusionDeltaScorer.computeDelta` (real scorer, ~1875 hands) | >5K ops/sec |

Multiply `computeDelta` target by the 55-second budget: 5,000 × 55 = **275,000 optimizer iterations** minimum with real scoring. This is the throughput floor.

---

## 2.8 Success Criteria

1. All Phase 2 tests pass.
2. `FusionScorer` implements `IScorer` — drop-in replacement for `MaxAtkScorer`.
3. `FusionDeltaScorer` implements `IDeltaScorer` — drop-in replacement for `MaxAtkDeltaScorer`.
4. The optimizer from Phase 0 (`RandomSwapOptimizer`) works unchanged with the new scorer/deltaScorer.
5. Zero heap allocations in `evaluateHand` hot path (verified via benchmark stability — no GC spikes).
6. All SPEC fusion resolution properties (F1–F5) pass dedicated tests.
7. Dual fusion table approach correctly blocks kind-kind matches for fusion intermediates.

---

## 2.8 File Tree Additions After Phase 2

```
src/
  scoring/
    fusion-scorer.ts
    fusion-delta-scorer.ts    (or: base-delta-scorer.ts used by both dummy and fusion)
tests/
  phase2.test.ts
```
