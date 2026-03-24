# Plan: Extract Type Names and Guardian Star Names from Binary

## Problem

The `CARD_TYPES` and `GUARDIAN_STARS` mappings are hardcoded in the script:

```typescript
const CARD_TYPES: Record<number, string> = { 0: "Dragon", 1: "Spellcaster", ... };
const GUARDIAN_STARS: Record<number, string> = { 0: "None", 1: "Mars", ... };
```

Comments note these come from "the type name table at SLUS offset 0x1C92CE" and "the name table at SLUS offset 0x1C9380". The script read them once manually and hardcoded the results. A mod could change type names (e.g., rename "Beast-Warrior" to "Beastfolk") or add new types. The French version has these names in French.

## Goal

Read the type name table and guardian star name table directly from the executable at runtime, making the extraction fully data-driven.

## Research Phase

1. **Start from community findings.** Check fmlib-cpp, fmscrambler, and TCRF wiki for how they handle type names and guardian star names. They likely document: table offsets, entry count, encoding format (0xFF-terminated TBL strings), and any version-specific differences. Gather the known offsets and expected values.
2. **Verify against the binary.** Using community-documented offsets, read the tables in the RP executable. Decode as consecutive 0xFF-terminated TBL strings. Confirm they match the hardcoded `CARD_TYPES` and `GUARDIAN_STARS` mappings.
3. **Count entries.** The type table has 24 entries (types 0-23). The guardian star table has 11 entries (0-10). Verify by counting 0xFF terminators.
4. **Check vanilla and French versions.** Community tools may already document whether these tables are at the same relative position across versions. If not, check the vanilla and SLES executables using the pointer table approach (plan 02).
5. **Update downstream plans.** If findings affect plan 09 (unit tests), update it.

## Implementation

1. Compute table addresses relative to card stats (like `detectTextOffsets` does).
2. Read and decode all entries using `decodeTblString`.
3. Replace hardcoded `CARD_TYPES` and `GUARDIAN_STARS` with the extracted values.
4. For EU/JP versions where text is external: fall back to the English defaults (card types and guardian stars are unlikely to be localized, or fall back to numeric IDs).

## Validation

- `bun verify:rp` must pass 4/4 with extracted table matching the hardcoded one.
- `bun verify:vanilla` must produce the same results.

## Files

- `scripts/extract-game-data.ts` — `CARD_TYPES`, `GUARDIAN_STARS` constants and their extraction
