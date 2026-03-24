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

1. **Start from community findings.** Check fmlib-cpp, fmscrambler, TCRF wiki, and other community tools for how they handle attribute names. They likely already document the attribute name table's offset, structure, and encoding. Gather: table address(es), entry format, and per-version differences.
2. **Verify against the binary.** Using the community-documented offset, read bytes at that location in the RP and vanilla executables. Decode as 0xFF-terminated TBL strings and confirm they match expected attribute names.
3. **Check across versions.** Does the vanilla French exe have the same table at the same relative position? Community tools may already document version differences.
4. **Find pointer to the table.** If community tools document a pointer, verify it. Otherwise search for a RAM-address pointer in the executable.
5. **Update downstream plans.** If findings affect plan 09 (unit tests) or 08 (module split), update those plans.

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
