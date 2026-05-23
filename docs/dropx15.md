# Drop x15 Patch

Status: production bridge support is based on the community Ghost/FMR
`Drop More Cards` behavior. The bridge does not install local reward
trampolines.

## Required Behavior

A compatible game should keep the normal reward semantics and simply grant 15
reward instances:

- same duelist;
- same rank/result pool;
- same vanilla reward-pick timing;
- 15 independent reward rolls, not 15 copies of one card.

## Supported Patch Families

### Ghost/FMR loop limits

Some mods already contain the Ghost/FMR reward expansion. For those images, the
bridge scans the raw image for the three loop-limit anchors and changes the
limits from `6/6/5` to `16/16/15`.

This path is structure-based and serial-independent: any image with the full
anchor set is patchable.

### Ghost Drop More Cards injection

For clean NTSC-U-like images, the bridge applies the Ghost tool recipe:

- patch the root executable hooks at `SLUS:0x12034`, `0x1246c`, `0x12710`,
  and `0x285fc`;
- inject the Ghost expansion at `SLUS:0x19b440`;
- inject the same expansion in `DATA/WA_MRG.MRG` at
  `0xb4c400 + i * 0x75800`, for `i = 1..7`;
- set the WA loop limits to `16`, `16`, `15`, plus the first external WA limit
  at `0xbc17e4`.

This path is also structure-based. The bridge requires the exact Ghost hook
bytes in the executable and clean WA_MRG target prefixes before writing. Gold
`SLUS_000.04` passes those checks; its local continuation instruction at
`SLUS:0x1247c` is preserved because the bridge writes only the hook bytes.

## Rejected Patch Families

The bridge refuses older local/custom reward trampolines. Those variants call
the drop picker late at the award site instead of letting the result-screen
initialization roll and store rewards like vanilla. On Gold, those attempts
produced crashes, mixed S-Pow/S-Tec evidence, or impossible cards outside the
duelist drop table.

If an image already contains one of those legacy local patches, restore an
unpatched backup and apply the Ghost recipe instead.

## Current Compatibility Policy

Supported:

- images with the Ghost/FMR loop-limit anchors;
- clean images with the Ghost Drop More Cards executable hooks and WA_MRG
  target layout.

Unsupported:

- PAL layouts without the Ghost anchors;
- Ultimate/local-recompiled layouts until a separate community-compatible
  recipe is proven;
- partial or unknown patches.
