# Phase 4: Main Thread Orchestration & Exact Refinement

**Goal:** Wire up the Web Worker infrastructure. The main thread spawns N workers, distributes work, enforces the 60-second time limit, gathers results, and runs exact scoring on the best candidates. This is the production runtime layer.

**Depends on:** Phase 0–3 (all interfaces, data structures, scorers, optimizer).

---

## 4.1 Files to Create

| File | Purpose |
|------|---------|
| `src/worker/optimizer-worker.ts` | Web Worker entry point — receives buffers, runs SA, returns best deck |
| `src/orchestrator/orchestrator.ts` | Main thread coordinator — spawns workers, manages timing, gathers results |
| `src/scoring/exact-scorer.ts` | Exact combinatorial evaluator — scores a deck over all C(40,5) = 658,008 hands |
| `src/worker/messages.ts` | Typed message protocol between main thread and workers |

---

## 4.2 Worker Message Protocol (`src/worker/messages.ts`)

Define strict typed messages for main ↔ worker communication. No `any` types.

```ts
/** Messages from Main Thread → Worker */
export type WorkerInMessage =
  | {
      type: 'INIT';
      fusionTableFull: Int16Array;
      fusionTableNameOnly: Int16Array;
      cardAtk: Int16Array;
      deck: Int16Array;
      cardCounts: Uint8Array;
      availableCounts: Uint8Array;
      handIndices: Uint8Array;
      affectedHandIds: Uint16Array;
      affectedHandOffsets: Uint32Array;
      affectedHandCounts: Uint16Array;
      seed: number;
      saConfig: SAConfig;
    }
  | { type: 'HALT' };

/** Messages from Worker → Main Thread */
export type WorkerOutMessage =
  | {
      type: 'RESULT';
      bestDeck: Int16Array;
      bestScore: number;
      iterations: number;
    }
  | {
      type: 'PROGRESS';
      currentScore: number;
      iterations: number;
    };
```

### Transfer Strategy

For maximum performance, use `postMessage` with **Transferable** buffers where possible:
- The `INIT` message transfers the lookup tables. Since each worker needs its own mutable `deck` and `cardCounts`, these are **copied** (not transferred).
- Shared immutable tables (`fusionTableFull`, `fusionTableNameOnly`, `cardAtk`, `handIndices`, `affectedHandIds`, `affectedHandOffsets`, `affectedHandCounts`) can use `SharedArrayBuffer` if available, falling back to copies if not.

```ts
// If SharedArrayBuffer is available (requires COOP/COEP headers):
const sharedFusionFull = new SharedArrayBuffer(fusionTableFull.byteLength);
new Int16Array(sharedFusionFull).set(fusionTableFull);
// All workers receive the same SharedArrayBuffer view — zero-copy.

// Fallback: structured clone (copies per worker, higher memory but always works).
```

---

## 4.3 Worker Entry Point (`src/worker/optimizer-worker.ts`)

```
onmessage handler:

  case 'INIT':
    // 1. Unpack all buffers from message
    // 2. Create FusionScorer and FusionDeltaScorer instances
    // 3. Create SAOptimizer with the provided seed/config
    // 4. Compute initial handScores from deck + handIndices
    // 5. Create AbortController (aborted on HALT message)
    // 6. Run optimizer.run(...)
    // 7. Post RESULT message back with bestDeck + bestScore

  case 'HALT':
    // Trigger AbortController.abort()
    // The SA loop will exit naturally, and step 7 above fires
```

### Progress Reporting

Optionally, every ~10,000 iterations, post a `PROGRESS` message so the main thread can display real-time feedback. This uses a simple counter check in the SA loop — no timer allocations.

---

## 4.4 Orchestrator (`src/orchestrator/orchestrator.ts`)

### Lifecycle

