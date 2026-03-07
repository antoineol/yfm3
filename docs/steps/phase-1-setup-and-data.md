# Phase 1: Setup, Types & Data Loading

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Bootstrap the project, define all type contracts, parse game data into typed arrays, build the fusion table, generate the Monte Carlo hand pool with CSR reverse lookup, and construct the initial deck. After this phase, all buffers are ready for scoring and optimization.

---

## 1.1 Project Scaffold

Vite + React + TypeScript with strict engine/UI boundary:

```
src/
  engine/    # Pure TS, no DOM/React/Node imports
  ui/        # React app, imports from @engine
```

- `@engine` path alias in both `tsconfig.json` and `vite.config.ts`
- Vitest for testing (`bun test`), `bun run dev` for dev server
- `strict: true`, `target: ES2022`, `moduleResolution: bundler`
- Add linting script (`bun lint`)

### Files to Create

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config with `@engine` alias |
| `vitest.config.ts` | Extends Vite config for tests |
| `tsconfig.json` | Strict TS config with path aliases |
| `src/ui/main.tsx` | React entry point |
| `src/ui/App.tsx` | Minimal app shell |
| `src/engine/index.ts` | Engine entry point |

---

## 1.2 Constants & Core Interfaces

### Constants (`src/engine/types/constants.ts`)

```ts
export const MAX_CARD_ID = 722;
export const DECK_SIZE = 40;
export const HAND_SIZE = 5;
export const NUM_HANDS = 15_000;
export const MAX_COPIES = 3;
export const FUSION_NONE = -1;
```

### Interfaces (`src/engine/types/interfaces.ts`)

All hot-path signatures accept `OptBuffers` (the pre-allocated typed-array bundle) and return primitives. No object allocation in hot loops.

```ts
export interface IScorer {
  evaluateHand(hand: Uint16Array, buf: OptBuffers): number;
}

export interface IDeltaEvaluator {
  computeDelta(slotIndex: number, buf: OptBuffers, scorer: IScorer): number;
  commitDelta(handScores: Int16Array): void;
}

export interface IOptimizer {
  run(
    buf: OptBuffers,
    scorer: IScorer,
    deltaEvaluator: IDeltaEvaluator,
    maxIterations: number,
  ): number;
}
```

### Buffer Layout (`src/engine/types/buffers.ts`)

```ts
export interface OptBuffers {
  readonly fusionTable: Int16Array;        // MAX_CARD_ID²
  readonly cardAtk: Int16Array;            // MAX_CARD_ID
  readonly deck: Int16Array;               // DECK_SIZE
  readonly cardCounts: Uint8Array;         // MAX_CARD_ID
  readonly availableCounts: Uint8Array;    // MAX_CARD_ID
  readonly handSlots: Uint8Array;          // NUM_HANDS × HAND_SIZE
  readonly handScores: Int16Array;         // NUM_HANDS
  readonly affectedHandIds: Uint16Array;   // NUM_HANDS × HAND_SIZE
  readonly affectedHandOffsets: Uint32Array; // DECK_SIZE
  readonly affectedHandCounts: Uint16Array;  // DECK_SIZE
}

export function createBuffers(): OptBuffers;
```

---

## 1.3 CSV Parsers

> **Note:** All code under `src/engine/data/` is retrieved from a prior version of this project and kept as-is. Do not refactor, clean up, or remove "unused" exports from these files — they are a shared data layer and may have consumers outside the current codebase.

### Card Database Parser

**Input:** CSV with columns: ID, Name, Attack, Defense, Kinds (comma-separated), Color (optional).

**Output:**
- `cardAtk: Int16Array(722)` — card ID → base ATK
- Kind/color data needed for fusion table construction (can be temporary, not in hot path)

### Fusion Recipe Parser

**Input:** CSV with fusion recipes (ingredient A, ingredient B, result).

**Output:** Raw recipe objects for fusion table construction.

### Files (pre-existing)

| File | Purpose |
|------|---------|
| `src/engine/data/parse-cards.ts` | Card CSV parser |
| `src/engine/data/parse-fusions.ts` | Fusion recipe CSV parser |

---

## 1.4 Fusion Table Construction

Build the flat 2D lookup: `fusionTable[cardA * 722 + cardB] = resultCardId` (or `FUSION_NONE = -1`).

### 3-Pass Priority Resolution

Per SPEC §4 and official FM fusion rules, recipes are applied in priority order:

