# Behavior Inventory

## Review Notes

- Status: draft for human review, not source of truth.
- Purpose: collect candidate behaviors that may need protection before refactoring.
- Evidence types: tests, implementation, scripts, generated data, docs, UI flow.
- Confidence means "well evidenced in the repo", not "product-approved".
- `docs/SPEC.md` is treated as draft evidence only.

## High-Level Product Areas

| Area | What Appears To Matter | Evidence | Confidence | Review Needed |
| --- | --- | --- | --- | --- |
| Deck optimization | Build a valid deck, score expected opening-hand ATK, report improvement, support cancellation/progress. | `src/engine/orchestrator.ts`, `src/engine/optimizer/*`, optimizer tests | High | Confirm whether expected ATK remains the primary business metric. |
| Hand/fusion scoring | Evaluate direct plays, fusions, chains, equips, and terrain/field bonuses. | `src/engine/scoring/*`, `src/test/reference-scorer.ts`, scoring tests | High | Confirm which scorer is the intended oracle, especially for equips. |
| Game data | Prefer bridge/extracted active-disc data when present, with static CSV fallback. | `bridge/game-data.ts`, `src/engine/data/*`, `public/data/*`, extraction tests | High | Confirm supported discs/mods and whether static data is legacy or product surface. |
| Bridge runtime | Connect to DuckStation, read RAM, resolve active disc, broadcast state/data, expose local write APIs. | `bridge/serve.ts`, `bridge/memory.ts`, bridge tests | High | Confirm bridge is still a core product surface. |
| Live duel helpers | Show live hand/field/rank/prediction info, with cheat mode controlling hidden opponent data. | `src/ui/features/duel/*`, `src/ui/features/hand/*`, bridge state tests | Medium | Confirm which live-duel helpers are durable versus experiments. |
| Data/edit patching | Patch active ISO drop pools and reward multiplier with backups and ambiguity refusal. | `bridge/iso-edit.ts`, `bridge/drop-x15-patch.ts`, data edit UI/tests | Medium | Confirm whether modding/patching is core or admin-only. |
| Save editing | Edit active DuckStation memcard in place, with backups and CRC updates. | `saveeditor/features.md`, `bridge/memcards.ts`, `src/engine/savefile/*` | High | Confirm auto-sync-only UI is still desired. |
| Persistence | Store collection, deck, hand, settings per user/mod using Convex; support anonymous users. | `convex/schema.ts`, `convex/*`, Convex tests | Medium | Confirm anonymous data behavior and auth migration expectations. |
| Import/export | Import/export collection/deck arrays with v1/v2 schema compatibility. | `src/ui/features/config/*`, `convex/importExport.ts` | Medium | Confirm whether v1 compatibility matters. |
| Farming recommendations | Suggest useful farmable cards/fusions and rank duelists by drops. | `src/engine/farm/*`, farm tests, `src/ui/features/farm/*` | Medium | Confirm whether current farming heuristic is product-critical. |
| Agent game control | Bridge accepts low-level input/load-state commands for testing/analysis. | `bridge/input.ts`, `bridge/agent-client.ts`, agent tests | Low | Confirm whether this is still active scope. |

## Candidate Behavioral Truths

### Deck Optimization And Scoring

- [ ] A valid optimized deck has exactly 40 physical cards, while `scoringSlots` may limit how many slots are scored/optimized.
  - Evidence: `src/engine/types/constants.ts`, `src/engine/types/buffers.test.ts`, `src/engine/orchestrator.ts`
  - Confidence: high
  - Risk if changed: optimizer output and UI deck assumptions diverge.
  - Review question: Should `scoringSlots` remain a user-facing setting or become internal/test-only?

- [ ] Optimization must respect owned collection counts and detected per-card deck-copy limits.
  - Evidence: `src/engine/orchestrator.ts`, `src/engine/optimizer/seed-strategies.test.ts`, `src/engine/optimizer/sa-optimizer.integration.test.ts`
  - Confidence: high
  - Risk if changed: illegal suggested decks.
  - Review question: Are deck-copy limits required for all product flows or only active-disc bridge mode?

