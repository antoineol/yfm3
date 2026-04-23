// PoC: patch one duelist's bcd drop pool in a PSX disc image so a chosen
// card has 100% drop rate on B/C/D wins. Hardcoded for the Alpha mod ISO
// (MODE2/2352, US-layout WA_MRG at 0xE9B000), Simon Muran (#1), BEWD (#1).

import fs from "node:fs";
import { detectWaMrgLayout } from "../bridge/extract/detect-wamrg.ts";
import { loadDiscData } from "../bridge/extract/index.ts";
import {
  detectDiscFormat,
  MODE2_2352,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "../bridge/extract/iso9660.ts";
import { DUELIST_BCD_OFFSET, DUELIST_ENTRY_SIZE, NUM_CARDS } from "../bridge/extract/types.ts";
import { discOffset, writeU16LeAt } from "../bridge/extract/write-iso.ts";

const SRC = "gamedata/alpha-mod.iso";
const DST = "gamedata/alpha-mod-patched.iso";
const DUELIST_INDEX = 0; // Simon Muran (id=1)
const TARGET_CARD_ID = 1; // Blue-Eyes White Dragon
const TARGET_WEIGHT = 2048; // pool sums to 2048; this = 100% drop rate

function findFileSector(bin: Buffer, fmt: ReturnType<typeof detectDiscFormat>, path: string) {
  const pvd = readSector(bin, PVD_SECTOR, fmt);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    bin,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    fmt,
  );
  let files = parseDirectory(rootData, root.readUInt32LE(10));
  const parts = path.split("/");
  for (let i = 0; i < parts.length; i++) {
    const entry = files.find((f) => f.name === parts[i]);
    if (!entry) throw new Error(`not found: ${parts[i]}`);
    if (i === parts.length - 1) return entry;
    const dd = readSectors(bin, entry.sector, Math.ceil(entry.size / SECTOR_DATA_SIZE), fmt);
    files = parseDirectory(dd, entry.size);
  }
  throw new Error("unreachable");
}

console.log(`Reading ${SRC}…`);
fs.copyFileSync(SRC, DST);
const bin = fs.readFileSync(DST);
const fmt = detectDiscFormat(bin);
if (fmt !== MODE2_2352) throw new Error("expected MODE2/2352");

const waMrgEntry = findFileSector(bin, fmt, "DATA/WA_MRG.MRG");
console.log(`WA_MRG.MRG: sector=${waMrgEntry.sector}, size=${waMrgEntry.size}`);

// Use the existing extractor to derive layout (validates sanity).
const { waMrg } = loadDiscData(SRC);
const layout = detectWaMrgLayout(waMrg);
const poolFileOffset =
  layout.duelistTable + DUELIST_INDEX * DUELIST_ENTRY_SIZE + DUELIST_BCD_OFFSET;
console.log(`Pool file offset (in WA_MRG): 0x${poolFileOffset.toString(16)}`);

// Pre-patch sanity: read current values via the same translation we'll use to write,
// confirm they match what loadDiscData saw.
const sampleFileOff = poolFileOffset + 227 * 2; // card #228, top-weighted entry
const sampleBefore =
  (bin[discOffset(waMrgEntry.sector, sampleFileOff, fmt)] ?? 0) |
  ((bin[discOffset(waMrgEntry.sector, sampleFileOff + 1, fmt)] ?? 0) << 8);
const sampleExpected = waMrg.readUInt16LE(sampleFileOff);
console.log(
  `Sanity: card #228 weight via raw disc = ${sampleBefore}, via WA_MRG buffer = ${sampleExpected}`,
);
if (sampleBefore !== sampleExpected) throw new Error("offset translation mismatch");

console.log(`Zeroing all 722 weights in Simon Muran's bcd pool…`);
for (let i = 0; i < NUM_CARDS; i++) {
  writeU16LeAt(bin, waMrgEntry.sector, poolFileOffset + i * 2, 0, fmt);
}
console.log(`Setting card #${TARGET_CARD_ID} (BEWD) weight to ${TARGET_WEIGHT}…`);
writeU16LeAt(bin, waMrgEntry.sector, poolFileOffset + (TARGET_CARD_ID - 1) * 2, TARGET_WEIGHT, fmt);

fs.writeFileSync(DST, bin);
console.log(`Wrote ${DST}`);
