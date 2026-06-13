# Refactoring Invariants

## Purpose

This document defines the target behavior and validated invariants that future
refactoring work must preserve.

Use it to challenge the codebase aggressively: anything not required by these
invariants, tests, or an explicit product decision is allowed to be deleted,
simplified, moved, or redesigned.

This is not a changelog and not a description of the current architecture.
Implementation details are intentionally omitted unless they define behavior
that must remain true.

## Product Model

YFM3 has two modes:

- **Autosync mode** is the primary product mode. It uses the bridge and the
  active game/disc as the source of truth.
- **Manual mode** is secondary. Its intended scope is vanilla English static
  data only.

Core product surfaces:

- Deck optimization.
- Live autosync companion through the bridge.
- Bridge setup/onboarding and connection status guidance.
- Game-data browsing for cards, fusions, equips, duelists, drops, and rewards.
- Active-save editing.
- Active-ISO editing.

Secondary or optional surfaces:

- Manual-mode import/export.
- Farming recommendations.

## Invariants

### Autosync Data

- Autosync mode must use live bridge/active-disc data.
- Autosync mode must not fall back to static CSV data.
- The active disc is the source of truth for autosync cards, names, fusions,
  equips, duelists, deck limits, rank tables, artwork, and patchable data.
- Active-save and active-ISO writes must not guess when the target is ambiguous.

### Bridge Setup

- Users must have a clear path to connect the app to the local bridge and active
  DuckStation game.
- Connection, setup, and game-data error states must guide recovery instead of
  silently falling back to stale or static data.
- Bridge live-reload for local bridge development should remain available.

### Manual Data

- Manual mode should be treated as vanilla English only unless a new product
  decision expands it.
- Manual-mode deck-copy limits are one copy for Exodia cards 17-21 and three
  copies for other cards.
- Import/export belongs to manual mode, not autosync.
- Legacy import v1 compatibility is not required.
- Autosync-only surfaces may be hidden or disabled when the bridge is not
  available.

### Product Data Domains

YFM3 must preserve product support for these game-data domains:

- Card catalog: IDs, names, stats, types, attributes, guardian stars, costs, and
  artwork references.
- Fusion rules and fusion results.
- Equipment compatibility and equipment bonuses.
- Duelist roster, drop pools, rank rewards, and reward patching.
- Deck-copy limits and rank-scoring tables.
- Field/terrain rules.
- Save data for collection, deck, starchips, and checksums.
- Patchable active-disc data required by user-facing ISO edits.

### Game-Data Browsing

- Users can inspect the selected game-data scope at a product level: cards,
  fusions, equips, duelists, drops, and rewards.
- Exact routes, tab structure, table layout, sorting controls, and detail-panel
  composition are not invariants.

### Deck Optimization

- The optimizer's business metric is expected highest achievable ATK from a
  random 5-card opening hand.
- A physical deck is 40 cards.
- The number of scored/optimized cards remains user-configurable so players can
  reserve non-optimized utility cards.
- Optimization must respect owned card counts.
- Autosync optimization must respect active-disc deck-copy limits.
- Manual optimization uses vanilla English deck-copy limits.
- Optimization suggestions should avoid noisy deck changes that reduce
  user-perceived clarity, such as many harmful small swaps hidden behind one
  large gain.

### Fusion, Equipment, And Field

- Fusion-chain legality must match Forbidden Memories rules: after the first
  fusion, each later fusion must include the previous result.
- Equipment can contribute to scoring when enabled.
- Equipment bonuses apply as terminal bonuses to direct plays and final fusion
  results, not to consumed equip materials.
- User-selected field/terrain affects deck optimization.
- Autosync field behavior should come from active game data.
- Manual field behavior may use vanilla static rules.
- Best-play ordering prefers result ATK/DEF, then fewer consumed cards, then
  better remaining play ATK/DEF, then lower consumed material ATK/DEF.

### Save Editing

- Save editing is autosync-only.
- Save editing targets the active DuckStation save.
- Save writes must be backed up before overwriting.
- Save edits must update the save checksums/CRCs so the game accepts the edited
  file.