- [ ] The score reported to users is expected max ATK across all 5-card hands drawn without replacement.
  - Evidence: `src/engine/scoring/exact-scorer.ts`, `src/test/reference-scorer.ts`, `README.md`
  - Confidence: high
  - Risk if changed: optimizer rankings and improvement numbers change.
  - Review question: Is expected ATK still the right business metric, or only the current implemented metric?

- [ ] The browser optimizer is multi-worker/multi-start SA; it picks the best exact-scored worker result.
  - Evidence: `src/engine/orchestrator.ts`, `src/engine/worker/*`, `src/engine/optimizer/sa-optimizer.integration.test.ts`
  - Confidence: high
  - Risk if changed: performance and determinism expectations change.
  - Review question: Is exact-scoring every final candidate required, or just desirable?

- [ ] Optimization cancellation should stop workers and return/fail without committing stale UI state.
  - Evidence: `src/ui/features/optimize/use-optimize.ts`, `src/engine/worker/sa-worker-pool.ts`
  - Confidence: medium
  - Risk if changed: users see stale or misleading suggestions.
  - Review question: Should cancel return the best known deck or clear the result?

- [ ] One-card swap suggestions exact-score a shortlist before recommending a swap.
  - Evidence: `src/engine/suggest-deck-swap.ts`, `src/engine/suggest-deck-swap.test.ts`
  - Confidence: high
  - Risk if changed: bad "last added card" recommendations.
  - Review question: Is this feature important enough to preserve during refactors?

### Fusion, Equip, And Field Rules

- [ ] Fusion lookup is represented as a commutative flat table.
  - Evidence: `src/engine/data/load-game-data-core.ts`, `src/engine/scoring/fusion-scorer.ts`, fusion tests
  - Confidence: high
  - Risk if changed: scoring, deck fusion lists, and farming become inconsistent.
  - Review question: Is table order or duplicate recipe handling observable to users?

- [ ] Fusion chains enforce the FM rule that after the first fusion, one material must be the previous result.
  - Evidence: `src/engine/scoring/fusion-scorer.ts`, `src/test/reference-scorer.ts`
  - Confidence: high
  - Risk if changed: best-play and deck scores can improve from impossible chains.
  - Review question: Should every fusion-path feature share one implementation of this rule?

- [ ] Production scoring applies equip cards as terminal bonuses after direct play or a fusion result.
  - Evidence: `src/engine/scoring/fusion-scorer.ts`, `src/engine/config.ts`
  - Confidence: medium
  - Risk if changed: optimization scores change, especially in modded data.
  - Review question: The reference scorer appears fusion-only; should it become equip-aware or remain separate?

- [ ] Terrain/field bonus can affect displayed and scored ATK/DEF, and a live RAM table may override vanilla rules.
  - Evidence: `src/engine/data/field-bonus.ts`, `src/ui/App.tsx`, `src/engine/data/field-bonus.test.ts`
  - Confidence: high
  - Risk if changed: live duel prediction and optimization disagree with the running game.
  - Review question: Should terrain be part of deck optimization by default?

- [ ] Best-play UI tie-breaks prefer higher DEF, fewer materials, better remaining play, then lower-value consumed materials.
  - Evidence: `docs/SPEC.md`, `src/engine/score-explainer.ts`, UI tests around hand/fusion results
  - Confidence: low
  - Risk if changed: user-facing explanations may reorder.
  - Review question: Is this desired behavior or just accumulated implementation detail?

### Game Data And Extraction

- [ ] Valid card IDs are modeled with an exclusive upper bound of 723; most gameplay cards are 1..722.
  - Evidence: `src/engine/types/constants.ts`, extraction/load tests
  - Confidence: high
  - Risk if changed: flat lookup indexes and save/collection mappings break.
  - Review question: Why does save editing use 720 card quantities while game data uses up to 722?

