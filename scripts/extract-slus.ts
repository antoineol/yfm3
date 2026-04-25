// Tiny helper: extract the SLUS/SLES/SLPS executable from a PS1 disc image.
// Usage: bun scripts/extract-slus.ts <disc> <out>
import fs from "node:fs";
import { loadDiscData } from "../bridge/extract/index.ts";

const disc = process.argv[2];
const out = process.argv[3];
if (!disc || !out) {
  console.error("Usage: bun scripts/extract-slus.ts <disc> <out>");
  process.exit(1);
}
const { slus, serial } = loadDiscData(disc);
fs.writeFileSync(out, slus);
console.log(`Wrote ${out} (${slus.length} bytes, serial=${serial})`);