```
async function optimize(gameData, collection, initialDeck?): Promise<OptimizerResult>

  // Phase 1: Pre-computation (runs synchronously on main thread)
  buffers = buildAllBuffers(gameData, collection, initialDeck)

  // Compute initial score for comparison
  initialScore = computeTotalScore(buffers, scorer)

  // Spawn workers
  numWorkers = navigator.hardwareConcurrency || 4
  workers = []
  for i = 0 to numWorkers - 1:
    worker = new Worker('optimizer-worker.ts')
    workers.push(worker)

  // Send INIT to each worker with different seeds
  for i = 0 to numWorkers - 1:
    workers[i].postMessage({
      type: 'INIT',
      ...buffers,         // shared or copied tables
      deck: randomVariant(buffers.deck, i),  // slightly different starting decks
      seed: i * 0x9E3779B9,
      saConfig: { initialTemp: 1000, coolingRate: 0.9999, ... }
    })

  // Set 55-second timeout
  await sleep(55_000)

  // Send HALT to all workers
  for worker of workers:
    worker.postMessage({ type: 'HALT' })

  // Gather results (with 2-second timeout for stragglers)
  results = await Promise.all(
    workers.map(w => waitForResult(w, 2000))
  )

  // Phase 4: Exact refinement (final ~3 seconds)
  bestDecks = deduplicateAndRank(results)
  exactResults = []
  for deck of bestDecks.slice(0, 3):  // score top 3
    exactScore = exactScorer.score(deck, fusionTableFull, fusionTableNameOnly, cardAtk)
    exactResults.push({ deck, exactScore })

  // Select winner
  winner = exactResults.sort((a, b) => b.exactScore - a.exactScore)[0]

  // Terminate workers
  workers.forEach(w => w.terminate())

  return {
    deck: winner.deck,
    score: winner.exactScore,
    initialScore: initialScore,
    improvement: winner.exactScore - initialScore,
    metrics: { numWorkers, totalIterations, elapsedMs }
  }
```

### Starting Deck Diversity

Don't give all workers the same starting deck. Variations:
- Worker 0: The greedy-sorted deck from Phase 1.
- Worker 1: Greedy deck with 5 random swaps.
- Worker 2: Greedy deck with 10 random swaps.
- Worker N: Fully random valid deck.

This ensures workers explore different regions of the search space.

---

## 4.5 Exact Scorer (`src/scoring/exact-scorer.ts`)

The exact scorer iterates over ALL C(40,5) = 658,008 possible 5-card hands from a 40-card deck and computes the true expected maximum ATK.

```
score(deck, fusionTableFull, fusionTableNameOnly, cardAtk) -> number:
  totalAtk = 0
  handBuf = Uint16Array(5)  // pre-allocated once
  count = 0

  for a = 0 to 35:
    for b = a+1 to 36:
      for c = b+1 to 37:
        for d = c+1 to 38:
          for e = d+1 to 39:
            handBuf[0] = deck[a]
            handBuf[1] = deck[b]
            handBuf[2] = deck[c]
            handBuf[3] = deck[d]
            handBuf[4] = deck[e]
            maxAtk = fusionScorer.evaluateHand(handBuf, fusionTableFull, cardAtk)
            totalAtk += maxAtk
            count++

  return totalAtk / count   // expected value = average max ATK
```

**count** will always be 658,008. The division gives the exact expected maximum ATK.

### Performance Budget

- 658,008 hands × FusionScorer evaluation.
- At 500K evals/sec (Phase 2 target), this takes ~1.3 seconds per deck.
- With 3 candidate decks to score: ~4 seconds. Fits comfortably in the 5-second exact refinement window.

---

## 4.6 Tests

### File to Create

| File | Purpose |
|------|---------|
| `tests/phase4.test.ts` | Tests for worker orchestration and exact scoring |

| Test | Validates |
|------|-----------|
| `Exact scorer: known deck` | Score a hand-crafted deck with known expected ATK |
| `Exact scorer: single card type` | 40 copies of same card → score equals that card's ATK exactly (SPEC S2) |
| `Exact scorer: determinism` | Same deck → same score every time (SPEC S6) |
| `Exact scorer: score bounds` | Score is in [min_atk_in_deck, max_achievable_atk] (SPEC S3) |
| `Worker: receives INIT and returns RESULT` | End-to-end worker message round-trip |
| `Worker: responds to HALT within 100ms` | Worker stops and returns result promptly |
| `Worker: RESULT contains valid deck` | 40 cards, within bounds |
| `Orchestrator: end-to-end under 60 seconds` | Full run completes within time limit |
| `Orchestrator: non-regression` | Final score >= initial score (SPEC O2) |
| `Orchestrator: valid output deck` | Output satisfies all hard constraints (SPEC O1, O4) |
| `Orchestrator: improves weak deck` | Trivially bad deck gets improved (SPEC O3) |
| `Orchestrator: cancellation` | If orchestrator is cancelled, returns best found so far (SPEC O5) |

---

## 4.7 Success Criteria

1. All Phase 4 tests pass.
2. Workers spawn, receive data, run SA, and return results without errors.
3. HALT message reliably stops all workers within 2 seconds.
4. Exact scorer produces deterministic results matching hand-computed expected values.
5. Full end-to-end run completes within 60 seconds.
6. Non-regression: final score >= initial score in all test scenarios.
7. Works with `navigator.hardwareConcurrency` ranging from 1 to 16.

---

## 4.8 File Tree Additions After Phase 4

```
src/
  worker/
    optimizer-worker.ts
    messages.ts
  orchestrator/
    orchestrator.ts
  scoring/
    exact-scorer.ts
tests/
  phase4.test.ts
```
