# Plan: Replace Hardcoded Deltas with Structural Detection — DONE

## Problem

The script detects text-related offsets (name offset table, text pool base, description offset table, description pool base, duelist names) using hardcoded deltas from the card stats address:

```
nameOT   = cardStats + 0x15be
namePool = cardStats - 0x4244
descOT   = cardStats - 0x14042
descPool = cardStats - 0x14244
duelNames = cardStats + 0x1c0e
```

These deltas were measured from ONE build (SLUS_014.11) and will break if any mod recompiles the executable with different section layout.

## Goal

Replace hardcoded deltas with a detection method that works for any PS1 executable layout without version-specific assumptions.

## Research Findings

### No pointer tables exist in the executable

The original plan assumed the game stores pointer tables — direct uint32 addresses referencing data sections. Research showed this is **not the case**:

1. **Zero direct pointer hits.** Searching the executable for uint32 values matching known data RAM addresses (card stats, text pools, offset tables) found 0 matches across both RP and vanilla builds.

2. **MIPS inline address construction.** PS1 games use MIPS `lui`+`addiu` instruction pairs to construct 32-bit addresses inline in code. For vanilla French, 58 `lui`+`addiu` pairs reference the card stats RAM address (0x801d4244). These are scattered across the code section, not in a centralized pointer table.

3. **MIPS references don't work for all builds.** The RP mod's recompiled code section contains different MIPS instruction sequences, so MIPS-based address scanning is unreliable across versions.

### Shared text pool architecture

Text data uses a shared pool + offset table design:
- A **text pool base** is a common reference address (e.g., RAM 0x801d0000)
- An **offset table** is an array of NUM_CARDS uint16LE values
- `pool_base + offset[i]` → TBL-encoded string for card i
- Multiple tables (names, duelist names) share the same pool base
- The actual text strings start well past the offset table (offsets are in the 0x5000–0x9000 range)

### Data layout (consistent across all known builds)

```
descPool → descOT → [desc text] → namePool → [other data] →
cardStats → levelAttr → [type/GS names] → nameOT → duelNamesOT → [name text]
```

All known builds (US vanilla, RP mod, French vanilla) share the same file offsets for card stats (0x1c4a44) and relative positions.  EU builds (SLES) have the same binary layout but store text externally (in SU_MRG), so text regions are zeroed.

## Implementation (adapted)

Since pointer tables don't exist, the approach was adapted to **structural scanning** — detecting text offset tables by their data-structure properties rather than through pointers or fixed deltas.

### 1. PS-X EXE header parsing

`parsePsxExeHeader(exe)` validates the "PS-X EXE" magic and extracts the load address and text size.  This is called at the start of `detectExeLayout()` as a basic sanity check.

### 2. Structural scanning for text offset tables

`findTextOffsetTable(exe, searchStart, searchEnd, numEntries, tblLimit)` searches a region of the executable for a uint16 offset table that resolves to TBL-encoded strings.

**Structural filters** (reject most candidates quickly):
- Offsets bounded (< 0xF000) with meaningful spread (> 0x200)
- ≥70% unique values (cards have distinct names)
- ≥80% non-decreasing consecutive pairs (sequential text storage)

**Pool base search** (for candidates passing structural filters):
- Constrained: `pool + minOffset >= OT + tableSize` (text after table)
- Quick-reject: first byte must be valid TBL character
- Sample validation: 20 entries resolve to TBL strings

**Disambiguation** (critical for correctness):
- **String-start check**: each offset must point to a position preceded by 0xFF (the terminator of the previous string).  This prevents matching at mid-string positions in densely packed text pools.
- **Gap consistency tiebreaker**: for consecutive entries, `offset[i+1] - offset[i]` must equal the byte-length of the TBL string at `offset[i]` plus its 0xFF terminator.  This breaks ties between off-by-2 candidates that score equally on the string-start check.
- **Best-match selection**: the scanner returns the candidate with the highest combined score (primary: string validity, tiebreaker: gap consistency) rather than the first above-threshold match.

### 3. Duelist name table: delta from nameOT

The duelist name table (39 entries) is too small for reliable structural scanning in a densely packed pool.  It uses a validated delta from the structurally-detected nameOT (+0x650, stable across all known builds).

### 4. Delta-based fallback

If structural scanning fails (e.g., EU builds with external text), the original delta-based detection runs as a fallback:
```typescript
let text = detectTextTables(exe, cardStats, levelAttr);
if (text.nameOffsetTable === -1) {
  text = detectTextOffsetsByDeltas(exe, cardStats);
}
```

## Validation

- `bun verify:rp` passes 4/4. ✓
- `bun verify:vanilla` produces the same results as before (equips ✓, fusions 25131, same text/name differences for EU build). ✓
- `bun typecheck`, `bun lint`, `bun run test` all pass. ✓

## Files

- `scripts/extract-game-data.ts` — structural scanning + PS-X EXE header parsing