- [ ] Bridge-provided game data overrides CSV data in browser workers and UI contexts.
  - Evidence: `src/engine/worker/messages.ts`, `src/engine/data/load-game-data-core.ts`, `src/engine/orchestrator.ts`
  - Confidence: high
  - Risk if changed: mods and active disc edits may use stale/static data.
  - Review question: Should all UI surfaces eventually require bridge data, or keep offline/static mode?

- [ ] Game data includes cards, duelists, fusions, equips, equip bonuses, deck limits, rank scoring, field bonus table, and artwork key.
  - Evidence: `src/engine/worker/messages.ts`, `bridge/game-data.ts`, `bridge/serve.ts`
  - Confidence: high
  - Risk if changed: silently dropped bridge fields cause partial mod support.
  - Review question: Which fields are durable API contract versus cache implementation detail?

- [ ] Cache identity includes both game-data hash and disc path hash to prevent sibling ISO bleed.
  - Evidence: `bridge/game-data.ts`, `bridge/gamedata-cache.test.ts`
  - Confidence: high
  - Risk if changed: wrong cards/artwork/drop pools can be served after ROM swaps.
  - Review question: Is path-based identity acceptable if users move/rename discs?

- [ ] Cache entries are rejected for old extractor versions and for malformed localized structural data.
  - Evidence: `bridge/gamedata-cache.test.ts`
  - Confidence: high
  - Risk if changed: stale or corrupted extracted data persists.
  - Review question: Are cache invalidation rules centralized enough?

- [ ] Static CSV data exists for `vanilla` and `rp`, while scripts can extract/verify game data from local BINs.
  - Evidence: `public/data/*`, `tests/data/*`, `scripts/extract-game-data.ts`, `scripts/verify-game-data.ts`, `package.json`
  - Confidence: high
  - Risk if changed: tests and offline behavior lose fixtures.
  - Review question: Which static data sets are supported product inputs?

### Bridge Runtime And Live State

- [ ] The bridge WebSocket runs on `ws://localhost:3333` and broadcasts live state plus game data.
  - Evidence: `bridge/serve.ts`, `src/ui/lib/use-emulator-bridge.ts`
  - Confidence: high
  - Risk if changed: app cannot auto-sync or read live duel data.
  - Review question: Is the port stable API or just default configuration?

- [ ] UI keeps last-ready bridge state during short reconnect gaps when game data is available.
  - Evidence: `src/ui/lib/use-emulator-bridge.ts`, `src/ui/lib/use-emulator-bridge.test.ts`
  - Confidence: high
  - Risk if changed: bridge reloads cause noisy onboarding/setup states.
  - Review question: Is the 15s reconnect grace intentional?

- [ ] Bridge reads universal RAM tables for card stats, collection, deck, hand/field, opponent zones, and unlock bytes.
  - Evidence: `bridge/memory.ts`, `bridge/memory.test.ts`
  - Confidence: high
  - Risk if changed: auto-sync and duel helpers break.
  - Review question: Which RAM offsets are validated against which game versions?

- [ ] Version-specific live-duel offsets use profiles, PAL overrides, and structural scans where possible.
  - Evidence: `bridge/memory.ts`, `bridge/offset-profiles.ts`, `bridge/offset-profiles.test.ts`
  - Confidence: medium
  - Risk if changed: PAL/RP live state becomes incorrect.
  - Review question: Which PAL fields are trusted enough to preserve?

- [ ] ISO write APIs must refuse when active-disc resolution is ambiguous.
  - Evidence: `bridge/game-data.ts`, `bridge/serve.ts`, `bridge/game-data.test.ts`
  - Confidence: high
  - Risk if changed: wrong disc image can be patched.
  - Review question: Should read-only game data also refuse ambiguity, or only writes?

