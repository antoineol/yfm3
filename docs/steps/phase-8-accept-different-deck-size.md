## Phase 8: Configurable Deck Size

**Status:** Done

**Goal:** Make the deck size configurable (5–40) instead of hardcoded to 40.

### Design

- `DECK_SIZE = 40` remains as the default/max value.
- `createBuffers(deckSize)` allocates correctly-sized arrays. All downstream code reads `buf.deck.length` instead of the constant.
- For small decks, `numHands` is capped at `C(deckSize, 5)` via a precomputed `CHOOSE_5` lookup table to prevent infinite sampling loops.
- `deckSize` flows through: `optimizeDeckParallel(options.deckSize)` → `WorkerInit.deckSize` → `initializeBuffersBrowser(deckSize)` → `createBuffers(deckSize)`.

### Files changed

- `src/engine/types/constants.ts` — added `CHOOSE_5` lookup table
- `src/engine/types/buffers.ts` — parameterized `createBuffers(deckSize)`
- `src/engine/data/hand-pool.ts`, `initial-deck.ts` — use `buf.deck.length`
- `src/engine/scoring/exact-scorer.ts`, `compute-initial-scores.ts` — dynamic loop bounds
- `src/engine/optimizer/sa-optimizer.ts`, `biased-selection.ts`, `tabu-list.ts`, `seed-strategies.ts` — use `buf.deck.length` or accept `deckSize` param
- `src/engine/initialize-buffers.ts`, `initialize-buffers-browser.ts` — accept `deckSize`
- `src/engine/worker/messages.ts`, `sa-worker.ts`, `scorer-worker.ts`, `orchestrator.ts` — thread `deckSize`
- `src/engine/index.ts`, `index-browser.ts` — accept `deckSize` option with validation
- `src/ui/App.tsx`, `src/ui/components/CollectionPanel.tsx` — deck size number input
- `src/test/reference-scorer.ts` — dynamic loop bounds
