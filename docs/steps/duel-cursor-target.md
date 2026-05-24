# Duel Cursor Target

## Goal

Show the card currently targeted by the in-game cursor in the duel HUD without adding page height.

## Current Step

- Verify the compact focused-card strip in live play, including empty field slots.

## Next Steps

- Confirm the target offset on PAL or add a PAL-specific offset if needed.
- Remove the diagnostic probe once the live focused-card strip has enough coverage.

## Notes

- Suspected NTSC-U cursor target card id: `duelPhase + 0xfe` (`0x9b338`). It changed between visible hand card IDs during hand phase while scene/phase stayed stable.
- Known slot status bytes do not move with the hand cursor, and earlier candidate bytes were animation/timing data.
- The bridge now exposes `duelCursorTargetCardId`; the UI resolves it to the active cursor phase zone and displays a compact focused-card strip near the Player/Opponent tabs.
- Empty slots render as a reserved blank strip area to avoid layout shift. Hidden opponent targets render as `Hidden card` unless cheat mode is enabled.
- Cursor diagnostic logs are opt-in with `YFM_DIAG_CURSOR=1 bun bridge` because they can reveal opponent hidden card ids.
