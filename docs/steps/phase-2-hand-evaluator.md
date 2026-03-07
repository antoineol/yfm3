# Phase 2: Fusion-Chain Hand Evaluator

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Implement the real `IScorer` — a DFS evaluator that finds the maximum ATK achievable from 5 cards, considering fusion chains up to 3 deep (4 materials consumed). Completely zero-allocation in the hot path.

**Depends on:** Phase 1 (fusion table, cardAtk).

---

## 2.1 Overview

The current scorer just returns the highest base ATK among 5 cards. The real scorer must explore all possible fusion chains to find the maximum achievable ATK.

A fusion chain:
1. Pick any pair of cards in hand
2. If they fuse, the result replaces both materials (hand shrinks by 1)
3. The result can fuse again with remaining cards (chain continues)
4. Chains go up to 3 fusions deep (4 materials consumed from 5-card hand)

Fusion results are regular cards — they retain all attributes (name, kinds, color) and can participate in further fusions exactly like base cards (see SPEC §4).

---

## 2.2 Pre-Allocated Stack Buffer

```ts
stackBuffer: Int16Array(3 * 5)    // card IDs at each DFS level (stride-5)
```

Level layout (hand shrinks each fusion, stride-5 addressing via `level * 5`):
| Level | Cards | Slice (`level*5`) | Max pairs |
|-------|-------|--------------------|-----------|
| 0 | 5 | [0..4] | C(5,2) = 10 |
| 1 | 4 | [5..8] | C(4,2) = 6 |
| 2 | 3 | [10..12] | C(3,2) = 3 |

---

## 2.3 Algorithm

```
evaluateHand(hand[5], fusionTable, cardAtk) -> maxAtk:
  Copy hand into stackBuffer[0..4]
  maxAtk = max(cardAtk[hand[i]] for i in 0..4)

  DFS(level=0, handSize=5):
    for i = 0 to handSize-2:
      for j = i+1 to handSize-1:
        cardA = stackBuffer[level*5 + i]
        cardB = stackBuffer[level*5 + j]

        result = fusionTable[cardA * 722 + cardB]
        if result == FUSION_NONE: continue

        resultAtk = cardAtk[result]
        if resultAtk > maxAtk: maxAtk = resultAtk

        newHandSize = handSize - 1
        if newHandSize < 2 || level + 1 > 2: continue

        // Copy remaining cards + result into next level
        nextBase = (level+1) * 5
        write = 0
        for k = 0 to handSize-1:
          if k != i and k != j:
            stackBuffer[nextBase + write] = stackBuffer[level*5 + k]
            write++
        stackBuffer[nextBase + write] = result

        DFS(level+1, newHandSize)

  return maxAtk
```

Key details:
- **Depth guard:** `level + 1 > 2` prevents recursion beyond level 2 (enforcing F4: max 3 fusions).
- **Single table lookup:** `fusionTable[cardA * 722 + cardB]` — no special handling for fusion results (per SPEC §4, fusion results are regular cards).
- **maxAtk update before recursion:** Captures the best result even if the chain doesn't continue.

---

## 2.4 Fusion Results as Materials

Per the official FM Remastered Perfected rules, fusion results are regular cards that retain all their attributes. No special handling is needed — the single `fusionTable` lookup works for both base cards and fusion results.

Classic example: Thunder + Dragon → Thunder Dragon, then Thunder Dragon + Dragon → Twin-Headed Thunder Dragon. The intermediate result (Thunder Dragon) participates in the second fusion via its Dragon kind, exactly like a base card.

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
| `chain depth limit (F4)` | 4th fusion is NOT attempted (max 3 fusions enforced) |
| `fusion result re-fuse by kind` | Fusion result CAN re-fuse via its kind (e.g., Thunder Dragon as Dragon) |
| `best chain selected` | When multiple chains possible, highest ATK wins |
| `strict improvement` | Result ATK <= material ATK → no fusion |
| `commutativity` | Same hand in any permutation → same result |
| `determinism` | Same input → same output every time |
| `zero allocations` | No GC pressure during evaluation (benchmark) |

---

## 2.7 Success Criteria

1. All tests pass.
2. Correctly handles fusion chain depths 0, 1, 2, 3 (meaning 0–3 fusions).
3. Zero allocations in hot path.
4. Per-hand evaluation ~1μs average.
5. Drop-in replacement for the placeholder scorer (implements `IScorer`).
