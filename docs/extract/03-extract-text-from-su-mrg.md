# Plan: Extract Card Text from SU.MRG (EU/JP Versions)

## Problem

The vanilla French game (SLES_039.48) stores card names and descriptions in a separate data file, not in the executable. The current script produces empty names/descriptions for this version. The text is likely in `DATA/SU.MRG` or a similar file on the disc.

Duelist names are also missing — they appear as "Duelist 1", "Duelist 2", etc.

## Goal

Support text extraction from the external text file used by EU/JP versions, so that `bun verify:vanilla` shows correct card names and descriptions (or at least non-empty French text).

## Research Phase

1. **List all files on the vanilla disc.** Parse the ISO 9660 directory and list everything in the root and DATA/ directories. Compare with the RP disc structure. Identify files present in vanilla but absent in RP (candidates for external text storage).
2. **Inspect SU.MRG (or equivalent).** Read the header/first few KB. Look for:
   - A file table similar to WA_MRG
   - TBL-encoded strings (byte sequences ending in 0xFF)
   - An offset table of uint16/uint32 values pointing to strings
3. **Determine the character table.** The French version likely uses a different TBL mapping (with accented characters: é, è, ê, à, ç, etc.). The character table might be:
   - Embedded in the SLES executable at a known offset
   - Stored in SU.MRG alongside the text
   - Identical to the English TBL but with unused slots filled with French characters
4. **Cross-reference known card names.** Use the community reference data (tests/data/vanilla/cards.csv has English names). Check if the French text, once decoded, matches the structure (same card count, similar string lengths). Note: the reference has English names; French names will differ but numerical data should help identify cards.
5. **Check the SLUS (US) version.** If the US vanilla version ALSO has SU.MRG alongside embedded text, that would help understand the format (English text in SU.MRG vs English text in SLUS — should match).
6. **Cross-check with community tools.** Compare findings against fmlib-cpp, fmscrambler, TCRF wiki, and any other community documentation on SU.MRG. If they diverge, investigate before implementing.
7. **Update downstream plans.** If findings change assumptions in later steps (07 TBL charset, 08 module split), update those plans before moving on.

## Implementation

1. In `loadDiscData`, also extract SU.MRG (or the identified text file) if present.
2. Write `parseSuMrg(suMrg: Buffer)` to extract the text offset tables and string pools.
3. If the TBL character table differs, detect or extract it. Consider making the TBL configurable or auto-detected.
4. Integrate into `extractAllCsvs`: if exe text offsets are -1 but SU.MRG is available, use the external text.
5. Return type of `loadDiscData` may need to expand to include the optional text buffer.

## Validation

- `bun verify:vanilla` card names should be non-empty (French text).
- `bun verify:rp` must still pass 4/4 (RP has no SU.MRG; text comes from the exe).
- Card stats, fusions, equips, duelists data must be unaffected.

## Files

- `scripts/extract-game-data.ts` (or new module `scripts/extract/su-mrg-text.ts`)
- May need a French TBL character mapping file
