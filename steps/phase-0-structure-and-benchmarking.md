# Phase 0: Structure & Benchmarking Harness

**Goal:** Establish the zero-allocation contract for the entire system. Define generic interfaces, build dummy implementations, and create a benchmarking harness that proves the architecture can sustain millions of ops/sec without GC pauses — before any real algorithm exists.

---

## 0.1 Project Scaffolding

### Files to Create

| File | Purpose |
|------|---------|
| `tsconfig.json` | Strict TypeScript config (`strict: true`, `target: ES2022`, `module: ESNext`) |
| `package.json` | Project manifest. Dependencies: `typescript`, `vitest` (test runner), `mitata` or raw `performance.now()` for benchmarks |
| `src/types/constants.ts` | Global constants extracted from PLAN.md |
| `src/types/interfaces.ts` | Core `IScorer` and `IOptimizer` interfaces |
| `src/types/buffers.ts` | TypedArray buffer layout type definitions |

### Constants to Define (`src/types/constants.ts`)

```ts
export const MAX_CARD_ID = 722;
export const DECK_SIZE = 40;
export const HAND_SIZE = 5;
export const NUM_HANDS = 15_000;
export const MAX_COPIES = 3;
export const FUSION_NONE = -1; // sentinel: no fusion exists
```

---

## 0.2 Core Interfaces (`src/types/interfaces.ts`)

These interfaces are the architectural backbone. Every scorer and optimizer in the project implements them. The critical constraint: **no object instantiation, no JS Arrays in signatures that touch hot paths.**

### `IScorer`

The scorer evaluates a single 5-card hand and returns the maximum achievable ATK.

```ts
export interface IScorer {
  /**
   * Evaluate the max ATK achievable from 5 cards.
   *
   * @param hand - Uint16Array of length 5 containing card IDs.
   *               This buffer is CALLER-OWNED. The scorer must NOT retain a reference.
   * @param fusionTable - Int16Array(722*722), flat fusion lookup.
   * @param cardAtk - Int16Array(722), card ID -> base ATK.
   * @returns The maximum ATK achievable (a plain number, zero-alloc).
   */
  evaluateHand(
    hand: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
  ): number;
}
```

### `IDeltaScorer`

The delta scorer evaluates *only the hands affected by a swap*, returning the net change in total score. This is the hot-path interface used ~millions of times per second.

```ts
export interface IDeltaScorer {
  /**
   * Compute the score delta when deck[slotIndex] changes from oldCard to newCard.
   *
   * @param deck - Int16Array(40), the current deck state. Caller has ALREADY written newCard into deck[slotIndex].
   * @param slotIndex - The deck slot that was swapped (0-39).
   * @param handIndices - Uint8Array(NUM_HANDS * 5), flat pool of pre-generated hand index combos.
   * @param handScores - Int16Array(NUM_HANDS), current cached score per hand. Caller expects mutation on accept.
   * @param affectedHandIds - Uint16Array(NUM_HANDS * 5), flat list of hand IDs per slot.
   * @param affectedHandOffsets - Uint32Array(40), start offset per slot.
   * @param affectedHandCounts - Uint16Array(40), count of affected hands per slot.
   * @param fusionTable - Int16Array(722*722).
   * @param cardAtk - Int16Array(722).
   * @param scorer - IScorer to evaluate individual hands.
   * @returns { delta: number } — net change in total score across affected hands.
   *          On accept, the caller will call commitDelta().
   */
  computeDelta(
    deck: Int16Array,
    slotIndex: number,
    handIndices: Uint8Array,
    handScores: Int16Array,
    affectedHandIds: Uint16Array,
    affectedHandOffsets: Uint32Array,
    affectedHandCounts: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
  ): number;

  /**
   * Commit the last computeDelta's per-hand score updates into handScores.
   * Must be called ONLY after an accepted move.
   * Uses an internal pre-allocated buffer to track pending updates (zero-alloc).
   */
  commitDelta(handScores: Int16Array): void;
}
```

