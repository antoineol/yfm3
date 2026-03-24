# Plan: Extract TBL Character Table from Binary

## Problem

The TBL character table (`CHAR_TABLE`) is hardcoded with ~90 English character mappings. This table is specific to the US version — the French, German, Spanish, Italian, and Japanese versions almost certainly use different byte-to-character mappings (accented characters, kanji, etc.). Bytes not in the table render as `{xx}` hex placeholders.

The game must have this mapping somewhere to render text on screen. It's likely stored as a font/glyph table in the executable or a data file.

## Goal

Extract the character mapping from the binary so text decoding works for any language version.

## Research Phase

1. **Start from community findings.** This is the most important step — the TBL character table is well-documented in the ROM hacking community. Check:
   - fmlib-cpp's `Dict` mapping — likely has the complete byte-to-character table
   - fmscrambler's `CharacterTable.txt` — may contain a ready-to-use TBL file
   - ROM-hacking community TBL files for YGO FM (e.g., from romhacking.net, TCRF wiki)
   - The Konami TBL format documentation
   Gather: the complete byte-to-character mapping, per-version differences (US/FR/JP), and whether the table is stored in the binary or is a community reconstruction.
2. **Check if the table is in the binary.** Community tools may document whether the mapping is embedded in the executable or font atlas, or if it's purely a community-maintained reconstruction. If it's in the binary, get the offset and format.
3. **Compare US and French versions.** Community tools likely already document per-language differences. If not, compare the US and French executables using the community-identified table location.
4. **Update downstream plans.** If the charset extraction approach changes, update plan 03 (SU.MRG text) and 09 (unit tests).

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