- [ ] Bridge supports background update staging and restart/update commands.
  - Evidence: `bridge/serve.ts`, `src/ui/features/bridge/*`
  - Confidence: medium
  - Risk if changed: bridge update UX regresses.
  - Review question: Is auto-update part of supported distribution?

### Duel UI And Prediction

- [ ] Main UI tabs are `deck`, `duel`, and `data`; deck sub-tabs include collection, deck, result, farm, and edit.
  - Evidence: `src/ui/App.tsx`, `src/ui/features/deck/DeckSubTabs.tsx`
  - Confidence: high
  - Risk if changed: routing/hash links and onboarding flow break.
  - Review question: Are these surfaces all still wanted?

- [ ] Onboarding gates bridge-dependent tabs, while save editing bypasses reference data and uses bridge HTTP data.
  - Evidence: `src/ui/App.tsx`, `saveeditor/features.md`
  - Confidence: high
  - Risk if changed: users may be blocked from save editing unnecessarily.
  - Review question: Is save editing intentionally available without full reference data?

- [ ] Opponent hidden cards are controlled by cheat mode; non-cheat helpers should avoid revealing hidden information.
  - Evidence: `src/ui/features/duel/*`, `src/ui/features/hand/*`, `convex/schema.ts`, `docs/TODO.md`
  - Confidence: medium
  - Risk if changed: product ethics/gameplay expectations change.
  - Review question: Which cheat-mode experiments should survive?

- [ ] Battle prediction should use live field ATK/DEF and avoid double-applying terrain.
  - Evidence: `src/ui/features/duel/battle-prediction.ts`, `src/ui/features/duel/battle-prediction.test.ts`, `docs/TODO.md`
  - Confidence: high
  - Risk if changed: displayed battle outcomes disagree with game state.
  - Review question: How important is guardian-star accuracy before refactoring prediction?

- [ ] Result screens and new active hands have special state reset behavior for post-duel suggestions.
  - Evidence: `src/ui/features/hand/use-post-duel-suggestion.ts`, related tests
  - Confidence: medium
  - Risk if changed: stale post-duel suggestions or aborted background optimization.
  - Review question: Is post-duel suggestion a core workflow?

### Save Editing

- [ ] The UI save editor targets the active DuckStation save only and writes in place with a timestamped backup.
  - Evidence: `saveeditor/features.md`, `bridge/memcards.ts`, `src/ui/features/saves/*`
  - Confidence: high
  - Risk if changed: users may edit the wrong file or lose rollback.
  - Review question: Should there ever be a manual file-picker mode?

- [ ] Save editor card names come from the matched BIN's extracted game data, not legacy static CSVs.
  - Evidence: `saveeditor/features.md`, `bridge/serve.ts`
  - Confidence: high
  - Risk if changed: modded saves display wrong card names.
  - Review question: Should unknown mod fingerprints block editing or only warn?

- [ ] CLI save editor semantics are separate and use `saveeditor/vanilla-cards.ts` for dump readability.
  - Evidence: `saveeditor/features.md`, `saveeditor/cli.ts`
  - Confidence: medium
  - Risk if changed: CLI users see changed output or dependencies.
  - Review question: Is the CLI still maintained?

- [ ] Save bytes support 720 card quantities, 24-bit little-endian starchips, and CRC updates over two regions.
  - Evidence: `src/engine/savefile/save.ts`, `src/engine/savefile/save.test.ts`
  - Confidence: high
  - Risk if changed: edited saves may be rejected or corrupted.
  - Review question: Is 720-card save scope correct for all supported discs?

- [ ] Memcard backup retention keeps newest 50 `.mcd` backups and creates pre-restore backups.
  - Evidence: `bridge/memcards.ts`, `bridge/memcards.test.ts`, `saveeditor/features.md`
  - Confidence: high
  - Risk if changed: restore/write safety changes.
  - Review question: Is 50 the intended retention count?

### ISO Editing And Patching

