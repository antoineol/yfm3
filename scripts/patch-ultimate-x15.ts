// Patch Yu-Gi-Oh! Forbidden Memories Ultimate (SLUS_027.11) so a won duel
// grants 15 cards. The exact formula is documented in
// docs/dropx15-ultimate-spec.md.
//
// Usage:
//   bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso>

export { buildUltimateX15Patch, patchUltimateX15 } from "../bridge/drop-x15-patch.ts";

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
