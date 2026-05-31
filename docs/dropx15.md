# Reward Multi-card Patch

Status: production bridge support is based on the community Ghost/FMR
`Drop More Cards` behavior, with a verified starchip reward-save extension.
NTSC-U/Gold support remains x15. PAL French `SLES_039.48` exposes selectable
card and starchip reward multipliers. The bridge does not install local reward
drop-picker trampolines.

## Required Behavior

A compatible game should keep the normal reward semantics and grant multiple
reward instances:

- same duelist;
- same rank/result pool;
- same vanilla reward-pick timing;
- independent reward rolls, not copies of one card.
- the same multiplier applied to the normal rank starchip award, capped by the
  vanilla `999999` limit.

The starchip patch preserves the result-screen count field and only changes the
final save update from:

```c
save->starchips += result->rankStarchips;
```

to:

```c
save->starchips += result->rankStarchips * 15;
```

For PAL French x50/x150, the original inline save-update site does not have
enough spare instructions for the multiply. The bridge replaces the three-word
`nop; addu; sw` tail with a jump to a helper at `SLES:0x19b700` /
`0x801aaf00`. The helper computes the selected multiplier with shifts/adds,
reloads `save->starchips`, waits through the PS1/MIPS load-delay slot, writes
the new total, then returns to the cap check at the same continuation used by
the verified inline x15 patch. The helper is written both to the root executable
and to every PAL WA copy at
`0xe25400 + i * 0x78000 + 0x300`; a root-only helper can be wiped when the
reward flow reloads the Ghost area from `WA_MRG.MRG`. This keeps the C-level
behavior equivalent to:

```c
save->starchips += result->rankStarchips * selectedRewardMultiplier;
```

## Supported Patch Families

### Ghost/FMR loop limits

Some mods already contain the Ghost/FMR reward expansion. For those images, the
bridge scans the raw image for the three loop-limit anchors and changes the
limits from `6/6/5` to `16/16/15`. It also upgrades the recognized starchip
save-update sequence to x15.

This path is structure-based and serial-independent: any image with the full
anchor set is patchable.

### Ghost Drop More Cards injection

For clean NTSC-U/Gold images, the bridge applies the Ghost tool recipe:

- patch the root executable hooks at `SLUS:0x12034`, `0x1246c`, `0x12710`,
  and `0x285fc`;
- inject the full Ghost blob at `SLUS:0x19b400`; its executable code starts
  0x40 bytes later at `SLUS:0x19b440`;
- inject the same expansion in `DATA/WA_MRG.MRG` at
  `0xb4c400 + i * 0x75800`, for `i = 1..7`;
- set the WA loop limits to `16`, `16`, `15`, plus the first external WA limit
  at `0xbc17e4`.
- patch the root executable starchip save update so S-rank awards 75 starchips
  instead of 5.

Gold `SLUS_000.04` passes those checks; its local continuation instruction at
`SLUS:0x1247c` is preserved because the bridge writes only the hook bytes.

For PAL French `SLES_039.48`, the bridge applies the verified PAL port of the
same Ghost recipe, then lets the user choose card rewards:

- patch root executable hooks at `SLES:0x120f0`, `0x12528`, and `0x127cc`;
- patch the picker delay slot at `SLES:0x12100` to `nop`, because the Ghost
  picker hook precomputes the drop-table base before returning to PAL's
  original RNG call;
- keep `SLES:0x28590` vanilla. That address is shared script/text rendering
  code on PAL and caused deck-edit crashes when hooked;
- inject the full PAL-adjusted Ghost blob at `SLES:0x19b400`, with code entry
  at `SLES:0x19b440`;
- inject the same PAL-adjusted blob in `DATA/WA_MRG.MRG` at
  `0xe25400 + i * 0x78000`, for `i = 0..6`;
- move the Ghost scratch area from `0x801aac00` to `0x801ab500`;
- set the PAL WA loop limits from the selected count: `count + 1`,
  `count + 1`, `count`, plus the preceding external WA limit at `0xe24fe4`.
