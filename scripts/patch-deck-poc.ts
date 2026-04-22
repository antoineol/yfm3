// PoC: patch Simon Muran's DECK pool to make BEWD 50% of his AI deck
// (preserving all 47 original cards at halved weight so the AI deck builder
// still has distinct cards to pick from). Hardcoded for Alpha mod ISO.

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
import { DUELIST_DECK_OFFSET, DUELIST_ENTRY_SIZE, NUM_CARDS } from "../bridge/extract/types.ts";
import { writeU16LeAt } from "../bridge/extract/write-iso.ts";

const SRC = "gamedata/alpha-mod.iso";
const DST = "gamedata/alpha-mod-deck-bewd.iso";
const DUELIST_INDEX = 0; // Simon Muran (id=1)
const TARGET_CARD_ID = 1; // Blue-Eyes White Dragon
const TOTAL = 2048;

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

const { waMrg } = loadDiscData(SRC);
const layout = detectWaMrgLayout(waMrg);
const poolFileOffset =
  layout.duelistTable + DUELIST_INDEX * DUELIST_ENTRY_SIZE + DUELIST_DECK_OFFSET;

// Read the original deck pool.
const orig: number[] = [];
for (let i = 0; i < NUM_CARDS; i++) orig.push(waMrg.readUInt16LE(poolFileOffset + i * 2));
const origSum = orig.reduce((a, b) => a + b, 0);
const origNz = orig.filter((v) => v > 0).length;
console.log(`Original deck pool: sum=${origSum}, nonzero=${origNz}`);

// Scale originals to sum to TOTAL/2 = 1024, then set BEWD to TOTAL/2.
// Distribute rounding error onto the largest entry so sum stays exact.
const scaled: number[] = orig.map((v) => Math.floor((v * TOTAL) / (2 * origSum)));
const scaledSum = scaled.reduce((a, b) => a + b, 0);
let bewdWeight = TOTAL - scaledSum; // = 1024 + any rounding deficit
// Zero out BEWD's own scaled value (it was 0 originally, but guard anyway)
bewdWeight -= scaled[TARGET_CARD_ID - 1]!;
scaled[TARGET_CARD_ID - 1] = bewdWeight;

const newSum = scaled.reduce((a, b) => a + b, 0);
const newNz = scaled.filter((v) => v > 0).length;
const bewdPct = ((scaled[TARGET_CARD_ID - 1]! / TOTAL) * 100).toFixed(1);
console.log(
  `Patched deck pool: sum=${newSum}, nonzero=${newNz}, BEWD weight=${scaled[TARGET_CARD_ID - 1]} (${bewdPct}%)`,
);
if (newSum !== TOTAL) throw new Error(`sum mismatch: ${newSum}`);

for (let i = 0; i < NUM_CARDS; i++) {
  writeU16LeAt(bin, waMrgEntry.sector, poolFileOffset + i * 2, scaled[i]!, fmt);
}

fs.writeFileSync(DST, bin);
console.log(`Wrote ${DST}`);
