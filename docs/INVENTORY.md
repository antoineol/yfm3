# Behavior Inventory

## Review Notes

- Status: draft for human review, not source of truth.
- Purpose: collect candidate behaviors that may need protection before refactoring.
- Evidence types: tests, implementation, scripts, generated data, docs, UI flow.
- Confidence means "well evidenced in the repo", not "product-approved".
- `docs/SPEC.md` is treated as draft evidence only.

## High-Level Product Areas

| Area | What Appears To Matter | Evidence | Confidence | Review Needed | Answer |
| --- | --- | --- | --- | --- | --- |
| Deck optimization | Build a valid deck, score expected opening-hand ATK, report improvement, support cancellation/progress. | `src/engine/orchestrator.ts`, `src/engine/optimizer/*`, optimizer tests | High | Confirm whether expected ATK remains the primary business metric. |yes|
| Hand/fusion scoring | Evaluate direct plays, fusions, chains, equips, and terrain/field bonuses. | `src/engine/scoring/*`, `src/test/reference-scorer.ts`, scoring tests | High | Confirm which scorer is the intended oracle, especially for equips. | I don't understand the question. What are the options?|
| Game data | Prefer bridge/extracted active-disc data when present, with static CSV fallback. | `bridge/game-data.ts`, `src/engine/data/*`, `public/data/*`, extraction tests | High | Confirm supported discs/mods and whether static data is legacy or product surface. |Supported mods: as many as possible; all mods that fit in the supported family (although there might be other mods we haven't anticipated yet). Static data is for manual mode only. For autosync, there is no CSV data usage at all expected, not even as fallback. For manual mode, I would simplify and enable it only for the vanilla game (EN), removing all other versions of the game (PAL/FR, mods...)|
| Bridge runtime | Connect to DuckStation, read RAM, resolve active disc, broadcast state/data, expose local write APIs. | `bridge/serve.ts`, `bridge/memory.ts`, bridge tests | High | Confirm bridge is still a core product surface. | Yes, bridge is core product, part of the autosync mode, even way more important than the manual mode.|
| Live duel helpers | Show live hand/field/rank/prediction info, with cheat mode controlling hidden opponent data. | `src/ui/features/duel/*`, `src/ui/features/hand/*`, bridge state tests | Medium | Confirm which live-duel helpers are durable versus experiments. |What are the options? Tell me what I should validate.|
| Data/edit patching | Patch active ISO drop pools and reward multiplier with backups and ambiguity refusal. | `bridge/iso-edit.ts`, `bridge/drop-x15-patch.ts`, data edit UI/tests | Medium | Confirm whether modding/patching is core or admin-only. |What do you mean by admin-only? It's a feature that's exposed to all users of the app, in autosync mode.|
| Save editing | Edit active DuckStation memcard in place, with backups and CRC updates. | `saveeditor/features.md`, `bridge/memcards.ts`, `src/engine/savefile/*` | High | Confirm auto-sync-only UI is still desired. |What is CRC update? And I confirm it's autosync only. It can't work in manual mode.|
| Persistence | Store collection, deck, hand, settings per user/mod using Convex; support anonymous users. | `convex/schema.ts`, `convex/*`, Convex tests | Medium | Confirm anonymous data behavior and auth migration expectations. |What are the options? Tell me what I should validate.|
| Import/export | Import/export collection/deck arrays with v1/v2 schema compatibility. | `src/ui/features/config/*`, `convex/importExport.ts` | Medium | Confirm whether v1 compatibility matters. |v1 compatibility doesn't matter at all, it's legacy code, we can remove this support. Note: this feature is only for manual mode. It's useless in autosync mode: the game data are the source of truth.
| Farming recommendations | Suggest useful farmable cards/fusions and rank duelists by drops. | `src/engine/farm/*`, farm tests, `src/ui/features/farm/*` | Medium | Confirm whether current farming heuristic is product-critical. |Not product-critical. It was more an experiment, might be an interesting feature, but quite niche and secondary. Not a core feature.|
| Agent game control | Bridge accepts low-level input/load-state commands for testing/analysis. | `bridge/input.ts`, `bridge/agent-client.ts`, agent tests | Low | Confirm whether this is still active scope. |What is this feature? Explain what it is and potential use cases. I need to understand to answer.|

## Candidate Behavioral Truths

### Deck Optimization And Scoring

- [ ] A valid optimized deck has exactly 40 physical cards, while `scoringSlots` may limit how many slots are scored/optimized.
  - Evidence: `src/engine/types/constants.ts`, `src/engine/types/buffers.test.ts`, `src/engine/orchestrator.ts`
  - Confidence: high
  - Risk if changed: optimizer output and UI deck assumptions diverge.
  - Review question: Should `scoringSlots` remain a user-facing setting or become internal/test-only?
  - Answer: Should remain a UI setting. I assume you're talking about the feature letting the user reserve n cards in the deck for magic/trap cards that are not optimizable, thus not considered for deck optimization.

- [ ] Optimization must respect owned collection counts and detected per-card deck-copy limits.
  - Evidence: `src/engine/orchestrator.ts`, `src/engine/optimizer/seed-strategies.test.ts`, `src/engine/optimizer/sa-optimizer.integration.test.ts`
  - Confidence: high
  - Risk if changed: illegal suggested decks.
  - Review question: Are deck-copy limits required for all product flows or only active-disc bridge mode?
  - Answer: I don't understand the question. What is "all product flows" referring to? Is the active-disc bridge referring to the autosync mode? The manual mode could hardcode the vanilla game rules (only Exodia is limited, I believe? To double-check), since there is no bin to read from. In autosync mode, the current disc is obviously the source of truth.

- [ ] The score reported to users is expected max ATK across all 5-card hands drawn without replacement.
  - Evidence: `src/engine/scoring/exact-scorer.ts`, `src/test/reference-scorer.ts`, `README.md`
  - Confidence: high
  - Risk if changed: optimizer rankings and improvement numbers change.
  - Review question: Is expected ATK still the right business metric, or only the current implemented metric?
  - Answer: Expected atk is the right business metric.

- [ ] The browser optimizer is multi-worker/multi-start SA; it picks the best exact-scored worker result.
  - Evidence: `src/engine/orchestrator.ts`, `src/engine/worker/*`, `src/engine/optimizer/sa-optimizer.integration.test.ts`
  - Confidence: high
  - Risk if changed: performance and determinism expectations change.
  - Review question: Is exact-scoring every final candidate required, or just desirable?
  - Answer: Not strictly required (it's the "how", not the "what" / "why"), but I remember it was identified as a way to make the deck optimization more efficient.

- [ ] Optimization cancellation should stop workers and return/fail without committing stale UI state.
  - Evidence: `src/ui/features/optimize/use-optimize.ts`, `src/engine/worker/sa-worker-pool.ts`
  - Confidence: medium
  - Risk if changed: users see stale or misleading suggestions.
  - Review question: Should cancel return the best known deck or clear the result?
  - Answer: No strong business requirement on this side, but returning the best known deck so far looks like a quick win, right? If cheap, we can include it, but not if complex (not worth extra effort).

- [ ] One-card swap suggestions exact-score a shortlist before recommending a swap.
  - Evidence: `src/engine/suggest-deck-swap.ts`, `src/engine/suggest-deck-swap.test.ts`
  - Confidence: high
  - Risk if changed: bad "last added card" recommendations.
  - Review question: Is this feature important enough to preserve during refactors?
  - Answer: Are you referring to local optimizations happening at the end of the deck optimization? I.e. there is first a global optimization research, then followed by local optimization? This was an attempt to provide better result, especially removing the noise, like: 1 card increases significantly the score, and the final suggestion includes swapping many other cards that actually decrease the score, but it's still suggested because the overall score is still higher than before, thanks to the one big score increase. This is the case we tried to address with local optimization. If inefficient or harmful, yes, it can be challenged, but if it works, I would not trim it. It's part of the "how", not the "what"/"why".

### Fusion, Equip, And Field Rules

- [ ] Fusion lookup is represented as a commutative flat table.
  - Evidence: `src/engine/data/load-game-data-core.ts`, `src/engine/scoring/fusion-scorer.ts`, fusion tests
  - Confidence: high
  - Risk if changed: scoring, deck fusion lists, and farming become inconsistent.
  - Review question: Is table order or duplicate recipe handling observable to users?
  - Answer: I don't know. Why asking me? The answer is in the code. You are the one supposed to be able to find the answer. Or I misunderstood the question and need clarification.

- [ ] Fusion chains enforce the FM rule that after the first fusion, one material must be the previous result.
  - Evidence: `src/engine/scoring/fusion-scorer.ts`, `src/test/reference-scorer.ts`
  - Confidence: high
  - Risk if changed: best-play and deck scores can improve from impossible chains.
  - Review question: Should every fusion-path feature share one implementation of this rule?
  - Answer: I don't understand the question. What are the options? Tell me what I should validate.

- [ ] Production scoring applies equip cards as terminal bonuses after direct play or a fusion result.
  - Evidence: `src/engine/scoring/fusion-scorer.ts`, `src/engine/config.ts`
  - Confidence: medium
  - Risk if changed: optimization scores change, especially in modded data.
  - Review question: The reference scorer appears fusion-only; should it become equip-aware or remain separate?
  - Answer: I don't understand what you're talking about. Please explain. PS: about the "risk if changed": the "especially in modded data" looks misleading if you meant the equips mainly apply to mods. The vanilla game also has equips.

- [ ] Terrain/field bonus can affect displayed and scored ATK/DEF, and a live RAM table may override vanilla rules.
  - Evidence: `src/engine/data/field-bonus.ts`, `src/ui/App.tsx`, `src/engine/data/field-bonus.test.ts`
  - Confidence: high
  - Risk if changed: live duel prediction and optimization disagree with the running game.
  - Review question: Should terrain be part of deck optimization by default?
  - Answer: Looks like you missed a feature: the user can choose a "terrain" (field) in the user settings. The user-selected field is indeed the one to use for deck optimization. For "and a live RAM table may override vanilla rules": are you referring to manual mode reading CSV data and autosync mode reading from the game? There shouldn't be fallbacks. It's a clear mapping: manual => CSV; autosync => game binary data.

- [ ] Best-play UI tie-breaks prefer higher DEF, fewer materials, better remaining play, then lower-value consumed materials.
  - Evidence: `docs/SPEC.md`, `src/engine/score-explainer.ts`, UI tests around hand/fusion results
  - Confidence: low
  - Risk if changed: user-facing explanations may reorder.
  - Review question: Is this desired behavior or just accumulated implementation detail?
  - Answer: Looks like the desired behavior, except one question: "higher DEF, fewer materials, better remaining play, then lower-value consumed materials": are you sure of the order? I remember the order in which criteria are applied is different.

### Game Data And Extraction

- [ ] Valid card IDs are modeled with an exclusive upper bound of 723; most gameplay cards are 1..722.
  - Evidence: `src/engine/types/constants.ts`, extraction/load tests
  - Confidence: high
  - Risk if changed: flat lookup indexes and save/collection mappings break.

- [ ] Bridge-provided game data overrides CSV data in browser workers and UI contexts.
  - Evidence: `src/engine/worker/messages.ts`, `src/engine/data/load-game-data-core.ts`, `src/engine/orchestrator.ts`
  - Confidence: high
  - Risk if changed: mods and active disc edits may use stale/static data.
  - Review question: Should all UI surfaces eventually require bridge data, or keep offline/static mode?
  - Answer: There is a clear mapping: manual mode => CSV, autosync mode (with bridge) => game bin data. No fallback. Some features can work for both: enable for both. Other features only work & make sense for autosync mode: only enable them for autosync. If I didn't answer the question, please clarify.

- [ ] Game data includes cards, duelists, fusions, equips, equip bonuses, deck limits, rank scoring, field bonus table, and artwork key.
  - Evidence: `src/engine/worker/messages.ts`, `bridge/game-data.ts`, `bridge/serve.ts`
  - Confidence: high
  - Risk if changed: silently dropped bridge fields cause partial mod support.
  - Review question: Which fields are durable API contract versus cache implementation detail?
  - Answer: I don't understand the question. What are the options? Tell me what I should validate.

- [ ] Cache identity includes both game-data hash and disc path hash to prevent sibling ISO bleed.
  - Evidence: `bridge/game-data.ts`, `bridge/gamedata-cache.test.ts`
  - Confidence: high
  - Risk if changed: wrong cards/artwork/drop pools can be served after ROM swaps.
  - Review question: Is path-based identity acceptable if users move/rename discs?
  - Answer: I guess yes, as long as it breaks nothing. Is the consequence just that it rebuilds the cache and no more impact? Then yes, it's acceptable.

- [ ] Cache entries are rejected for old extractor versions and for malformed localized structural data.
  - Evidence: `bridge/gamedata-cache.test.ts`
  - Confidence: high
  - Risk if changed: stale or corrupted extracted data persists.
  - Review question: Are cache invalidation rules centralized enough?
  - Answer: I don't understand the question. What are the options? Tell me what I should validate. Is it really a spec/scope question?

- [ ] Static CSV data exists for `vanilla` and `rp`, while scripts can extract/verify game data from local BINs.
  - Evidence: `public/data/*`, `tests/data/*`, `scripts/extract-game-data.ts`, `scripts/verify-game-data.ts`, `package.json`
  - Confidence: high
  - Risk if changed: tests and offline behavior lose fixtures.
  - Review question: Which static data sets are supported product inputs?
  - Answer: Answered separately.

### Bridge Runtime And Live State

- [ ] The bridge WebSocket runs on `ws://localhost:3333` and broadcasts live state plus game data.
  - Evidence: `bridge/serve.ts`, `src/ui/lib/use-emulator-bridge.ts`
  - Confidence: high
  - Risk if changed: app cannot auto-sync or read live duel data.
  - Review question: Is the port stable API or just default configuration?
  - Answer: Are you talking about the port 3333? The answer is in the code, I don't understand the question. Looks like you're asking about implementation details, about how bridge & app should communicate and agree on the channel, this is a "how" and your role to figure out. The current code base contains a possible implementation. It's your role to judge if it's good enough or if it should be refactored.

- [ ] UI keeps last-ready bridge state during short reconnect gaps when game data is available.
  - Evidence: `src/ui/lib/use-emulator-bridge.ts`, `src/ui/lib/use-emulator-bridge.test.ts`
  - Confidence: high
  - Risk if changed: bridge reloads cause noisy onboarding/setup states.
  - Review question: Is the 15s reconnect grace intentional?
  - Answer: I don't understand the behavior you're talking about. Are you saying that when the bridge disconnects, the app preserves the old state and, after 15 seconds, it shows the bridge as disconnected? If yes, looks like an implementation detail or an inferred feature as attempt to improve the UX, not a spec requirement. Your call on which behavior we should have here, what's good or bad for UX, etc.

- [ ] Bridge reads universal RAM tables for card stats, collection, deck, hand/field, opponent zones, and unlock bytes.
  - Evidence: `bridge/memory.ts`, `bridge/memory.test.ts`
  - Confidence: high
  - Risk if changed: auto-sync and duel helpers break.
  - Review question: Which RAM offsets are validated against which game versions?
  - Answer: I don't know. The answer is in the code, right? I don't understand why you're asking me this kind of implementation details.

- [ ] Version-specific live-duel offsets use profiles, PAL overrides, and structural scans where possible.
  - Evidence: `bridge/memory.ts`, `bridge/offset-profiles.ts`, `bridge/offset-profiles.test.ts`
  - Confidence: medium
  - Risk if changed: PAL/RP live state becomes incorrect.
  - Review question: Which PAL fields are trusted enough to preserve?
  - Answer: I don't know. The answer is in the code, right? I don't understand why you're asking me this kind of implementation details.

- [ ] ISO write APIs must refuse when active-disc resolution is ambiguous.
  - Evidence: `bridge/game-data.ts`, `bridge/serve.ts`, `bridge/game-data.test.ts`
  - Confidence: high
  - Risk if changed: wrong disc image can be patched.
  - Review question: Should read-only game data also refuse ambiguity, or only writes?
  - Answer: I don't understand the question. Implementation detail?

- [ ] Bridge supports background update staging and restart/update commands.
  - Evidence: `bridge/serve.ts`, `src/ui/features/bridge/*`
  - Confidence: medium
  - Risk if changed: bridge update UX regresses.
  - Review question: Is auto-update part of supported distribution?
  - Answer: Are you referring to the live reload of "bun bridge" that restarts the bridge when the source code changes? It's a development feature to make iterations easier. Not a production feature.

### Duel UI And Prediction

- [ ] Main UI tabs are `deck`, `duel`, and `data`; deck sub-tabs include collection, deck, result, farm, and edit.
  - Evidence: `src/ui/App.tsx`, `src/ui/features/deck/DeckSubTabs.tsx`
  - Confidence: high
  - Risk if changed: routing/hash links and onboarding flow break.
  - Review question: Are these surfaces all still wanted?
  - Answer:

- [ ] Onboarding gates bridge-dependent tabs, while save editing bypasses reference data and uses bridge HTTP data.
  - Evidence: `src/ui/App.tsx`, `saveeditor/features.md`
  - Confidence: high
  - Risk if changed: users may be blocked from save editing unnecessarily.
  - Review question: Is save editing intentionally available without full reference data?
  - Answer:

- [ ] Opponent hidden cards are controlled by cheat mode; non-cheat helpers should avoid revealing hidden information.
  - Evidence: `src/ui/features/duel/*`, `src/ui/features/hand/*`, `convex/schema.ts`, `docs/TODO.md`
  - Confidence: medium
  - Risk if changed: product ethics/gameplay expectations change.
  - Review question: Which cheat-mode experiments should survive?
  - Answer:

- [ ] Battle prediction should use live field ATK/DEF and avoid double-applying terrain.
  - Evidence: `src/ui/features/duel/battle-prediction.ts`, `src/ui/features/duel/battle-prediction.test.ts`, `docs/TODO.md`
  - Confidence: high
  - Risk if changed: displayed battle outcomes disagree with game state.
  - Review question: How important is guardian-star accuracy before refactoring prediction?
  - Answer:

- [ ] Result screens and new active hands have special state reset behavior for post-duel suggestions.
  - Evidence: `src/ui/features/hand/use-post-duel-suggestion.ts`, related tests
  - Confidence: medium
  - Risk if changed: stale post-duel suggestions or aborted background optimization.
  - Review question: Is post-duel suggestion a core workflow?
  - Answer:

### Save Editing

- [ ] The UI save editor targets the active DuckStation save only and writes in place with a timestamped backup.
  - Evidence: `saveeditor/features.md`, `bridge/memcards.ts`, `src/ui/features/saves/*`
  - Confidence: high
  - Risk if changed: users may edit the wrong file or lose rollback.
  - Review question: Should there ever be a manual file-picker mode?
  - Answer:

- [ ] Save editor card names come from the matched BIN's extracted game data, not legacy static CSVs.
  - Evidence: `saveeditor/features.md`, `bridge/serve.ts`
  - Confidence: high
  - Risk if changed: modded saves display wrong card names.
  - Review question: Should unknown mod fingerprints block editing or only warn?
  - Answer:

- [ ] CLI save editor semantics are separate and use `saveeditor/vanilla-cards.ts` for dump readability.
  - Evidence: `saveeditor/features.md`, `saveeditor/cli.ts`
  - Confidence: medium
  - Risk if changed: CLI users see changed output or dependencies.
  - Review question: Is the CLI still maintained?
  - Answer:

- [ ] Save bytes support 722 card quantities, 24-bit little-endian starchips, and CRC updates over two regions.
  - Evidence: `src/engine/savefile/save.ts`, `src/engine/savefile/save.test.ts`
  - Confidence: high
  - Risk if changed: edited saves may be rejected or corrupted.

- [ ] Memcard backup retention keeps newest 50 `.mcd` backups and creates pre-restore backups.
  - Evidence: `bridge/memcards.ts`, `bridge/memcards.test.ts`, `saveeditor/features.md`
  - Confidence: high
  - Risk if changed: restore/write safety changes.
  - Review question: Is 50 the intended retention count?
  - Answer:

### ISO Editing And Patching

- [ ] Drop pool patching edits one duelist pool, validates 722 weights, creates ISO backup, then prunes old backups.
  - Evidence: `bridge/iso-edit.ts`, data edit UI tests
  - Confidence: high
  - Risk if changed: invalid or unsafe ISO writes.
  - Review question: Should pool sum `2048` be enforced at this layer or UI layer?
  - Answer:

- [ ] ISO backup retention keeps newest 20 `.iso` backups under `.yfm3-iso-backups`.
  - Evidence: `bridge/iso-edit.ts`
  - Confidence: medium
  - Risk if changed: disk usage or restore safety changes.
  - Review question: Is 20 enough?
  - Answer:

- [ ] Reward patching supports Ghost/FMR-style x15 and PAL selectable counts `[1, 5, 15, 50, 150, 1000]`.
  - Evidence: `bridge/drop-x15-patch.ts`, `bridge/drop-x15-patch.test.ts`, `docs/SPEC.md`
  - Confidence: medium
  - Risk if changed: unsupported discs may be patched incorrectly.
  - Review question: Which reward patch definitions are production-supported?
  - Answer:

- [ ] After an ISO edit, bridge refreshes/persists extracted game data because RAM hash may not change.
  - Evidence: `bridge/serve.ts`, `bridge/game-data.ts`
  - Confidence: high
  - Risk if changed: UI shows stale drop pools after patch.
  - Review question: Is this refresh behavior covered well enough by tests?
  - Answer:

### Persistence, Auth, And Sync

- [ ] Data is scoped by user and mod for collection, deck, hand, and per-mod settings.
  - Evidence: `convex/schema.ts`, `convex/*`
  - Confidence: high
  - Risk if changed: cross-mod or cross-user data leaks.
  - Review question: Should all user settings be per-mod?
  - Answer:

- [ ] Unauthenticated users get a local UUID mapped to `anon:<uuid>`; authenticated Clerk identity wins.
  - Evidence: `src/ui/core/identity-context.tsx`, `convex/authHelper.ts`, `tests/convex/authHelper.test.ts`
  - Confidence: high
  - Risk if changed: users lose anonymous data or mix identities.
  - Review question: Is anonymous data migration to authenticated accounts required?
  - Answer:

- [ ] Deck rows use fractional order, with card ID as fallback sort for missing/tied orders.
  - Evidence: `convex/deck.ts`, `tests/convex/getDeck.test.ts`
  - Confidence: high
  - Risk if changed: deck display/reordering changes.
  - Review question: Can old rows with missing order be migrated away?
  - Answer:

- [ ] Bridge sync updates collection and deck by diffs to reduce database writes and subscription churn.
  - Evidence: `convex/importExport.ts`, `convex/diffHelpers.ts`
  - Confidence: medium
  - Risk if changed: autosync becomes noisy or expensive.
  - Review question: Is preserving row identity important for UI animations/order?
  - Answer:

- [ ] Server-side deck add currently enforces max 3 copies, not active extracted deck limits.
  - Evidence: `convex/deck.ts`, `src/engine/data/game-db.ts`
  - Confidence: high
  - Risk if changed: manual deck edits may accept cards illegal under active disc limits.
  - Review question: Is this a bug to fix or acceptable because optimizer enforces limits?
  - Answer:

### Import/Export

- [ ] Export schema v2 includes `mod`; v1 lacks mod and is treated as `rp`.
  - Evidence: `src/ui/features/config/import-export-schema.ts`, config tests
  - Confidence: high
  - Risk if changed: old exported files may fail or import into wrong mod.
  - Review question: Does v1 compatibility still matter?
  - Answer:

- [ ] Import validates deck card counts do not exceed imported collection counts before replacing data.
  - Evidence: `convex/importExport.ts`
  - Confidence: high
  - Risk if changed: impossible decks can be imported.
  - Review question: Should import also enforce deck size and deck-copy limits?
  - Answer:

### Farming And Drops

- [ ] POW farming mode uses `max(saPow, bcd)` while TEC uses `saTec`.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: high
  - Risk if changed: duelist recommendations change.
  - Review question: Is this the intended user model for drop pools?
  - Answer:

- [ ] A card with at least 3 owned copies is considered fully owned for farming recommendations.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: high
  - Risk if changed: farming recommendations expand or shrink.
  - Review question: Should detected deck-copy limits affect "fully owned"?
  - Answer:

- [ ] Farming filters candidates by result ATK being above current deck score.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, farm tests
  - Confidence: medium
  - Risk if changed: recommendation volume and usefulness change.
  - Review question: Is deck expected ATK an appropriate threshold for single-card/fusion farming?
  - Answer:

- [ ] Optional unlocked duelist filtering is supported from RAM unlock bytes.
  - Evidence: `src/engine/farm/discover-farmable-fusions.ts`, `bridge/memory.ts`, farm tests
  - Confidence: medium
  - Risk if changed: recommendations include unavailable duelists.
  - Review question: Which game versions have reliable unlock bytes?
  - Answer:

### Agent Game Control

- [ ] Bridge accepts low-level input commands and load-state slots 1..8.
  - Evidence: `bridge/serve.ts`, `bridge/input.ts`, `tests/bridge/agent-client.test.ts`
  - Confidence: medium
  - Risk if changed: debug/data-collection workflows break.
  - Review question: Is this still needed outside tests?
  - Answer:

- [ ] Agent control blocks save-state creation and known save hotkeys.
  - Evidence: `docs/SPEC.md`, `bridge/input.ts`, input/settings tests
  - Confidence: low
  - Risk if changed: automation could overwrite user progress.
  - Review question: Are safety boundaries implemented and tested enough to call this product behavior?
  - Answer:

## Data And Compatibility Contracts

- [ ] Static public data contract: `cards.csv`, `fusions.csv`, `equips.csv`, optional `deck-limits.csv`.
  - Evidence: `src/engine/data/load-game-data-core.ts`, `public/data/*`
  - Confidence: high
  - Review question: Are CSV column positions stable API?
  - Answer:

- [ ] Bridge game-data wire contract requires every `BridgeGameData` field to be explicitly forwarded.
  - Evidence: `src/engine/worker/messages.ts`, `bridge/serve.ts`
  - Confidence: high
  - Review question: Should bridge and UI share generated types instead?
  - Answer:

- [ ] Save editor HTTP API uses `/api/active-save/*`; ISO editor uses `/api/active-iso/*`.
  - Evidence: `bridge/serve.ts`, UI bridge clients
  - Confidence: high
  - Review question: Are these routes external API or internal UI/bridge coupling?
  - Answer:

- [ ] Import/export JSON supports versioned schemas, currently v1 and v2.
  - Evidence: `src/ui/features/config/import-export-schema.ts`
  - Confidence: high
  - Review question: Should future imports preserve unknown fields or be strict?
  - Answer:

- [ ] Reference fixture generation writes committed generated TypeScript from fixture definitions.
  - Evidence: `scripts/generate-fixtures.ts`, `src/test/reference-fixture-defs.ts`, `src/test/reference-fixtures.gen.ts`
  - Confidence: high
  - Review question: Should generated fixtures include equip/terrain cases?
  - Answer:

## Workflows

- [ ] Developer validation workflow: `bun typecheck`, `bun lint`, `bun run test`; integration tests are separate.
  - Evidence: `AGENTS.md`, `package.json`, `docs/SPEC.md`
  - Confidence: high
  - Review question: Should docs-only changes require all checks?
  - Answer:

- [ ] Reference scoring workflow: edit fixture definitions, run `bun run gen:ref`, commit generated fixtures.
  - Evidence: `AGENTS.md`, `README.md`, `scripts/generate-fixtures.ts`
  - Confidence: high
  - Review question: Should this remain the primary scoring oracle workflow?
  - Answer:

- [ ] Game-data extraction/verification workflow uses local BIN paths under `gamedata/*`.
  - Evidence: `package.json`, `scripts/extract-game-data.ts`, `scripts/verify-game-data.ts`
  - Confidence: medium
  - Review question: Are those paths developer-local assumptions or project conventions?
  - Answer:

- [ ] Normal app use expects DuckStation/RomStation, bridge running locally, and web app connected to it.
  - Evidence: `README.md`, onboarding UI files, bridge setup tests
  - Confidence: medium
  - Review question: Is manual/offline mode still important?
  - Answer:

- [ ] Save editing workflow requires auto-sync/bridge mode and active DuckStation context.
  - Evidence: `saveeditor/features.md`, `src/ui/features/saves/*`
  - Confidence: high
  - Review question: Is "active game only" acceptable long term?
  - Answer:

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