- patch the PAL root executable starchip save update to the same selected
  multiplier and mirror the x50/x150 helper into every PAL WA copy. The x15 form
  was runtime-verified on `SLES_039.48`: an S-rank reward changed from `+5` to
  `+75` starchips while awarding 15 cards.

Selectable PAL French card counts:

- `x1`
- `x5`
- `x15`
- `x50`
- `x150`

The previous verified `x30` card state is still recognized so existing patched
discs can move cleanly to one of the selectable targets. If such a disc still
has the older starchip x15 arithmetic, the bridge reports the mismatch and
reapplying a selectable target updates starchips to match cards.

Runtime testing on PAL French verified both the RAM-only edit and the persistent
disc patch:

- the result-flow code loaded the x30 blob from disc;
- the picker generated 30 nonzero reward IDs from the duelist/rank pool;
- accepting the reward increased collection counts by exactly 30 cards.

Both Ghost injection paths are structure-based. The bridge requires the exact
verified hook bytes in the executable, clean WA_MRG target prefixes, and either
the recognized vanilla/x15 starchip arithmetic or the bridge's recognized PAL
starchip helper before writing.

Automated coverage now executes the patched PAL helper bytes with a minimal
MIPS interpreter instead of only checking that the bytes were written. It models
the PS1 load-delay slot so the stale x150 helper that wrote `1490` from `2727`
and a `5`-starchip rank reward is recognized and refreshed. Current regression
cases include `2727 + 5 * 150 = 3477` and `2727 + 22 * 150 = 6027`, and x50/x150
helpers must return to the same continuation as the verified inline x15 patch.

## Rejected Patch Families

The bridge refuses older local/custom reward trampolines. Those variants call
the drop picker late at the award site instead of letting the result-screen
initialization roll and store rewards like vanilla. On Gold, those attempts
produced crashes, mixed S-Pow/S-Tec evidence, or impossible cards outside the
duelist drop table.

If an image already contains one of those legacy local patches, restore an
unpatched backup and apply the Ghost recipe instead.

The bridge still refuses the earlier attempted PAL French port that hooks
`SLES:0x28590` or writes the executable blob with the wrong 0x40-byte alignment.
Those variants crashed in unrelated screens or before the duel-result screen.

## Current Compatibility Policy

Supported:

- images with the Ghost/FMR loop-limit anchors and recognized starchip reward
  arithmetic;
- clean images with the Ghost Drop More Cards executable hooks and WA_MRG
  target layout, including verified NTSC-U/Gold layouts;
- clean PAL French `SLES_039.48` images matching the verified PAL Ghost layout;
- PAL French `SLES_039.48` images already carrying the previous verified x15
  PAL Ghost layout; these can be moved to one of the selectable scratch/loop
  layouts;
- PAL French `SLES_039.48` images already carrying the previous verified x30
  PAL Ghost layout; these are recognized as active and can be moved to one of
  the selectable targets.

Unsupported:

- PAL layouts that do not match the verified PAL Ghost layout;
- Ultimate/local-recompiled layouts until a separate community-compatible
  recipe is proven;
- partial or unknown patches.

## x30 Finding

Live PAL `SLES_039.48` RAM tests verified that the x15 cap is not a reward
engine limit. It was a Ghost scratch/code overlap:

- Ghost stores picked card IDs at `scratch + 0x20 + i * 2`.
- The verified x15 blob uses `scratch = 0x801aac00`.
- Slot 16 writes to `0x801aac40`, exactly where the injected code starts.
- Moving scratch to `0x801ab500` and changing the loop limits from
  `16/16/15` to `31/31/30` produced 30 independent picks and 30 collection
  increments on PAL French.

The current production patch generalizes that PAL French layout by changing only
the scratch base and loop-limit immediates in both the root executable and every
verified `WA_MRG.MRG` copy. The collection/chest recent-drop "new" marker is
still a separate 16-entry vanilla UI history and is not expanded by this patch.
