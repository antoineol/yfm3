# Duel Cursor Target

## Goal

Show the card currently targeted by the in-game cursor in the duel HUD without adding page height.

## Current Step

- Verify the focused-card strip after tightening stale field-target handling in hand phases.

## Next Steps

- Confirm the target offset on PAL or add a PAL-specific offset if needed.
- Remove the diagnostic probe once the live focused-card strip has enough coverage.

## Notes

- Suspected NTSC-U cursor target card id: `duelPhase + 0xfe` (`0x9b338`). It changed between visible hand card IDs during hand phase while scene/phase stayed stable.
- Known slot status bytes do not move with the hand cursor, and earlier candidate bytes were animation/timing data.
- The bridge now exposes `duelCursorTargetCardId`; the UI resolves it against live slots every poll. Hand/select phases are hand-authoritative first; field targets are accepted there only while field-preview status bytes are active. The bridge message processor also carries the confirmed player-hand target across preview open/close, because the raw target id can remain on the previewed field card after the game has already returned to hand.
- The focused-card row is visible only during duels with cheat mode enabled. Hidden opponent targets are revealed only in that mode.
- The focused-card row is hidden once the duel phase is `ended`; results screens should not retain active-duel helpers.
- NTSC-U field active-slot signal: `duelPhase + 0x114` is non-zero when a field card is focused and `0` when the cursor is on an empty field slot/no active field slot. It is not a reliable card index in every field layout; the UI uses the target-card id to choose the focused card and uses this signal only to distinguish card focus from empty field focus.
- Cursor diagnostic logs are opt-in with `YFM_DIAG_CURSOR=1 bun bridge` because they can reveal opponent hidden card ids.
