# Plan: Extract TBL Character Table from Binary

## Status: DONE

## Problem

The TBL character table (`CHAR_TABLE`) is hardcoded with ~90 English character mappings. This table is specific to the US version — the French, German, Spanish, Italian, and Japanese versions almost certainly use different byte-to-character mappings (accented characters, kanji, etc.). Bytes not in the table render as `{xx}` hex placeholders.

The game must have this mapping somewhere to render text on screen. It's likely stored as a font/glyph table in the executable or a data file.

## Goal

Extract the character mapping from the binary so text decoding works for any language version.

## Research Findings

### 1. The table is NOT binary-extractable

The character table is a **community reconstruction**, not a data structure stored in the executable. The game stores font glyph tiles in VRAM ordered by frequency, and the byte value is the glyph index. The community reconstructed the mapping by pairing glyph indices with their visual characters (comparing known card names like "Blue-Eyes White Dragon" against raw bytes).

The exe offset `0x1A18F4` is where the text data begins (card name pointer table), not where a character table is stored as a separate structure.

### 2. Community sources (all identical for NTSC-U)

- **fmlib-cpp** (`FMLib/FMLib/src/Data.cpp`) — `Dict` map with 86 entries including 3 duplicate glyph slots
- **duke1102/FMLibrary** (`CharacterTable.txt`) — standalone TBL file in `HH=C` format
- **Data Crystal / TCRF** — canonical wiki page documenting the same table

### 3. PAL/EU uses a different table

- **NTSC-U (SLUS):** 95 entries, frequency-ordered for English (`space e t a o i n s r h l...`)
- **PAL (SLES):** 92 entries, frequency-ordered across all 5 European languages (`space e a i n r o t s l...`), plus 28 accented characters for FR/DE/IT/ES
- PAL text lives in WA_MRG.MRG (exe text section is zeroed), NTSC-U text is in the exe
- Community tools only document the NTSC-U table; the PAL table was reconstructed by this project (see plan 03b)

### 4. Duplicate glyph slots in NTSC-U

fmlib-cpp documents 3 duplicate mappings plus 1 unique entry not in the original `CHAR_TABLE`:
- `0x4F` = `$` (unique, not a duplicate)
- `0x51` = `>` (duplicate of `0x28`)
- `0x54` = `<` (duplicate of `0x27`)
- `0x55` = `a` (duplicate of `0x03`)

### 5. PAL accented characters (from plan 03b)

28 additional entries for Romance and Germanic languages, verified against raw disc bytes:
- **Romance:** é è ê â î ô û ï œ Œ É à í ó ú ñ
- **German:** ä ö ü ß
- **Punctuation:** - (hyphen) ' (apostrophe) ) ( / ° º ª
- **Greek:** α (one use, "Kuwagata α")
- **Per-language conflict:** 0x3f = œ (FR/DE/IT) / á (ES). Default: œ.

## Implementation (Pragmatic Fallback — Option 3)

Since the table is community-reconstructed (not binary-extractable), we maintain hardcoded tables per region and select automatically.

### What was done

1. **Completed CHAR_TABLE to match fmlib-cpp Dict.** Added 4 missing entries (`0x4F=$`, `0x51=>`, `0x54=<`, `0x55=a`). CHAR_TABLE now has 95 entries — a complete match with the community-canonical mapping.

2. **Added 29 accented/punctuation entries to PAL_CHAR_TABLE.** Expanded from 64 to 92 entries. Includes all accented characters needed for French, German, Italian, and Spanish card names (é è ê â î ô û ï œ Œ É à ä ö ü ß í ó ú ñ ° º ª α). Verified by extracting raw bytes from the PAL vanilla disc and cross-referencing with known translations.

3. **Parameterized `decodeTblString`.** Added a `charTable` parameter (default `CHAR_TABLE`) so the same function works with both NTSC-U and PAL encodings.

4. **Refactored `extractWaMrgStrings`.** Eliminated duplicated decode logic — now calls `decodeTblString` with `PAL_CHAR_TABLE` instead of reimplementing the decode loop inline.

5. **Exported tables and decoder** (`CHAR_TABLE`, `PAL_CHAR_TABLE`, `decodeTblString`) for testability.

6. **Added 27 unit tests** (`scripts/decode-tbl-string.test.ts`) covering:
   - CHAR_TABLE completeness against fmlib-cpp Dict (all 86 entries)
   - Duplicate glyph slot decoding
   - PAL_CHAR_TABLE accented characters (FR é/è, DE ä/ü/ö/ß, ES í/ó/ú)
   - decodeTblString: default/explicit table, terminator, newline, control codes, unmapped bytes, offsets, maxLen
   - **Real game data fixtures:** 11 card names from the PAL vanilla disc (EN/FR/DE/ES) with raw byte arrays verified against known translations — catches regressions in accent decoding

### Table selection (already working)

- NTSC-U (SLUS): `decodeTblString` with default `CHAR_TABLE` — used for exe text
- PAL (SLES): `extractWaMrgStrings` with `PAL_CHAR_TABLE` — used for WA_MRG text
- Selection is implicit: the extraction functions detect exe layout and fall back to WA_MRG text blocks for PAL discs

### Artwork output versioning (bonus fix)

Artwork extraction previously wrote to a flat `public/images/artwork/` directory. Running the extract script against a different disc (e.g., vanilla) would silently overwrite RP artwork. Fixed:
- Extract script now derives artwork subdirectory from the output path basename: `public/images/artwork/{modName}/`
- App components (`GameCard`, `MiniGameCard`, `FusionCardThumb`) now use `useSelectedMod()` to build mod-specific artwork URLs
- Added `artworkSrc(modId, cardId)` helper in `format.ts`
- Moved committed RP artwork from `public/images/artwork/` to `public/images/artwork/rp/`

Note: vanilla artwork extraction produces **wrong images** — this is a separate bug tracked in plan 11.

## Validation

- `bun verify:rp` passes 4/4 ✓
- `bun verify:vanilla` passes 4/4 ✓ (PAL French disc)
- `bun run test` passes (457 total) ✓
- `bun typecheck` passes ✓
- `bun lint` passes ✓

## Files Changed

- `scripts/extract-game-data.ts` — added 4 CHAR_TABLE entries, added 29 PAL_CHAR_TABLE accented entries, parameterized decodeTblString, refactored extractWaMrgStrings, exported tables+decoder, versioned artwork output dir
- `scripts/decode-tbl-string.test.ts` — new test file (27 tests including real disc byte fixtures)
- `vitest.config.ts` — added `scripts/**/*.test.ts` to test include paths
- `src/ui/lib/format.ts` — added `artworkSrc()` helper
- `src/ui/lib/format.test.ts` — added artworkSrc tests
- `src/ui/components/GameCard.tsx` — mod-specific artwork path
- `src/ui/components/MiniGameCard.tsx` — mod-specific artwork path
- `src/ui/features/hand/FusionResultsList.tsx` — mod-specific artwork path
- `src/ui/components/CardDetailModal.test.tsx` — mock useSelectedMod
- `public/images/artwork/*.webp` → `public/images/artwork/rp/*.webp` — moved to versioned dir
- `docs/extract/11-fix-artwork-extraction.md` — new plan for PAL artwork bug
