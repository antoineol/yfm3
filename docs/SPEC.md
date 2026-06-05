# YFM3 Specification

## Documentation Policy

This directory has two durable documents:

- `SPEC.md`: keep. It is the product and architecture source of truth.
- `TODO.md`: keep. It is the short active backlog, not a scratchpad.

Recommendations:

- Delete completed plans, handoffs, temporary investigations, and rejected options once their durable facts are in this spec or in tests.
- Keep implementation evidence in tests and code comments, not separate narrative files.
- If a new investigation is unavoidable, create a short temporary note, then fold the result into this spec or delete it before merging.

## Purpose

YFM3 is a companion app for Yu-Gi-Oh! Forbidden Memories, focused on the Remastered Perfected mod while supporting vanilla NTSC-U and PAL French where practical.

The product has four jobs:

1. Build the best legal 40-card monster deck from a player's collection.
2. Explain best plays from a 5-card hand, including fusion chains.
3. Read live game state from DuckStation through the local bridge.
4. Use extracted game data so mods work without hardcoded CSVs.

The optimizer's business metric is the expected value of the highest ATK achievable from a random 5-card opening hand, considering direct plays and legal fusion chains.

## Product Surfaces

- Web app: React/Vite UI, Clerk auth, Convex-backed persistence.
- Engine: deterministic card, fusion, scoring, farming, ranking, and worker logic.
- Bridge: local Windows/Bun process that reads DuckStation shared memory and active disc data.
- Extraction: disc image readers for cards, fusions, equips, duelists, rank scoring, deck limits, and artwork.
- Patching: local bridge-only ISO edits for supported reward/drop/deck workflows. PAL Ghost Drop More Cards reward patch targets are x1, x5, x15, x50, x150, and x1000.
- Agent control: optional bridge WebSocket commands for controlled gameplay automation.

## Core Terms

- Card: one monster or game card with ID, name, ATK, DEF, type/kind metadata, guardian stars, attribute, colors, and labels.
- Collection: card counts owned by the player.
- Deck: exactly 40 card IDs, respecting collection counts and per-card copy limits.
- Hand: 5 cards drawn uniformly without replacement from the deck.
- Fusion: a two-material combination that resolves to one result card.
- Fusion chain: repeated fusions where a result may fuse again with remaining hand cards.
- Best play: the highest-value direct play or fusion chain available from a hand.
- Rank scoring: post-duel rank estimate from live counters and active-disc threshold tables.
- Game data hash: bridge cache key derived from live RAM card stats plus disc identity.

## Game Data

The app prefers active-disc extraction over static data.

Data sources:

- RAM: live card stats, collection, deck definition, duel state, rank counters, cursor focus, terrain, and unlock bytes.
- Disc image: names, descriptions, fusions, equips, duelists, artwork, deck limits, rank tables, and localized labels.
- Fallback fixtures/static references: only when bridge data is unavailable or extraction fails.

Card metadata rules:

- Structural identifiers stay canonical across languages: type, guardian stars, and attributes must remain app enum values.
- Display labels may be localized from PAL WA_MRG text blocks.
- Frame color and card-name label color are different facts and must not be merged.
- Fusion results are regular cards and must retain all extracted attributes for later fusions.

Extraction rules:

- Detect disc layout structurally where possible. Do not hardcode offsets when signatures or table shapes can be scanned.
- Cache extracted data per active disc path and data hash so sibling ISOs cannot bleed into each other.
- Refuse write operations when active-disc resolution is ambiguous.
- Invalidate cached game data when extractor semantics change.

## Fusion Rules

Fusion lookup is an ordered table lookup, not a recovered hidden rule engine.

Recipe ingredients can be:

- Specific card name.
- Card kind/type.
- Color-qualified kind/type.

Resolution rules:

1. Ingredient order is commutative.
2. Exact name/name matches beat name/kind matches.
3. Name/kind matches beat kind/kind matches.
4. Color-qualified ingredients match only cards with both the required kind and color.
5. Unqualified kind ingredients ignore color.
6. A fusion applies only when the result ATK is strictly greater than both materials' ATK.
7. A fusion result can participate in later fusions exactly like a base card.

Current chain limit:

- The production scorer considers chains up to the configured depth.
- Business-facing best-play flows should stay readable and should not expose impossible or redundant equivalent paths.

Known duplicate-fusion behavior:

- Multiple recipes can produce the same result.
- Deduplicate output by achieved result and material multiset where needed for UI readability.
- Preserve the actual engine resolution order for scoring and play prediction.

## Deck Scoring

