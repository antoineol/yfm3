# IMPLEMENTATION PLAN: FM DECK OPTIMIZER

**Architecture:** Fixed-Index Correlated Monte Carlo (CRN) with Simulated Annealing and Exact Refinement.

**Target Environment:** TypeScript (Browser/Bun), Strict 60s Execution.

## Global Directives

- **Zero Allocations in Hot Loops:** No `new Array()`, `[]`, `.map()`, `.filter()` during the search phase.
- **Typed Arrays Only:** All state, lookups, and buffers use 1D typed arrays (`Int16Array`, `Uint8Array`, `Uint16Array`, `Uint32Array`).
- **Flatten Everything:** 2D arrays flattened into 1D with index offset calculations.

---

## Architecture Overview

```
Main Thread
───────────
Load CSVs → fusionTable, cardAtk
Build initial deck (greedy)
Sample 15,000 hands (slot indices)
Build CSR reverse lookup
Score all hands (initial handScores)

SA loop (55s):
  Pick random slot
  Pick biased candidate
  Skip if tabu
  Swap deck[slot]
  Delta = rescore ~1,875 hands
  Accept/reject (SA criterion)
  Update tabu list
  Cool temperature

Exact refinement:
  Score best deck via all C(40,5) = 658,008 hands
  (~660ms)

Return best deck + exact expected ATK
```

---

## Performance Budget

| Phase | Time | What Happens |
|---|---|---|
| Precompute | 0–1s | Load CSVs, build fusion table, sample hands, build CSR |
| SA search | 1–56s | Single-threaded SA, ~27,500 swaps, biased selection + tabu |
| Exact refinement | 56–57s | Score best deck via all 658,008 hands |

**Iteration budget:** ~27,500 swaps (single thread). Degrades to ~11,000 on fusion-dense decks (~5ms/swap).

**Per-swap cost:** ~1,875 hands × ~1μs/hand = ~2ms. Degrades to ~4–6ms on fusion-dense decks.

---

## Phases

