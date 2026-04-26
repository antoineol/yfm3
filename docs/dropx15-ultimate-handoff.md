# Hand-off: 15-card-drop patch for Ultimate ISO

## 2026-04-26 update: local full-random PoC successful

The current test ISO is:

`/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/ultimate-x15-test.iso`

The current ISO was rebuilt from the clean Ultimate ISO with [scripts/patch-ultimate-x15.ts](../scripts/patch-ultimate-x15.ts) in `local-full-random` mode. It keeps the safe local code host and sends all 15 drops through the game's normal card-credit routine. The detailed implementation spec is [docs/dropx15-ultimate-spec.md](dropx15-ultimate-spec.md).

What it does:

- Leaves the normal card-credit increment vanilla: `0x800218ac` is still `addiu v0, v0, 1`.
- Routes the final award site through local code space at `0x80021f24` / file `0x12724`, not through the crashing `0x801aac40` region.
- Calls `FUN_80021894` once for the displayed reward card.
- Loops 14 times: calls Ultimate's existing picker `FUN_80021810`, then calls `FUN_80021894` for each picked card.
- Jumps back to the original tail at `0x8002209c`.

Observed result:

- Duel ended successfully, no black screen.
- Reward UI still showed one card, as expected.
- Collection gained 15 cards.
- All 15 cards were marked as new/latest in-game.

Known results:

- Direct one-instruction same-card patch: confirmed in DuckStation, 15 copies of displayed card, no transition crash.
- `0x801aac40` cave-smoke patch: black-screened during the transition back to campaign. This proves the alpha/vanilla expansion region itself is unsafe for Ultimate.
- Hidden-random patch at `0x801aac40`: black-screened after validating the reward screen, during the transition back to campaign.
- Local-cave same-card smoke patch at `0x80021f24`: confirmed in DuckStation, 15 copies of displayed card, no transition crash.
- Local hidden-random patch at `0x80021f24`: confirmed in DuckStation, 15 total cards, no transition crash, but incomplete latest/new bookkeeping.
- Local full-random patch at `0x80021f24`: confirmed in DuckStation, 15 cards, no transition crash, all marked new/latest.

What failed after that:

- Hook `0x80021f10..14` / file `0x12710..14` to a 136-byte routine at `0x801aac40` / file `0x19b440`.
- First, run the vanilla visible reward call once.
- Then loop 14 times: call Ultimate's existing picker `FUN_80021810`, increment `0x801d0200 + cardId + 0x4f` directly, capped at 250.
- Jump back to the original tail at `0x8002209c`.

This hidden-random build still black-screened at transition. The `0x801aac40` cave-smoke build also black-screened, even with no random loop and no hidden direct writes. The leading conclusion is that writing executable code into `0x801aac40` is not safe in Ultimate, even though the bytes are zero in the file and alpha/RP/vanilla 15-drop variants use that region.

Verification done locally:

- `bun test scripts/patch-ultimate-x15.test.ts`
- For the current local-full-random build: re-extracted and disassembled the patched SLUS. `0x800218ac` is vanilla `addiu v0,v0,1`; `0x80021f10` is `j 0x80021f24`; `0x80021f24` reloads the selected card and calls `FUN_80021894`; `0x80021f5c` starts the 14-iteration picker loop; each hidden result is passed to `FUN_80021894`; `0x80021f80` jumps to `0x8002209c`; `0x801aac40` remains zero.
- Required project checks after adding the diagnostic modes: `bun typecheck`, `bun lint`, `bun run test`.

Additional comparison:

- `C:\jeux\ps1\Yu-gi-oh! Forbidden Memories\15 card mod` has `Copy.bin` and `Copy.bin.uibak`.
- Extracting `SLUS_014.11` from both through ISO9660 produces identical files, so a normal C decompile diff of those extracted executables would falsely show no patch.
- Raw BIN anchor scan does show the expected Ghost-style change: the backup has the three vanilla loop-limit anchors, and the patched BIN changes the loaded copies to `16/16/15`. If deeper comparison is needed, decompile/disassemble the loaded raw-sector copies, not the ISO9660-extracted SLUS.
- `Vanilla USA/Yu-Gi-Oh! Forbidden Memories (USA).bin` is not byte-identical to the `15 card mod` backup baseline and did not match the exact Ghost anchors. The reliable before/after pair in this folder is `Copy.bin.uibak` -> `Copy.bin`.
- RP[15], RP 1.3, Alpha, and the vanilla 15-card mod all use the same `0x801aac40`/`0x801aad4c`/`0x801aae74` expansion family in the loaded executable copies. They are good algorithm inspiration, but not safe byte-location inspiration for Ultimate.

