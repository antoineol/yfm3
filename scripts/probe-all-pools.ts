import { detectWaMrgLayout } from "../bridge/extract/detect-wamrg.ts";
import { loadDiscData } from "../bridge/extract/index.ts";
import {
  DUELIST_BCD_OFFSET,
  DUELIST_DECK_OFFSET,
  DUELIST_ENTRY_SIZE,
  DUELIST_SA_POW_OFFSET,
  DUELIST_SA_TEC_OFFSET,
  NUM_CARDS,
  NUM_DUELISTS,
} from "../bridge/extract/types.ts";

const ISO = "gamedata/alpha-mod.iso";
const { waMrg } = loadDiscData(ISO);
const layout = detectWaMrgLayout(waMrg);

const POOLS = [
  { name: "deck", off: DUELIST_DECK_OFFSET },
  { name: "sa_pow", off: DUELIST_SA_POW_OFFSET },
  { name: "bcd", off: DUELIST_BCD_OFFSET },
  { name: "sa_tec", off: DUELIST_SA_TEC_OFFSET },
];

console.log("duelist | deck_sum nz max | sa_pow_sum nz max | bcd_sum nz max | sa_tec_sum nz max");
const sumCounts = new Map<number, number>();
for (let d = 0; d < NUM_DUELISTS; d++) {
  const row: string[] = [];
  for (const p of POOLS) {
    const base = layout.duelistTable + d * DUELIST_ENTRY_SIZE + p.off;
    let sum = 0,
      nz = 0,
      max = 0;
    for (let i = 0; i < NUM_CARDS; i++) {
      const v = waMrg.readUInt16LE(base + i * 2);
      sum += v;
      if (v > 0) nz++;
      if (v > max) max = v;
    }
    sumCounts.set(sum, (sumCounts.get(sum) ?? 0) + 1);
    row.push(`${String(sum).padStart(5)} ${String(nz).padStart(3)} ${String(max).padStart(4)}`);
  }
  console.log(`${String(d + 1).padStart(3)}     | ${row.join(" | ")}`);
}

console.log("\nSum distribution across all 156 (duelist × pool) entries:");
for (const [sum, count] of [...sumCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  sum=${sum}: ${count} pools`);
}

// Also check max individual weight seen anywhere
let gmax = 0,
  gmaxLoc = "";
for (let d = 0; d < NUM_DUELISTS; d++) {
  for (const p of POOLS) {
    const base = layout.duelistTable + d * DUELIST_ENTRY_SIZE + p.off;
    for (let i = 0; i < NUM_CARDS; i++) {
      const v = waMrg.readUInt16LE(base + i * 2);
      if (v > gmax) {
        gmax = v;
        gmaxLoc = `duelist ${d + 1} ${p.name} card ${i + 1}`;
      }
    }
  }
}
console.log(`\nGlobal max weight: ${gmax} at ${gmaxLoc}`);
