# Rank Scoring Profiles

**Status:** IN PROGRESS
**Goal:** Make duel-rank estimation match the active mod instead of assuming one fixed threshold table.

## Findings

- The rank computation is in `FUN_80021598`; it starts both players at 50, adds the win-type bonus, then calls `FUN_80021558` for 10 threshold rows.
- The rows are 5 pairs of signed shorts: `[exclusiveLimit, points]`.
- The active RP 1.3 BIN has repeated loaded executable copies. The ISO9660-extracted `SLUS_014.11` leaves the runtime table zeroed, so raw-BIN scanning is required.
- RP 1.3 changes the cards-used row in 39 of 40 copies:
  - Vanilla/old row: `used < 9 => +15`, `used < 13 => +12`, `used < 33 => 0`, `used < 37 => -5`, else `-7`.
  - RP 1.3 row: `used < 9 => +32`, `used < 15 => +20`, `used < 33 => 0`, `used < 37 => -5`, else `-7`.
- The app stores the equivalent `remainingCards` value, so RP 1.3 maps to thresholds `[4, 8, 26, 32]` with points `[-7, -5, 0, 20, 32]`.

## Current Step

- Add vanilla and RP rank scoring profiles.
- Select the profile from the bridge mod fingerprint during live duel tracking.
- Keep vanilla as the fallback for unknown mods.

## Next Steps

- Extract the rank table into bridge `gameData` from the active disc image instead of hardcoding known profiles.
- Collapse repeated raw-BIN copies by majority vote and warn when copies disagree.
- Broadcast the extracted rank table to the UI so unknown mods can be scored without a code change.