Goal:

- Compute expected highest achievable ATK from a random 5-card hand drawn from a 40-card deck.

Required properties:

- Empty decks score 0.
- A full deck of one repeated non-fusing card scores that card's ATK.
- Scoring is deterministic for the same deck and game data.
- Scores stay within the achievable ATK range.
- Fusion-capable decks should benefit when fusions improve reachable ATK.
- Replacing a non-interacting card with a strictly stronger non-interacting card must not reduce score.

Attack paths:

- Direct card play.
- Two-material fusion.
- Multi-material fusion chain up to the configured limit.

Reference fixture workflow:

1. Define hands/decks in `src/test/reference-fixture-defs.ts`.
2. Run `bun run gen:ref`.
3. Test production scoring against `src/test/reference-fixtures.gen.ts`.

Use the reference scorer as ground truth when changing production scoring or fusion behavior.

## Deck Optimization

Input:

- Optional current deck.
- Collection.
- Active game database.
- Deck copy limits when detected.

Output:

- Valid 40-card deck.
- Initial score.
- Final score.
- Improvement.

Hard constraints:

1. Exactly 40 cards.
2. No card count exceeds owned copies.
3. No card count exceeds active deck-copy limit.
4. All card IDs exist in active game data.
5. Final score must not be lower than initial score.

Search expectations:

- Global optimum is not required.
- Cancellation returns the best valid deck found so far.
- Workers should run until budget completion or explicit abort, not stop early from weak convergence signals.
- UI progress should remain meaningful while optimization is in flight.

Edge cases:

- Empty or wrong-sized starting deck.
- Collection with exactly 40 legal cards.
- Collection with one card type.
- Transient all-zero bridge deck snapshots during result screens.

## Bridge Runtime

The bridge is a local process for DuckStation integration.

Responsibilities:

- Enable DuckStation shared memory export during onboarding.
- Read raw PS1 RAM values.
- Resolve active disc images from DuckStation settings and gamelist data.
- Extract and cache active game data.
- Broadcast live state and game data to the web app over WebSocket.
- Execute supported local patch/write operations only when the target disc is unambiguous.

Boundaries:

- Bridge may expose raw or lightly normalized state.
- Game interpretation and UI policy belong in the app unless the bridge is the only place with required local access.
- The UI must tolerate bridge reconnects and keep last-ready state during short live-reload gaps.
- The bridge must avoid whole-BIN reads on cache hits.

Shared memory constants:

- Card stats table starts at `0x1D4244`, 722 cards x 4 bytes.
- Collection starts at `0x1D0250`, 722 bytes.
- Deck definition starts at `0x1D0200`, 40 little-endian u16 card IDs.
- Player hand starts at `0x1A7AE4`, 5 slots, stride `0x1C`.
- Player field starts at `0x1A7B70`, 5 slots, stride `0x1C`.
- Opponent hand starts at `0x1A7C88`; opponent field follows after 5 slots.
- Free-duel unlock bitfield starts at `0x1D06F4`.

Offset profiles:

- NTSC-U/RP profile is the default.
- PAL French uses explicit offsets; do not derive new PAL features from NTSC relative offsets without evidence.
- Unknown binaries may be scanned from structural patterns, but validation must reject impossible LP/phase values.

PAL caveats:

- PAL result/rank block starts at `0x0EB279`.
- PAL terrain is `0x09C6F9`.
- PAL cursor target card ID is `0x09C6B8`.
- PAL field-card focus signal is `0x09C6D1`; it is focus-present, not a trusted slot index.
- PAL active-duel cards-left uses the live deal counter at `0x0EB290`.
- PAL result-screen cards-used uses `0x0EB296`; it can be stale or `0xFF` during active duels.
- PAL initiated-fusion counter is `0x0EB280`.
- PAL equip counter is `0x0EB281`.
- PAL rank LP is `0x0EB28A`.

## Duel UI And Prediction

Live duel helpers should be useful without revealing hidden information unless cheat mode is enabled.

Rules:

