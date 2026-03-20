Known fusion duplicates (same materials, 2+ output fusions given) are listed below.

Correct: 42,159,206,2400
Incorrect: 42,159,457,2200

---

Fusions skiped because ID1 > ID2:
178,177 → 432 (2700 ATK)
210,209 → 259 (4000 ATK)

## Root cause

The binary fusion table (WA_MRG.MRG at 0xB87800) contained overlapping entries
for the same (material1, material2) pair — 127 conflicting duplicates and 38
exact duplicates total — caused by overlapping range-based fusion rules in the
mod's data.

## Resolution rule

The game's fusion lookup routine (ROM 0x19a60):
1. Normalizes the pair so the lower card ID is always material1
2. Linear-scans material1's fusion list for material2
3. Returns immediately on the first match (first-match-wins)

Evidence: disassembled game code, community documentation
(MarceloSilvarolla/YFM-Database-and-Fusion-Guide), and the user-confirmed
example above.

## Fix

`scripts/extract-game-data.ts` `extractFusions()` now:
- Skips entries where material1 > material2 (unreachable due to normalization;
  2 such entries existed: 178,177 and 210,209)
- Deduplicates (material1, material2) pairs, keeping only the first occurrence

---

Wrong fusion order from hand

Hand: Celtic Guardian, Solar Flare Dragon, Darkfire Dragon, Kojikocy, Dark Blade
It generates:
468 Blue-Eyes White Dragon - from:
(1) Celtic Guardian
(2) Solar Flare Dragon → Armed Dragon LV5
(3) Darkfire Dragon → Paladin Of White Dragon
(4) Armed Dragon LV5 → Blue-Eyes White Dragon
Armed Dragon LV5 is produced by 1st fusion, used as material of 3rd fusion, which is impossible in game.
