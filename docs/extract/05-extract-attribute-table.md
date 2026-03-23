# Plan: Extract Attribute Mapping from Binary Instead of Heuristics

## Problem

The attribute encoding (which nibble value maps to which attribute name) differs between game versions:

- **Vanilla:** `{0: "Light", 1: "Dark", 2: "Earth", 3: "Water", 4: "Fire", 5: "Wind"}`
- **RP mod:** `{0: "", 1: "Light", 2: "Dark", 3: "Water", 4: "Fire", 5: "Earth", 6: "Wind"}`

Currently detected by checking if any card name starts with a `{F8 0A}` color prefix (RP-specific). This heuristic is fragile — a mod could use different color conventions.

The PS1 executable stores an **attribute name table** (like the type name table at SLUS offset 0x1C92CE and the guardian star name table at 0x1C9380). This table defines the mapping and can be read directly.

## Goal

Extract the attribute name table from the executable, eliminating the need for heuristic-based detection.

## Research Phase

1. **Find the attribute name table.** In the RP executable (SLUS_014.11):
   - Type names are at 0x1C92CE (24 consecutive 0xFF-terminated TBL strings)
   - Guardian star names are at 0x1C9380 (11 consecutive 0xFF-terminated TBL strings)
   - The attribute name table should be nearby — look for 6-7 consecutive 0xFF-terminated TBL strings between these addresses
   - Expected strings (RP): `"" "Light" "Dark" "Water" "Fire" "Earth" "Wind"` in TBL encoding
   - Expected strings (vanilla): `"Light" "Dark" "Earth" "Water" "Fire" "Wind"` in TBL encoding
2. **Verify table location.** Decode the strings at the candidate address. They should match known attribute names.
3. **Check across versions.** Does the vanilla French exe have the same table at the same relative position? (It might — the strings would be French: "Lumière", "Ténèbres", etc., or could be English since the game might not localize attribute names.)
4. **Find pointer to the table.** The game code must reference this table. Search for a pointer (RAM address = load_addr + offset) in the executable.
5. **Cross-check with community tools.** Compare attribute name table findings against fmlib-cpp, fmscrambler, and TCRF wiki. Verify the mapping matches what community tools produce.
6. **Update downstream plans.** If findings affect plan 09 (unit tests) or 08 (module split), update those plans.

## Implementation

1. Locate the attribute name table relative to the type/guardian-star tables (which are at known relative offsets from card stats).
2. Decode all entries using `decodeTblString`.
3. Build the `cardAttributes` mapping from the decoded strings.
4. Remove `detectAttributeMapping()` and its color-prefix heuristic.
5. Handle the "no text in executable" case (EU/JP): fall back to the standard vanilla mapping or skip attributes.

## Validation

- `bun verify:rp` must pass 4/4.
- `bun verify:vanilla` attributes must match the reference (Light, Dark, Earth, etc.).
- The extracted table must produce the correct mapping for both vanilla and RP without any heuristic.

## Files

- `scripts/extract-game-data.ts` — `detectAttributeMapping()` and related constants
