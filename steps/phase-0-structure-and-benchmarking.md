# Phase 0: Engine Interfaces, Dummies & Benchmarking

This phase is one of the implementation step of the plan in PLAN.md file.

**Prerequisite:** Phase Init is complete — `bun test` and `bun run dev` work, `@engine` alias resolves, `src/engine/` exists.

**Goal:** Define the zero-allocation interface contracts, build dummy implementations that satisfy them, and create a benchmarking harness that measures raw throughput. After this phase, any future scorer or optimizer can be dropped in without touching wiring code.

**Scope:** All files live under `src/engine/`. No config files, no UI changes, no toolchain work.

---

## 0.1 Constants (`src/engine/types/constants.ts`)

```ts
export const MAX_CARD_ID = 722;
export const DECK_SIZE = 40;
export const HAND_SIZE = 5;
export const NUM_HANDS = 15_000;
export const MAX_COPIES = 3;
export const FUSION_NONE = -1; // sentinel: no fusion exists
```

---

## 0.2 Core Interfaces (`src/engine/types/interfaces.ts`)

The performance contract: **all hot-path signatures accept only TypedArrays and return primitives. No object allocation, no JS Arrays.**

### `IScorer`

Evaluates a single 5-card hand → maximum achievable ATK.

```ts
export interface IScorer {
  evaluateHand(
    hand: Uint16Array,        // length 5, caller-owned
    fusionTable: Int16Array,  // flat 722×722 lookup
    cardAtk: Int16Array,      // card ID → base ATK
  ): number;
}
```

### `IDeltaEvaluator`

Evaluates only the hands affected by a single swap → net score change. Separated `computeDelta` / `commitDelta` so rejected moves cost zero writes.

```ts
export interface IDeltaEvaluator {
  computeDelta(
    deck: Int16Array,                    // length 40, already mutated with the new card
    slotIndex: number,                   // which slot was swapped (0–39)
    handSlots: Uint8Array,             // flat NUM_HANDS × 5 pool
    handScores: Int16Array,              // cached score per hand
    affectedHandIds: Uint16Array,        // flat reverse-lookup: hand IDs per slot
    affectedHandOffsets: Uint32Array,    // start offset per slot
    affectedHandCounts: Uint16Array,     // count per slot
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
  ): number;

  /** Write pending scores into handScores. Call ONLY after accepting a move. */
  commitDelta(handScores: Int16Array): void;
}
```

### `IOptimizer`

Drives the search loop. Consumes a scorer + delta scorer, iterates until aborted.

```ts
export interface IOptimizer {
  run(
    deck: Int16Array,
    cardCounts: Uint8Array,
    availableCounts: Uint8Array,
    handSlots: Uint8Array,
    handScores: Int16Array,
    affectedHandIds: Uint16Array,
    affectedHandOffsets: Uint32Array,
    affectedHandCounts: Uint16Array,
    fusionTable: Int16Array,
    cardAtk: Int16Array,
    scorer: IScorer,
    deltaEvaluator: IDeltaEvaluator,
    signal: AbortSignal,
  ): number; // total score of the best deck found
}
```

### Design Rationale

- All buffers passed in, not owned → enables SharedArrayBuffer swap later.
- No generics, no classes in the interface → plain method signatures.
- Return values are primitive `number` → zero-alloc.

---

## 0.3 Buffer Layout (`src/engine/types/buffers.ts`)

A single type bundling all pre-allocated memory. One allocation site for the entire hot path.

```ts
export interface OptBuffers {
  readonly fusionTable: Int16Array;        // MAX_CARD_ID²
  readonly cardAtk: Int16Array;            // MAX_CARD_ID
  readonly deck: Int16Array;               // DECK_SIZE
  readonly cardCounts: Uint8Array;         // MAX_CARD_ID
  readonly availableCounts: Uint8Array;    // MAX_CARD_ID
  readonly handSlots: Uint8Array;        // NUM_HANDS × HAND_SIZE
  readonly handScores: Int16Array;         // NUM_HANDS
  readonly affectedHandIds: Uint16Array;   // NUM_HANDS × HAND_SIZE
  readonly affectedHandOffsets: Uint32Array; // DECK_SIZE
  readonly affectedHandCounts: Uint16Array;  // DECK_SIZE
}

export function createBuffers(): OptBuffers;
```

---

## 0.4 Dummy Implementations

Three stubs that prove the interface wiring. All under `src/engine/`.

### `MaxAtkScorer` (`src/engine/scoring/max-atk-scorer.ts`)

