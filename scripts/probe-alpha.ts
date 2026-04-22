import fs from "node:fs";
import { detectWaMrgLayout } from "../bridge/extract/detect-wamrg.ts";
import { loadDiscData } from "../bridge/extract/index.ts";
import { detectDiscFormat, MODE2_2352 } from "../bridge/extract/iso9660.ts";
import { DUELIST_BCD_OFFSET, DUELIST_ENTRY_SIZE, NUM_CARDS } from "../bridge/extract/types.ts";

const ISO = "gamedata/alpha-mod.iso";
const bin = fs.readFileSync(ISO);
const fmt = detectDiscFormat(bin);
console.log("disc format:", fmt === MODE2_2352 ? "MODE2/2352" : "MODE1/2048");
console.log("file size:", bin.length);

const { slus, waMrg, serial } = loadDiscData(ISO);
console.log("serial:", serial, "| slus:", slus.length, "| waMrg:", waMrg.length);
const layout = detectWaMrgLayout(waMrg);
console.log("layout:", layout);

const base = layout.duelistTable + 0 * DUELIST_ENTRY_SIZE + DUELIST_BCD_OFFSET;
let sum = 0,
  nonzero = 0,
  max = 0;
for (let i = 0; i < NUM_CARDS; i++) {
  const v = waMrg.readUInt16LE(base + i * 2);
  sum += v;
  if (v > 0) nonzero++;
  if (v > max) max = v;
}
console.log(`Simon Muran bcd: sum=${sum}, nonzero=${nonzero}, max=${max}`);
console.log(`BEWD (#1) bcd weight: ${waMrg.readUInt16LE(base + 0)}`);

// Top 10 cards in bcd
const top: Array<{ id: number; w: number }> = [];
for (let i = 0; i < NUM_CARDS; i++) {
  const w = waMrg.readUInt16LE(base + i * 2);
  if (w > 0) top.push({ id: i + 1, w });
}
top.sort((a, b) => b.w - a.w);
console.log("\nTop 10 bcd entries:");
for (const t of top.slice(0, 10)) console.log(`  card ${t.id}: ${t.w}`);
