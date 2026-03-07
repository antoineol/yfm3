# Phase 5: Web Workers, Exact Refinement & Integration

This phase is one of the implementation steps of the plan in PLAN.md file.

**Goal:** Spawn parallel Web Workers for SA search, collect results, score top candidates with exhaustive combinatorial evaluation, and wire everything into the public API. ~200 LOC.

**Depends on:** Phase 2 (scorer), Phase 3 (delta evaluator), Phase 4 (SA optimizer).

---

## 5.1 Web Worker Infrastructure (~150 LOC)

### Message Protocol

**Main → Worker:**

```ts
type WorkerInit = {
  type: 'INIT'
  fusionTable: Int16Array
  cardAtk: Int16Array
  handSlots: Uint8Array
  affectedHandIds: Uint16Array
  affectedHandOffsets: Uint32Array
  affectedHandCounts: Uint16Array
  initialDeck: Int16Array       // varies per worker (multi-start)
  availableCounts: Uint8Array
  seed: number                  // different per worker
}

type WorkerHalt = { type: 'HALT' }
```

**Worker → Main:**

```ts
type WorkerResult = {
  type: 'RESULT'
  bestDeck: Int16Array
  bestScore: number
  iterations: number
}
```

### Worker Entry Point

Each worker:
1. Receives `INIT`, unpacks buffers
2. Creates scorer, delta evaluator, SA optimizer instances
3. Computes initial `handScores` from the provided deck
4. Runs SA loop until `HALT` received
5. Posts `RESULT` with best deck + score

### Orchestrator

```
async function runOptimization(collection, timeLimit = 60_000):
  buffers = initializeBuffers(collection, rand)

  numWorkers = navigator.hardwareConcurrency || 4
  for i = 0 to numWorkers-1:
    worker = new Worker('sa-worker.ts')
    initialDeck = generateSeed(i, buffers)
    worker.postMessage({ type: 'INIT', ...buffers, initialDeck, seed: i })

  await sleep(55_000)
  for worker of workers:
    worker.postMessage({ type: 'HALT' })

  results = await Promise.all(workers.map(waitForResult))
  return refineBest(results, buffers)
```

### Transfer Strategy

Read-only tables (`fusionTable`, `cardAtk`, `handSlots`, CSR arrays) use `SharedArrayBuffer` if available, otherwise structured clone copies. Mutable state (`deck`, `handScores`, `cardCounts`) is always per-worker.

### Files to Create

| File | Purpose |
|------|---------|
| `src/engine/worker/sa-worker.ts` | Web Worker entry point |
| `src/engine/worker/orchestrator.ts` | Main thread worker management |
| `src/engine/worker/messages.ts` | Typed message protocol |

---

## 5.2 Exact Combinatorial Refinement (~50 LOC)

MC scores have sampling noise. The exact evaluator eliminates this by scoring every possible hand.

```
function exactScore(deck[40], scorer, fusionTable, cardAtk) -> number:
  totalAtk = 0
  for a = 0 to 35:
    for b = a+1 to 36:
      for c = b+1 to 37:
        for d = c+1 to 38:
          for e = d+1 to 39:
            hand = [deck[a], deck[b], deck[c], deck[d], deck[e]]
            totalAtk += scorer.evaluateHand(hand, fusionTable, cardAtk)
  return totalAtk / 658_008
```

All C(40,5) = 658,008 hands. At ~1μs/hand → ~660ms per deck. The 5-second budget allows scoring ~7 unique decks.

### Refinement Pipeline

1. **Deduplicate:** Sort card IDs in each deck, remove identical decks.
2. **Rank by MC score:** Take top ~7 unique decks.
3. **Exact score each:** Run exhaustive evaluator.
4. **Select winner:** Return deck with highest exact expected ATK.

### File to Create

| File | Purpose |
|------|---------|
| `src/engine/scoring/exact-scorer.ts` | Exhaustive combinatorial deck scorer |

---

## 5.3 Public API

```ts
export async function optimizeDeck(
  cardsCsv: string,
  fusionsCsv: string,
  collection: number[],
  timeLimit?: number
): Promise<{
  deck: number[]
  expectedAtk: number
  initialScore: number
  improvement: number
  elapsedMs: number
}>
```

Entry point that:
1. Parses CSVs and builds data structures (Phase 1)
2. Spawns workers and runs SA search (Phase 5.1)
3. Runs exact refinement (Phase 5.2)
4. Returns the best deck

### File to Create/Modify

| File | Purpose |
|------|---------|
| `src/engine/index.ts` | Public API entry point |

---

## 5.4 Edge Case Handling

Per SPEC §6.5 and §7.2:

| Edge Case | Handling |
|-----------|----------|
| Empty initial deck | Auto-generate via greedy sort |
| Wrong-sized initial deck | Discard and auto-generate |
| Collection = exactly 40 cards | One valid deck, return immediately |
| Only one card type | Fill deck with max copies + next-best |
| No fusions possible | Scoring degenerates to max base ATK |
| All cards ATK 0 | Score = 0, return valid deck |
| Collection < 40 total cards | Return error |
| Cancellation (AbortSignal) | Return best valid deck found so far |

---

## 5.5 Tests

| Test | Validates |
|------|-----------|
| `exact scorer counts all hands` | Returns exactly 658,008 evaluations |
| `exact scorer matches known value` | Hand-computed deck scores correctly |
| `exact scorer determinism` | Same deck → same score |
| `deduplication works` | Identical decks (different order) merged |
| `refinement picks true best` | Exact-best may differ from MC-best |
| `worker sends RESULT after HALT` | Message protocol round-trip |
| `orchestrator picks best` | Highest-scoring deck selected |
| `public API valid output` | 40 cards, within collection, valid IDs |
| `public API respects time limit` | Completes within specified time |
| `public API non-regression` | Output score >= initial score |
| `cancellation returns best so far` | Abort mid-run → still valid deck |
| **SPEC validation matrix** | |
| `S1: zero deck` | Empty deck scores 0 |
| `S2: single card type` | 40× same card → score = card ATK |
| `S3: score bounds` | min_ATK <= score <= max_achievable_ATK |
| `S6: determinism` | Same input → same output |
| `O1: valid output` | 40 cards, within bounds, valid IDs |
| `O2: non-regression` | finalScore >= initialScore |
| `O3: improves weak decks` | Bad deck + good collection → improvement |
| `O4: respects collection` | Never exceeds owned quantities |
| `F1: name priority` | Name-name > kind-kind |
| `F2: strict improvement` | No fusion if result ATK <= material ATK |
| `F3: commutativity` | fuse(A,B) == fuse(B,A) |
| `F4: chain depth limit` | Max 3 fusions (4 materials) |
| `F5: fusion result restriction` | Results can't re-fuse by own kind |

---

## 5.6 Success Criteria

1. All tests pass, including full SPEC validation matrix.
2. Exact scorer completes in <700ms per deck.
3. Refinement phase fits in 5-second budget.
4. Workers run in parallel and return results within time budget.
5. Public API produces valid, optimized decks.
6. End-to-end completes within 60s.
7. `bun lint` and `bun test` pass.
