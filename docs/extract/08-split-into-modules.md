# Plan: Split extract-game-data.ts into Modules

## Problem

`scripts/extract-game-data.ts` is ~1350 lines in a single file, mixing disc I/O, ISO 9660 parsing, offset detection, data extraction, image processing, CSV serialization, and CLI. This makes it hard to test individual components, reason about dependencies, and work on one area without touching others.

## Goal

Split into focused modules under `scripts/extract/`, each testable independently.

## Module Breakdown

```
scripts/extract/
├── iso9660.ts           — Disc image reading & ISO filesystem parsing
├── detect-exe.ts        — PS1 executable layout detection (card stats, level/attr, text tables)
├── detect-wamrg.ts      — WA_MRG layout detection (KNOWN_WAMRG_LAYOUTS + structural validators)
├── text-decoding.ts     — TBL character table & string decoding
├── extract-cards.ts     — Card stats, names, descriptions, starchip/password extraction
├── extract-fusions.ts   — Fusion table parsing
├── extract-equips.ts    — Equip table parsing
├── extract-duelists.ts  — Duelist deck/drop pool extraction
├── extract-images.ts    — Card artwork extraction (sharp dependency isolated here)
├── csv.ts               — CSV serialization for all table types
├── types.ts             — Shared interfaces (ExeLayout, WaMrgLayout, CardStats, Fusion, etc.)
└── index.ts             — Public API: loadDiscData(), extractAllCsvs(), detectLayout()
```

## Rules

- **No circular dependencies.** `types.ts` is leaf. Detection modules depend on `types.ts` and `iso9660.ts`. Extraction modules depend on `types.ts`. `index.ts` wires everything together.
- **Each module has a clear single responsibility.** Detection modules don't extract data; extraction modules don't detect offsets.
- **The `main()` CLI stays in `scripts/extract-game-data.ts`** (the entry point) and imports from `scripts/extract/index.ts`.
- **`verify-game-data.ts` imports from `scripts/extract/index.ts`** — same public API, just reorganized internals.
- **Move one module at a time.** Don't refactor everything at once. Start with the cleanest separation (e.g., `iso9660.ts` has no dependencies on anything else), verify, then continue.
- **Preserve the reading order convention.** Within each module, if A calls B, write A before B.

## Migration Order

1. `types.ts` — Extract all interfaces (ExeLayout, WaMrgLayout, CardStats, Fusion, EquipEntry, etc.)
2. `iso9660.ts` — Move disc reading, sector parsing, ISO directory parsing
3. `text-decoding.ts` — Move CHAR_TABLE, decodeTblString, isTblString
4. `detect-exe.ts` — Move isValidCardStat, isValidLevelAttrTable, detectExeLayout, detectTextOffsets, detectAttributeMapping
5. `detect-wamrg.ts` — Move KNOWN_WAMRG_LAYOUTS, detectWaMrgLayout, isValidWaMrgLayout, and structural validators (isValidFusionHeader, isValidStarchipTable, isValidDuelistBlock, isValidEquipStart)
6. `extract-cards.ts` — Move extractCardTexts, extractCardDescriptions, extractCards, extractStarchips
7. `extract-fusions.ts` — Move extractFusions
8. `extract-equips.ts` — Move extractEquips
9. `extract-duelists.ts` — Move extractDuelistNames, extractDuelists
10. `extract-images.ts` — Move image extraction (sharp dependency isolated)
11. `csv.ts` — Move all CSV serialization functions
12. `index.ts` — Wire up the public API

## Validation

After EACH module migration:
- `bun typecheck` must pass
- `bun lint` must pass
- `bun verify:rp` must pass 4/4
- `bun verify:vanilla` must produce the same results

## Files

- `scripts/extract-game-data.ts` (shrinks to CLI + imports)
- `scripts/extract/*.ts` (new modules)
- `scripts/verify-game-data.ts` (update imports)
