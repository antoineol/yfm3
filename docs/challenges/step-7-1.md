# Phase 7 Plan Review — Issues & Suggestions

## 1. Section 7.3: Leverage Phase 6.6 Scorer Workers

The plan says "exact score each (~660ms each, ~5s total)", implying sequential main-thread scoring. Phase 6.6 introduced `scoreInWorker` — scorer workers that run `exactScore` off the main thread.

**Fix:** Score all top-N candidate decks in parallel by spawning N scorer workers simultaneously. Total wall-clock time ≈ 660ms regardless of N (all workers run concurrently). `EXACT_SCORING_RESERVE` does not need to scale with candidate count.

## 2. Missing: Worker Protocol Change

The plan doesn't explain how workers receive a non-greedy initial deck. Currently `initializeBuffersBrowser` always calls `buildInitialDeck` (greedy). To support multi-start:

- Add `initialDeck?: number[]` to `WorkerInit` in `messages.ts`.
- In `sa-worker.ts`, after `initializeBuffersBrowser`, if `initialDeck` is provided:
  1. Zero-fill `buf.cardCounts`.
  2. Copy `initialDeck` into `buf.deck` and rebuild `buf.cardCounts` from it.
  3. Call `computeInitialScores(buf, scorer)` as usual.
- `handSlots` and CSR reverse lookup are slot-index-based — they remain valid after a deck swap. No regeneration needed.

## 3. Missing: Where Strategy Logic Runs

The plan says seed strategies go in `seed-strategies.ts` but doesn't say **who calls them**. Two options:

**Option A — Orchestrator generates decks (recommended):**
- Orchestrator generates initial decks and passes them via `WorkerInit.initialDeck`.
- Workers stay simple (no strategy awareness).
- **Problem:** Generating valid decks requires card data (available card IDs, max copies). The orchestrator currently doesn't load game data — it only forwards the collection record to workers.
- **Solution:** Either load game data once in the orchestrator (~100ms overhead, clean), or derive card IDs directly from the collection keys (no CSV needed — the collection already tells us which cards are available and how many).

**Option B — Workers generate their own decks:**
- Add a `strategy: "greedy" | "perturbed" | "random"` enum to `WorkerInit`.
- Each worker calls the appropriate strategy function after `initializeBuffersBrowser`.
- Avoids loading data on the main thread, but makes workers more complex.

Option A is simpler and keeps workers as pure SA executors. The collection record already has all the information needed to generate random valid decks (card IDs = keys, max copies = min(values, MAX_COPIES)), so no CSV loading is needed on the main thread.

## 4. Seed Strategies Need Only the Collection

The plan implies strategies need `buf.availableCounts` and `CardSpec[]`, but for generating random/perturbed decks, all we need is the collection `Record<number, number>`:

- Card IDs = `Object.keys(collection)`
- Max copies per card = `min(collection[id], MAX_COPIES)`
- ATK values = only needed for the greedy strategy (worker 0), which `buildInitialDeck` already handles inside the worker

So `seed-strategies.ts` can operate purely on the collection record — no buffers or CSV data required.