- [ ] Drop pool patching edits one duelist pool, validates 722 weights, creates ISO backup, then prunes old backups.
  - Evidence: `bridge/iso-edit.ts`, data edit UI tests
  - Confidence: high
  - Risk if changed: invalid or unsafe ISO writes.
  - Review question: Should pool sum `2048` be enforced at this layer or UI layer?

- [ ] ISO backup retention keeps newest 20 `.iso` backups under `.yfm3-iso-backups`.
  - Evidence: `bridge/iso-edit.ts`
  - Confidence: medium
  - Risk if changed: disk usage or restore safety changes.
  - Review question: Is 20 enough?

- [ ] Reward patching supports Ghost/FMR-style x15 and PAL selectable counts `[1, 5, 15, 50, 150, 1000]`.
  - Evidence: `bridge/drop-x15-patch.ts`, `bridge/drop-x15-patch.test.ts`, `docs/SPEC.md`
  - Confidence: medium
  - Risk if changed: unsupported discs may be patched incorrectly.
  - Review question: Which reward patch definitions are production-supported?

- [ ] After an ISO edit, bridge refreshes/persists extracted game data because RAM hash may not change.
  - Evidence: `bridge/serve.ts`, `bridge/game-data.ts`
  - Confidence: high
  - Risk if changed: UI shows stale drop pools after patch.
  - Review question: Is this refresh behavior covered well enough by tests?

### Persistence, Auth, And Sync

- [ ] Data is scoped by user and mod for collection, deck, hand, and per-mod settings.
  - Evidence: `convex/schema.ts`, `convex/*`
  - Confidence: high
  - Risk if changed: cross-mod or cross-user data leaks.
  - Review question: Should all user settings be per-mod?

- [ ] Unauthenticated users get a local UUID mapped to `anon:<uuid>`; authenticated Clerk identity wins.
  - Evidence: `src/ui/core/identity-context.tsx`, `convex/authHelper.ts`, `tests/convex/authHelper.test.ts`
  - Confidence: high
  - Risk if changed: users lose anonymous data or mix identities.
  - Review question: Is anonymous data migration to authenticated accounts required?

- [ ] Deck rows use fractional order, with card ID as fallback sort for missing/tied orders.
  - Evidence: `convex/deck.ts`, `tests/convex/getDeck.test.ts`
  - Confidence: high
  - Risk if changed: deck display/reordering changes.
  - Review question: Can old rows with missing order be migrated away?

- [ ] Bridge sync updates collection and deck by diffs to reduce database writes and subscription churn.
  - Evidence: `convex/importExport.ts`, `convex/diffHelpers.ts`
  - Confidence: medium
  - Risk if changed: autosync becomes noisy or expensive.
  - Review question: Is preserving row identity important for UI animations/order?

- [ ] Server-side deck add currently enforces max 3 copies, not active extracted deck limits.
  - Evidence: `convex/deck.ts`, `src/engine/data/game-db.ts`
  - Confidence: high
  - Risk if changed: manual deck edits may accept cards illegal under active disc limits.
  - Review question: Is this a bug to fix or acceptable because optimizer enforces limits?

### Import/Export

- [ ] Export schema v2 includes `mod`; v1 lacks mod and is treated as `rp`.
  - Evidence: `src/ui/features/config/import-export-schema.ts`, config tests
  - Confidence: high
  - Risk if changed: old exported files may fail or import into wrong mod.
  - Review question: Does v1 compatibility still matter?

- [ ] Import validates deck card counts do not exceed imported collection counts before replacing data.
  - Evidence: `convex/importExport.ts`
  - Confidence: high
  - Risk if changed: impossible decks can be imported.
  - Review question: Should import also enforce deck size and deck-copy limits?

### Farming And Drops

- [ ] POW farming mode uses `max(saPow, bcd)` while TEC uses `saTec`.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: high
  - Risk if changed: duelist recommendations change.
  - Review question: Is this the intended user model for drop pools?

