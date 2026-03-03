# Phase 5: Integration, Edge Cases & Final Validation

This phase is one of the implementation step of the plan in PLAN.md file.

**Goal:** Bring everything together into a production-ready system. Handle all edge cases from the SPEC, build the public API surface, run the full SPEC validation matrix, and perform final performance tuning.

**Depends on:** Phases 0–4 (everything).

---

## 5.1 Files to Create

| File | Purpose |
|------|---------|
| `src/index.ts` | Public API entry point |
| `src/validation/deck-validator.ts` | Validates deck constraints (size, bounds, valid IDs) |
| `src/validation/invariants.ts` | Runtime invariant checks for development/debug mode |
| `tests/spec-validation.test.ts` | Full SPEC property validation matrix |
| `tests/edge-cases.test.ts` | Edge case scenarios from SPEC Section 6.6 |
| `tests/e2e.test.ts` | End-to-end integration tests with real game data |

---

## 5.2 Public API (`src/index.ts`)

```ts
export interface OptimizerInput {
  /** Raw card database (format TBD — JSON or typed) */
  cardDatabase: CardData[];
  /** Raw fusion recipe database */
  fusionRecipes: FusionRecipe[];
  /** Player's collection: cardId -> quantity owned */
  collection: Map<number, number> | Record<number, number>;
  /** Optional starting deck (40 card IDs). Auto-generated if missing/invalid. */
  initialDeck?: number[];
}

export interface OptimizerOutput {
  /** The optimized 40-card deck (card IDs) */
  deck: number[];
  /** Exact expected maximum ATK score */
  score: number;
  /** Score of the input/initial deck for comparison */
  initialScore: number;
  /** score - initialScore */
  improvement: number;
  /** Execution metrics */
  metrics: {
    elapsedMs: number;
    totalIterations: number;
    numWorkers: number;
    candidatesScored: number;
  };
}

/**
 * Run the deck optimizer.
 * @param input - Card data, fusions, collection, optional initial deck.
 * @param signal - Optional AbortSignal for cancellation.
 * @returns The optimized deck and scoring details.
 */
export async function optimizeDeck(
  input: OptimizerInput,
  signal?: AbortSignal,
): Promise<OptimizerOutput>;
```

### Implementation

`optimizeDeck` is the thin orchestration shell:

```
1. Validate input (card IDs exist, collection is non-empty, etc.)
2. Build typed arrays from raw data (Phase 1 functions)
3. Validate or auto-generate initial deck (Phase 1)
4. Compute initial score via exact scorer (Phase 4)
5. Run orchestrator (Phase 4) — spawns workers, waits, gathers results
6. Validate output deck (deck-validator)
7. Assert non-regression (output score >= initial score)
8. Convert typed arrays back to plain JS arrays for the public API
9. Return OptimizerOutput
```

---

## 5.3 Deck Validator (`src/validation/deck-validator.ts`)

Enforces SPEC Section 6.4 hard constraints:

```ts
export function validateDeck(
  deck: Int16Array | number[],
  availableCounts: Uint8Array,
  cardAtk: Int16Array,
): { valid: boolean; errors: string[] };
```

Checks:
1. **Size:** Exactly 40 cards.
2. **Collection bounds:** For each card, count in deck <= `availableCounts[cardId]`.
3. **Valid IDs:** Every card ID is in [0, MAX_CARD_ID) and has a non-zero entry in `cardAtk` (i.e., exists in the database).
4. **No negatives:** No card ID < 0.

---

## 5.4 Edge Case Handling

From SPEC Section 6.6 and 7.2 (O6):

| Edge Case | How to Handle |
|-----------|---------------|
| **Empty initial deck** | Auto-generate via greedy sort (Phase 1). |
| **Wrong-sized initial deck** | Discard and auto-generate. Log a warning. |
| **Collection = exactly 40 cards** | Only one valid deck exists. Optimizer should converge immediately and return it. |
| **Only one card type** | Deck is 40 copies (or fewer if capped at 3). Fill remainder with next-best. |
| **No fusions possible** | Scoring degenerates to max(cardAtk[hand[i]]). Optimizer still improves by picking high-ATK cards. |
| **All cards have ATK 0** | Score = 0. Valid but degenerate. Return a valid 40-card deck anyway. |
| **Collection has < 40 total cards** | Cannot build a valid deck. Return an error. |
| **Cancellation (AbortSignal)** | Return best valid deck found so far. If no iteration completed, return initial deck. |

---

## 5.5 SPEC Validation Matrix (`tests/spec-validation.test.ts`)

Systematically test every property from SPEC Section 7.

### Scoring Properties (S1–S9)

