# Plan: Auto-Detect Card Count Instead of Hardcoding 722

## Problem

`NUM_CARDS = 722` is hardcoded and used in ~40 places: table scanning, loop bounds, validation thresholds, CSV generation. A mod that adds or removes cards would break every detection heuristic and every extraction function silently (wrong data, not an error).

The game knows how many cards it has — this count is stored somewhere in the binary.

## Goal

Auto-detect the card count from the binary data so the script works with mods that change the card pool size.

## Research Phase

1. **Start from community findings.** Check fmlib-cpp, fmscrambler, and TCRF wiki for how they determine the card count. They likely document whether it's a hardcoded constant, derived from a table size, or detected via sentinel values. Gather: the constant's location (if stored), the detection method used, and any version-specific notes.
2. **Check if different versions have different counts.** Vanilla US/EU/JP all have 722. The RP mod also has 722. But future mods might differ. Community tools may document this.
3. **Determine the relationship between card count and table sizes.** For each table, the relationship is:
   - Card stats: `count * 4` bytes
   - Level/attr: `count * 1` bytes
   - Name offset table: `count * 2` bytes
   - Fusion header: `2 + count * 2` bytes
   - Starchip table: `count * 8` bytes
   - Duelist pools: `count * 2` bytes each
4. **Verify against the binary.** Using the community-documented approach, confirm the card count detection works on both RP and vanilla binaries.
5. **Update downstream plans.** If the detection approach changes table-size assumptions, update plans 08 (module split) and 09 (unit tests).

## Implementation

1. Detect card count from the card stats table: count the number of consecutive valid entries from the detected start. The entry after the last card should be invalid or zero.
2. Replace all uses of `NUM_CARDS` with the detected count.
3. Recalculate dependent constants (fusion header size, duelist pool sizes, etc.) from the detected count.
4. Keep `722` as a validation hint (warn if detected count differs significantly from expected).

## Validation

- `bun verify:rp` must pass 4/4.
- `bun verify:vanilla` must produce the same results.
- Test with a hypothetical card count change (e.g., truncated binary) to verify the detection adapts.

## Files

- `scripts/extract-game-data.ts` — `NUM_CARDS` constant and all its usages
