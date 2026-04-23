# Per-card deck-copy limit — findings

Where "Alpha mod" stores the 2-copy / 1-copy deck restrictions, and how to
extract them automatically from any mod that shares the same code shape.

## TL;DR

The rule is encoded entirely in the SLUS — code + a small u16 table. No
overlay load, no WA_MRG block, no runtime-only state.

- **Table**: 25 × u16 LE at `DAT_801cf324` (Alpha SLUS file offset
  `0x1bfb24`). Each non-zero entry encodes `card_id + 31452` (the `31452`
  is a mod-specific constant — see "Encoding" below).
- **Dispatcher**: `FUN_801cf364` at RAM `0x801cf364` (file offset
  `0x1bfb64`). MIPS loop that walks the table. The first 14 non-zero
  entries yield a 2-copy cap; after two zero sentinels, the next 10
  entries yield a 1-copy cap; anything not in the table defaults to 3.
- **Exodia exception**: cards with id in `[17..21]` are hard-capped at 1
  by a range check in the caller (`FUN_800336f0`), not by the table.

## Alpha-mod result (34/34 ground-truth tests pass)

- **1-copy (15 cards)**
  - Exodia pieces via range check: 17, 18, 19, 20, 21.
  - Table entries: 249 King of the Swamp, 312 Riryoku, 655 Dragon Master
    Knight, 669 Fiendish Chain, 686 Mirror Force, 698 Slifer the Sky
    Dragon, 699 The Winged Dragon of Ra, 700 Obelisk the Tormentor, 710
    Antihope God of Despair, 720 Five-Headed Dragon.
- **2-copy (14 cards)**
  - 298–300 Hex-Sealed Fusions (Light / Dark / Earth), 309 Ballista of
    Rampart Smashing, 329 Fusion Weapon, 337 Raigeki, 344 Inferno
    Tempest, 348 Swords of Concealing Light, 350 Vanquishing Light, 657
    Megamorph, 661 Crush Card, 672 Harpie's Feather Duster, 685 Blast
    Held by a Tribute, 690 Negate Attack.
- **3-copy**: everything else (693 cards).

## Encoding

The dispatcher computes `probe = (v1 - 0x80100000) + 31452` and walks the
table looking for `probe == table[i]`. Since the caller sets
`v1 = 0x80100000 + card_id`, the table entry for card `c` is literally
`c + 31452`. The constant `31452` is just the addiu immediate — it could
differ in other mods (any value that keeps `card_id + constant` in u16
range works).

Relevant MIPS (Alpha):

```
801cf38c  addiu  a0, zero, 2          # default cap = 2
801cf390  lui    t1, 0x801d
801cf394  addiu  t1, t1, -3292        # t1 = 0x801cf324  (TABLE base)
801cf398  lui    t0, 0x8010
801cf39c  sub    t0, v1, t0           # t0 = v1 - 0x80100000
801cf3a0  addiu  t0, t0, 31452        # t0 = probe (card_id + 31452)
801cf3a4  lhu    t5, 0(t1)            # loop: read entry
801cf3a8  beq    t0, t5, epilogue     #   match → return a0
801cf3ac  addiu  t2, t2, 1            #   (delay) counter++
801cf3b0  beq    t2, 17, set_a0_1     #   16 iters done → switch to 1-copy
801cf3b4  nop
801cf3b8  beq    t2, 28, set_a0_3     #   27 iters done → default 3, exit
801cf3bc  nop
801cf3c0  j      801cf3a4             # loop
801cf3c4  addiu  t1, t1, 2            #   (delay) advance pointer
801cf3c8  j      801cf3a4             # set_a0_1: back to loop
801cf3cc  addiu  a0, zero, 1          #   (delay) a0 = 1
801cf3d0  addiu  a0, zero, 3          # set_a0_3: a0 = 3, fall through
801cf3d4  ...                         # epilogue: restore regs, return
```

The two magic terminators `17` and `28` encode the block layout:

- Entries `0..(17-2)` = indices `0..15` are candidates for **2-copy**.
  Non-zero ones are the 2-copy list; zeros act as "no more 2-copy cards"
  and stop matching in that range.
