# Plan: Extract Attribute Mapping from Binary Instead of Heuristics — DONE (no table exists)

## Problem

The attribute encoding (which nibble value maps to which attribute name) differs between game versions:

- **Vanilla:** `{0: "Light", 1: "Dark", 2: "Earth", 3: "Water", 4: "Fire", 5: "Wind"}`
- **RP mod:** `{0: "", 1: "Light", 2: "Dark", 3: "Water", 4: "Fire", 5: "Earth", 6: "Wind"}`

Currently detected by checking if any card name starts with a `{F8 0A}` color prefix (RP-specific). This heuristic is fragile — a mod could use different color conventions.

The original hypothesis was that the PS1 executable stores an **attribute name table** (like the type name table at SLUS offset 0x1C92CE and the guardian star name table at 0x1C9380).

## Research Findings

### No attribute name table exists

1. **Exhaustive binary search.** Searched the entire RP and vanilla executables for TBL-encoded attribute names ("Light", "Dark", "Earth", "Water", "Fire", "Wind") as standalone 0xFF-terminated consecutive strings. No attribute name table found. Individual word matches are only inside card names/descriptions.

2. **Complete data layout mapped.** The region between levelAttr and nameOT is fully accounted for (sort tables, type names at 0x1C92CE, GS names at 0x1C9380, duelist/UI text). No unaccounted gap exists.

3. **Community tools confirm.** fmlib-cpp, fmscrambler, and FMLibrary/duke1102 all treat the attribute as a raw nibble value from the levelAttr byte. None read an attribute name table from the binary.

4. **Game uses icons, not text.** Type names and guardian star names are stored as text because the game renders them as UI text. Attributes are displayed as graphical sprite icons, so the game never needs attribute name strings.

### Nibble data cannot distinguish versions

Both RP and vanilla use nibble values 0–5 for monsters (non-monster cards use 6–7 in both). The distributions differ but the value ranges are identical. No binary signal in the nibble data alone can determine which mapping applies.

- **RP monsters:** 0:95, 1:206, 2:148, 3:75, 4:45, 5:53
- **Vanilla monsters:** 0:56, 1:176, 2:221, 3:97, 4:20, 5:51

In RP, nibble 0 means "no attribute" (95 monsters including Copycat, Time Wizard, fairies, machines). In vanilla, nibble 0 means "Light" (56 monsters including BEWD). Both have monsters with nibble 0 and nonzero ATK/DEF, so this cannot serve as a discriminator.

### Color-prefix heuristic is the best available approach

The `{F8 0A XX}` color prefix in card names is a fundamental RP feature (it adds color-coded card names to the UI), not just a cosmetic choice. It is the strongest binary signal distinguishing RP from vanilla. PAL/EU discs (no text in exe) correctly default to vanilla encoding.

## Outcome

The original implementation plan (extract a name table) is impossible. Instead:

1. Improved `detectAttributeMapping()` comments to document why no table exists and why the color-prefix heuristic is used.
2. Updated the top-level `cardAttributes` doc comment with the same explanation.
3. Kept the existing detection logic unchanged (it works correctly for all known versions).

## Validation

- `bun verify:rp` passes 4/4. ✓
- `bun verify:vanilla` passes 4/4. ✓
- `bun typecheck`, `bun lint`, `bun run test` all pass. ✓

## Files

- `scripts/extract-game-data.ts` — `detectAttributeMapping()` and `cardAttributes` comments updated