1. **Pass 1:** Name-name recipes. **Absolute priority** — always written (subject to strict improvement). If multiple name-name recipes match, keep the one with the highest result ATK.
2. **Pass 2:** Name-kind and name-colorKind recipes. Only write if slot is still `FUSION_NONE`. **Tiebreaker: lower ATK wins** — if multiple type-based recipes match the same pair, keep the lowest result ATK (this matches the game's fusion resolution order).
3. **Pass 3:** Kind-kind, kind-colorKind, colorKind-colorKind recipes. Only write if slot is still `FUSION_NONE`. Same **lower-ATK tiebreaker** as Pass 2.

Each recipe is expanded by cross-product of matching card IDs for each ingredient.

**Summary of resolution rules:**
- **Between tiers:** Name > Kind (absolute). A name-name result is never overwritten by a kind-based result.
- **Within type tiers (2 & 3):** Lower ATK result wins when multiple recipes match the same card pair.

### Strict Improvement Filter

Only write `fusionTable[A*722+B] = result` if `cardAtk[result] > cardAtk[A] AND cardAtk[result] > cardAtk[B]`.

### Symmetry

Always write both `[A*722+B]` and `[B*722+A]`.

### File (pre-existing)

| File | Purpose |
|------|---------|
| `src/engine/data/build-fusion-table.ts` | Fusion table construction with 3-tier priority |

---

## 1.5 Monte Carlo Hand Pool

### Hand Index Generation (`handSlots: Uint8Array(NUM_HANDS * HAND_SIZE)`)

Generate 15,000 unique 5-combinations of indices from [0, 39]. Each stored as 5 consecutive bytes.

C(40,5) = 658,008 possible combos. 15,000 is ~2.3% — collisions are rare, rejection sampling is efficient.

### CSR Reverse Lookup

For each deck slot `s` (0–39), which hand IDs contain that slot?

- `affectedHandIds: Uint16Array(NUM_HANDS * HAND_SIZE)` — flat array of hand IDs
- `affectedHandOffsets: Uint32Array(DECK_SIZE)` — start offset per slot
- `affectedHandCounts: Uint16Array(DECK_SIZE)` — count per slot (~1,875 average)

Construction: two-pass algorithm (count, then prefix-sum offsets, then fill).

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/data/hand-pool.ts` | Hand sampling and CSR reverse lookup |

---

## 1.6 Initial Deck Construction

Greedy strategy: sort all owned cards by ATK descending, greedily pick top cards respecting max-3-copies constraint until 40 cards selected.

If a valid initial deck is provided, validate and use it. Otherwise auto-generate.

Write into `deck: Int16Array(40)` and populate `cardCounts: Uint8Array(722)`.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/data/initial-deck.ts` | Greedy deck builder from collection |

---

## 1.7 Initialization Pipeline

Single function that wires everything together:

```ts
function initializeBuffers(setCollection, rand): OptBuffers
```

CSV reading is handled internally by `loadGameData` (static game data, read once at module load). `setCollection` populates `availableCounts` from the player's card collection. `rand` is a seeded PRNG for Monte Carlo hand sampling.

Parses CSVs → builds fusion table → sets collection → constructs initial deck → samples hands → builds CSR → returns fully populated `OptBuffers`.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/initialize-buffers.ts` | End-to-end initialization pipeline |

---

## 1.8 Tests

| Test | Validates |
|------|-----------|
| `fusionTable symmetry` | `fusionTable[A*722+B] === fusionTable[B*722+A]` for all A, B |
| `fusionTable priority` | Name-name recipe overrides kind-kind for same card pair |
| `fusionTable strict improvement` | No entry where result ATK <= either material ATK |
| `cardAtk populated` | All cards in the database have ATK values |
| `color-qualified fusion` | `[Blue] Fairy` matches only blue fairies |
| `hand pool uniqueness` | No duplicate 5-combos |
| `hand pool range` | All index values in [0, 39] |
| `reverse lookup completeness` | Sum of counts = NUM_HANDS × 5 |
| `reverse lookup correctness` | For each slot, every listed hand contains that slot |
| `initial deck validity` | 40 cards, within collection, all valid IDs |
| `buffer allocation sizes` | Every buffer has correct `.length` |
| `smoke test` | Engine module imports and loads correctly |

---

## 1.9 Success Criteria

1. All Phase 1 tests pass.
2. `bun test` and `bun lint` pass.
3. Fusion table construction completes in <500ms.
4. Hand pool + CSR generation completes in <100ms.
5. Fusion table is symmetric and respects all 3 priority tiers.
6. `OptBuffers` struct fully populated from real game data.
