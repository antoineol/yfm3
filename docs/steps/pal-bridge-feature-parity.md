# PAL Bridge Feature Parity

## Goal

Make PAL French (`SLES_039.48`) bridge-backed duel features match the NTSC/RP experience, or explicitly mark them unavailable until their RAM addresses are mapped.

## Current Step

- Map PAL cursor target, field-slot focus, terrain, equip counter, selected guardian star, and free-duel unlock bytes with live PAL probes.
- Keep incomplete PAL data out of "full" UI modes. PAL rank counters currently run in partial mode because the equip counter is not mapped.

## Confirmed In Scope

- Focused card under the in-game duel cursor.
- Live terrain during PAL duels.
- Target-selection battle prediction.
- Rank tracker counters, especially equip counter.
- Results-screen / post-duel lifecycle reliability.
- Opponent focused-card behavior.
- Player and opponent hand-slot reliability.
- Free-duel unlock bitfield.
- PAL equip bonus extraction from localized data.

## Fix Order

1. Add PAL-specific fields to the offset profile instead of deriving new features from NTSC relative offsets.
2. For each field, capture before/after snapshots from one small live scenario and write the confirmed address into `PAL_PROFILE`.
3. Add bridge-level guards for unmapped fields so the UI shows partial/empty data rather than wrong data.
4. Add unit tests for interpretation and fallback behavior; use live PAL verification for raw RAM addresses that cannot be tested in Linux CI because `bridge/memory.ts` loads Windows FFI.
5. Update this file and `AGENTS.md` with any address that was surprising or easy to misread.

## Notes

- `0x0EB280` is not the PAL equip counter. It was observed to track the fusion counter, so using it makes a monster fusion appear as an equip.
- PAL cursor fields must not assume `duelPhase + 0xfe` or `duelPhase + 0x114`; those are NTSC findings.
- Terrain needs a duel with a non-Normal field. Prior neutral-field duels could not identify it.
