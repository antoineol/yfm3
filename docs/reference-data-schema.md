# Reference Data Schema

This document freezes the canonical Google Sheets schema for shared reference data used by YFM3.

## Tabs

- `Cards`
- `Fusions`
- `Meta` (optional; import metadata/log notes)

## Cards columns

Required headers in reading order:

1. `cardId`
2. `name`
3. `attack`
4. `defense`
5. `kind1`
6. `kind2`
7. `source`
8. `status`
9. `notes`

Rules:

- `cardId` must be a positive integer and globally unique.
- `name` must be non-empty and unique (case-insensitive after trimming).
- `attack` and `defense` must be integers >= 0.
- `kind1`/`kind2` are optional, but when present they should match in-game card kind names.
- `status` must be one of: `confirmed`, `unverified`, `needs_review`.

## Fusions columns

Required headers in reading order:

1. `materialA`
2. `materialB`
3. `resultName`
4. `resultAttack`
5. `resultDefense`
6. `source`
7. `status`
8. `notes`

Rules:

- `materialA` and `materialB` must be non-empty card-name references.
- Material pairs are normalized in alphabetical order for duplicate checks.
- `resultName` must be non-empty.
- `resultAttack` and `resultDefense` must be integers >= 0.
- `status` must be one of: `confirmed`, `unverified`, `needs_review`.

## Naming rules for card references

- Card names are trimmed.
- Duplicate whitespace is collapsed.
- Matching is case-insensitive for validation.
- Runtime storage keeps the first-seen display casing.

## Fusion-only result cards

If `resultName` does not appear in the `Cards` tab:

- import remains valid;
- runtime loaders synthesize a fusion-only card entry with the imported attack/defense;
- the synthetic card receives an available in-range ID when building in-memory fusion tables.
