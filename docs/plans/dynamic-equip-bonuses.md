# Plan: Dynamic Equip Bonus Values

## Status: TODO

## Problem

The scoring engine hardcodes equip bonuses: Megamorph (card 657) gives +1000 ATK, everything else gives +500. This is baked into two functions:

- `src/engine/scoring/fusion-scorer.ts:7` — hot path (optimizer)
- `src/engine/fusion-chain-finder.ts:6` — UI display (hand fusion calculator)

Both do: `equipId === megamorphId ? 1000 : 500`

This breaks for mods that change equip bonuses, add new equips with different bonus tiers, or reassign Megamorph to a different card ID.

## How the PS1 game works

Equip bonus values are **not stored in the game data files** (WA_MRG.MRG). The equip table only contains compatibility (which equip works on which monster). The actual bonus amounts are hardcoded in the PS1 game engine (EXE), likely as part of the battle logic.

In vanilla/RP:
- Megamorph (ID 657): +1000 ATK, compatible with all monsters
- All other equips: +500 ATK, compatible with specific monster subsets

## Approach: Per-equip bonus lookup table

### Data source

The equip bonus values need to be found in the PS1 EXE. Two options:

**Option A — Signature scan in RAM (like field bonus table).** The field bonus table is found by scanning RAM 0x010000–0x1E0000 for a 120-byte region matching a known value pattern (see `bridge/memory.ts:730`). A similar approach could find the equip bonus logic or a bonus table.

**Option B — Hardcode a lookup by card stats hash.** Since we know the bonus values for vanilla and RP (both identical), we could maintain a mapping of `gameDataHash → bonus table`. Unknown mods would fall back to the default (+500 for all). This is simpler but doesn't discover new bonus tiers.

**Option C — Derive from EXE disassembly.** The battle code has a branch that checks the equip card ID against Megamorph and applies a different constant. This could be found by scanning for the MIPS instruction pattern that loads `657` (or equivalent) and branches. Fragile but fully dynamic.

**Recommended: Option A or B.** Option A is better long-term; Option B is a quick interim fix.

### Engine changes

1. **Add `equipBonus: Int16Array` buffer** in `src/engine/types/buffers.ts` — indexed by equipId, stores the ATK bonus each equip provides (e.g., 500, 1000).

2. **Populate from game data** in `src/engine/data/load-game-data-core.ts`:
   - When loading from bridge gameData: use a new `equipBonuses` field (see below)
   - When loading from CSV: add a `bonus` column to `equips.csv`, or use a separate file

3. **Replace hardcoded functions**:
   - `fusion-scorer.ts`: `effective += buf.equipBonus[eqId]` (drop the megamorphId param entirely)
   - `fusion-chain-finder.ts`: same pattern

4. **Remove `megamorphId` from EngineConfig** (`src/engine/config.ts`) — no longer needed once bonuses are per-equip.

5. **Update bridge game data** (`bridge/game-data.ts`, `src/engine/worker/messages.ts`):
   - Add `equipBonuses: Record<number, number>` to `BridgeGameData` (or extend `EquipEntry` with a `bonus` field)
   - Bridge populates this from RAM scan or hardcoded fallback

### Performance consideration

The hot path (`fusion-scorer.ts`) is called millions of times during optimization. The current `equipId === megamorphId ? 1000 : 500` is a branch + comparison. Replacing it with `buf.equipBonus[eqId]` is a single array lookup — same or faster. The `Int16Array` fits in L1 cache (722 * 2 = ~1.4KB).

### Migration

- Existing CSV format (`equip_id,monster_id`) could add a third column (`bonus`) or use a separate `equip-bonuses.csv`
- Static extraction (`bun run extract:rp`) would need to produce the bonus data
- Bridge extraction would need to transmit it

## Files affected

| File | Change |
|------|--------|
| `src/engine/types/buffers.ts` | Add `equipBonus: Int16Array` |
| `src/engine/data/load-game-data-core.ts` | Populate equipBonus from CSV or bridge |
| `src/engine/scoring/fusion-scorer.ts` | Replace hardcoded function with buffer lookup |
| `src/engine/fusion-chain-finder.ts` | Same |
| `src/engine/config.ts` | Remove `megamorphId` from EngineConfig |
| `src/engine/mods.ts` | Remove `megamorphId` from ModConfig, remove `getMegamorphId` |
| `src/engine/worker/messages.ts` | Add equip bonuses to BridgeGameData |
| `bridge/game-data.ts` or `bridge/memory.ts` | Extract/scan bonus values |
| `scripts/extract/extract-equips.ts` | Extract bonus values for static CSV |
| 5 `megamorphId` consumers | Remove (replaced by per-equip buffer) |

## Prerequisite research

Before implementing, we need to locate the equip bonus values in the PS1 EXE. Suggested approach:
1. In DuckStation debugger, set a breakpoint on the battle ATK calculation
2. Equip a monster with Megamorph, observe where the +1000 constant is loaded from
3. Check if it's an immediate value in the instruction or loaded from a data table
4. If it's a table, find its offset and signature for RAM scanning
