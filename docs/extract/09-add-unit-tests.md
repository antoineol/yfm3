# Plan: Add Unit Tests for Extraction Logic

## Problem

The extraction logic has no unit tests. The only validation is the end-to-end `verify:rp` and `verify:vanilla` scripts, which require actual disc images and take seconds to run. Bugs in detection heuristics, parsing logic, or CSV serialization can only be caught by running the full pipeline.

## Goal

Add unit tests for the core extraction functions so that individual components can be tested in isolation, without disc images.

## What to Test

### Detection functions (with small synthetic buffers)
- `isValidCardStat(raw)` — boundary values, all-zero, max values
- `isValidLevelAttrTable(exe, addr, cardStatsAddr)` — valid table, off-by-one, random data
- `isValidFusionHeader(waMrg, addr)` — synthetic fusion header, 0xFF-filled regions (rejected), zero regions (rejected)
- `isValidStarchipTable(waMrg, addr)` — BCD validation, zero-padding rejection, non-zero cost threshold
- `isValidDuelistBlock(waMrg, addr)` — sparse arrays with non-zero deck entries, all-zero rejection
- `isValidWaMrgLayout(waMrg, layout)` — full layout validation against synthetic WA_MRG buffer
- `detectWaMrgLayout(waMrg)` — matches correct known layout, throws on unrecognised file
- `detectAttributeMapping` — with/without color prefixes

### Extraction functions (with known binary data)
- `extractFusions(waMrg)` — small synthetic fusion table with known entries, verify correct parsing
- `extractEquips(waMrg)` — synthetic equip entries, terminator handling
- `extractStarchips(waMrg)` — BCD password decoding, 0xFFFFFFFE sentinel
- `decodeTblString(buf, start, maxLen)` — known TBL sequences, control codes, color prefixes, terminator
- `extractCards(slus, waMrg)` — verify bit-field extraction (atk 9-bit, def 9-bit, gs 4-bit, type 5-bit)

### CSV serialization (with known data)
- `cardsToCsv(cards)` — escaping of quotes, newlines in descriptions, empty fields
- `fusionsToCsv(fusions, cardAtk)` — correct column order
- `equipsToCsv(equips)` — expansion of monsterIds array

### ISO 9660 (with synthetic sectors)
- `readSector(bin, sector)` — correct offset calculation with MODE2/2352 layout
- `parseDirectory(dirData, dirSize)` — entry parsing, sector boundary handling

## Implementation

1. Create test files alongside the modules (after plan 08 splits the code):
   - `scripts/extract/__tests__/iso9660.test.ts`
   - `scripts/extract/__tests__/detect-exe.test.ts`
   - `scripts/extract/__tests__/extract-fusions.test.ts`
   - etc.
2. Use Vitest (already configured in the project).
3. Build small synthetic Buffer fixtures for each test — avoid depending on disc images.
4. For integration tests that DO use disc images, keep them in the verify scripts (existing pattern).

## Validation

- `bun run test` must pass with the new tests.
- Tests should run fast (< 1s total for the extraction tests).

## Files

- `scripts/extract/__tests__/*.test.ts` (new)
- Depends on plan 08 (module split) for clean imports, but could be written against the monolith too
