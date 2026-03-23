# Plan: Extract TBL Character Table from Binary

## Problem

The TBL character table (`CHAR_TABLE`) is hardcoded with ~90 English character mappings. This table is specific to the US version — the French, German, Spanish, Italian, and Japanese versions almost certainly use different byte-to-character mappings (accented characters, kanji, etc.). Bytes not in the table render as `{xx}` hex placeholders.

The game must have this mapping somewhere to render text on screen. It's likely stored as a font/glyph table in the executable or a data file.

## Goal

Extract the character mapping from the binary so text decoding works for any language version.

## Research Phase

1. **Find the font/glyph data.** The PS1 renders text using a bitmap font. The character table maps byte values to glyph indices or directly to pixel data. Look for:
   - A glyph atlas image in WA_MRG (bitmap with character tiles)
   - A byte-to-glyph mapping table in the executable
   - Community documentation of the YGO FM font format
2. **Compare US and French executables.** The shared code sections (identified as ~85% identical 0x90000-0x190000) should include the font rendering code. The character table itself is in a version-specific section.
3. **Check if the TBL maps to Unicode.** The Konami TBL format is well-documented in the ROM hacking community. Tools like "common TBL editor" or "common character table" might have the YGO FM TBL already.
4. **Identify the table by searching for known byte sequences.** In the US version, byte 0 = " ", byte 1 = "e", byte 2 = "t". These map to the English frequency order. The French version should have a different frequency order (e.g., "e" is still most common but "s" and "a" are more common than "t").
5. **Consider runtime extraction.** Use an emulator to dump the character table from RAM after the game loads. This gives the definitive mapping.

## Implementation

1. If a mapping table is found in the binary: read and parse it into `CHAR_TABLE`.
2. If the mapping is in a font atlas: extract glyph images and OCR them (complex — may not be worth it).
3. Pragmatic fallback: maintain TBL files per known language (US English, French, etc.) and select based on executable region prefix (SLUS→English, SLES→language-specific).
4. The `decodeTblString` function should use the extracted/selected table.

## Validation

- `bun verify:rp` must pass 4/4 (English TBL should be auto-detected or selected).
- French text (from plan 03: SU.MRG extraction) should decode to readable French strings.
- No `{xx}` hex placeholders in output for known-language versions.

## Files

- `scripts/extract-game-data.ts` — `CHAR_TABLE` constant and `decodeTblString()` function
- Possibly new TBL mapping files per language
