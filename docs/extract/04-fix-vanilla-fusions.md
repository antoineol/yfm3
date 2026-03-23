# Plan: Fix 15 Missing Vanilla Fusions

## Problem

`bun verify:vanilla` extracts 25,131 fusions vs 25,146 in the reference — 15 are missing. A bounds check was added to prevent out-of-bounds reads:

```typescript
while (read < count) {
  if (pos + 4 >= data.length) break; // bounds safety
  // ... read 5 bytes for up to 2 fusions ...
  pos += 5;
}
```

This truncates fusion entries that extend to the very end of the 64KB fusion table. The game itself reads these entries fine — the table size might actually extend beyond the assumed 64KB, or the last entries wrap in a way the script doesn't handle.

## Goal

Extract all 25,146 fusions without out-of-bounds errors.

## Research Phase

1. **Check the actual fusion table size.** The constant `FUSION_TABLE_SIZE = 0x10000` (64KB) was chosen for the RP mod. The vanilla fusion table might be larger, or the data might extend slightly past 64KB. Read bytes at offset 64KB+ from the fusion table start in vanilla WA_MRG to see if there's valid fusion data there.
2. **Identify which 15 fusions are missing.** Compare the 25,131 extracted rows against the 25,146 reference rows. The 15 missing fusions likely involve specific cards whose fusion data sits at the very end of the table.
3. **Check if the reference has the right count.** The reference was built from community JSON data. It's possible the reference has 15 extra fusions that don't exist in the binary (community data errors). Or the binary has them but the bounds check skips them.
4. **Understand the fusion table layout more precisely.** The per-card offset header has 722 uint16 entries. For the 15 missing fusions, check which cards they belong to (material1_id) and whether those cards' offset entries point near the end of the table.
5. **No file-table size available (plan 01 outcome):** WA_MRG has no internal file table, so the fusion table size cannot be derived from metadata.  However, with `KNOWN_WAMRG_LAYOUTS` we know that equip and fusion are contiguous (equip ends exactly where fusion begins), so the fusion table's *upper* bound is wherever the next known data block starts.  Check whether the 15 missing entries sit just past the 64 KB boundary.
6. **Cross-check with community tools.** Compare the 15 missing fusions against community fusion databases (YGO FM Database, fmlib reference data) to confirm whether they exist in the binary or are reference-data errors.
7. **Update downstream plans.** If the fusion table size changes, update plan 08 (module split) and 09 (unit tests) accordingly.

## Implementation

Option A (if fusion table is exactly 64KB):
- The bounds check `pos + 4 >= data.length` uses `>=` which rejects the very last valid 5-byte entry at positions 65531-65535. Change to `pos + 4 > data.length` (strictly greater) to allow reading up to the last byte.

Option B (if fusion table extends beyond 64KB):
- Increase `FUSION_TABLE_SIZE`.  Use the gap between the fusion offset and the next known table offset in `KNOWN_WAMRG_LAYOUTS` as an upper bound.

Option C (if the 15 are reference errors):
- Document the discrepancy and adjust the reference data.

## Validation

- `bun verify:vanilla` fusions should match exactly (25,146 rows) or the discrepancy should be documented.
- `bun verify:rp` must still pass 4/4.

## Files

- `scripts/extract-game-data.ts` — `extractFusions()` function and `FUSION_TABLE_SIZE` constant
