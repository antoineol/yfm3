# Reference Data Schema

This document describes the canonical Google Sheets schema for shared reference data used by YFM3.

## Tabs

- `Cards`
- `Fusions`

## Cards columns

Headers used by the sync parser (`syncReferenceData.ts`):

1. `id` — positive integer, globally unique
2. `name` — non-empty, unique (case-insensitive after trimming)
3. `attack` — integer >= 0 (rows without attack/defense are skipped as non-monster)
4. `defense` — integer >= 0
5. `kind1` — optional card kind
6. `kind2` — optional card kind
7. `kind3` — optional card kind
8. `color` — optional card color

Additional columns in the sheet (e.g. `source`, `status`, `notes`) are ignored by the parser.

## Fusions columns

Headers used by the sync parser:

1. `materialA` — non-empty card-name reference
2. `materialB` — non-empty card-name reference
3. `resultName` — non-empty card-name reference
4. `resultAttack` — integer >= 0
5. `resultDefense` — integer >= 0

Material pairs are normalized in alphabetical order for duplicate checks at the domain layer (`parse-reference-fusions.ts`).

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