### `IOptimizer`

The optimizer drives the search loop (e.g., simulated annealing). It consumes a scorer + delta scorer and iterates.

```ts
export interface IOptimizer {
  /**
   * Run the optimization loop.
   *
   * @param deck - Int16Array(40), initial deck. Will be mutated in-place to the best found.
   * @param cardCounts - Uint8Array(722), copies of each card currently in deck.
   * @param availableCounts - Uint8Array(722), max copies of each card the player owns.
   * @param handIndices - Uint8Array(NUM_HANDS * 5).
   * @param handScores - Int16Array(NUM_HANDS).
   * @param affectedHandIds - Uint16Array(NUM_HANDS * 5).
   * @param affectedHandOffsets - Uint32Array(40).
   * @param affectedHandCounts - Uint16Array(40).
   * @param fusionTable - Int16Array(722*722).
   * @param cardAtk - Int16Array(722).
   * @param scorer - IScorer instance.
   * @param deltaScorer - IDeltaScorer instance.
   * @param signal - AbortSignal for cancellation.
   * @returns The total score of the best deck found.
   */
  run(
    deck: Int16Array,
    cardCounts: Uint8Array,
    availableCounts: Uint8Array,
    handIndices: Uint8Array,
    handScores: Int16Array,
    affectedHandIds: Uint16Array,
    affectedHandOffsets: Uint32Array,
    affectedHandCounts: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
    deltaScorer: IDeltaScorer,
    signal: AbortSignal,
  ): number;
}
```

### Design Rationale

- **All buffers are passed in, not owned.** This eliminates hidden allocations and allows SharedArrayBuffer swaps later.
- **No generics, no classes in the interface.** Just plain method signatures accepting typed arrays.
- **Return values are primitive numbers**, not wrapper objects.
- **`commitDelta` is separate from `computeDelta`** so rejected moves cost zero writes.

---

## 0.3 Buffer Layout Types (`src/types/buffers.ts`)

Define a single type that bundles all the pre-allocated buffers. This is the "memory context" passed around.

```ts
import { MAX_CARD_ID, DECK_SIZE, NUM_HANDS, HAND_SIZE } from './constants';

/** All pre-allocated typed array buffers for the optimizer. */
export interface OptBuffers {
  readonly fusionTable: Int16Array;   // length: MAX_CARD_ID * MAX_CARD_ID
  readonly cardAtk: Int16Array;       // length: MAX_CARD_ID
  readonly deck: Int16Array;          // length: DECK_SIZE
  readonly cardCounts: Uint8Array;    // length: MAX_CARD_ID
  readonly availableCounts: Uint8Array; // length: MAX_CARD_ID
  readonly handIndices: Uint8Array;   // length: NUM_HANDS * HAND_SIZE
  readonly handScores: Int16Array;    // length: NUM_HANDS
  readonly affectedHandIds: Uint16Array; // length: NUM_HANDS * HAND_SIZE
  readonly affectedHandOffsets: Uint32Array; // length: DECK_SIZE
  readonly affectedHandCounts: Uint16Array;  // length: DECK_SIZE
}

/** Allocate all buffers once. This is the ONLY allocation site for hot-path data. */
export function createBuffers(): OptBuffers;
```

---

## 0.4 Dummy Implementations

### Files to Create

| File | Purpose |
|------|---------|
| `src/scoring/dummy-scorer.ts` | `DummyScorer` implementing `IScorer` |
| `src/scoring/dummy-delta-scorer.ts` | `DummyDeltaScorer` implementing `IDeltaScorer` |
| `src/optimizer/random-swap-optimizer.ts` | `RandomSwapOptimizer` implementing `IOptimizer` |

### `DummyScorer` (`src/scoring/dummy-scorer.ts`)