- [ ] A card with at least 3 owned copies is considered fully owned for farming recommendations.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: high
  - Risk if changed: farming recommendations expand or shrink.
  - Review question: Should detected deck-copy limits affect "fully owned"?

- [ ] Farming filters candidates by result ATK being above current deck score.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: medium
  - Risk if changed: recommendation volume and usefulness change.
  - Review question: Is deck expected ATK an appropriate threshold for single-card/fusion farming?

- [ ] Optional unlocked duelist filtering is supported from RAM unlock bytes.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, `bridge/memory.ts`, farm tests
  - Confidence: medium
  - Risk if changed: recommendations include unavailable duelists.
  - Review question: Which game versions have reliable unlock bytes?

### Agent Game Control

- [ ] Bridge accepts low-level input commands and load-state slots 1..8.
  - Evidence: `bridge/serve.ts`, `bridge/input.ts`, `tests/bridge/agent-client.test.ts`
  - Confidence: medium
  - Risk if changed: debug/data-collection workflows break.
  - Review question: Is this still needed outside tests?

- [ ] Agent control blocks save-state creation and known save hotkeys.
  - Evidence: `docs/SPEC.md`, `bridge/input.ts`, input/settings tests
  - Confidence: low
  - Risk if changed: automation could overwrite user progress.
  - Review question: Are safety boundaries implemented and tested enough to call this product behavior?

## Data And Compatibility Contracts

- [ ] Static public data contract: `cards.csv`, `fusions.csv`, `equips.csv`, optional `deck-limits.csv`.
  - Evidence: `src/engine/data/load-game-data-core.ts`, `public/data/*`
  - Confidence: high
  - Review question: Are CSV column positions stable API?

- [ ] Bridge game-data wire contract requires every `BridgeGameData` field to be explicitly forwarded.
  - Evidence: `src/engine/worker/messages.ts`, `bridge/serve.ts`
  - Confidence: high
  - Review question: Should bridge and UI share generated types instead?

- [ ] Save editor HTTP API uses `/api/active-save/*`; ISO editor uses `/api/active-iso/*`.
  - Evidence: `bridge/serve.ts`, UI bridge clients
  - Confidence: high
  - Review question: Are these routes external API or internal UI/bridge coupling?

- [ ] Import/export JSON supports versioned schemas, currently v1 and v2.
  - Evidence: `src/ui/features/config/import-export-schema.ts`
  - Confidence: high
  - Review question: Should future imports preserve unknown fields or be strict?

- [ ] Reference fixture generation writes committed generated TypeScript from fixture definitions.
  - Evidence: `scripts/generate-fixtures.ts`, `src/test/reference-fixture-defs.ts`, `src/test/reference-fixtures.gen.ts`
  - Confidence: high
  - Review question: Should generated fixtures include equip/terrain cases?

## Workflows

- [ ] Developer validation workflow: `bun typecheck`, `bun lint`, `bun run test`; integration tests are separate.
  - Evidence: `AGENTS.md`, `package.json`, `docs/SPEC.md`
  - Confidence: high
  - Review question: Should docs-only changes require all checks?

- [ ] Reference scoring workflow: edit fixture definitions, run `bun run gen:ref`, commit generated fixtures.
  - Evidence: `AGENTS.md`, `README.md`, `scripts/generate-fixtures.ts`
  - Confidence: high
  - Review question: Should this remain the primary scoring oracle workflow?

- [ ] Game-data extraction/verification workflow uses local BIN paths under `gamedata/*`.
  - Evidence: `package.json`, `scripts/extract-game-data.ts`, `scripts/verify-game-data.ts`
  - Confidence: medium
  - Review question: Are those paths developer-local assumptions or project conventions?

- [ ] Normal app use expects DuckStation/RomStation, bridge running locally, and web app connected to it.
  - Evidence: `README.md`, onboarding UI files, bridge setup tests
  - Confidence: medium
  - Review question: Is manual/offline mode still important?

