# Step: Apply PAL Profile Addresses

Status: **DONE** (2026-03-27)

## Context

Session 2 of the PAL address investigation (2026-03-27) confirmed 3 of 4 remaining addresses for `PAL_PROFILE` in `bridge/memory.ts`. Terrain is deferred (nice-to-have, requires late-game duelist with non-Normal terrain).

See `docs/memory/pal-remaining-addresses.md` for full evidence.

## Changes

### 1. Update `PAL_PROFILE` in `bridge/memory.ts`

```typescript
export const PAL_PROFILE: OffsetProfile = {
  label: "PAL",
  duelPhase: 0x09c564,
  turnIndicator: 0x09c504,
  sceneId: 0x09c4c2,       // was 0 — phase-0xA2, uint16: 0 in duel, non-zero on menus
  terrain: 0,               // still unknown — skip for now
  duelistId: 0x09c6f3,     // was 0 — phase+0x18F, uint8
  lpP1: 0x0eb28a,
  lpP2: 0x0eb2aa,
  fusionCounter: 0x0eb27f,  // was 0 — lpP1-0x0B, uint8
};
```

### 2. Update structural scanner validation (if needed)

`scanForPhaseStructurally` in `memory.ts` uses NTSC-U relative offsets (`sceneDist`, `terrainDist`, `duelistDist`) to validate candidates. These distances are explicitly documented as "preserved across NTSC-U and PAL."

**This is now known to be wrong** — PAL offsets differ wildly:
- NTSC-U scene: phase+0x32, PAL scene: phase-0xA2
- NTSC-U duelist: phase+0x127, PAL duelist: phase+0x18F

The structural scanner is only used for auto-detection of unknown binaries. Since PAL is detected by serial (`SLES_039.48`), the scanner doesn't run for PAL. **No change needed**, but add a comment noting the NTSC-U assumption.

### 3. Disable diagnostic probe

In `bridge/serve.ts`:
```typescript
const DIAG_PAL = false; // investigation complete
```

Keep `bridge/debug/pal-address-probe.ts` for future terrain investigation.

### 4. Verify scene ID behavior with `resolveEndedPhase`

The PAL scene ID behaves differently from NTSC-U:
- NTSC-U: non-zero during duels, changes to different value on menu
- PAL: **0 during duels**, non-zero on menu

`resolveEndedPhase()` records sceneId at duel end and detects changes. For PAL:
1. Duel ends → records sceneId=0
2. User stays on results screen → sceneId still 0 → keeps "ended"
3. User navigates to menu → sceneId becomes non-zero → overrides to "other"

This should work correctly. Verify by checking existing tests still pass, then test end-to-end with the PAL game.

### 5. Run checks

- `bun typecheck`
- `bun lint`
- `bun run test`
- Manual: play a PAL duel, verify webapp shows hand/field/LP during duel and clears after leaving results screen

## Out of scope

- Terrain address discovery (requires late-game PAL duelist with non-Normal terrain)
- Structural scanner update for PAL distances (not needed since PAL detected by serial)
