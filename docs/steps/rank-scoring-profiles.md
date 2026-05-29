# Rank Scoring Profiles

**Status:** IN PROGRESS
**Goal:** Make duel-rank estimation match the active mod instead of assuming one fixed threshold table.

## Findings

- The rank computation is in `FUN_80021598`; it starts both players at 50, adds the win-type bonus, then calls `FUN_80021558` for 10 threshold rows.
- The decompiled call order is cards used, LP, effective attacks, defensive wins, face-downs, initiated fusions, equip magic, pure magic, traps, then turns. In the NTSC result struct this is `base+0x18`, `base+0x14`, `base+0x02`, `base+0x03`, `base+0x04`, `base+0x08`, `base+0x09`, `base+0x05`, `base+0x06`, `base+0x01`; with the bridge's `rankStatsBase = base+1`, initiated fusions are `rankStatsBase+0x07` and equips are `rankStatsBase+0x08`.
- The rows are 5 pairs of signed shorts: `[exclusiveLimit, points]`.
- The active RP 1.3 BIN has repeated loaded executable copies. The ISO9660-extracted `SLUS_014.11` leaves the runtime table zeroed, so raw-BIN scanning is required.
- RP 1.3 changes the cards-used row in 39 of 40 copies:
  - Vanilla/old row: `used < 9 => +15`, `used < 13 => +12`, `used < 33 => 0`, `used < 37 => -5`, else `-7`.
  - RP 1.3 row: `used < 9 => +32`, `used < 15 => +20`, `used < 33 => 0`, `used < 37 => -5`, else `-7`.
- The app stores the equivalent `remainingCards` value, so RP 1.3 maps to thresholds `[4, 8, 26, 32]` with points `[-7, -5, 0, 20, 32]`.
- Extraction now scans for the table structure itself: 10 rows, each with 5 `[exclusiveLimit, points]` signed-short pairs, and each row ending at `0x7fff`. This no longer depends on the vanilla turns row staying unchanged.
- PAL French result-screen fixture: turns `3`, cards used `8`, LP `8000`, effective attacks `0`, defensive wins `0`, recap combo plays `2`, initiated fusions `1`, equip magic `1`, magic `0`, traps `0` scores `93`, matching S-POW.

## Current Step

- Extract the rank table from the active BIN during bridge `gameData` acquisition.
- Collapse repeated loaded executable copies by majority vote and warn when copies disagree.
- Broadcast the extracted table to the UI and use hardcoded vanilla/RP profiles only as fallback.

## Next Steps

- Validate the extracted table against a live RP 1.3 bridge run after cache refresh.
- Treat mods that change the rank algorithm shape itself separately: different factor count, different row width, changed victory bonuses, or changed final rank thresholds would need code-pattern extraction from the rank helper/caller instead of table-only extraction.
- Surface extraction metadata in diagnostics if users report rank mismatches (`tableCount`, `selectedCount`, `variantCount`).