Returns `max(cardAtk[hand[i]])` for i in 0..4. No fusion logic — just a 5-iteration loop.

### `DeltaEvaluator` (`src/engine/scoring/delta-evaluator.ts`)

Iterates affected hands for the swapped slot, calls `scorer.evaluateHand()` for each, computes delta vs cached score. Internal pre-allocated buffers (allocated once in constructor, reused forever):

- `pendingScores: Int16Array(NUM_HANDS)` — new score per affected hand.
- `pendingIds: Uint16Array(NUM_HANDS)` — which hand IDs were updated.
- `pendingCount: number` — how many pending.
- `handBuf: Uint16Array(5)` — reusable hand buffer.

`commitDelta()` writes pending scores into `handScores`. If never called (rejected move), nothing is mutated.

### `RandomSwapOptimizer` (`src/engine/optimizer/random-swap-optimizer.ts`)

Greedy hill-climber: pick random slot, pick random replacement card, compute delta, accept if positive, revert otherwise. No annealing. Proves the optimizer ↔ scorer ↔ deltaEvaluator wiring works end-to-end.

---

## 0.5 Synthetic Test Data (`src/engine/bench/create-test-buffers.ts`)

Factory that returns a fully populated `OptBuffers` with random but structurally valid data:

- `fusionTable`: mostly `FUSION_NONE`, ~5% random fusions with higher ATK.
- `cardAtk`: random values 100–3000.
- `deck`: 40 random card IDs respecting max 3 copies.
- `handSlots`: 15,000 random 5-combinations of [0, 39].
- Reverse lookup (`affectedHandIds`, `affectedHandOffsets`, `affectedHandCounts`): correctly computed from `handSlots`.

---

## 0.6 Tests (`tests/phase0.test.ts`)

| # | Test | Validates |
|---|------|-----------|
| 1 | `IScorer: returns a number` | `MaxAtkScorer.evaluateHand()` returns non-negative number |
| 2 | `IScorer: max of hand` | Result equals `Math.max(...cardAtk[hand[i]])` for known input |
| 3 | `IDeltaEvaluator: zero delta on identity swap` | Swapping a card with itself → `delta === 0` |
| 4 | `IDeltaEvaluator: commit updates handScores` | After `commitDelta()`, affected entries match new values |
| 5 | `IDeltaEvaluator: no mutation on reject` | Skipping `commitDelta()` → `handScores` unchanged |
| 6 | `IOptimizer: returns valid deck` | After `run()`, deck has 40 cards, all within `availableCounts` |
| 7 | `IOptimizer: non-regression` | Returned score ≥ initial score |
| 8 | `IOptimizer: respects abort signal` | Stops when `AbortController.abort()` fires |
| 9 | `Buffer allocation: exact sizes` | Every buffer in `createBuffers()` has correct `.length` |
| 10 | `Reverse lookup correctness` | For each slot, every listed hand actually contains that slot index |

---

## 0.7 Benchmarks (`src/engine/bench/`)

Vitest bench files (run via `bun run bench`).

| File | What it measures | Target |
|------|-----------------|--------|
| `bench-scorer.bench.ts` | `MaxAtkScorer.evaluateHand` ops/sec | >5M ops/sec |
| `bench-delta.bench.ts` | `DeltaEvaluator.computeDelta` ops/sec | >50K ops/sec |
| `bench-optimizer.bench.ts` | `RandomSwapOptimizer` iterations in 2s | >30K iter/sec |

Each bench uses `createTestBuffers()` for setup. Steady ops/sec with no GC spikes (>2× variance between samples) confirms zero-allocation.

---

## 0.8 Success Criteria

1. `bun test` — all 10 Phase 0 tests pass (plus the Phase Init smoke test still passes).
2. `bun run bench` — meets all three throughput targets.
3. No GC spikes visible in bench output.
4. Interfaces `IScorer`, `IDeltaEvaluator`, `IOptimizer` are final — changing them after this phase is a breaking change.
5. Swapping `MaxAtkScorer` for any future `IScorer` requires zero changes to optimizer or delta scorer code.

---

## 0.9 File Tree (additions only — Phase Init files untouched)

```
src/engine/
  types/
    constants.ts
    interfaces.ts
    buffers.ts
  scoring/
    max-atk-scorer.ts
    delta-evaluator.ts
  optimizer/
    random-swap-optimizer.ts
  bench/
    create-test-buffers.ts
    bench-scorer.bench.ts
    bench-delta.bench.ts
    bench-optimizer.bench.ts
tests/
  phase0.test.ts
```
