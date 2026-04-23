// Re-extract duelist drops from the patched ISO and verify Simon Muran's bcd
// pool now reflects the patch (only BEWD with weight 2048).

import { detectWaMrgLayout } from "../bridge/extract/detect-wamrg.ts";
import { extractAllCsvs, loadDiscData } from "../bridge/extract/index.ts";
import { DUELIST_BCD_OFFSET, DUELIST_ENTRY_SIZE, NUM_CARDS } from "../bridge/extract/types.ts";

for (const iso of ["gamedata/alpha-mod.iso", "gamedata/alpha-mod-patched.iso"]) {
  const { waMrg } = loadDiscData(iso);
  const layout = detectWaMrgLayout(waMrg);
  const base = layout.duelistTable + 0 * DUELIST_ENTRY_SIZE + DUELIST_BCD_OFFSET;
  let sum = 0,
    nonzero = 0;
  const entries: Array<{ id: number; w: number }> = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const w = waMrg.readUInt16LE(base + i * 2);
    sum += w;
    if (w > 0) {
      nonzero++;
      entries.push({ id: i + 1, w });
    }
  }
  console.log(`\n=== ${iso} ===`);
  console.log(`Simon Muran bcd: sum=${sum}, nonzero=${nonzero}`);
  entries.sort((a, b) => b.w - a.w);
  for (const e of entries.slice(0, 5)) console.log(`  card ${e.id}: ${e.w}`);
}

// Also: full CSV pipeline produces the right row.
const { slus, waMrg } = loadDiscData("gamedata/alpha-mod-patched.iso");
const csvs = extractAllCsvs(slus, waMrg);
const lines = csvs["duelists.csv"]!.split("\n").filter((l) => l.startsWith("1,"));
console.log("\nCSV rows for duelist 1 (Simon Muran), first 5:");
for (const l of lines.slice(0, 5)) console.log(`  ${l}`);
console.log(`Total non-trivial rows for duelist 1: ${lines.length}`);