- [ ] Save editing workflow requires auto-sync/bridge mode and active DuckStation context.
  - Evidence: `saveeditor/features.md`, `src/ui/features/saves/*`
  - Confidence: high
  - Review question: Is "active game only" acceptable long term?

## Test Oracles

- Strong current oracles:
  - `src/test/reference-scorer.ts` and generated fixtures for fusion/deck expected ATK without production scorer internals.
  - `src/engine/savefile/*.test.ts` for save offsets, CRCs, and bounds.
  - `bridge/gamedata-cache.test.ts` for cache invalidation and localization corruption rules.
  - `bridge/memcards.test.ts` for active-save resolution and backup behavior.
  - `bridge/game-data.test.ts` for active-disc ambiguity decisions.
  - `bridge/drop-x15-patch.test.ts` for byte-level reward patch semantics.
  - `src/engine/farm/discover-farmable-fusions.test.ts` for farming heuristics.

- Weaker or unclear oracles:
  - Best-play path selection across UI and scorer implementations.
  - Equip-aware scoring versus reference scorer, which appears fusion-only.
  - PAL live-duel fields that are still listed in `docs/TODO.md`.
  - Agent game control safety beyond low-level command tests.
  - End-to-end bridge plus real emulator/disc workflows.

- Integration-test trigger areas:
  - Production scoring or fusion behavior.
  - Game-data extraction from BINs.
  - Optimizer behavior involving workers, bridge data, deck limits, equip bonuses, or terrain.
  - Any patching behavior that changes extracted data or ISO bytes.

## Open Questions For Review

1. Is expected opening-hand max ATK still the central optimizer metric?
2. Should equip and terrain behavior be part of the reference scorer oracle?
3. Which product surfaces are core: optimizer, live duel assistant, save editor, ISO editor, farming, agent control?
4. Which supported discs/mods are durable commitments?
5. Should static CSV/offline mode remain first-class, or is active-disc bridge data the real product path?
6. Is anonymous Convex data expected to migrate when a user later signs in?
7. Should manual deck editing enforce extracted deck-copy limits, not just the optimizer?
8. Are save editing and ISO patching user-facing product features or developer/power-user tools?
9. Which PAL live-duel behaviors are validated enough to preserve?
10. Should current long-lived docs be rewritten after this inventory is reviewed?

## Suspected Refactor Tracks

These are hypotheses only. Do not execute them until the inventory is reviewed.

- Scoring oracle alignment
  - Why it looks valuable: production scoring, reference scoring, explanations, equips, and terrain may not share one behavior contract.
  - Behavior to protect first: expected ATK fixtures, fusion-chain legality, equip terminal bonuses, field bonus rules.

- Game-data boundary cleanup
  - Why it looks valuable: bridge wire data, CSV fallback, cache data, and UI contexts duplicate related concepts.
  - Behavior to protect first: active-disc override, cache identity, localized labels versus structural enums.

- Bridge API contract hardening
  - Why it looks valuable: WebSocket messages, HTTP APIs, and UI clients are hand-coupled.
  - Behavior to protect first: reconnect grace, ambiguity refusal, game-data forwarding, save/ISO backup semantics.

- Persistence and legality boundary
  - Why it looks valuable: Convex deck mutations enforce generic max 3 while engine can know extracted deck limits.
  - Behavior to protect first: user/mod scoping, anonymous identity, fractional order, import validation.

- Save/ISO write safety
  - Why it looks valuable: both systems implement local file writes and backups with similar but separate rules.
  - Behavior to protect first: pre-write backups, restore backups, retention counts, active-target resolution.

- Live-duel feature triage
  - Why it looks valuable: several PAL/cheat/opponent-pool behaviors look experimental and may be hard to refactor safely.
  - Behavior to protect first: hidden-info policy, battle prediction correctness, post-duel reset behavior.

- Documentation reset
  - Why it looks valuable: `docs/SPEC.md` currently mixes intended product rules, implementation notes, offsets, and draft claims.
  - Behavior to protect first: only inventory items validated by review.

