# Phase 6.6: Offload Exact Scoring to Workers

**Goal:** Eliminate the ~1s main-thread freeze caused by synchronous exact scoring in the orchestrator, so the UI stays responsive throughout the entire optimization pipeline.

**Depends on:** Phase 6.5 (Early Termination).

---

## Problem

The orchestrator runs two `exactScore` calls on the main thread:

1. **Current deck scoring** (before workers start): `initializeBuffersBrowser` + `exactScore` — blocks ~500ms.
2. **Best deck scoring** (after workers finish): `initializeBuffersBrowser` + `exactScore` — blocks ~500ms.

Each call enumerates all C(40,5) = 658,008 hands synchronously. Together they freeze the UI for ~1 second.

---

## 6.6.1 Scorer Worker

Create `src/engine/worker/scorer-worker.ts` — a lightweight worker that receives a deck + collection, initializes buffers, runs `exactScore`, and posts the result.

```ts
type ScorerInit = {
  type: "SCORE";
  collection: Record<number, number>;
  deck: number[];
};

type ScorerResult = {
  type: "SCORE_RESULT";
  expectedAtk: number;
};
```

The worker:
1. Receives `ScorerInit`
2. Calls `initializeBuffersBrowser(collection, rand)` to get buffers with fusion table
3. Copies the provided deck into `buf.deck`
4. Calls `exactScore(buf, scorer)`
5. Posts `ScorerResult`

This reuses all existing engine code — no new scoring logic needed.

---

## 6.6.2 Message Types

Add `ScorerInit` and `ScorerResult` to `messages.ts`:

```ts
export type ScorerInit = {
  type: "SCORE";
  collection: Record<number, number>;
  deck: number[];
};

export type ScorerResult = {
  type: "SCORE_RESULT";
  expectedAtk: number;
};
```

---

## 6.6.3 Orchestrator Changes

Replace the two synchronous `exactScore` calls with async worker calls:

1. **Current deck scoring:** Spawn a scorer worker immediately (runs in parallel with SA workers).
2. **Best deck scoring:** Spawn a scorer worker after picking the best SA result (or reuse a terminated SA worker slot).

Both calls become `await`-based. The orchestrator remains async and the main thread stays free.

```
Before (blocking):
  [main] exactScore(currentDeck)        ~500ms FREEZE
  [main] spawn workers, wait...
  [main] exactScore(bestDeck)           ~500ms FREEZE

After (non-blocking):
  [worker A] exactScore(currentDeck)    parallel with SA
  [workers]  SA optimization...
  [worker B] exactScore(bestDeck)       after SA completes
  [main]     idle throughout            no freeze
```

The `EXACT_SCORING_RESERVE` constant (5s) can be reduced since exact scoring (~660ms) no longer competes with the main thread.

---

## 6.6.4 Orchestrator Flow

```ts
// 1. Fire current-deck scoring in a worker (non-blocking)
let currentDeckPromise: Promise<number | null> = Promise.resolve(null);
if (options?.currentDeck?.length === DECK_SIZE) {
  currentDeckPromise = scoreInWorker(collectionRecord, options.currentDeck);
}

// 2. Run SA workers as before...
const results = await Promise.all(saPromises);

// 3. Pick best, score it in a worker (non-blocking)
const expectedAtk = await scoreInWorker(collectionRecord, best.bestDeck);

// 4. Await current deck score (likely already done, ran in parallel)
const currentDeckScore = await currentDeckPromise;
```

`scoreInWorker` is a small helper that spawns a scorer worker, sends `ScorerInit`, and returns a Promise that resolves on `ScorerResult`.

---

## 6.6.5 Trade-offs

- **Pro:** Eliminates ~1s UI freeze — main thread does zero computation.
- **Pro:** Current deck scoring runs in parallel with SA, so total wall-clock time doesn't increase.
- **Pro:** No new engine code — just a thin worker wrapper around existing `exactScore`.
- **Con:** Two extra short-lived workers (each ~660ms). On low-core machines (2 cores), this briefly adds contention with SA workers — but SA is already finishing by the time best-deck scoring starts.
- **Con:** Slightly more complex orchestrator code (worker lifecycle management for scorer workers).
