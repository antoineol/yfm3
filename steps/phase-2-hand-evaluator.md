# Phase 2: Fusion-Chain Hand Evaluator

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Implement the real `IScorer` — a DFS evaluator that finds the maximum ATK achievable from 5 cards, considering fusion chains up to 3 deep (4 materials). Completely zero-allocation in the hot path. ~100 LOC.

**Depends on:** Phase 1 (fusion table, cardAtk).

---

## 2.1 Overview

The current scorer just returns the highest base ATK among 5 cards. The real scorer must explore all possible fusion chains to find the maximum achievable ATK.

A fusion chain:
1. Pick any pair of cards in hand
2. If they fuse, the result replaces both materials (hand shrinks by 1)
3. The result can fuse again with remaining cards (chain continues)
4. Chains go up to 3 fusions deep (4 materials consumed from 5-card hand)

---

## 2.2 Pre-Allocated Stack Buffer

```ts
stackBuffer: Int16Array(5 * 5)    // card IDs at each DFS level
stackIsFused: Uint8Array(5 * 5)   // 1 if card is a fusion result
handBuf: Uint16Array(5)            // reusable hand buffer
```

Level layout (hand shrinks each fusion):
| Level | Cards | Slice | Max pairs |
|-------|-------|-------|-----------|
| 0 | 5 | [0..4] | C(5,2) = 10 |
| 1 | 4 | [5..8] | C(4,2) = 6 |
| 2 | 3 | [9..11] | C(3,2) = 3 |
| 3 | 2 | [12..13] | C(2,2) = 1 |

---

## 2.3 Algorithm

```
evaluateHand(hand[5], fusionTable, cardAtk) -> maxAtk:
  Copy hand into stackBuffer[0..4], stackIsFused[0..4] = 0
  maxAtk = max(cardAtk[hand[i]] for i in 0..4)

  DFS(level=0, handSize=5):
    for i = 0 to handSize-2:
      for j = i+1 to handSize-1:
        cardA = stackBuffer[level*5 + i]
        cardB = stackBuffer[level*5 + j]
        isFusedA = stackIsFused[level*5 + i]
        isFusedB = stackIsFused[level*5 + j]

        // Fusion result kind restriction (SPEC F5):
        // If either card is a fusion result, use name-only table
        result = lookupFusion(cardA, cardB, isFusedA, isFusedB)
        if result == FUSION_NONE: continue

        resultAtk = cardAtk[result]
        if resultAtk > maxAtk: maxAtk = resultAtk

        // Copy remaining cards + result into next level
        nextBase = (level+1) * 5
        write = 0
        for k = 0 to handSize-1:
          if k != i and k != j:
            stackBuffer[nextBase + write] = stackBuffer[level*5 + k]
            stackIsFused[nextBase + write] = stackIsFused[level*5 + k]
            write++
        stackBuffer[nextBase + write] = result
        stackIsFused[nextBase + write] = 1
        newHandSize = handSize - 1

        if newHandSize >= 2:
          DFS(level+1, newHandSize)

  return maxAtk
```

---

## 2.4 Handling Fusion Result Kind Restriction (SPEC F5)

Fusion results cannot re-fuse by their own kinds. Two approaches:

### Approach A: Dual Fusion Tables

Build **two** fusion tables in Phase 1:
- `fusionTableFull: Int16Array(722²)` — all fusions (name+name, name+kind, kind+kind)
- `fusionTableNameOnly: Int16Array(722²)` — only name-name and name-kind fusions

```
lookupFusion(cardA, cardB, isFusedA, isFusedB):
  if isFusedA || isFusedB:
    return fusionTableNameOnly[cardA * 722 + cardB]
  else:
    return fusionTableFull[cardA * 722 + cardB]
```

Memory cost: ~2 MB total. Single branch + one typed array read = O(1), zero-allocation.

### Phase 1 Adjustment

If using dual tables, Phase 1's fusion builder must produce both:
- `fusionTableFull`: all 3 priority passes
- `fusionTableNameOnly`: only pass 1 (name-name) and pass 2 (name-kind)

---

## 2.5 File to Create

| File | Purpose |
|------|---------|
| `src/engine/scoring/fusion-scorer.ts` | `FusionScorer` implementing `IScorer` — DFS fusion-chain evaluator |

---

## 2.6 Tests

| Test | Validates |
|------|-----------|
| `no-fusion hand` | Returns highest base ATK when no fusions possible |
| `single fusion` | Two cards fuse, result ATK returned |
| `2-fusion chain` | A+B→X, X+C→Y, returns ATK(Y) |
| `3-fusion chain` | Maximum depth chain works correctly |
| `best chain selected` | When multiple chains possible, highest ATK wins |
| `strict improvement` | Result ATK <= material ATK → no fusion |
| `fusion result kind restriction (F5)` | Result cannot re-fuse by its own kind |
| `fusion result name re-fuse (F5)` | Result CAN re-fuse by name |
| `commutativity` | Same hand in any permutation → same result |
| `determinism` | Same input → same output every time |
| `zero allocations` | No GC pressure during evaluation (benchmark) |

---

## 2.7 Success Criteria

1. All tests pass.
2. Correctly handles fusion chain depths 0, 1, 2, 3.
3. Respects SPEC F5 (fusion result kind restriction).
4. Zero allocations in hot path.
5. Per-hand evaluation ~1μs average.
6. Drop-in replacement for the placeholder scorer (implements `IScorer`).
