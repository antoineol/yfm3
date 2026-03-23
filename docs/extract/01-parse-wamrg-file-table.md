# Plan: Parse WA_MRG.MRG File Table — DONE

## Problem

The extraction script locates tables (fusions, equips, starchips, duelists) inside WA_MRG.MRG by scanning the entire file with heuristics: checking byte patterns, threshold counts, sector-aligned stepping. This is slow, fragile, and produces false positives that require elaborate tiebreakers.

## Goal

Replace all WA_MRG heuristic scanning (`findFusionTable`, `findStarchipTable`, `findEquipTable`, `findDuelistTable`) with a reliable, non-heuristic approach.

## Research Findings

### WA_MRG has no internal file table

WA_MRG.MRG is a flat "merge" archive — a byte-level concatenation of game assets with **no directory, header, or file table**. The first bytes are card thumbnail pixel data (not metadata).

Evidence:
1. **Hex dump**: first 0x200 bytes of WA_MRG are 8bpp pixel values for card #1's thumbnail, not any index structure.
2. **Community tools**: Both fmlib-cpp (`DataReader.cpp`) and fmscrambler (`DataScrambler.cs`) use hardcoded byte offsets — `0xB87800` for fusions, `0xB85000` for equips, `0xFB9808` for starchips, `0xE9B000` for duelists — with no parsing of a directory.
3. **Exe sector table**: The executable contains a 1536-entry uint16LE sector table at file offset 0x1034, but it maps background/3D-model file indices to sectors within WA_MRG, **not** the data tables we need. Entry sizes (2-4 sectors each) don't match data table sizes, and the indices are inconsistent across versions.
4. **TCRF / community docs**: The "MRG" name stands for "merged" — a Perl script (`over.pl`) concatenated assets during build. LBAs are hardcoded at compile time.

### Known offsets per version

| Table | US / RP (SLUS_014.11) | French (SLES_03947) |
|---|---|---|
| Card thumbnails | 0x000000 | 0x000000 |
| Full artwork | 0x169000 | 0x169000 |
| Equip table | 0xB85000 | 0xDE8800 |
| Fusion table | 0xB87800 | 0xDEB000 |
| Duelist table | 0xE9B000 | 0x110D800 |
| Starchip table | 0xFB9808 | 0x1278808 |

Sources: fmlib-cpp, fmscrambler, heuristic scanning cross-validation.

## Implementation (adapted)

Since no file table exists, the approach was adapted:

1. **`KNOWN_WAMRG_LAYOUTS`** — an array of `WaMrgLayout` objects with known byte offsets for each supported version (US/RP and French).
2. **`detectWaMrgLayout(waMrg)`** — iterates over `KNOWN_WAMRG_LAYOUTS` and returns the first one that passes structural validation.
3. **Structural validators** — `isValidFusionHeader`, `isValidStarchipTable`, `isValidDuelistBlock`, `isValidEquipStart` check that each table's bytes conform to the expected format, ensuring we don't silently use wrong offsets on an unknown version.
4. **Removed** `findFusionTable`, `findStarchipTable`, `findEquipTable`, `findDuelistTable` and all heuristic scanning helpers. Archived to `scripts/archive/wamrg-heuristic-scanning.ts` for future offset discovery.

## Validation

- `bun verify:rp` passes 4/4. ✓
- `bun verify:vanilla` produces the same results as before (equips ✓, fusions 25131, same text/name differences). ✓

## Files

- `scripts/extract-game-data.ts` — known-layout detection + validators
- `scripts/archive/wamrg-heuristic-scanning.ts` — archived scanning functions
