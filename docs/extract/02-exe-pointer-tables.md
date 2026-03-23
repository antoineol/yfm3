# Plan: Use Executable Pointer Tables Instead of Relative Offsets

## Problem

The script detects text-related offsets (name offset table, text pool base, description offset table, description pool base, duelist names) using hardcoded deltas from the card stats address:

```
nameOT   = cardStats + 0x15be
namePool = cardStats - 0x4244
descOT   = cardStats - 0x14042
descPool = cardStats - 0x14244
duelNames = cardStats + 0x1c0e
```

These deltas were measured from ONE build (SLUS_014.11) and will break if any mod recompiles the executable with different section layout. The game itself doesn't use fixed deltas — it uses pointer tables embedded in the executable to locate data sections.

## Goal

Find the pointer tables in the PS1 executable that the game uses to locate card names, descriptions, and other text data. Use those pointers instead of hardcoded deltas.

## Research Phase

1. **Understand PS1 executable layout.** SLUS/SLES executables are PS-X EXE format:
   - Header at offset 0x000: magic "PS-X EXE", text_addr (load address), entry point, etc.
   - The load address tells where the binary is mapped in RAM (typically 0x80010000)
   - All internal pointers are absolute RAM addresses = load_address + file_offset
2. **Find pointer references to known offsets.** The game code must reference the text pool, name table, etc. Search the executable for uint32 values that equal `load_address + known_offset`:
   - E.g., if load_address = 0x80010000 and nameOffsetTable is at file offset 0x1c6002, search for the uint32 value 0x801D6002 in the exe
   - These pointers are in the game's code or data sections
3. **Identify the card data pointer block.** Multiple pointers (card stats, level/attr, name table, desc table, text pools) are likely stored near each other in a structured way — a "card data descriptor" block.
4. **Cross-reference with disassembly tools.** Use community resources (MIPS disassembly of the game, fmlib-cpp source) to confirm which addresses are the pointer tables.

## Implementation

1. Parse the PS-X EXE header to get the load address.
2. Search for a pointer block that references the already-detected card stats address.
3. Extract all neighboring pointers — these should include text pools, offset tables, etc.
4. Replace `detectTextOffsets()` with pointer-table-based resolution.
5. This also makes card stats detection more robust: instead of scanning for valid entries, find the pointer to the card stats table.

## Validation

- `bun verify:rp` must pass 4/4.
- `bun verify:vanilla` must produce the same or better results.
- The pointer-based detection should work for any SLUS/SLES/SLPS executable without version-specific assumptions.

## Files

- `scripts/extract-game-data.ts` (or new module `scripts/extract/exe-pointers.ts`)
