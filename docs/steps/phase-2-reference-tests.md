# Phase 2: Reference Scorer & Test Fixtures

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Build a maximally-accurate reference scorer that serves as the **ground truth** for evaluating every production component. Its scores are the objective metric against which hand evaluators, exact scorers, and optimizer output quality are all measured.

**Depends on:** Phase 1 (fusion table, cardAtk, buffers).

---

## 2.1 Motivation

Accuracy is the defining property. The reference scorer must be the most correct implementation possible — exhaustive, clear, and trustworthy. Its output is the number we believe unconditionally.

This matters at every phase boundary:

- **Phase 3 (Hand Evaluator):** Does the fast DFS scorer produce the same result as the reference for every hand? Any disagreement means a production bug.
- **Phase 4 (SA Optimizer):** Does the optimizer actually improve the deck? Score the output deck with the reference — if `referenceScore(optimizedDeck) >= referenceScore(initialDeck)`, the optimizer is working. If not, it's making things worse.
- **Phase 5 (Integration):** Does the production exact scorer match the reference deck scorer exactly? Any discrepancy means the production scorer has a bug.

Without a trusted reference, we'd have no way to tell whether a production scorer bug is silently under-counting fusions (producing suboptimal decks) or over-counting them (reporting inflated scores). The reference scorer eliminates this ambiguity.

**Design principles:**
- **Accuracy first:** Exhaustive search of every fusion path, no shortcuts. The algorithm is optimal for 5-card hands — the search space is bounded at C(5,2) × C(4,2) × C(3,2) = 180 paths maximum.
- **Structural independence:** Written with a different structure than the production DFS (standalone function, plain arrays, recursion vs. typed-array stack buffer) so bugs in one can't hide bugs in the other.
- **Fast enough for dev use:** Hand scoring is instant (<5μs/hand). Deck scoring takes ~2-6s — acceptable for fixture generation and occasional test-time use, not a bottleneck.

---

## 2.2 Reference Hand Scorer

Recursive evaluator that exhaustively explores every fusion path in a 5-card hand. Uses plain arrays and recursion — readable enough that correctness is verifiable by inspection.

```
referenceEvaluateHand(hand: number[], fusionTable, cardAtk) -> number:
  maxAtk = max(cardAtk[id] for id in hand)
  tryFusions(hand, 0)
  return maxAtk

  tryFusions(cards: number[], depth: number):
    if cards.length < 2: return
    if depth >= 3: return                    // F4: max 3 fusions
    for i = 0 to cards.length - 2:
      for j = i + 1 to cards.length - 1:
        result = fusionTable[cards[i] * 722 + cards[j]]
        if result == FUSION_NONE: continue
        resultAtk = cardAtk[result]
        if resultAtk <= cardAtk[cards[i]]: continue   // strict improvement
        if resultAtk <= cardAtk[cards[j]]: continue
        if resultAtk > maxAtk: maxAtk = resultAtk
        remaining = cards without cards[i] and cards[j], plus result
        tryFusions(remaining, depth + 1)
```

The search space per hand is bounded: at most 180 paths (10 × 6 × 3). This makes the per-hand cost negligible (~1-5μs) regardless of implementation style. Plain arrays and recursion are used for clarity, not because performance requires it — the algorithm is already optimal for this problem size.

---

## 2.3 Reference Deck Scorer

Enumerates all C(40,5) = 658,008 hands and averages the reference hand scorer results. This gives the **true expected ATK** of a deck — no sampling, no approximation.

```
referenceScoreDeck(deck: number[], fusionTable, cardAtk) -> number:
  totalAtk = 0
  hand = new Array(5)             // reused across all 658K iterations
  count = 0
  for a = 0 to 35:
    for b = a+1 to 36:
      for c = b+1 to 37:
        for d = c+1 to 38:
          for e = d+1 to 39:
            hand[0]=deck[a]; hand[1]=deck[b]; hand[2]=deck[c]
            hand[3]=deck[d]; hand[4]=deck[e]
            totalAtk += referenceEvaluateHand(hand, fusionTable, cardAtk)
            count++
  assert count == 658_008
  return totalAtk / count
```

Takes ~2-6s per deck depending on fusion density. Run at fixture-generation time, not on every test run.

---

## 2.4 Test Fixtures

Pre-computed at test-write time using the reference scorer against real game data. Each fixture captures a specific scenario with a **known-correct expected value** from the reference.

### Hand-level fixtures (~15 scenarios)

| # | Scenario | What it validates |
|---|----------|-------------------|
| 1 | No-fusion hand | 5 cards with no fusions possible, returns max base ATK |
| 2 | Single fusion | Exactly one pair fuses, result ATK returned |
| 3 | 2-chain | A+B->X, X+C->Y, returns ATK(Y) |
| 4 | 3-chain (max depth) | Maximum depth chain works, 4 materials consumed |
| 5 | 4th fusion not attempted | Hand where a 4th fusion would help but must not happen (F4) |
| 6 | Fusion result re-fuses by kind | e.g., Thunder Dragon re-fuses as Dragon (F5) |
| 7 | Multiple chains, best wins | Two possible chains, scorer picks highest ATK |
| 8 | Fusion strict improvement | Pair could fuse but result ATK <= material ATK, skipped |
| 9 | Commutativity | Same 5 cards in different order, same result |
| 10 | All cards identical | 5 copies of same card, no fusions possible |
| 11 | Diamond fusion graph | Multiple overlapping pairs, only one fusion can happen per card use |
| 12 | Chain with branching | After first fusion, two possible next fusions, best path wins |
| 13 | High-ATK no-fusion vs low-ATK chain | Chain result must beat the non-fusing high-ATK card |
| 14 | Name-name priority over kind-kind | Pair has both recipe types, name-name result used |
| 15 | Real game scenario | Known cards from FM (e.g., Thunder + Dragon chain) |

