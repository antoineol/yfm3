# Plan: Complete PAL TBL (Accented Characters)

## Status: PENDING

## Problem

The PAL TBL has 64 mapped entries (all characters used in English text). Bytes for accented characters (é, è, ê, à, ç, ü, ß, ñ, etc.) are unmapped and render as `{hex}` placeholders. This blocks correct decoding of French, German, Italian, and Spanish text.

## Language Block Order (Identified)

| Block | Language | Card 2 name | Type 0 |
|-------|----------|-------------|--------|
| 0 | English | Mystical Elf | Dragon |
| 1 | French | Elfe Mystique | (empty — uses image-based type names) |
| 2 | German | Heiliger Elf | Drache |
| 3 | Italian | ElfoMist. | Drago |
| 4 | Spanish | Duende Míst. | (garbled — different encoding?) |

Block 1 (French) card 1 decoded partially: "D. Blanc aux Yeux Bleus" — the `D.` should be "Dragon" but bytes `0x0D` maps to `.` in the English TBL. This means **French uses the same byte positions but different character mappings for some slots**. Specifically `0x0D` = `r` in French context but `.` in English — wait, that breaks single-table assumption.

**Key finding**: Blocks 1 and 4 have garbled card 1 names with high bytes (0x8D+), suggesting they may use a different encoding or contain image/pointer data rather than TBL text. Blocks 0, 2, 3 decode cleanly with the PAL TBL (just missing a few chars like `ß` at 0x4F, space-hyphen at 0x37).

## Approach

1. **Complete the easy mappings first.** German block (2) and Italian block (3) decode almost fully. Map remaining bytes:
   - `0x4F` = `ß` (from German "Weißer")
   - `0x37` = `-` or `'` (from German "Baby-Drache", Italian "Hitotsu-me")
   - `0x24` = `é` (from Italian/French accented names)
   - `0x42` = `í` (from Spanish "Míst.")
   - `0x43` = `ó` (from Spanish "Dragón")

2. **Cross-reference with Yugipedia/community databases** for German and Italian card name lists to fill remaining gaps.

3. **Investigate blocks 1 and 4.** The high-byte content suggests these may not be simple TBL text. They could be:
   - A different TBL variant per language
   - Pointer/index data rather than inline text
   - Compressed or image-based card names

## Validation

After mapping, decode card names 1–10 from each language block and verify they match known translations (Yugipedia, community databases).

## Files

- `scripts/extract-game-data.ts` — expand `PAL_CHAR_TABLE`
- `docs/memory/disc-structure.md` — already has language order
