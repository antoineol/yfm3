# Plan: Auto-Detect Card Count Instead of Hardcoding 722

## Status: SKIPPED

## Decision

Keep `NUM_CARDS = 722` hardcoded. Auto-detection was attempted but abandoned because:

1. **All known versions use 722.** Vanilla US/EU/JP and the RP mod all have exactly 722 cards. The game engine hardcodes this count in its table structures.
2. **Detection is unreliable.** The card stats table in the PS1 executable is preceded by a few bytes of unrelated data that coincidentally pass `isValidCardStat` range checks. This causes the consecutive-entry counting approach to overcount (e.g., 725 instead of 722). The level/attr cross-validation can't distinguish the overcounted alignment because the off-by-N level/attr position compensates for the shifted card stats start, and the 98-99.5% match threshold still passes.
3. **No real benefit.** Community tools (fmlib-cpp, fmscrambler) also hardcode 722. No known mod changes the card pool size because the game itself has this number baked into many places (ROM routines, table sizes, save format). A mod that changes the count would need to patch the game engine itself, not just the data tables.
4. **Complexity cost.** Reliable detection would require either a secondary anchor (e.g., name offset table cross-validation) or a multi-candidate scoring system, adding significant complexity for a hypothetical use case.

## Files

- `scripts/extract-game-data.ts` — `NUM_CARDS = 722` remains as a constant
