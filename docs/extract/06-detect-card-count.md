# Plan: Auto-Detect Card Count Instead of Hardcoding 722

## Problem

`NUM_CARDS = 722` is hardcoded and used in ~40 places: table scanning, loop bounds, validation thresholds, CSV generation. A mod that adds or removes cards would break every detection heuristic and every extraction function silently (wrong data, not an error).

The game knows how many cards it has — this count is stored somewhere in the binary.

## Goal

Auto-detect the card count from the binary data so the script works with mods that change the card pool size.

## Research Phase

1. **Find where the card count is stored.** Candidates:
   - A uint16/uint32 constant in the SLUS executable, likely near the card stats table
   - The card stats table might be bounded by a sentinel value (e.g., all-zero entry after the last card)
   - The WA_MRG file table might encode it as the size of the card stats file entry (size / 4 = card count)
   - The fusion table header (722 uint16 entries) implicitly encodes the count
2. **Cross-reference with fmlib-cpp / fmscrambler.** These tools likely define a card count constant with documentation of where it comes from.
3. **Check if different versions have different counts.** Vanilla US/EU/JP all have 722. The RP mod also has 722. But future mods might differ.
4. **Determine the relationship between card count and table sizes.** For each table, the relationship is:
   - Card stats: `count * 4` bytes
   - Level/attr: `count * 1` bytes
   - Name offset table: `count * 2` bytes
   - Fusion header: `2 + count * 2` bytes
   - Starchip table: `count * 8` bytes
   - Duelist pools: `count * 2` bytes each
5. **Cross-check with community tools.** Verify the detected count against fmlib-cpp, fmscrambler, and community card databases. All known versions use 722, but confirm the detection method would generalize.
6. **Update downstream plans.** If the detection approach changes table-size assumptions, update plans 08 (module split) and 09 (unit tests).

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