Implements `IScorer`. Returns the maximum `cardAtk[hand[i]]` among the 5 cards. No fusion logic — just a raw loop over 5 elements. This validates the interface contract and establishes the baseline cost of a hand evaluation call.

```
evaluateHand(hand, fusionTable, cardAtk):
  max = 0
  for i = 0 to 4:
    atk = cardAtk[hand[i]]
    if atk > max: max = atk
  return max
```

### `DummyDeltaScorer` (`src/scoring/dummy-delta-scorer.ts`)

Implements `IDeltaScorer`. Iterates over the affected hands for the swapped slot, calls `scorer.evaluateHand()` for each, computes delta vs cached score. Stores pending updates in a pre-allocated internal `Int16Array(NUM_HANDS)` buffer (written at construction time, reused forever).

```
Internal state:
  pendingUpdates: Int16Array(NUM_HANDS)  // pre-allocated at construction
  pendingCount: number = 0
  pendingIds: Uint16Array(NUM_HANDS)     // pre-allocated at construction

computeDelta(deck, slotIndex, ...):
  offset = affectedHandOffsets[slotIndex]
  count = affectedHandCounts[slotIndex]
  delta = 0
  pendingCount = 0
  handBuf = Uint16Array(5)  // NOTE: allocate this ONCE in constructor, not here

  for i = 0 to count-1:
    handId = affectedHandIds[offset + i]
    // Fill handBuf from deck using handIndices
    base = handId * 5
    for j = 0 to 4:
      handBuf[j] = deck[handIndices[base + j]]
    newScore = scorer.evaluateHand(handBuf, fusionTable, cardAtk)
    diff = newScore - handScores[handId]
    delta += diff
    pendingIds[pendingCount] = handId
    pendingUpdates[pendingCount] = newScore
    pendingCount++
  return delta

commitDelta(handScores):
  for i = 0 to pendingCount-1:
    handScores[pendingIds[i]] = pendingUpdates[i]
```

### `RandomSwapOptimizer` (`src/optimizer/random-swap-optimizer.ts`)

Implements `IOptimizer`. Runs a simple loop: pick a random slot, pick a random replacement card, compute delta, accept if positive, reject otherwise. No annealing, no temperature — just greedy hill climbing. This proves the optimizer ↔ scorer wiring works.

```
run(deck, cardCounts, availableCounts, ..., signal):
  totalScore = sum of handScores
  bestScore = totalScore

  while !signal.aborted:
    slotIndex = randomInt(0, 39)
    oldCard = deck[slotIndex]
    newCard = randomInt(0, MAX_CARD_ID - 1)

    // Rejection filters
    if newCard == oldCard: continue
    if cardCounts[newCard] >= availableCounts[newCard]: continue

    // Tentatively swap
    deck[slotIndex] = newCard
    cardCounts[oldCard]--
    cardCounts[newCard]++

    delta = deltaScorer.computeDelta(deck, slotIndex, ...)

    if delta > 0:
      deltaScorer.commitDelta(handScores)
      totalScore += delta
      if totalScore > bestScore: bestScore = totalScore
    else:
      // Revert
      deck[slotIndex] = oldCard
      cardCounts[oldCard]++
      cardCounts[newCard]--

  return bestScore
```

---

## 0.5 Benchmarking & Testing Harness

### Files to Create

| File | Purpose |
|------|---------|
| `src/bench/create-test-buffers.ts` | Factory that allocates & populates buffers with synthetic data |
| `src/bench/bench-scorer.ts` | Benchmark: measures `IScorer.evaluateHand` ops/sec |
| `src/bench/bench-delta.ts` | Benchmark: measures `IDeltaScorer.computeDelta` ops/sec |
| `src/bench/bench-optimizer.ts` | Benchmark: measures full optimizer iterations/sec |
| `tests/phase0.test.ts` | Vitest test suite for all Phase 0 components |

### Synthetic Test Data (`src/bench/create-test-buffers.ts`)

