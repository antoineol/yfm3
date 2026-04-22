import fs from "node:fs";
import {
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "../bridge/extract/iso9660.ts";

const bin = fs.readFileSync("gamedata/alpha-mod.iso");
const fmt = detectDiscFormat(bin);
const pvd = readSector(bin, PVD_SECTOR, fmt);
const rootRecord = pvd.subarray(156, 190);
const rootExtent = rootRecord.readUInt32LE(2);
const rootSize = rootRecord.readUInt32LE(10);
const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE), fmt);
const rootFiles = parseDirectory(rootData, rootSize);
console.log("Root files:");
for (const f of rootFiles)
  console.log(` ${f.isDir ? "D" : "F"} ${f.name.padEnd(20)} sec=${f.sector} size=${f.size}`);

const dataDir = rootFiles.find((f) => f.name === "DATA");
if (dataDir) {
  const dd = readSectors(bin, dataDir.sector, Math.ceil(dataDir.size / SECTOR_DATA_SIZE), fmt);
  const files = parseDirectory(dd, dataDir.size);
  console.log("\nDATA/ files:");
  for (const f of files)
    console.log(` ${f.isDir ? "D" : "F"} ${f.name.padEnd(20)} sec=${f.sector} size=${f.size}`);
}
