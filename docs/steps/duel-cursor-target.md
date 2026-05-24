# Duel Cursor Target

## Goal

Show the card currently targeted by the in-game cursor in the duel HUD without adding page height.

## Current Step

- Verify target-selection battle prediction in live duels, especially duplicated card IDs, terrain-affected field stats, and non-primary guardian-star choices.

## Next Steps

- Map the selected guardian-star byte in RAM so battle prediction can stop falling back to each card's primary star.
- Confirm the target offset on PAL or add a PAL-specific offset if needed.
- Remove the diagnostic probe once the live focused-card strip has enough coverage.

## Notes

- Suspected NTSC-U cursor target card id: `duelPhase + 0xfe` (`0x9b338`). It changed between visible hand card IDs during hand phase while scene/phase stayed stable.
- Known slot status bytes do not move with the hand cursor, and earlier candidate bytes were animation/timing data.
- The bridge now exposes `duelCursorTargetCardId`; the UI resolves it against live slots every poll. Hand/select phases are hand-authoritative unless field-preview status bytes are active; during field preview, empty slots clear focus instead of falling back to the hand. The bridge message processor carries the confirmed player-hand target across preview open/close, because the raw target id can remain on the previewed field card after the game has already returned to hand.
- The focused-card row is visible only during duels with cheat mode enabled. Hidden opponent targets are revealed only in that mode.
- The focused-card row is hidden once the duel phase is `ended`; results screens should not retain active-duel helpers.
- NTSC-U field active-slot signal: `duelPhase + 0x114` is non-zero when a field card is focused and `0` when the cursor is on an empty field slot/no active field slot. It is not a reliable card index in every field layout; the UI uses the target-card id to choose the focused card and uses this signal only to distinguish card focus from empty field focus.
- While an opponent field card is focused, the HUD predicts Win / Both destroyed / Lose from live RAM ATK/DEF, field status position, and guardian-star advantage. Live field-slot ATK/DEF is treated as the source of truth for equipment and other visible stat changes; terrain is not added a second time. The attacker is recovered from the current player field-slot signal first, so refreshes and cursor re-entry can recover without relying on previous cursor history. The selected guardian star is not mapped yet, so prediction currently uses each monster's primary guardian star as the deterministic fallback.
- Cursor diagnostic logs are opt-in with `YFM_DIAG_CURSOR=1 bun bridge` because they can reveal opponent hidden card ids.
