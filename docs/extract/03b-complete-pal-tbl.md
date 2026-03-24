# Plan: Complete PAL TBL (Accented Characters)

## Status: DONE

## Problem

The PAL TBL had 64 mapped entries (all characters used in English text). Bytes for accented characters (é, è, ê, à, ü, ß, ñ, etc.) were unmapped and rendered as `{hex}` placeholders, blocking correct decoding of French, German, Italian, and Spanish text.

## Language Block Order (Confirmed)

| Block | Language | Card 1 name | Offset | Notes |
|-------|----------|-------------|--------|-------|
| 0 | English | Blue-eyes White Dragon | 0 | Decodes fully |
| 1 | French | D. Blanc aux Yeux Bleus | 1 | 1 garbage entry at index 0 (pointer data) |
| 2 | German | Weißer Drache | 0 | Decodes fully |
| 3 | Italian | DragoBianco Occhi | 0 | Decodes fully |
| 4 | Spanish | Dragón Bl. Ojo Azul | 2 | 2 garbage entries at indices 0-1 (pointer data) |

## What Was Done

### 1. Diagnostic analysis

Wrote `scripts/diagnose-pal-tbl.ts` to dump raw bytes from all 5 language blocks (3610 card names total) and identify unmapped bytes by cross-referencing with known translations.

### 2. Added 28 new character mappings

Expanded `PAL_CHAR_TABLE` from 64 to 92 entries. New mappings by category:

**Accented (Romance languages):**
- 0x24=é, 0x3e=à, 0x40=è, 0x42=í, 0x43=ó, 0x4c=ê, 0x4d=ñ, 0x52=ú
- 0x56=î, 0x59=ô, 0x5d=â, 0x72=ï, 0x77=û
- 0x51=É, 0x3f=œ, 0x69=Œ

**Accented (German):**
- 0x3d=ä, 0x41=ü, 0x44=ö, 0x4f=ß

**Punctuation:**
- 0x37=- (hyphen, distinct from 0x4b), 0x2a=' (apostrophe, distinct from 0x3a)
- 0x5e=), 0x60=(, 0x65=/, 0x66=°, 0x71=º, 0x7c=ª

### 3. Findings about FR/ES blocks

Three issues discovered that don't affect English-only extraction but block multi-language support. Each is addressed concretely in step 03c:

1. **Name block offsets differ per language.** FR (block 1) has 1 garbage entry at index 0 (high bytes 0x8D–0x8F, pointer table data). ES (block 4) has 2. EN/DE/IT start at index 0. Currently `extractWaMrgStrings` always reads from index 0.

2. **Per-language TBL conflict at byte 0x3f.** Maps to `œ` in French (Bœuf, Sœurs, Cœur — 9 uses) but `á` in Spanish (Máquina — 44 uses). Only known conflict in the 92-entry table.

3. **One unmapped byte remains: 0x2f.** Appears once, in ES card "Kuwagata {2f}" (likely `α`).

Side note: French abbreviates heavily (e.g., "D." for "Dragon"). The `0x0D` = `.` mapping is correct for all languages — false alarm from the initial investigation.

### 4. Validation

- **3609/3610 card names** decode cleanly across all 5 languages (99.97%).
- English extraction produces **identical output** to reference CSVs (verified via `bun verify:vanilla`).

## Files Changed

- `scripts/extract-game-data.ts` — expanded `PAL_CHAR_TABLE` (64→92 entries)
- `docs/memory/disc-structure.md` — updated TBL section