Each fixture is a `{ hand: number[], expectedMaxAtk: number, description: string }`.

### Deck-level fixtures (~3 scenarios)

| # | Scenario | What it validates |
|---|----------|-------------------|
| 1 | Greedy initial deck (all cards owned) | Baseline expected ATK for the strongest-ATK deck |
| 2 | Weak deck (low-ATK cards) | Low expected ATK, confirms scorer handles weak hands |
| 3 | Fusion-rich deck | Deck with many fusion pairs, higher expected ATK than greedy |

Each fixture is a `{ deck: number[], expectedAvgAtk: number, description: string }`.

### Fixture generation workflow

Fixture definitions live in `src/test/reference-fixture-defs.ts` (inputs only: card IDs + descriptions, no expected values).

**To generate or regenerate scored fixtures:**

```bash
bun run gen:ref
```

This runs `scripts/generate-fixtures.ts`, which:
1. Reads hand/deck definitions from `reference-fixture-defs.ts`
2. Scores each hand via `referenceEvaluateHand` (~instant)
3. Scores each deck via `referenceScoreDeck` (~0.1-6s each)
4. Writes `src/test/reference-fixtures.gen.ts` with expected values attached

**When to run `bun run gen:ref`:**
- Once during initial setup
- After changing game data (rp-cards.csv, rp-fusions1.csv)
- After changing the reference scorer logic
- After adding/editing fixture scenarios in `reference-fixture-defs.ts`

The generated file is committed to the repo. Unit tests (`bun run test`) read from it directly — fast, no scoring at test time.

---

## 2.5 Files

| File | Purpose |
|------|---------|
| `src/test/reference-scorer.ts` | `referenceEvaluateHand` and `referenceScoreDeck` — exhaustive recursive implementations, optimized for correctness |
| `src/test/reference-fixture-defs.ts` | Fixture definitions: hand/deck card IDs + descriptions (no expected values) |
| `src/test/reference-fixtures.gen.ts` | **Generated** — scored fixtures with expected values (committed to repo) |
| `src/test/reference-scorer.test.ts` | Fast unit tests: hand fixtures, self-consistency, structural checks |
| `scripts/generate-fixtures.ts` | Generation script: reads defs, runs reference scorer, writes `.gen.ts` |

---

## 2.6 Tests

### Reference scorer self-consistency

| Test | Validates |
|------|-----------|
| `commutativity` | Same hand in any permutation -> same result |
| `determinism` | Same input -> same output every time |
| `no-fusion baseline` | Hand with no fusions returns max base ATK |
| `depth limit` | 4th fusion is never attempted |
| `strict improvement` | Fusion skipped when result ATK <= material ATK |
| `agrees with MaxAtkScorer on no-fusion hands` | When no fusions exist, reference scorer matches the placeholder scorer |

### Fixture validation (`bun run test`)

| Test | Validates |
|------|-----------|
| `all hand fixtures produce expected values` | Reference scorer matches pre-computed expected ATK for each hand fixture |
| `fixture hands use valid card IDs` | All card IDs in fixtures exist in game data |
| `fixture decks are valid` | 40 cards, valid IDs, within collection bounds |

### Fixture regeneration (`bun run gen:ref`)

| Check | Validates |
|-------|-----------|
| Script prints scores for all fixtures | Reference scorer computes and writes expected values for all hand and deck fixtures |

---

## 2.7 Usage in Later Phases

The reference scorer is the objective evaluation metric at every phase boundary.

### Phase 3 (Hand Evaluator) — Correctness
The fast DFS scorer must produce identical results to the reference on every fixture:
```ts
for (const fixture of handFixtures) {
  expect(fusionScorer.evaluateHand(fixture.hand, buf)).toBe(fixture.expectedMaxAtk);
}
```

### Phase 4 (SA Optimizer) — Quality
The optimizer must actually improve deck quality, measured by the reference:
```ts
const initialScore = referenceScoreDeck(initialDeck, buf.fusionTable, buf.cardAtk);
const optimizedScore = referenceScoreDeck(optimizedDeck, buf.fusionTable, buf.cardAtk);
expect(optimizedScore).toBeGreaterThanOrEqual(initialScore);
```

### Phase 5 (Integration) — Accuracy
The production exact scorer must match the reference exactly:
```ts
for (const fixture of deckFixtures) {
  expect(exactScorer.score(fixture.deck, buf)).toBeCloseTo(fixture.expectedAvgAtk);
}
```

---

## 2.8 Success Criteria

1. All tests pass.
2. Reference scorer is readable and verifiable by inspection.
3. Reference scorer is structurally independent from the production DFS.
4. At least 15 hand fixtures and 3 deck fixtures with reference-computed values.
5. Fixture values are stable (deterministic, reproducible).
6. `bun lint` and `bun run test` pass.

---

## 2.9 Implementation Notes

**Status: COMPLETE**

- 16 hand fixtures and 3 deck fixtures created.
- Fusion-only cards (results only in rp-fusions1.csv) are registered with gap IDs in 1..721 by `registerFusionOnlyCards` in `load-game-data.ts`. This enables chain fusions through intermediate fusion-only cards.
- In real game data, no 5-card hand benefits from a 4th fusion beyond what 3 fusions achieve (exhaustive search confirmed). The depth limit is structurally verified by the 3-chain fixture.
- Deck scores: greedy=3301.1, weak=2597.3, fusion-rich=3097.4.