A function that creates a fully populated `OptBuffers` with random but structurally valid data:
- `fusionTable`: mostly `-1` (no fusion), ~5% random fusions yielding higher ATK cards.
- `cardAtk`: random values 100–3000 for all 722 slots.
- `deck`: 40 random card IDs in `[0, 721]`, respecting max 3 copies.
- `handIndices`: 15,000 random 5-combinations of indices `[0, 39]`.
- `affectedHandIds`, `affectedHandOffsets`, `affectedHandCounts`: properly computed reverse lookup from `handIndices`.

### Test Suite (`tests/phase0.test.ts`)

| Test | Validates |
|------|-----------|
| `IScorer contract: returns a number` | `DummyScorer.evaluateHand()` returns a non-negative number |
| `IScorer contract: max of hand` | Result equals `Math.max(...cardAtk[hand[i]])` for known input |
| `IDeltaScorer contract: zero delta on identity swap` | Swapping a card with itself yields `delta === 0` |
| `IDeltaScorer contract: commit updates handScores` | After `commitDelta()`, affected `handScores` entries match new values |
| `IDeltaScorer contract: no mutation on reject` | If `commitDelta()` is NOT called, `handScores` is unchanged |
| `IOptimizer contract: returns valid deck` | After `run()`, deck has 40 cards, all within `availableCounts` |
| `IOptimizer contract: non-regression` | Returned score >= initial score |
| `IOptimizer contract: respects abort signal` | Optimizer stops when `AbortController.abort()` is called |
| `Buffer allocation: exact sizes` | Every buffer in `createBuffers()` has the correct `.length` |
| `Reverse lookup correctness` | For each slot `s`, every hand in `affectedHandIds[offset..offset+count]` contains index `s` |

### Benchmarks

Each benchmark runs in a tight loop for 2 seconds and reports ops/sec:

**`bench-scorer.ts`** — Measures raw `evaluateHand` throughput:
```
loop 2 seconds:
  call scorer.evaluateHand(randomHand, fusionTable, cardAtk)
  count++
report: count / elapsed = X ops/sec
```
**Target:** >5M ops/sec (this is just max-of-5, should be trivial).

**`bench-delta.ts`** — Measures `computeDelta` throughput:
```
loop 2 seconds:
  pick random slot
  call deltaScorer.computeDelta(...)
  count++
report: count / elapsed = X ops/sec
```
**Target:** >50K ops/sec (each call evaluates ~1,875 hands).

**`bench-optimizer.ts`** — Measures full optimization iterations/sec:
```
run optimizer for 2 seconds via AbortSignal timeout
report: iterations completed / elapsed
```
**Target:** >30K iterations/sec (establishes the ceiling before real fusion logic).

---

## 0.6 Success Criteria

Phase 0 is complete when ALL of the following are true:

1. `tsc --noEmit` passes with zero errors.
2. All 10 tests in `tests/phase0.test.ts` pass.
3. `bench-scorer` reports >5M ops/sec.
4. `bench-delta` reports >50K ops/sec.
5. `bench-optimizer` completes >30K iterations in 2 seconds.
6. No GC pauses visible in benchmarks (steady ops/sec, no spikes >2x variance between runs).
7. Interfaces `IScorer`, `IDeltaScorer`, `IOptimizer` are finalized — changing them after Phase 0 is a breaking change.
8. `DummyScorer` can be swapped with any future `IScorer` implementation without touching optimizer code.

---

## 0.7 File Tree After Phase 0

```
src/
  types/
    constants.ts
    interfaces.ts
    buffers.ts
  scoring/
    dummy-scorer.ts
    dummy-delta-scorer.ts
  optimizer/
    random-swap-optimizer.ts
  bench/
    create-test-buffers.ts
    bench-scorer.ts
    bench-delta.ts
    bench-optimizer.ts
tests/
  phase0.test.ts
tsconfig.json
package.json
```