Next step:

- Safety commit this working formula and spec.
- Delete the experimental implementation modes.
- Reimplement the feature cleanly from [docs/dropx15-ultimate-spec.md](dropx15-ultimate-spec.md).

The current patcher still contains experimental modes (`same-card`, `cave-same-card`, `local-cave-same-card`, `local-hidden-random`, `local-full-random`). The clean rewrite should keep only the final `local-full-random` behavior.

## Goal

Convert `Yu-Gi-Oh! Forbidden Memories (Ultimate).iso` (`SLUS_027.11`) into a 15-card-drop variant matching the alpha mod / Ghost x15 / RP[15] community mods. Then expose the toggle as a checkbox in `Data > Edit`.

The scope is **only `SLUS_027.11`** for now. SLUS_014.11 base + derivatives is documented as v2 work in [docs/dropx15.md](dropx15.md).

## Current state

- Patcher script: [scripts/patch-ultimate-x15.ts](../scripts/patch-ultimate-x15.ts). Runs cleanly, applies a precise byte-level patch.
- Test ISO destination: **overwrite** `/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/ultimate-x15-test.iso`. **Do not** create v2/v3 variants — the user explicitly asked to overwrite the same filename. If DuckStation locks it, ask the user to close DuckStation; don't rename. (Memory note `feedback_test_iso_path.md` was wrong about the legacy BEWD filename.)
- Decomp + asm artifacts: [gamedata/disasm/ultimate-slus-all.c](../gamedata/disasm/ultimate-slus-all.c) (Ghidra, 2255/2425 functions) and [gamedata/disasm/ultimate-slus.asm](../gamedata/disasm/ultimate-slus.asm) (full disasm via [scripts/disas-mips.ts](../scripts/disas-mips.ts)).
- Reference: [gamedata/disasm/alpha-slus-all.c](../gamedata/disasm/alpha-slus-all.c), [gamedata/disasm/alpha-slus.asm](../gamedata/disasm/alpha-slus.asm), `gamedata/exe/alpha-slus.bin` (the source of the 668-byte expansion we copy).
- Ghidra and JDK 21 are pre-installed at `/tmp/ghidra_12.0.4_PUBLIC/` and `/tmp/jdk21/`. Headless project at `/tmp/ghidra-proj-ultimate/`.

## Patch spec (verified against alpha decomp + byte-diff Ultimate vs alpha)

Four hooks in the duel-end function path, plus a 668-byte expansion copied verbatim from alpha (with three +10 immediate bumps for 5→15 cards):

| # | RAM | What | Notes |
|---|---|---|---|
| 1 | `0x80021834..38` + `0x80021844` | drop pool ptr setup → jump to `FUN_801aae54` (saves ptr to global `0x801aae50`) | needed; safe |
| 2 | `0x80021c6c..70` + `0x80021c7c..80` | picker call → `FUN_801aac40` (5/15-iter pick loop into `0x801aac22..3e`) | needed |
| 3 | `0x80021f10..14` | give-card site → `FUN_801aad4c` (5/15-iter give loop calling `FUN_80021894`) | needed |
| 4 | `0x80037dfc..0x80037e07` | render dispatch → `FUN_801aae74` (multi-card animation) | **the trouble** |

Expansion at `0x801aac40..0x801aaedb` (file `0x19b440..0x19b6db`, 668 bytes, all-zero in Ultimate). Three +10 bumps inside it: file offsets `0x19b478` (6→16), `0x19b574` (6→16), `0x19b5ec` (5→15).

## Empirical results so far (in-game tests)

| Patch | Hooks | Result |
|---|---|---|
| v1 | 1+2+3+4, alpha t0-check intact | crash at duel start, after the 5 opening cards drawn |
| v2 | 1+2+3 only | clean duel start, but **crash at duel end** between "you win" and the result/drops/stats screen |
| v3 | 1+2+3+4, with `beq v0, t0, ...` neutralized to `beq v0, zero, ...` (one byte, file `0x19b67e`: 0x48→0x40) | duel-start crash regressed (back), couldn't reach duel end to check |

So: hook 4's mere installation crashes duel start, even with the t0 dispatch neutralized. Without hook 4, duel end crashes.

## Where I got stuck

`FUN_801aae74` (hook 4 expansion) does:
```
lui   v0, 0x8020
addiu v0, v0, -352      # v0 = 0x801FFEA0  (NOT 0x8001fea0 — I had this wrong for a while)
beq   v0, t0, 0x801aae98
ori   v0, zero, 0x8000  # delay slot (always)
lh    v1, 1072(gp)
nop
j     0x80037f1c
addu  a1, v1, v0        # delay slot
```