| Phase | Step File | What It Builds |
|---|---|---|
| 1: Setup & Data (DONE) | `docs/steps/v1/phase-1-setup-and-data.md` | Tech stack, types, CSV parsers, fusion table, hand pool, initial deck |
| 2: Reference Tests (DONE) | `docs/steps/v1/phase-2-reference-tests.md` | Reference scorer, golden test fixtures |
| 3: Hand Evaluator (DONE) | `docs/steps/v1/phase-3-hand-evaluator.md` | Fusion-chain DFS scorer + initial scoring |
| 4: SA Optimizer (DONE) | `docs/steps/v1/phase-4-sa-optimizer.md` | SA + tabu + biased selection |
| 5: Integration (DONE) | `docs/steps/v1/phase-5-integration.md` | Exact refinement, public API |
| 1-UI: Convex + UI (DONE) | `docs/steps/phase-1-setup-convex.md` | Minimalist UI to test optimizer with Convex data |
| 6 (V2): Web Workers (DONE) | `docs/steps/phase-6-web-workers.md` | Parallelize SA across 4-8 workers, unblock UI |
| 6.1 (V2): Adaptive Cooling & Worker Count (DONE) | `docs/steps/phase-6.1-adaptive-cooling-and-worker-count.md` | Fix truncated cooling schedule, cap worker count |
| 6.5 (V2): Early Termination (DONE) | `docs/steps/phase-6.5-early-termination.md` | Progress reporting + convergence detection |
| 6.6 (V2): Offload Exact Scoring (DONE) | `docs/steps/phase-6.6-offload-exact-scoring.md` | Move exact scoring off main thread |
| 7 (V2): Multi-Start (DONE) | `docs/steps/phase-7-multi-start.md` | Different initial decks per worker |
| 8.1: Configuration UI (DONE) | `docs/steps/phase-8.1-configuration-ui-including-deck-size.md` | Global config module, persisted preferences, ConfigPanel UI |
| 9: Configurable Fusion Depth (DONE) | `docs/steps/phase-9-accept-different-depth.md` | Configurable fusion chain depth (1–4), threaded through config/workers/UI |
| **Port YFM2 Features** | [`docs/steps/overview-port-yfm2-features.md`](steps/overview-port-yfm2-features.md) | Overview & feature gap analysis |
| P0a: Authentication (DONE) | [`docs/steps/p1.1-auth.md`](steps/p1.1-auth.md) | Clerk + Google OAuth with Convex-authenticated data access |
| P0b: Baseline UX Polish (DONE) | [`docs/steps/p1.5-baseline-ux-polish.md`](steps/p1.5-baseline-ux-polish.md) | Fix broken config inputs, visual hierarchy, card display |
| P0c: Shared Infrastructure (DONE) | [`docs/steps/p1.9-shared-infrastructure.md`](steps/p1.9-shared-infrastructure.md) | FusionTable context, CardAutocomplete, tab navigation shell |
| P1: Hand Fusion Calculator (DONE) | [`docs/steps/p2-hand-fusion-calculator.md`](steps/p2-hand-fusion-calculator.md) | 5-card hand simulation, real-time fusion chains, play fusion |
| P2: Optimization UX (DONE) | [`docs/steps/p3-optimization-ux.md`](steps/p3-optimization-ux.md) | Progress bar, cancel, accept/reject/re-run |
| Card Row Readability (DONE) | [`docs/steps/manual-optimization-result-readability.md`](steps/manual-optimization-result-readability.md) | Show card IDs inline with names in the shared card table, including optimization loading/results, and improve remove/error red contrast across the app theme |
| P3: Deck Intelligence (DONE) | [`docs/steps/p4-deck-intelligence.md`](steps/p4-deck-intelligence.md) | Deck fusion list, score explanation with probabilities |
| Card Display Hygiene (DONE) | — | Hide monster-only ATK/DFD values for non-monster Best Plays and fusion-reference rows, while preserving type-based card rendering |
| P4: Collection & Deck Editing (DONE) | [`docs/steps/p5-collection-ux.md`](steps/p5-collection-ux.md) | Last-added hint, collection actions, manual deck add/remove, centralized UI ownership semantics, explicit owned-card naming |
| P4.5: Animate Generated Deck (DONE) | [`docs/steps/p5.5-animate-generated-deck.md`](steps/p5.5-animate-generated-deck.md) | Live deck preview with auto-animate during optimization |
| P5: New Card Deck Swap Suggestion (DONE) | [`docs/steps/p6-new-card-suggest-to-deck.md`](steps/p6-new-card-suggest-to-deck.md) | Suggest and optionally apply a caller-gated ranked-then-exact one-card deck upgrade after adding a card with narrow worker payloads |
| P5.5: Simplify Deck Swap Suggestion (DONE) | [`docs/steps/p6.5-refactor.md`](steps/p6.5-refactor.md) | Keep suggestion worker lifecycle lazy/stable, caller-side availability gating, and resilience to reference-only data churn |
| P7: Shared Reference Data (DONE) | [`docs/steps/p7-fusion-reference.md`](steps/p7-fusion-reference.md) | Google Sheets as canonical source, shared runtime store, permissions model, and backup snapshots |
| P8: Google Sheets Fusions | [`docs/steps/p8-google-sheets-fusions.md`](steps/p8-google-sheets-fusions.md) | Replace static fusion CSV with backend-imported Google Sheets fusion data |
| P9: Reference Data CRUD | [`docs/steps/p9-reference-data-crud.md`](steps/p9-reference-data-crud.md) | Cards & fusions CRUD UI with Google Sheets write-back |
| **Emulator Bridge** | [`docs/emulator-bridge.md`](emulator-bridge.md) | Real-time hand detection from DuckStation via shared memory + WebSocket bridge |
| **Bridge Gold Card Stats** (DONE) | [`docs/steps/bridge-gold-card-stats.md`](steps/bridge-gold-card-stats.md) | Select the active Gold card-stat table by live RAM hash and reject stale or impossible metadata caches |
| **Bridge Card Colors** (DONE) | [`docs/steps/bridge-gold-card-stats.md`](steps/bridge-gold-card-stats.md) | Keep card frame colors separate from card-name label colors; use Gold's packed EXE table for frames and `{F8 0A XX}` prefixes for labels |
| **Post-Duel Optimization Reliability** (DONE) | — | Keep the collection-change detector app-wide, preserve baselines across transient bridge resets, missing collection frames, and results-screen reconnects, start optimization as soon as reward cards appear even if the phase still looks active, keep post-duel work running through the next duel, hide stale post-duel UI once a new active hand is confirmed, fall back to selected-mod data if bridge game data is unavailable, abort hung optimizer runs, and keep the results screen in the duel lifecycle until the game scene actually exits |
| **Duel Best Play Path Selection** (DONE) | [`docs/steps/duel-best-play-path-selection.md`](steps/duel-best-play-path-selection.md) | Pick the displayed path for equivalent Best Plays by preferring fewer materials, then preserving the strongest remaining hand play and lower-ATK material paths |
| **Duel Results HUD Hygiene** (DONE) | — | Hide active-duel helpers such as opponent-cheat warnings and cheat-view controls once the duel phase has ended |
| **Campaign Reward Pool Evidence** (DONE) | [`docs/dropx15.md`](dropx15.md) | Capture rank counters and credited-card fit evidence; use the community Ghost/FMR x15 routine for compatible images, including Gold and the verified PAL French port, with verified x15 starchip save updates |
| **Bridge Distribution** | — | Portable Windows zip with in-app setup guide, update notification, and GitHub Actions release workflow |
| **Onboarding Flow** (DONE) | [`docs/onboard/auto-duckstation-setting.md`](onboard/auto-duckstation-setting.md) | Mode chooser, prerequisite steps, shared-memory auto-patch, and bridge-only data in auto-sync mode |
| **Agent Game Control** | [`docs/steps/agent-game-control.md`](steps/agent-game-control.md) | AI agent control of gameplay via PostMessage input + save state loading through bridge WebSocket |
| **Rank Scoring Profiles** (CURRENT) | [`docs/steps/rank-scoring-profiles.md`](steps/rank-scoring-profiles.md) | Extract rank tables from the active disc image, with vanilla/RP profiles as fallback |
| **Duel Cursor Target** (CURRENT) | [`docs/steps/duel-cursor-target.md`](steps/duel-cursor-target.md) | Show focused cards and target-selection battle prediction in the duel HUD without revealing opponent hidden cards unless cheat mode is enabled; PAL now maps target-card id plus empty-slot clearing |
| **PAL Bridge Feature Parity** (CURRENT) | [`docs/steps/pal-bridge-feature-parity.md`](steps/pal-bridge-feature-parity.md) | Map and verify PAL French bridge memory fields for cursor focus, terrain, rank counters, post-duel lifecycle, opponent focus, hand slots, free-duel unlocks, and localized equip bonuses; PAL cards-left now uses the live deal counter during active duels and the result rank cards-used byte on results, PAL field cursor target reads from `0x09C6B8`, PAL field-card focus reads non-zero at `0x09C6D1`, and PAL card metadata keeps canonical type/guardian-star/attribute enums while names/descriptions stay localized |