- Focused-card UI may show player focus normally.
- Opponent hidden cards are revealed only in cheat mode.
- Result screens must clear active-duel helpers.
- New active hands should dismiss post-duel content without aborting background optimization.
- Battle prediction should use live field ATK/DEF as source of truth for visible stat changes.
- NTSC-U/RP player field cursor focus should use the trusted physical field slot when it matches the target card ID, so duplicate cards with different live boosts show the hovered copy's stats.
- Terrain must not be added twice when live field stats already include it.
- Until selected guardian star is mapped, prediction falls back to each card's primary guardian star.
- In cheat mode, the opponent available pool renders occupied visible-hand cards first, skipping empty spent slots, then renders reserve cards separately. The reserve is the AI draw window: it is the live duel-deck suffix starting at the opponent dealt-card counter, capped with visible hand cards by the duelist's configured pool size. A normal draw materializes the first reserve card into an empty visible hand slot and advances the window; an AI reserve swap mutates the live duel deck by exchanging a selected reserve entry with a visible hand entry. The pool is a compact ordered card list, not five fixed slots; reserve cards may be visually de-emphasized, but category color borders should not compete with card frame colors. UI transition identity must use live duel-table slot IDs, not card IDs, so duplicate cards and reserve-to-hand movement animate as the same card copy.
- Cheat-mode opponent hand/reserve data must clear while a new duel's opponent pool is not ready.
- The cheat-mode focus row shows the current cursor target and the opponent pool's highest available ATK and highest available DEF as separate values; the two maxima may come from different cards.
- The former CPU swap "cheat detected" banner/detector is disabled; cheat-mode insight should come from the opponent available pool.

Best-play path selection:

- Prefer higher result DEF when ATK ties.
- Prefer fewer materials when result stats tie.
- Prefer paths that leave the strongest remaining hand play.
- Prefer lower-value consumed materials when equivalent paths remain.

## Rank Scoring

The rank estimator must match the active disc when possible.

Extraction:

- Scan the active BIN for rank threshold tables.
- Table shape is 10 rows, each with 5 signed-short `[exclusiveLimit, points]` pairs.
- Each row ends at open limit `0x7FFF`.
- Repeated loaded executable copies are collapsed by majority vote.
- Built-in vanilla/RP profiles are fallback only.

App factor order:

1. Turns.
2. Effective attacks.
3. Defensive wins.
4. Face-down plays.
5. Fusions initiated.
6. Equip magic used.
7. Pure magic used.
8. Traps triggered.
9. Cards left.
10. Remaining LP.

If a mod changes factor count, row width, victory bonuses, or final rank thresholds, table extraction is insufficient and the rank algorithm needs separate extraction.

## Deck Limits

Default card copy limit is 3.

Detected exceptions:

- RP-family mods may include a dispatcher function followed by a u16 lookup table.
- Vanilla SLUS/SLES has no dispatcher; Exodia's one-copy rule is inline deck-edit code.

Extraction strategy:

1. Signature-match the RP dispatcher prologue.
2. Parse the dispatcher's constants dynamically.
3. Decode the u16 table into per-card limits.
4. Scan vanilla inline range checks for one-copy contiguous card ranges.

Deck validation and editing must apply detected limits before optimization or patching.

## Reward And Farming Features

Farm recommendations should answer practical player questions:

- Which duelists can drop useful cards?
- Which drops improve the current deck or unlock stronger fusion paths?
- Which rank profile matters for the desired reward pool?
- Which duelists are currently unlocked from RAM?

Reward patching:

- Keep patch support explicit per disc family.
- Ghost/FMR loop-limit style patches are compatible with NTSC/RP-style images.
- PAL French multiplier support uses verified scratch relocation and root save-update helper logic.
- Patch code must be tested at the arithmetic/byte level; live emulator verification is still required for final confidence.

## Agent Game Control

Agent control exists for automated testing, data collection, and gameplay analysis.

Architecture:

- WebSocket command to bridge.
- Bridge input module.
- ViGEm virtual Xbox controller for focus-free game input.
- DuckStation receives XInput.
- Bridge reads RAM feedback and broadcasts state.

Allowed commands:

- Tap, press, release, and release-all for known PS1 buttons.
- Load save states 1 through 8 through patched hotkeys.

Safety:

- No save-state creation.
- No in-game save command.
- Reject unknown message types.
- Block known save hotkeys such as F2.
- Keep save-state loading separate from normal controller input.

## Testing And Maintenance

Required checks before completing changes:

- `bun typecheck`
- `bun lint`
- `bun run test`

Behavior changes need specs/tests near the changed behavior.

Code style:

- Minimal code that implements the business need.
- Prefer restructuring that reduces total complexity over adding glue.
- Write functions in reading order: callers before helpers.
- Keep source-of-truth behavior in tests and code, not in long-lived plan files.

## Out Of Scope

- Spell/trap/equip deck optimization unless explicitly added later.
- Full opponent AI modeling for optimizer scoring.
- Multiplayer.
- Deck ordering effects beyond the opening hand.
- General-purpose mod authoring tools.
