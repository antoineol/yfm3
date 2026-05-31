# PAL Bridge Feature Parity

## Goal

Make PAL French (`SLES_039.48`) bridge-backed duel features match the NTSC/RP experience, or explicitly mark them unavailable until their RAM addresses are mapped.

## Current Step

- Done: card type labels now travel separately from canonical type identifiers, so French UI labels can come from WA_MRG without breaking engine enum workflows.
- Done: PAL French vanilla deck-limit extraction now detects Exodia cards `17..21` as one-copy cards from the executable's inline deck-edit range check, even though PAL vanilla has no RP/Alpha dispatcher table.
- Verify PAL cursor target display beyond the current player-field cases, then map opponent field-slot focus, selected guardian star, and free-duel unlock bytes with live PAL probes.
- Keep PAL card names/descriptions localized while exporting structural card metadata as canonical app enums. Type, guardian-star, and attribute labels must match NTSC/RP enum values even though WA_MRG stores localized type/star display strings.
- Keep incomplete PAL data out of "full" UI modes. PAL rank counters expose mapped counters from the decompiled rank routine; active-duel cards-left uses the live deal counter because the PAL result cards-used byte is only reliable once the result screen writes it.
- Keep post-duel result UI tied to the results lifecycle: confirmed active hands dismiss visible post-duel content without aborting any background optimization already in flight.
- Done: post-duel optimization now ignores transient empty/all-zero result-screen deck definitions by using the last valid active/saved deck snapshot or waiting for a complete deck before consuming the reward collection change.

## Confirmed In Scope

- Focused card under the in-game duel cursor.
- Live terrain during PAL duels is mapped at `0x09C6F9`, the byte read by the PAL field-bonus routine before indexing the 20 monster types x 6 terrain bonus table. This fixed PAL field display, best-play terrain ranking, and battle prediction.
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
5. Add unit tests for interpretation and fallback behavior; use live PAL verification for raw RAM addresses that cannot be proven from Linux tests. Pure RAM readers can be tested without opening Windows shared memory.
6. Update this file and `AGENTS.md` with any address that was surprising or easy to misread.

## Notes

- PAL rank stats use the live SLES_039.48 result block at `0x0EB279`.
- PAL recap "Jeux combo" is `0x0EB27F`, but the decompiled rank row matching app "Fusions" uses initiated fusions at `0x0EB280`.
- PAL equip magic is `0x0EB281`.
- PAL rank cards used is `0x0EB296` on the result screen, not the hand/deal counter at `0x0EB290`. During active play, `0x0EB296` can be `0xFF` or stale; use `0x0EB290` for live cards-left.
- PAL rank LP is `0x0EB28A`.
- Use `bun scripts/check-live-rank.ts` on the result screen to compare live bridge counters to the screenshot fixture.
- PAL cursor target is `0x09C6B8` (`duelPhase+0x154`) in live `SLES_039.48` field-target evidence. The NTSC `duelPhase+0xfe` address reads the wrong PAL byte.
- PAL field-card focus uses `0x09C6D1` as a non-zero focus-present signal. It read `0x02` on an active player field card and `0x00` on the adjacent empty slot while `0x09C6B8` stayed stale on card `531`; do not rely on its numeric value as a slot index.
- `0x09C6E8` is not the PAL field cursor slot. It matched one empty-slot snapshot but belongs to a previously rejected per-duelist area and made valid PAL card focus resolve as empty.
- PAL WA_MRG name blocks include localized type and guardian-star labels, but those labels are not safe for `CardStats.type`, `gs1`, or `gs2`. Keep those structural fields canonical so shared engine/UI code sees `Magic`, `Sun`, etc.
- PAL French vanilla Exodia one-copy limits come from inline deck-edit code around `SLES:0x24514` / RAM `0x80033D14`, not from the RP-family dispatcher table. The same semantic scan also matches the display-side limit check around `SLES:0x227D0`.
- PAL terrain was verified statically from the `SLES_039.48` field-bonus routine: it reads `0x8009C6F9`, returns zero for Normal, and otherwise indexes the bonus table as `cardType * 6 + terrain - 1`.
