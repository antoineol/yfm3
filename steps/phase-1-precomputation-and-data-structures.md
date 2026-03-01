# Phase 1: Pre-Computation & Data Structures

This phase is one of the implementation step of the plan in PLAN.md file.

**Goal:** Parse the real game data and build all lookup tables and buffer pools that the optimizer consumes. Everything here runs **once** on the main thread before any workers spawn. Zero runtime allocations — all buffers are created in this phase and then transferred.

**Depends on:** Phase 0 (interfaces, buffer types, constants).

---

## 1.1 Game Data Ingestion

### Files to Create

| File | Purpose |
|------|---------|
| `src/data/card-db.ts` | Parse card database into typed arrays |
| `src/data/fusion-db.ts` | Parse fusion recipes and build flat fusion table |
| `src/data/collection.ts` | Parse player collection into `availableCounts: Uint8Array(722)` |

### Card Database (`src/data/card-db.ts`)

**Input:** Raw card data (JSON or embedded TS const — format TBD based on data source).

**Output:**
- `cardAtk: Int16Array(MAX_CARD_ID)` — card ID -> base ATK.
- `cardDef: Int16Array(MAX_CARD_ID)` — card ID -> base DEF (stored but unused in scoring; needed for validation).
- `cardKinds: Uint32Array(MAX_CARD_ID)` — card ID -> bitmask of kinds. Each of the 22 kinds maps to one bit. A card with kinds [Dragon, Warrior] has bits 0 and 4 set.
- `cardColor: Uint8Array(MAX_CARD_ID)` — card ID -> color enum (0=none, 1=blue, 2=yellow, 3=orange, 4=red).
- `cardNameIndex: Map<string, number>` — name -> card ID lookup (used only during fusion table construction, not in hot path).

### Kind Bitmask Encoding

```ts
export const enum Kind {
  Dragon      = 1 << 0,
  Fairy       = 1 << 1,
  Beast       = 1 << 2,
  Fiend       = 1 << 3,
  Warrior     = 1 << 4,
  Zombie      = 1 << 5,
  WingedBeast = 1 << 6,
  Machine     = 1 << 7,
  Rock        = 1 << 8,
  Plant       = 1 << 9,
  Dinosaur    = 1 << 10,
  Spellcaster = 1 << 11,
  Pyro        = 1 << 12,
  Reptile     = 1 << 13,
  Aqua        = 1 << 14,
  Insect      = 1 << 15,
  Thunder     = 1 << 16,
  Fish        = 1 << 17,
  Female      = 1 << 18,
  MothInsect  = 1 << 19,
  SharkFish   = 1 << 20,
  SeaSerpent  = 1 << 21,
}
```

This bitmask representation allows O(1) kind checking via `(cardKinds[id] & Kind.Dragon) !== 0`.

---

## 1.2 Fusion Table Construction (`src/data/fusion-db.ts`)

This is the most complex part of Phase 1. The fusion table is a flat 2D lookup: `fusionTable[cardA * MAX_CARD_ID + cardB] = resultCardId` (or `FUSION_NONE = -1`).

### Fusion Recipe Types

Each raw recipe has two ingredients and a result. Each ingredient is one of:
- **Name**: matches a specific card by name.
- **Kind**: matches any card with that kind.
- **ColorKind**: matches any card with that kind AND that color.

### Construction Algorithm

```
1. Parse all raw fusion recipes.
2. For each recipe(ingredientA, ingredientB, resultCardId):
   a. Expand ingredientA to a list of matching card IDs:
      - If Name: [cardNameIndex.get(name)]
      - If Kind: all card IDs where (cardKinds[id] & kindBit) !== 0
      - If ColorKind: all card IDs where (cardKinds[id] & kindBit) !== 0 AND cardColor[id] === color
   b. Expand ingredientB similarly.
   c. For each pair (idA, idB) from the cross product:
      - Check priority: only write if no higher-priority recipe already occupies fusionTable[idA * 722 + idB].
      - Check strict improvement: resultAtk > cardAtk[idA] AND resultAtk > cardAtk[idB].
      - Write fusionTable[idA * 722 + idB] = resultCardId.
      - Write fusionTable[idB * 722 + idA] = resultCardId. (symmetry)
```

### Priority Resolution

Recipes must be applied in SPEC priority order:
1. **Pass 1:** Process all name-name recipes first. These take absolute priority.
2. **Pass 2:** Process name-kind and name-colorKind recipes. Only write if slot is still `FUSION_NONE`.
3. **Pass 3:** Process kind-kind, kind-colorKind, and colorKind-colorKind recipes. Only write if slot is still `FUSION_NONE`.

This 3-pass approach implements the priority system from SPEC Section 4 without needing a priority field per cell.

### Fusion Result Metadata

We also need to know which cards are fusion results (for the chain restriction in SPEC F5):
- `isFusionResult: Uint8Array(MAX_CARD_ID)` — 1 if this card ID appears as a result in any recipe, 0 otherwise.
- This is used in Phase 2 to disable kind-based matching for fusion intermediates.

---

