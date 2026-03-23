# Plan: Parse WA_MRG.MRG File Table

## Problem

The extraction script locates tables (fusions, equips, starchips, duelists) inside WA_MRG.MRG by scanning the entire file with heuristics: checking byte patterns, threshold counts, sector-aligned stepping. This is slow, fragile, and produces false positives that require elaborate tiebreakers.

The PS1 game itself doesn't scan — it loads data by file index from a directory. WA_MRG.MRG is a "merge" archive with a file table at the start (or a known location) that maps file indices to (offset, size) pairs. The game code references entries like "file 42 = fusion table" using hardcoded indices.

## Goal

Replace all WA_MRG heuristic scanning (`findFusionTable`, `findStarchipTable`, `findEquipTable`, `findDuelistTable`) with a single `parseWaMrgDirectory()` that reads the archive's file table, then looks up known file indices.

## Research Phase

1. **Reverse-engineer the WA_MRG header format.** Read the first 0x1000 bytes of WA_MRG from both the RP and vanilla French bins. Look for:
   - An array of uint32 offsets at the start (common PS1 archive pattern)
   - Entry count in the first 2-4 bytes, followed by (offset, size) pairs
   - Or a fixed-size directory with sentinel-terminated entries
2. **Cross-reference with community resources.** Search for "WA_MRG format", "YGO FM MRG archive", "fmlib", "fmscrambler" documentation. The code comments already mention fmlib-cpp and fmscrambler as sources.
3. **Identify file indices.** Once the directory is parsed, compare known table offsets (confirmed by current detection) against directory entries to determine which file index corresponds to which table:
   - Fusion table
   - Equip table
   - Starchip/password table
   - Duelist table
   - Card thumbnail images (offset 0x000000)
   - Full card artwork (offset ~0x169000)

## Implementation

1. Write `parseWaMrgDirectory(waMrg: Buffer): WaMrgEntry[]` that returns `{index, offset, size}` for each file.
2. Write `resolveWaMrgLayout(entries: WaMrgEntry[]): WaMrgLayout` that maps known file indices to the layout struct.
3. Remove `findFusionTable`, `findStarchipTable`, `findEquipTable`, `findDuelistTable`, and all their heuristic helpers.
4. Keep the current heuristic functions as a fallback path (gated behind a flag or try/catch) until the file-table approach is validated on multiple versions.

## Validation

- `bun verify:rp` must pass 4/4.
- `bun verify:vanilla` must produce the same results as before (equips ✓, fusions ~25131, etc.).
- The detected offsets from the file table must match the offsets previously found by heuristic scanning.

## Files

- `scripts/extract-game-data.ts` (or new module `scripts/extract/wamrg-archive.ts`)
