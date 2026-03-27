# PAL Remaining Address Investigation

Status: **3 of 4 confirmed** — terrain address still under investigation.

## Goal

Find 4 remaining PAL (SLES-039.48, French vanilla) RAM addresses for the bridge's `PAL_PROFILE` in `bridge/memory.ts`.

## Final results

| Field | NTSC-U addr | NTSC-U offset | PAL addr | PAL offset | Status |
|-------|-------------|---------------|----------|------------|--------|
| duelPhase | 0x09B23A | — | 0x09C564 | — | Previously confirmed |
| turnIndicator | 0x09B1D5 | phase-0x65 | 0x09C504 | phase-0x60 | Previously confirmed |
| lpP1 | 0x0EA004 | — | 0x0EB28A | — | Previously confirmed |
| lpP2 | 0x0EA024 | lpP1+0x20 | 0x0EB2AA | lpP1+0x20 | Previously confirmed |
| **sceneId** | 0x09B26C | phase+0x32 | **0x09C4C2** | **phase-0xA2** | **Confirmed (session 2)** |
| **duelistId** | 0x09B361 | phase+0x127 | **0x09C6F3** | **phase+0x18F** | **Confirmed (session 2)** |
| **terrain** | 0x09B364 | phase+0x12A | **?** | **?** | **NOT FOUND — see notes** |
| **fusionCounter** | 0x0E9FF8 | lpP1-0x0C | **0x0EB27F** | **lpP1-0x0B** | **Confirmed (session 2)** |

### Key findings

1. **PAL relative offsets differ wildly from NTSC-U** — cannot apply NTSC-U deltas:
   - turnIndicator shifted by +5 (phase-0x65 → phase-0x60)
   - sceneId shifted by -0xD4 (phase+0x32 → phase-0xA2), now BELOW phase instead of above
   - duelistId shifted by +0x68 (phase+0x127 → phase+0x18F)
   - terrain shifted by +0x62 (phase+0x12A → phase+0x18C)
   - fusionCounter shifted by +1 (lpP1-0x0C → lpP1-0x0B)

2. **PAL scene ID behaves differently from NTSC-U**: 0 during duels, non-zero on menu screens. NTSC-U scene ID is non-zero during duels. For `resolveEndedPhase()`, this still works: it records sceneId=0 at duel end and detects the change to non-zero when the user navigates away from results.

3. **PAL phase byte (0x0D) persists after leaving duel**: the duel phase stays at 0x0D even after the user leaves the results screen and navigates menus. This is the root cause of the "stuck ended phase" bug. With the scene ID now available, `resolveEndedPhase()` can detect the user has left.

4. **+0x18C/+0x184 are NOT terrain**: initially thought to be terrain because they're 3 bytes before duelistId (matching NTSC-U spacing), but user confirmed all 3 duels had neutral field. These bytes vary per duelist but represent something else (duelist category? AI type?).

## Verification evidence

### Fusion counter (0x0EB27F)

| Event | Value | Delta |
|-------|-------|-------|
| Duel start (no fusions) | 0 | — |
| After fusion 1 | 1 | +1 |
| After fusion 2 | 2 | +1 |
| New duel start | 0 | reset |

Also observed: 0x0EB280 (lpP1-0x0A) tracks identically. Using 0x0EB27F as primary.

### Duelist ID (0x09C6F3)

| Opponent | Value | Expected |
|----------|-------|----------|
| Simon Muran | 1 | 1 (from game data) |
| K le maître des duels | 39 | plausible for late-game duelist |
| Teana | 2 | 2 (from game data) |

### Terrain — NOT FOUND

Initial candidates +0x18C (0x09C6F0) and +0x184 (0x09C6E8) were rejected. They track per-duelist values (Simon Muran=1, K=4, Teana=0) but the user confirmed **all 3 duels had neutral/normal terrain** on the field. So these bytes are some other per-duelist attribute (possibly AI type, difficulty, or duelist category), not the active terrain.

The terrain byte should be 0 (Normal) for all 3 tested duels, making it impossible to identify through diffing. **Need a duel with non-Normal terrain** (a duelist who uses Forest, Sogen, Yami, etc.) to find the terrain address via diffing.

### Scene ID (0x09C4C2)

| Game state | uint16 LE value |
|------------|----------------|
| During duel (K) | 0x0000 |
| Deck confirmation screen | 0x0104 |
| During duel (Teana) | 0x0000 |

Behavior: 0 during duels (including results screen with phase 0x0D), non-zero on menu/navigation screens. Different from NTSC-U where scene ID is always non-zero, but functionally equivalent for `resolveEndedPhase()`.

## Next steps

1. **Update `PAL_PROFILE` in `bridge/memory.ts`** with the 3 confirmed addresses (sceneId, duelistId, fusionCounter). Set terrain=0 for now.
2. **Find terrain**: duel an opponent with non-Normal terrain (e.g., a duelist who uses Forest, Yami, etc.) and diff to find the terrain byte. Terrain is nice-to-have, not blocking.
3. **Run tests** to verify the bridge and webapp work correctly with PAL addresses
4. **Remove diagnostic code**: set `DIAG_PAL = false` in serve.ts or remove the probe import
5. **Verify end-to-end**: play a PAL duel and confirm the webapp correctly shows/hides duel state

## Investigation methodology

### Tools used
- `bridge/debug/pal-address-probe.ts` — snapshot/diff diagnostic probe
- Wide hex dumps of memory regions around known addresses
- Periodic snapshots (every 10s) to catch menu transitions invisible to phase-based detection
- Duel boundary reset detection (phase 0x0D → 0x01-0x04)

### Session 2 approach (2026-03-27)
1. Duel #1 vs Simon Muran: baseline hex dump, 2 fusions performed → fusion counter confirmed
2. Duel #2 vs K (free duel): EXIT(reset) diff → duelist ID candidate identified
3. Duel #3 vs Teana (campaign): periodic snapshots captured menu navigation, ENTER diff confirmed duelist ID and terrain. Scene ID identified from periodic diff of wide phase region.

## Related files

- `bridge/memory.ts` — `PAL_PROFILE` definition (needs update)
- `bridge/serve.ts` — diagnostic toggle (`DIAG_PAL`)
- `bridge/debug/pal-address-probe.ts` — diagnostic probe module
- `docs/investigation-duel-memory.md` — Phase 1 findings and full background
- `src/ui/lib/use-emulator-bridge.ts` — `resolveEndedPhase()` uses scene ID