## 1.3 Fixed-Index Monte Carlo Pool

### Files to Create

| File | Purpose |
|------|---------|
| `src/pool/hand-pool.ts` | Generate the fixed hand index pool and reverse lookup |

### Hand Index Generation (`handIndices: Uint8Array(NUM_HANDS * HAND_SIZE)`)

Generate 15,000 unique 5-combinations of indices from [0, 39]. Each combination is stored as 5 consecutive bytes in the flat array.

```
Algorithm:
  seen = Set<string>() // only used during generation, not hot path
  count = 0
  while count < NUM_HANDS:
    generate 5 random distinct indices in [0, 39], sorted ascending
    key = indices.join(',')
    if !seen.has(key):
      seen.add(key)
      for j = 0 to 4:
        handIndices[count * 5 + j] = indices[j]
      count++
```

Note: There are C(40,5) = 658,008 possible combos. 15,000 is ~2.3% — collisions are rare. A simple rejection sampler is efficient here.

### Reverse Lookup Construction

Build the reverse map: for each deck slot `s` (0-39), which hand IDs contain that slot?

```
Algorithm:
  // First pass: count
  for h = 0 to NUM_HANDS - 1:
    for j = 0 to 4:
      slot = handIndices[h * 5 + j]
      affectedHandCounts[slot]++

  // Compute offsets (prefix sum)
  affectedHandOffsets[0] = 0
  for s = 1 to 39:
    affectedHandOffsets[s] = affectedHandOffsets[s-1] + affectedHandCounts[s-1]

  // Second pass: fill
  tempOffsets = Uint32Array(40) // copy of offsets, used as write cursors
  tempOffsets.set(affectedHandOffsets)
  for h = 0 to NUM_HANDS - 1:
    for j = 0 to 4:
      slot = handIndices[h * 5 + j]
      affectedHandIds[tempOffsets[slot]] = h
      tempOffsets[slot]++
```

---

## 1.4 Initial Deck Construction

### File to Create

| File | Purpose |
|------|---------|
| `src/data/initial-deck.ts` | Build a valid starting deck from the collection |

### Logic

If the player provides an initial deck:
1. Validate it (40 cards, within collection bounds, all valid IDs).
2. If valid, use as-is.
3. If invalid (wrong size, over-bounds), fall back to auto-generation.

Auto-generation (greedy):
1. Sort all owned cards by ATK descending.
2. Greedily pick the top cards respecting the max-3-copies constraint until 40 cards are selected.
3. This produces a reasonable starting point for the optimizer.

Write the deck into `deck: Int16Array(40)` and populate `cardCounts: Uint8Array(722)`.

---

## 1.5 Initial Score Computation

After the deck and hand pool are built, compute the initial `handScores`:

```
for h = 0 to NUM_HANDS - 1:
  fill handBuf[0..4] = deck[handIndices[h*5 + j]] for j in 0..4
  handScores[h] = scorer.evaluateHand(handBuf, fusionTable, cardAtk)
```

This uses the `IScorer` interface — at this point it will be the `DummyScorer` (from Phase 0) or the real `FusionScorer` (from Phase 2) depending on build order.

---

## 1.6 Tests

### File to Create

| File | Purpose |
|------|---------|
| `tests/phase1.test.ts` | Tests for all Phase 1 components |

| Test | Validates |
|------|-----------|
| `fusionTable symmetry` | `fusionTable[A*722+B] === fusionTable[B*722+A]` for all A, B |
| `fusionTable priority` | Name-name recipe overrides kind-kind for same card pair |
| `fusionTable strict improvement` | No entry where result ATK <= either material ATK |
| `cardAtk populated` | All cards in the database have ATK values in `cardAtk` |
| `kind bitmask correctness` | Known multi-kind cards have correct bits set |
| `color-qualified fusion` | `[Blue] Fairy` matches only blue fairies, not red fairies |
| `hand pool uniqueness` | No duplicate 5-combos in `handIndices` |
| `hand pool range` | All index values in `handIndices` are in [0, 39] |
| `reverse lookup completeness` | Sum of `affectedHandCounts` = `NUM_HANDS * 5` |
| `reverse lookup correctness` | For each slot, every listed hand actually contains that slot |
| `initial deck validity` | 40 cards, within collection, all valid IDs |
| `initial deck ATK ordering` | Auto-generated deck prioritizes high-ATK cards |

---

## 1.7 Success Criteria

1. All Phase 1 tests pass.
2. Fusion table construction completes in <500ms for the full 722x722 table.
3. Hand pool + reverse lookup generation completes in <100ms.
4. `fusionTable` is symmetric and respects all 3 priority tiers.
5. The `OptBuffers` struct can be fully populated from real game data.
6. The initial `handScores` array is populated using the DummyScorer (will be recomputed in Phase 2 with real scoring).

---

## 1.8 File Tree Additions After Phase 1

```
src/
  data/
    card-db.ts
    fusion-db.ts
    collection.ts
    initial-deck.ts
  pool/
    hand-pool.ts
tests/
  phase1.test.ts
```
