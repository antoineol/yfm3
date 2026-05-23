// Patch a compatible Yu-Gi-Oh! Forbidden Memories disc image so a won duel
// grants 15 cards. The bridge patcher accepts only Ghost/FMR-compatible
// layouts; legacy local trampolines are refused.
//
// Usage:
//   bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso>

export { patchUltimateX15 } from "../bridge/drop-x15-patch.ts";

import { patchUltimateX15 } from "../bridge/drop-x15-patch.ts";

export function runCli(argv = process.argv): void {
  const src = argv[2];
  const dst = argv[3];
  if (!src || !dst) {
    console.error("Usage: bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso>");
    process.exit(1);
  }

  const result = patchUltimateX15(src, dst);
  console.log(result.changed ? `Wrote ${dst}` : `${dst} already has 15-card drops enabled`);
}

if (import.meta.main) runCli();