| Test ID | Property | Test Strategy |
|---------|----------|---------------|
| S1 | Zero deck | `exactScorer.score(emptyDeck) === 0` |
| S2 | Single card type | 40x same card → score equals card ATK |
| S3 | Score bounds | `minAtk <= score <= maxAchievableAtk` for 100 random decks |
| S4 | Monotonicity | Replace weakest non-fusing card with higher ATK non-fusing card → score doesn't decrease |
| S5 | Fusion bonus | Compare deck with fusion pair vs same deck with non-fusing equivalents |
| S6 | Determinism | Score same deck 10 times → all identical |
| S7 | Probability sanity | Sum of `P(A is max)` over all A equals 1.0 (within floating-point tolerance) |
| S8 | More copies = higher chance | Add more copies of a card → probability of drawing it increases |
| S9 | High-card replacement | Replace any card with card of ATK >= max achievable → score doesn't decrease |

### Optimization Properties (O1–O6)

| Test ID | Property | Test Strategy |
|---------|----------|---------------|
| O1 | Valid output | `validateDeck(output.deck)` passes |
| O2 | Non-regression | `output.score >= output.initialScore` |
| O3 | Improves weak decks | Start with 40 weakest cards, collection has 3000+ ATK cards → improvement > 0 |
| O4 | Respects collection | No card in output exceeds owned quantity |
| O5 | Cancellation | Abort after 5 seconds → still returns valid deck |
| O6 | Edge cases | Run optimizer for each edge case in Section 5.4 |

### Fusion Properties (F1–F5)

| Test ID | Property | Test Strategy |
|---------|----------|---------------|
| F1 | Name priority | Craft cards where name-name and kind-kind both match → verify name-name wins |
| F2 | Strict improvement | Result ATK <= material ATK → no fusion occurs |
| F3 | Commutativity | `fuse(A,B) === fuse(B,A)` for 1000 random pairs |
| F4 | Chain depth limit | No chain consumes more than 4 cards from a 5-card hand |
| F5 | Fusion result restriction | Fusion result's own kinds are ignored in subsequent fusions |

---

## 5.6 End-to-End Integration Tests (`tests/e2e.test.ts`)

Run the full `optimizeDeck()` pipeline with real game data (or a realistic subset):

| Test | What it Validates |
|------|-------------------|
| `Small collection (50 cards)` | Optimizer runs and improves score |
| `Medium collection (200 cards)` | Optimizer finds fusion-heavy deck |
| `Full collection (all 722 cards)` | Optimizer runs within 60 seconds |
| `Timeout enforcement` | Total elapsed time < 60,000ms |
| `Deterministic with same seed` | Same collection + same internal seeds → same output |
| `Multiple runs improve` | Running twice with previous output as input → score doesn't decrease |

---

## 5.7 Performance Final Tuning

### Profiling Checklist

- [ ] Run V8 profiler (`--prof`) on the exact scorer loop. Identify any hidden deopt.
- [ ] Verify no GC events during the 55-second worker phase via `--trace-gc`.
- [ ] Check that `fusionTable` lookups are monomorphic (single type at each call site).
- [ ] Ensure `evaluateHand` is inlined by V8 (function size < 600 bytes of bytecode).
- [ ] Verify that `SharedArrayBuffer` path works when COOP/COEP headers are present.
- [ ] Stress test with 16 workers — verify no contention or memory issues.

### Tuning Parameters

| Parameter | Default | Tuning Range | Effect |
|-----------|---------|-------------|--------|
| `NUM_HANDS` | 15,000 | 10K–50K | More hands = better MC approximation, slower delta |
| `initialTemp` | 1,000 | 500–5,000 | Higher = more exploration early on |
| `coolingRate` | 0.9999 | 0.999–0.99999 | Slower cooling = longer exploration |
| `coolingInterval` | 100 | 50–500 | How often to apply cooling |
| `numWorkers` | `hardwareConcurrency` | 1–16 | Parallelism level |
| `haltTime` | 55,000ms | 50K–57K | When to stop workers |
| `exactCandidates` | 3 | 1–5 | How many decks to exact-score |

---

## 5.8 Success Criteria

1. All SPEC properties (S1–S9, O1–O6, F1–F5) pass.
2. All edge case tests pass.
3. End-to-end test with full collection completes in <60 seconds.
4. `optimizeDeck()` public API returns correct `OptimizerOutput` structure.
5. Non-regression holds across 100 random test runs.
6. No GC pauses >5ms during the worker phase.
7. System works in both Web Worker and Bun/Node environments (for testing).

---

## 5.9 Final File Tree

```
src/
  types/
    constants.ts
    interfaces.ts
    buffers.ts
  data/
    card-db.ts
    fusion-db.ts
    collection.ts
    initial-deck.ts
  pool/
    hand-pool.ts
  scoring/
    max-atk-scorer.ts
    delta-evaluator.ts
    fusion-scorer.ts
    fusion-delta-evaluator.ts
    exact-scorer.ts
  optimizer/
    random-swap-optimizer.ts
    sa-optimizer.ts
    rng.ts
  worker/
    optimizer-worker.ts
    messages.ts
  orchestrator/
    orchestrator.ts
  validation/
    deck-validator.ts
    invariants.ts
  index.ts
tests/
  phase0.test.ts
  phase1.test.ts
  phase2.test.ts
  phase3.test.ts
  phase4.test.ts
  spec-validation.test.ts
  edge-cases.test.ts
  e2e.test.ts
tsconfig.json
package.json
```
