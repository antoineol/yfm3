# Duel Memory Investigation

Status: **Phase 1 complete** — core duel detection works for both NTSC-U and PAL.
Phase 2 (scene, terrain, duelist, fusion counter for PAL) is planned below.

Goal: map version-dependent RAM addresses for duel state across NTSC-U and PAL.

## Community sources

- [Data Crystal RAM map](https://datacrystal.tcrf.net/wiki/Yu-Gi-Oh!_Forbidden_Memories/RAM_map) (NTSC-U only)
- [GameHacking.org NTSC-U](https://gamehacking.org/game/90203) — GameShark codes (403'd, need alt access)
- [GameHacking.org PAL](https://gamehacking.org/game/110167) — same, 403'd

### Data Crystal confirmed addresses (NTSC-U, SLUS-01411)

| PS1 addr   | RAM offset | Size | Description |
|------------|-----------|------|-------------|
| 8009B150   | 0x09B150  | ?    | Card ID (unknown purpose) |
| 8009B2C4   | 0x09B2C4  | 4    | Debug menu - last sound ID |
| 8009B2C8   | 0x09B2C8  | 4    | Debug menu scene/sound ID |
| 8009B338   | 0x09B338  | 2    | Selected card ID |
| 8009B360   | 0x09B360  | 1    | Unknown (duel end function) |
| 8009B361   | 0x09B361  | 1    | Opponent ID |
| 8009B364   | 0x09B364  | 1    | Terrain type |
| 800EA002   | 0x0EA002  | 2    | P1 LP (display) |
| 800EA004   | 0x0EA004  | 2    | P1 LP (actual) |
| 800EA022   | 0x0EA022  | 2    | P2 LP (display) |
| 800EA024   | 0x0EA024  | 2    | P2 LP (actual) |
| 800EA118   | 0x0EA118  | 2    | Fusion result |
| 800FE6F8   | 0x0FE6F8  | 4    | PRNG seed |
| 80177F94   | 0x177F94  | 40   | Deck shuffle permutation (player) |
| 80177FBC   | 0x177FBC  | 40   | Deck shuffle permutation (CPU) |
| 80177FE8   | 0x177FE8  | 80   | Shuffled deck (player) |
| 80178038   | 0x178038  | 80   | Shuffled deck (CPU) |
| 801781D8   | 0x1781D8  | 1444 | CPU deck pool |
| 80184594   | 0x184594  | 1    | Menu ID |
| 801A7E20   | 0x1A7E20  | 30   | Player's hand (with other data?) |
| 801D0200   | 0x1D0200  | 80   | Player's deck (40 x uint16) |
| 801D0250   | 0x1D0250  | 722  | Cards in chest |
| 801D06F4   | 0x1D06F4  | 4    | Free duel duelist unlock status |
| 801D07BC   | 0x1D07BC  | 20   | Last 10 cards dropped |
| 801D07E0   | 0x1D07E0  | 4    | Starchip count |

### Bridge-discovered NTSC-U addresses (not on Data Crystal)

| RAM offset | Size | Description |
|-----------|------|-------------|
| 0x09B1D5  | 1    | Turn indicator (0=player, 1=opponent) |
| 0x09B23A  | 1    | Duel phase byte (0x01–0x0D) |
| 0x09B26C  | 2    | Scene ID |
| 0x0E9FF8  | 1    | Fusion counter |
| 0x1D4244  | 16   | Card stats (mod fingerprint) |

## Live investigation — PAL (SLES-03947, French vanilla)

### Phase byte discovery (two-snapshot diff, 2026-03-26)

Snapshot: 1647 addresses with value 0x04 during HAND_SELECT.
After playing a card to field: exactly **1 address** changed 0x04 → 0x05.

**PAL duel phase byte: `0x093F46`**

### Computed deltas

| Segment | NTSC-U | PAL | Delta |
|---------|--------|-----|-------|
| Phase (code/data segment) | 0x09B23A | 0x093F46 | **-0x72F4** |
| LP (different segment) | 0x0EA004 | 0x0EB28A (prev run) | **+0x1286** (needs re-verification) |

### Verified PAL addresses (SLES-03948, French)

| Field | NTSC-U | PAL | Verified |
|-------|--------|-----|----------|
| duelPhase | 0x09B23A | **0x09C564** | YES — full phase cycle matches all NTSC-U values |
| turnIndicator | 0x09B1D5 | **0x09C504** | YES — 0 on player turn, 1 on opponent turn |
| lpP1 (actual) | 0x0EA004 | **0x0EB28A** | YES — showed 8000 at duel start, tracked damage |
| lpP2 (actual) | 0x0EA024 | **0x0EB2AA** | YES — showed 5850 (opponent took damage) |
| sceneId | 0x09B26C | ? | not yet — nearby area shows GPU noise, not scene ID |
| duelistId | 0x09B361 | ? | not yet — relative offset from phase changed |
| terrain | 0x09B364 | ? | not yet — same |
| fusionCounter | 0x0E9FF8 | ? | not yet |

**Key findings:**
- PAL struct layout differs from NTSC-U — relative offsets between variables changed.
- Turn indicator: NTSC-U at phase-0x65, PAL at phase-0x60 (shifted by 5 bytes).
- LP segment delta: +0x1286 (0x0EB28A - 0x0EA004). Different from phase segment delta +0x132A.
- Phase values (0x01-0x0D) are identical between NTSC-U and PAL.
- Scene, terrain, and duelist NOT at the same relative offsets as NTSC-U.

## Open questions

- Data Crystal lists hand at `0x1A7E20` ("Player's Hand with other data?") which differs from our `0x1A7AE4`. What is at 0x1A7E20?
- Are the "universal" addresses (hand 0x1A7AE4, field 0x1A7B70, deck 0x1D0200, collection 0x1D0250) truly identical across NTSC-U and PAL? (Hand/field work on PAL, so likely yes.)
- LP display addresses (0x0EA002, 0x0EA022): are these useful? Could we read display LP for visual sync?
- Menu ID at 0x184594 vs our sceneId at 0x09B26C — different variables or same?

## Remaining investigation plan

### What's done
- Phase byte: confirmed via two-snapshot diff (record 0x04 addresses during HAND_SELECT, detect which changed to 0x05+ after playing a card)
- Turn indicator: found by probing bytes near phase, observing which flipped 0→1 during opponent turn
- LP: found via `scanForOffsets(view, 8000)` at duel start (two equal uint16 at 0x20 stride)
- All verified through a full duel turn cycle with real-time probe logging

### What's left to find (PAL)

**Scene ID** — needed for stale "ended" phase detection (resolveEndedPhase).
- Method: exit the duel (win/lose/surrender), navigate to different screens (deck edit, free duel select, campaign map). The scene ID changes on screen transitions.
- Approach: snapshot a range (e.g. phase+0x20..phase+0x50 and phase-0x20..phase+0x00) during duel, then compare after navigating away. Look for a uint16 LE that changes to a consistent value per screen.
- Alternative: scan 0x090000-0x0A0000 for uint16 values that match known NTSC-U scene IDs (0x05C3 campaign duel, 0x06C3 free duel) — but PAL might use different scene IDs.
- Note: the +0x21 byte near phase flickers constantly (likely GPU/animation), not scene ID.

**Duelist ID** — needed for opponent identification (drop tables, display).
- Method: start duels against different opponents. The duelist ID byte should be stable during a duel and change between duels.
- Approach: snapshot a range (e.g. phase+0x80..phase+0x180) during one duel, then start a duel against a different opponent and compare. Look for a byte that changed to a different small value (0-39).
- Known NTSC-U offset from phase: +0x127. PAL likely nearby but shifted.

**Terrain** — needed for terrain-aware fusion suggestions.
- Method: play duels on different terrains (different opponents have different default terrains in the game).
- Approach: same as duelist — compare a range near phase across duels with different terrains. Look for a byte in 0-6 range that changes.
- Known NTSC-U offset from phase: +0x12A. PAL likely nearby.
- Note: terrain=0 (Normal) was observed during the investigation, which matches the game, but could be coincidental since many bytes are 0.

**Fusion counter** — nice-to-have for post-duel stats.
- Method: perform fusions during a duel and watch which byte increments.
- Approach: snapshot a range around the LP addresses (since fusion counter is near LP in NTSC-U at lpP1-0x0C). Read bytes at lpP1-0x10..lpP1+0x10 before and after each fusion.
- Known NTSC-U: 0x0E9FF8 (lpP1 - 0x0C). PAL LP is at 0x0EB28A, so candidate at 0x0EB27E.

### How to repeat on NTSC-U / RP

The NTSC-U profile (DEFAULT_PROFILE in memory.mjs) was originally discovered by the project author and is hardcoded. To verify or re-derive it:
1. Run the bridge with `bun bridge` while playing the US/RP version
2. The bridge auto-detects SLUS serial → uses DEFAULT_PROFILE
3. All phase/turn/LP/scene values should work immediately
4. If verification is needed, temporarily set `resolvedProfile = null` in `resolveOffsetProfile()` to force the diagnostic path

### Investigation tooling (in serve.mjs)

The current serve.mjs has diagnostic code (`[diag]` and `[probe]` log entries) that should be removed once all addresses are found. The key techniques used:

1. **Two-snapshot diff**: Record all addresses with a known value (e.g. 0x04 during HAND_SELECT). After a state change, find which changed to the expected new value. Best for finding phase byte.

2. **Accumulated polling**: Instead of checking once, track which addresses left their initial value over 20 polls (~1s). Catches brief phase transitions.

3. **Targeted probing**: Read specific candidate addresses and log on every state change. Compare probe output to expected game state. Best for verifying candidates and finding nearby variables.

4. **LP scanning**: `scanForOffsets(view, startingLP)` in memory.mjs finds LP pairs at 0x20 stride. Must be called at duel start when both LP are equal.