Falls through to behavior **functionally equivalent** to the original instructions at `0x80037dfc..0x80037e04`. I verified the surrounding bytes are identical between Ultimate and alpha, and the j target `0x80037f1c` is byte-identical too. So the expansion *should* be safe in Ultimate the same way it is in alpha mod's ISO.

But empirically it isn't — installing hook 4 crashes Ultimate at duel start. Reason unknown.

What I had just started checking before stopping:

- The sentinel value is `0x801FFEA0` (I had been thinking `0x8001fea0` for a while). Search for `addiu t0, *, -352` and `lui t0, 0x8020` came up with **zero** matches in Ultimate. So the t0 dispatch shouldn't fire even un-neutralized — yet hook 4 still crashes.
- `FUN_80037db0` is reached as **fall-through** from `FUN_80037da4` (no `jal` callers). `FUN_80037da4` is referenced as a function pointer at file offset `0x816ac` (RAM `0x80090eac`). Probably a dispatch table.
- The 0x20-flag path is a *script-byte interpreter*: `*(*(s0 + v1*4))` is a script pointer that gets advanced. At duel start, the script being interpreted hits flag 0x20 (sprite render), entering hook 4's code path. Different mod = different scripts, possibly explaining why hook 4 works in alpha but not Ultimate.

## Promising next steps (in order of cost)

1. **Look at the script bytes that drive `FUN_80037db0` at duel start in Ultimate vs alpha.** They're stored at the address pointed to by `*(s0 + 88*4)`. Find that storage location, dump it for both ISOs, see if Ultimate genuinely hits the 0x20-flag path more / earlier than alpha. If it does, the duel-start crash is from hook 4 firing in a context alpha never tested.

2. **Suspect 2: picker's hardcoded sp restore.** `FUN_801aac40` overrides `sp` to `0x801aac00`, runs the loop, then on exit does `lui sp, 0x8020; addiu sp, sp, -216` which sets `sp = 0x801FFF28` unconditionally. This only matches if the caller's sp was `0x801FFF68` going in. In Ultimate the call chain to `FUN_800218f0` may differ from alpha and put sp elsewhere. **This is the leading hypothesis for the v2 duel-end crash.** A fix would be to modify the picker to *save* the original sp on entry (in one of the BASE slots at `0x801aac00..1c`) and *restore* from there on exit — but the entry sequence is tight (`lui sp, 0x1b; addiu sp, sp, -21504`) and we'd have to rework register saves. Doable but invasive.

3. **Sanity-check the bytes the patcher writes.** I never opened the patched ISO and re-disassembled the expansion + hook sites end-to-end to verify everything matches alpha exactly. Worth doing before deeper rabbit holes — there could be a subtle off-by-one in the patcher.

4. **Bigger lever — write a custom expansion.** Instead of copying alpha's 668-byte expansion verbatim, write a much smaller one that just loops "call FUN_80021810 (drop-pool pick); call FUN_80021894 (give-to-trunk)" 15 times. No sp override, no t0 dispatch, no shared state with the renderer. Self-contained at the give-card site (hook 3 only). Doesn't reproduce visual multi-card animation, but the trunk gets credited 15× per duel — which is what the user actually asked for. **If hypothesis 2 is right, this side-steps it entirely.**

I'd start with **(3)** as a 5-minute sanity check, then **(4)** as the actually-pragmatic path. The user explicitly said visual fidelity is secondary — trunk credit is the goal.

## What NOT to do

- Don't make new test-ISO filenames. Overwrite `ultimate-x15-test.iso` in place; ask the user to close DuckStation if it's locked.
- Don't keep arguing about 5 vs 15 cards. The mods all give 15. Confirmed via raw-BIN scan of three ISOs (alpha, 15-card-mod, RP[15]) — each has 7 patched copies of the immediates at 16/16/15. The ISO9660-extracted SLUS shows 6/6/5 because the directory points to a stale logical copy; the loaded sectors are at 16/16/15. See [docs/dropx15.md](dropx15.md) for the full BIN-vs-ISO-extracted distinction.

## Top-of-mind context

User wants this exposed as a single checkbox in `Data > Edit` (file [src/ui/features/data/edit/DataEditPanel.tsx](../src/ui/features/data/edit/DataEditPanel.tsx)) once the ISO patch is verified working in DuckStation. Bridge IPC plumbing comes after. UI work is *not* started.
