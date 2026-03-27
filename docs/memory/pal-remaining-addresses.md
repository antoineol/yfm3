# PAL Remaining Address Investigation

Status: **Not started** — diagnostic code written but not yet tested.

## Goal

Find 4 remaining PAL (SLES-039.48, French vanilla) RAM addresses for the bridge's `PAL_PROFILE` in `bridge/memory.ts`.

## What's already mapped

| Field | NTSC-U | PAL | Status |
|-------|--------|-----|--------|
| duelPhase | 0x09B23A | 0x09C564 | Confirmed |
| turnIndicator | 0x09B1D5 | 0x09C504 | Confirmed |
| lpP1 | 0x0EA004 | 0x0EB28A | Confirmed |
| lpP2 | 0x0EA024 | 0x0EB2AA | Confirmed |
| sceneId | 0x09B26C | **?** | TODO |
| duelistId | 0x09B361 | **?** | TODO |
| terrain | 0x09B364 | **?** | TODO |
| fusionCounter | 0x0E9FF8 | **?** | TODO |

Key finding from Phase 1: PAL relative offsets differ from NTSC-U (turn indicator is at phase-0x60, not phase-0x65). Cannot simply apply NTSC-U deltas.

## Addresses to find

### 1. Scene ID (uint16)

**Why needed**: `resolveEndedPhase()` in the webapp uses scene ID to detect when the user has left the duel results screen. Without it, PAL gets stuck showing stale duel phase.

**Method**: Two-snapshot diff across screen transitions.

**Steps**:
1. Enter a duel → snapshot bytes at `phase+0x10` to `phase+0x70` (covers NTSC-U offset +0x32)
2. Finish/surrender the duel → navigate to a menu screen
3. Diff: find a uint16 that changed from a "duel" value to a "menu" value
4. Navigate to another screen → verify the uint16 changed again to a different value

**High-probability candidates** (NTSC-U-relative):
- `0x09C596` (phase+0x32, same relative offset as NTSC-U)
- `0x09C591` (phase+0x2D, shifted -5 like turn indicator)

**Note**: The +0x21 byte near phase flickers constantly (GPU/animation noise) — ignore it.

### 2. Duelist ID (uint8)

**Why needed**: Opponent identification for drop tables and display.

**Method**: Compare duel-start snapshots across different opponents.

**Steps**:
1. Start a duel against opponent A → snapshot bytes at `phase+0x100` to `phase+0x180`
2. Finish the duel
3. Start a duel against opponent B (different opponent) → snapshot same range
4. Diff: look for a byte that changed to a different small value (0-39)

**High-probability candidates**:
- `0x09C68B` (phase+0x127, same relative offset as NTSC-U)
- `0x09C690` (phase+0x12C, shifted +5)

### 3. Terrain (uint8)

**Why needed**: Terrain-aware fusion suggestions.

**Method**: Same as duelist ID — compare across duels with different terrains.

**Steps**: Same diff as duelist ID. Look for a byte in 0-6 range that differs between opponents with different default terrains.

**High-probability candidates**:
- `0x09C68E` (phase+0x12A, same relative offset as NTSC-U)
- `0x09C693` (phase+0x12F, shifted +5)

**Terrain values**: 0=Normal, 1=Forest, 2=Wasteland, 3=Mountain, 4=Sogen, 5=Umi, 6=Yami.

### 4. Fusion Counter (uint8)

**Why needed**: Post-duel stats (nice-to-have).

**Method**: Snapshot LP region before/after a fusion.

**Steps**:
1. During a duel, snapshot bytes at `LP-0x20` to `LP+0x20`
2. Perform a fusion (phase goes through 0x07 FUSION → 0x08 FUSION_RESOLVE)
3. Diff: find a byte that incremented by exactly 1
4. Perform another fusion → verify same byte incremented again

**High-probability candidate**:
- `0x0EB27E` (lpP1-0x0C, same relative offset as NTSC-U)

## Diagnostic code

Add temporary diagnostic code to `bridge/serve.ts` that:

1. **On duel enter** (phase transitions from invalid to 0x01-0x0D): snapshot all 3 regions, diff with previous duel's snapshot, log probe values
2. **On fusion resolve** (phase becomes 0x08): snapshot fusion region, diff with last snapshot
3. **On duel exit** (phase transitions from valid to invalid): snapshot scene region, diff with duel snapshot
4. **On every phase change**: log high-probability candidate values

The diagnostic code logs with `[diag]` prefix to `bridge/bridge.log`. Remove after all addresses confirmed.

### Probe function

Log these values on every phase change during PAL duel:

```
[diag] probes: scn@+32=0xNNNN scn@+2D=0xNNNN did@+127=N did@+12C=N ter@+12A=N ter@+12F=N fus@lp-C=N
```

### Snapshot regions

| Region | Start | Length | Purpose |
|--------|-------|--------|---------|
| scene | phase+0x10 | 96 bytes | Scene ID candidates |
| duelist_terrain | phase+0x100 | 128 bytes | Duelist + terrain candidates |
| fusion | LP-0x20 | 64 bytes | Fusion counter candidates |

## Interactive investigation flow

### Session plan (4 user actions)

1. **Start duel against opponent A** → baseline snapshot captured
2. **Perform a fusion** → diff LP region → find fusion counter
3. **Finish duel, go to menu** → diff scene region → find scene ID
4. **Start duel against opponent B** (different terrain) → diff duelist/terrain region → find duelist ID + terrain

### Verification

After identifying candidates, verify by:
- Playing additional duels against different opponents → duelist changes, terrain changes
- Navigating multiple screens → scene ID changes consistently
- Performing multiple fusions → counter increments each time

## Related files

- `bridge/memory.ts` — `PAL_PROFILE` definition (update after addresses found)
- `bridge/serve.ts` — add temporary diagnostic code here
- `docs/investigation-duel-memory.md` — Phase 1 findings and full background
- `src/ui/lib/use-emulator-bridge.ts` — `resolveEndedPhase()` uses scene ID
