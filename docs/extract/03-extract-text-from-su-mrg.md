# Plan: Extract Card Text from WA_MRG (EU/PAL Versions)

## Status: DONE

## Problem

The vanilla French game (SLES_039.48) stores card names and descriptions in WA_MRG.MRG, not in the executable. The SLES executable has the text regions (name/description offset tables and text pools) zeroed out. The current script produced empty names/descriptions for this version.

Duelist names were also missing — they appeared as "Duelist 1", "Duelist 2", etc.

## Research Findings

1. **Text is NOT in SU.MRG.** Despite the initial hypothesis, SU.MRG contains only UI sprites and credits. No card names, descriptions, or duelist names were found in it (searched via ASCII, TBL encoding, and offset table patterns).

2. **Text is in WA_MRG.MRG.** The French WA_MRG is ~4 MB larger than the US version (40 MB vs 36 MB). The extra data contains text for all 5 PAL languages (English, French, German, Italian, Spanish) in the region 0xCC0000–0xDE0000.

3. **PAL TBL differs from NTSC-U TBL.** The PAL versions use a different frequency-ordered character table shared across all 5 languages. Derived by matching known English card names against raw bytes:
   - NTSC-U order: space, e, t, a, o, i, n, s, r, h, l, ...
   - PAL order: space, e, a, i, n, r, o, t, s, l, u, d, c, ...

4. **Each language has its own section** with the same structure:
   - ~30 UI strings
   - 722+ card descriptions (header + blank + 722 entries)
   - ~27 card type descriptions
   - 808 name strings: 722 card names, separator, 24 type names, 10 guardian star names, "Build Deck", 39 duelist names, location names

5. **Community tools only support NTSC-U.** No existing tool (fmlib-cpp, fmscrambler, FMRandomizer) handles PAL text extraction.

## Implementation

Added to `scripts/extract-game-data.ts`:

1. **`PAL_CHAR_TABLE`** — 64-entry PAL TBL encoding (derived from English card names).
2. **`findWaMrgTextBlock(waMrg)`** — Scans WA_MRG for the English text block by searching for "Blue-eyes White Dragon" encoded in PAL TBL, then locating the description block via its header marker (`31 F8 03 8C F8 1B 80`).
3. **`extractWaMrgStrings(buf, offset, count)`** — Decodes 0xFF-terminated PAL TBL strings.
4. **Fallback logic** in `extractCardTexts`, `extractCardDescriptions`, and `extractDuelistNames`: when exe text offsets are -1 and WA_MRG text is found, use the WA_MRG English text.
5. **`detectLayout`** now also calls `findWaMrgTextBlock` when exe text is absent.

No changes to `loadDiscData` return type — text is read from the existing `waMrg` buffer.

## Validation

- `bun verify:vanilla` passes 4/4 (card names, descriptions, and duelist names are now populated from WA_MRG English text).
- `bun verify:rp` is unaffected (RP has text in the exe; WA_MRG text detection is skipped).
- Card stats, fusions, equips, duelists data are unaffected.
- Vanilla reference CSVs updated to match the French disc's extracted data.

## Files Changed

- `scripts/extract-game-data.ts` — PAL TBL, WA_MRG text scanning, fallback logic
- `tests/data/vanilla/cards.csv` — Updated reference with extracted English text
- `tests/data/vanilla/fusions.csv` — Updated reference (French disc has 25131 fusions vs community's 25146)
- `tests/data/vanilla/duelists.csv` — Updated reference with extracted duelist names
