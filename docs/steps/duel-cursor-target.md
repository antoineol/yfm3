# Duel Cursor Target

## Goal

Show the card currently targeted by the in-game cursor in the duel HUD without adding page height.

## Current Step

- Verify the focused-card strip after adding empty player-field slot detection.

## Next Steps

- Confirm the target offset on PAL or add a PAL-specific offset if needed.
- Remove the diagnostic probe once the live focused-card strip has enough coverage.

## Notes

- Suspected NTSC-U cursor target card id: `duelPhase + 0xfe` (`0x9b338`). It changed between visible hand card IDs during hand phase while scene/phase stayed stable.
- Known slot status bytes do not move with the hand cursor, and earlier candidate bytes were animation/timing data.
- The bridge now exposes `duelCursorTargetCardId`; the UI resolves it against all currently live slots every poll and uses duel phase only as a priority hint. This avoids missing initialized targets or field-view cards while the logical phase still says hand.
- Empty slots render as a reserved blank strip area to avoid layout shift. Hidden opponent targets render as `Hidden card` unless cheat mode is enabled.
- NTSC-U field active-slot signal: `duelPhase + 0x114` is 1-based/non-zero when a field card is focused and `0` when the cursor is on an empty field slot/no active field slot. The UI uses it only during player field phase and still uses the target-card id to decide whether the focused card is on the player or opponent side.
- Cursor diagnostic logs are opt-in with `YFM_DIAG_CURSOR=1 bun bridge` because they can reveal opponent hidden card ids.
