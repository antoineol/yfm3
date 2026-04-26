# Ultimate x15 Drop Patch Spec

## Business Goal

Patch the existing `Yu-Gi-Oh! Forbidden Memories (Ultimate).iso` (`SLUS_027.11`) so a won duel grants 15 card drops instead of one.

The duel-end reward UI may keep showing one card. The required behavior is in the collection: after the duel, 15 cards must be granted and marked by the game as newly earned/latest cards, matching the practical behavior of common 15-drop mods.

## Confirmed Working Formula

Use a local code-space trampoline inside the duel-end award function. Do not use the `0x801aac40` expansion region used by vanilla/Alpha/RP 15-drop mods; that region crashes Ultimate during the transition back to campaign.

Final patch mode proven in DuckStation:

- `local-full-random`
- Duel exits cleanly.
- Reward UI shows one card.
- Collection gains 15 cards.
- All 15 grants are marked as new/latest in-game.

## Addresses

All offsets below are for the extracted `SLUS_027.11` executable within the Ultimate ISO.

| Purpose | RAM | File offset |
|---|---:|---:|
| Normal card credit routine, `FUN_80021894` | `0x80021894` | `0x12094` |
| Normal card increment instruction | `0x800218ac` | `0x120ac` |
| Normal random drop picker, `FUN_80021810` | `0x80021810` | `0x12010` |
| Award hook start | `0x80021f10` | `0x12710` |
| Local code host | `0x80021f24` | `0x12724` |
| Original award-function tail | `0x8002209c` | `0x1289c` |
| Bad Alpha/Ghost/RP expansion region | `0x801aac40` | `0x19b440` |

## Patch Sites

Patch only the award hook instructions:

| File offset | RAM | Vanilla word | Patched word | Meaning |
|---:|---:|---:|---:|---|
| `0x12710` | `0x80021f10` | `0x8444003c` | `0x080087c9` | `j 0x80021f24` |
| `0x12714` | `0x80021f14` | `0x0c008625` | `0x00000000` | remove original `jal FUN_80021894` |

Do not patch `0x800218ac` for the final random x15 behavior. It must remain vanilla:

| File offset | RAM | Required word | Meaning |
|---:|---:|---:|---|
| `0x120ac` | `0x800218ac` | `0x24420001` | `addiu v0, v0, 1` |

The previous same-card PoC changed this word to `0x2442000f`, but that gives 15 copies of the displayed card and is not the final formula.

## Injected Program

Write these 25 words at file offset `0x12724` / RAM `0x80021f24`:

| RAM | Word | Assembly |
|---:|---:|---|
| `0x80021f24` | `0x8f8202e0` | `lw v0, 0x02e0(gp)` |
| `0x80021f28` | `0x8444003c` | `lh a0, 0x003c(v0)` |
| `0x80021f2c` | `0x0c008625` | `jal 0x80021894` |
| `0x80021f30` | `0x00000000` | `nop` |
| `0x80021f34` | `0x8f8402e0` | `lw a0, 0x02e0(gp)` |
| `0x80021f38` | `0x90830039` | `lbu v1, 0x0039(a0)` |
| `0x80021f3c` | `0x90820038` | `lbu v0, 0x0038(a0)` |
| `0x80021f40` | `0x0003182b` | `sltu v1, zero, v1` |
| `0x80021f44` | `0x00038840` | `sll s1, v1, 1` |
| `0x80021f48` | `0x2c420003` | `sltiu v0, v0, 3` |
| `0x80021f4c` | `0x10400002` | `beq v0, zero, 0x80021f58` |
| `0x80021f50` | `0x00000000` | `nop` |
| `0x80021f54` | `0x24110001` | `addiu s1, zero, 1` |
| `0x80021f58` | `0x2410000e` | `addiu s0, zero, 14` |
| `0x80021f5c` | `0x02202021` | `addu a0, s1, zero` |
| `0x80021f60` | `0x0c008604` | `jal 0x80021810` |
| `0x80021f64` | `0x00000000` | `nop` |
| `0x80021f68` | `0x00402021` | `addu a0, v0, zero` |
| `0x80021f6c` | `0x0c008625` | `jal 0x80021894` |
| `0x80021f70` | `0x00000000` | `nop` |
| `0x80021f74` | `0x2610ffff` | `addiu s0, s0, -1` |
| `0x80021f78` | `0x1600fff8` | `bne s0, zero, 0x80021f5c` |
| `0x80021f7c` | `0x00000000` | `nop` |
| `0x80021f80` | `0x08008827` | `j 0x8002209c` |
| `0x80021f84` | `0x00000000` | `nop` |

## Routine Behavior

1. Credit the displayed reward card once via `FUN_80021894`.
2. Recompute the same drop-pool selector used by the vanilla award path from `*(gp + 0x02e0) + 0x38/0x39`.
3. Loop 14 times:
   - call `FUN_80021810(poolSelector)` to choose a reward card,
   - call `FUN_80021894(cardId)` so the normal collection count and recent/new list are updated.
4. Jump to `0x8002209c`, the original function tail.

This gives 15 total grants and lets the game maintain its own latest/new bookkeeping.

## Required Preflight Checks

Before writing:

- ISO root executable must be `SLUS_027.11`.
- `0x12710` must equal `0x8444003c`.
- `0x12714` must equal `0x0c008625`.
- `0x120ac` should equal `0x24420001` for the final random formula.
- The local code host words at `0x12724..0x12784` must match unpatched Ultimate before overwriting.

After writing:

- `0x80021f10` must disassemble to `j 0x80021f24`.
- `0x80021f14` must be `nop`.
- `0x800218ac` must remain `addiu v0, v0, 1`.
- `0x801aac40` must remain zero/untouched.

## Failure History To Preserve

- Copying the Alpha/Ghost/RP expansion family into `0x801aac40` crashes Ultimate.
- Even a tiny same-card trampoline at `0x801aac40` crashes during transition.
- A local same-card trampoline at `0x80021f24` exits cleanly.
- Direct hidden collection byte writes at `0x80021f24` grant 15 total cards and exit cleanly, but only the displayed card is marked new/latest.
- Calling `FUN_80021894` for all grants at `0x80021f24` is the confirmed clean formula.

## Manual Acceptance Test

1. Build `/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/ultimate-x15-test.iso` from the clean Ultimate ISO.
2. Boot it in DuckStation.
3. Win one duel.
4. Confirm the duel exits back to campaign with no black screen.
5. Open the collection sorted by latest/new.
6. Confirm 15 newly earned cards are present.