- Entries `15..(28-2)` = indices `15..26` are candidates for **1-copy**
  (with index 15 effectively re-read due to how the jump is wired,
  harmless because it's a zero). Non-zero ones are the 1-copy list.

Alpha's table uses 14 entries for 2-copy, two zero padders, then 10
entries for 1-copy — fitting inside those two windows. A different mod
could bump the terminators `17 → K` and `28 → L` to make room for more
cards, or leave them and just fill more of the existing slots.

## Where the data lives (Alpha SLUS, byte-exact)

| Item | RAM | SLUS file offset |
|---|---|---|
| Dispatcher `FUN_801cf364` | `0x801cf364` | `0x1bfb64` |
| Table `DAT_801cf324` | `0x801cf324` | `0x1bfb24` |
| Caller `FUN_800336f0` (Exodia range check) | `0x800336f0` | `0x23ef0` |

Table dump (Alpha, 25 × u16 LE at `0x1bfb24`, decoded with `- 31452`):

```
[ 0] 0x7c06 → 298    [ 9] 0x7c2d → 337    [18] 0x7d97 → 699
[ 1] 0x7c07 → 299    [10] 0x7d71 → 661    [19] 0x7d98 → 700
[ 2] 0x7c08 → 300    [11] 0x7c3a → 350    [20] 0x7c14 → 312
[ 3] 0x7d89 → 685    [12] 0x7d7c → 672    [21] 0x7d8a → 686
[ 4] 0x7d8e → 690    [13] 0x7c34 → 344    [22] 0x7d79 → 669
[ 5] 0x7c25 → 329    [14] 0x0000 → —      [23] 0x7d6b → 655
[ 6] 0x7d6d → 657    [15] 0x0000 → —      [24] 0x7dac → 720
[ 7] 0x7c11 → 309    [16] 0x7d96 → 698    [25] 0x7bd5 → 249
[ 8] 0x7c38 → 348    [17] 0x7da2 → 710
```

## Extraction strategy (autosync-friendly)

For a given SLUS, the extractor needs to find:

1. **The table base.** Scan for the MIPS idiom `lui rt, 0x801d; addiu rt,
   rt, simm16` (computes any address in the `0x801c****` / `0x801d****`
   window). Require that the computed address be followed by a specific
   shape: ≥14 u16 values ≤ `0x80ff` (card IDs 0–721 plus offset),
   interrupted by zeros, then more u16 values, all within a ~50-byte
   window.
2. **The encoding constant.** Read the next `addiu rt, rt, simm16` after
   the `sub rt, v1, t0` in the dispatcher. The immediate is the offset
   (`31452` in Alpha).
3. **The block boundaries.** Read the two `beq rt, imm_reg, label`
   comparisons. The literal immediates loaded into the compared registers
   earlier in the prologue (`addiu rt, zero, 17` and
   `addiu rt, zero, 28` in Alpha) give the `2-copy window end` and
   `1-copy window end` counters. Iterate entries accordingly.
4. **The Exodia range.** Scan the caller for an `slti`/`sltiu` pair that
   brackets `[17, 22)` before the `jal` to the dispatcher. If absent,
   omit the hard-1-copy range.

A fallback: locate the dispatcher by byte signature (the 10-instruction
prologue starting with `addiu v0, v0, -336; sw t0, 0(v0); ...`) — this
will work for mods that only add/remove table entries without rewiring
the scheme.

## Cross-mod verification

Alpha's findings were re-checked against the two other SLUS images in
the repo:

- `gamedata/rp-bin/Yu-Gi-Oh! FM REMASTERED PERFECTED.bin`
  — serial `SLUS_014.11` (file named for the 15-drop variant of RP).
- `gamedata/vanilla-bin/Yu-Gi-Oh! Forbidden Memories (France).bin`
  — serial `SLES_039.48` (PAL French, the baseline we have for "vanilla").

Method: (a) byte-match the 7-instruction dispatcher prologue
(`addiu v0,v0,-336; sw t0..t5,0..20(v0)`) to see whether each SLUS even
has the function; (b) scan the full text for any run of 25 u16 values
where non-zero entries decode to valid card IDs `[0..721]` via
`raw - 31452`; (c) dump the 25 u16 table at RAM `0x801cf324` if the
dispatcher is present; (d) confirm the Exodia range check
`addiu v0, s0, -17; sltiu v0, v0, 5` in the caller at `FUN_800336f0`.

Results:

| | dispatcher | table at 0x801cf324 | Exodia range check |
|---|---|---|---|
| **Alpha** (SLUS_027.11) | ✓ byte-identical | 14 × 2-copy + 10 × 1-copy | ✓ |
| **RP** (SLUS_014.11)    | ✓ byte-identical | 1 × 1-copy (card 348) only | ✓ |
| **Vanilla** (SLES_039.48) | ✗ not present | all zeros | ✗ |

Conclusions:

1. **Vanilla has no per-card deck-copy restriction system at all.** The
   dispatcher function does not exist; the caller at `FUN_800336f0` is
   entirely different code; there's no Exodia range check. Every card in
   a vanilla deck is implicitly capped at 3.
2. **The mechanism was introduced by RP** (Remastered Perfected). Alpha
   inherited Byte-for-Byte identical dispatcher + caller logic and only
   added more entries to the table. Any mod that shares this dispatcher
   shape can be decoded with the same extractor — the per-mod variation
   lives in the table, not the code.
3. **RP's table (as shipped in our `rp-bin`)** has exactly one populated
   entry: card 348 = Swords of Revealing Light → 1 copy. Plus Exodia
   (17–21) from the range check. If RP also caps Slifer / Obelisk / Ra
   / etc., that enforcement is elsewhere (e.g., drop/reward logic rather
   than deck-build-time checks), not in this table. Worth validating
   in-game if we plan to rely on RP's table.
4. **Extractor robustness.** The dispatcher bytes (Alpha ↔ RP) match
   exactly, including the magic constants `17`, `28`, `31452`, and the
   table address `0x801cf324`. A simple byte-signature scan of the
   10-instruction prologue is enough to reject vanilla and accept
   RP-family mods. Once located, the constants can be read out instead
   of hard-coded, so the extractor survives any future mod that tweaks
   them.

