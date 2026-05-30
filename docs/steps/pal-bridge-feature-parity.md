# PAL Bridge Feature Parity

## Goal

Make PAL French (`SLES_039.48`) bridge-backed duel features match the NTSC/RP experience, or explicitly mark them unavailable until their RAM addresses are mapped.

## Current Step

- Map PAL cursor target, field-slot focus, terrain, selected guardian star, and free-duel unlock bytes with live PAL probes.
- Keep incomplete PAL data out of "full" UI modes. PAL rank counters expose mapped counters from the decompiled rank routine; active-duel cards-left uses the live deal counter because the PAL result cards-used byte is only reliable once the result screen writes it.
- Keep post-duel result UI tied to the results lifecycle: confirmed active hands dismiss visible post-duel content without aborting any background optimization already in flight.

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
4. Keep duel-lifecycle UI tests around active-duel/post-duel transitions before changing PAL phase or scene interpretation.
5. Add unit tests for interpretation and fallback behavior; use live PAL verification for raw RAM addresses that cannot be tested in Linux CI because `bridge/memory.ts` loads Windows FFI.
6. Update this file and `AGENTS.md` with any address that was surprising or easy to misread.

## Notes

- PAL rank stats use the live SLES_039.48 result block at `0x0EB279`.
- PAL recap "Jeux combo" is `0x0EB27F`, but the decompiled rank row matching app "Fusions" uses initiated fusions at `0x0EB280`.
- PAL equip magic is `0x0EB281`.
- PAL rank cards used is `0x0EB296` on the result screen, not the hand/deal counter at `0x0EB290`. During active play, `0x0EB296` can be `0xFF` or stale; use `0x0EB290` for live cards-left.
- PAL rank LP is `0x0EB28A`.
- Use `bun scripts/check-live-rank.ts` on the result screen to compare live bridge counters to the screenshot fixture.
- PAL cursor fields must not assume `duelPhase + 0xfe` or `duelPhase + 0x114`; those are NTSC findings.
- Terrain needs a duel with a non-Normal field. Prior neutral-field duels could not identify it.