- Save card quantities cover 722 card slots.
- Save backup retention should keep the newest 50 backups by default.

### ISO Editing

- ISO editing is autosync-only.
- ISO editing targets the active disc.
- ISO writes must be backed up before overwriting.
- Unsupported or ambiguous discs must be refused, not patched by guesswork.
- Drop-pool editing and reward patching are user-facing autosync features.
- Drop-pool edits must preserve game-valid drop data.
- PAL France wording patching is limited to validated PAL France wording
  surfaces unless deliberately expanded.
- ISO backup retention should keep the newest 20 backups by default.

### Live Duel Companion

- The live-duel companion is a core autosync surface.
- Hidden opponent information must remain gated by cheat mode.
- Battle prediction must use live field stats when available.
- Live duel helpers should not silently replace active-disc data with static
  data.

### Persistence

- Manual-mode user data must remain scoped by user and selected game data scope.
- Auth/Convex persistence is for manual mode.
- Autosync preferences remain local-only.
- Anonymous manual-mode data should migrate to the authenticated identity on
  sign-in.

## Explicit Non-Invariants

Future agents should not preserve these merely because the current code does:

- Current module boundaries.
- Current component hierarchy.
- Current worker orchestration.
- Current optimizer algorithm, as long as the business metric and legality
  constraints are preserved.
- Current game-data storage formats.
- Current bridge message shapes, if replaced by a safer explicit contract.
- Current CSV support for non-vanilla manual data.
- Current import v1 compatibility.
- Current farming recommendation heuristics.
- Current agent game-control API and automation proof of concept.
- Packaged production bridge update/restart behavior.

## Open Decisions

These must be answered before converting this draft into a durable source of
truth:

1. Which live-duel companion surfaces are core?
   - Manual hand analyzer when the bridge is unavailable. => yes (although the condition is "when in manual mode", not "when the bridge is unavailable")
   - Live player hand/field view. => yes
   - Live player fusion suggestions. => yes
   - Cheat-mode opponent hand/field view. => yes
   - Cheat-mode opponent fusion suggestions. => yes
   - Cheat-mode opponent available-card pool. => yes
   - Rank tracker. => yes
   - Battle prediction. => yes
   - Waiting-for-duel and duel-ended states. => yes
   - Post-duel optimization. => yes
   - Automatic collection/deck synchronization after duels. => yes, although from product perspective, it's not specifically at the end of the duel: in autosync mode, at any time, the collection and deck must be up to date with whatever happened in the game. Another example: when loading a state. As far as I know, it's currently working.

## Verification Anchors

These tests currently provide useful evidence for the invariants above:

- `src/test/reference-scorer.ts` and generated fixtures for independent
  fusion/deck expected ATK cases.
- `src/engine/scoring/fusion-scorer.integration.test.ts` for production
  fusion/equipment behavior.
- `src/engine/scoring/field-bonus-scoring.integration.test.ts` for terrain
  behavior.
- `src/engine/savefile/*.test.ts` for save offsets, 722 quantities, CRCs, and
  bounds.
- `bridge/gamedata-cache.test.ts` for cache invalidation/localization corruption
  rules.
- `bridge/memcards.test.ts` for active-save resolution and backup behavior.
- `bridge/game-data.test.ts` for active-disc ambiguity decisions.
- `bridge/drop-x15-patch.test.ts` and `bridge/iso-edit.test.ts` for byte-level
  patch semantics.

Verification work to add:

- Add optimizer acceptance cases for user-visible result quality:
  - keeps legal 40-card decks;
  - respects owned counts and deck-copy limits;
  - applies equipment and selected field;
  - reports expected opening-hand ATK;
  - avoids noisy recommendations where many small harmful swaps hide behind one
    large gain.
- Add live-duel verification for supported game families:
  - player hand/field;
  - opponent hand/field in cheat mode;
  - opponent hidden information outside cheat mode;
  - rank tracker;
  - battle prediction;
  - post-duel optimization trigger.
- Add autosync workflow verification:
  - bridge connected to DuckStation;
  - active-disc game data loaded without static CSV fallback;
  - active-save edit writes backup and valid checksum;
  - active-ISO edit writes backup and refreshes game data.
