/**
 * Extract card stats and fusion table from a Yu-Gi-Oh! Forbidden Memories
 * PS1 disc image (.bin file, MODE2/2352 format).
 *
 * Outputs two CSV files:
 *   - cards-from-bin.csv:   id, atk, def, guardian_star_1, guardian_star_2, type
 *   - fusions-from-bin.csv: material1_id, material2_id, result_id, result_atk
 *
 * Usage:
 *   bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]
 *
 * Example:
 *   bun run scripts/extract-game-data.ts "gamedata/Yu-Gi-Oh! FM REMASTERED PERFECTED.bin" gamedata
 *
 * The .cue file is NOT required — the script assumes standard PS1 MODE2/2352
 * sector layout (2352 bytes/sector, 24-byte header, 2048 bytes data).
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NUM_CARDS = 722;

/** PS1 CD-ROM MODE2/2352 layout */
const SECTOR_SIZE = 2352;
const SECTOR_DATA_OFFSET = 24; // 12 sync + 4 header + 8 subheader
const SECTOR_DATA_SIZE = 2048;

/** ISO 9660 Primary Volume Descriptor is always at sector 16 */
const PVD_SECTOR = 16;

/** Card stats in SLUS_014.11 (the PS1 executable) */
const CARD_STATS_OFFSET = 0x1c_4a44;

/** Fusion table in WA_MRG.MRG */
const FUSION_TABLE_OFFSET = 0xb8_7800;
const FUSION_TABLE_SIZE = 0x1_0000;

const GUARDIAN_STARS: Record<number, string> = {
  0: "None",
  1: "Sun",
  2: "Moon",
  3: "Mercury",
  4: "Venus",
  5: "Mars",
  6: "Jupiter",
  7: "Saturn",
  8: "Uranus",
  9: "Neptune",
  10: "Pluto",
};

const CARD_TYPES: Record<number, string> = {
  0: "Dragon",
  1: "Spellcaster",
  2: "Zombie",
  3: "Warrior",
  4: "Beast",
  5: "Winged Beast",
  6: "Fiend",
  7: "Fairy",
  8: "Insect",
  9: "Dinosaur",
  10: "Reptile",
  11: "Fish",
  12: "Aqua",
  13: "Machine",
  14: "Thunder",
  15: "Pyro",
  16: "Rock",
  17: "Plant",
  18: "Equip",
  19: "Magic",
  20: "Trap",
  21: "Ritual",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read a single byte from a buffer, throwing on out-of-bounds. */
function byte(buf: Buffer, offset: number): number {
  const v = buf[offset];
  if (v === undefined) throw new Error(`Read out of bounds at offset ${offset}`);
  return v;
}

// ---------------------------------------------------------------------------
// Disc image reading
// ---------------------------------------------------------------------------

function readSector(bin: Buffer, sector: number): Buffer {
  const offset = sector * SECTOR_SIZE + SECTOR_DATA_OFFSET;
  return bin.subarray(offset, offset + SECTOR_DATA_SIZE);
}

/** Read a contiguous range of sectors and return the concatenated data bytes. */
function readSectors(bin: Buffer, startSector: number, count: number): Buffer {
  const out = Buffer.alloc(count * SECTOR_DATA_SIZE);
  for (let i = 0; i < count; i++) {
    readSector(bin, startSector + i).copy(out, i * SECTOR_DATA_SIZE);
  }
  return out;
}

// ---------------------------------------------------------------------------
// ISO 9660 filesystem helpers
// ---------------------------------------------------------------------------

interface IsoFile {
  name: string;
  sector: number;
  size: number;
  isDir: boolean;
}

function parseDirectory(dirData: Buffer, dirSize: number): IsoFile[] {
  const files: IsoFile[] = [];
  let pos = 0;

  while (pos < dirSize) {
    const recordLen = byte(dirData, pos);
    if (recordLen === 0) {
      pos = (Math.floor(pos / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE;
      if (pos >= dirSize || byte(dirData, pos) === 0) break;
      continue;
    }

    const extent = dirData.readUInt32LE(pos + 2);
    const size = dirData.readUInt32LE(pos + 10);
    const flags = byte(dirData, pos + 25);
    const nameLen = byte(dirData, pos + 32);
    const rawName = dirData.subarray(pos + 33, pos + 33 + nameLen).toString("ascii");

    if (rawName !== "\x00" && rawName !== "\x01") {
      const name = rawName.split(";")[0] ?? rawName;
      files.push({
        name,
        sector: extent,
        size,
        isDir: (flags & 0x02) !== 0,
      });
    }

    pos += recordLen;
  }

  return files;
}

function readIsoFile(bin: Buffer, file: IsoFile): Buffer {
  const sectorCount = Math.ceil(file.size / SECTOR_DATA_SIZE);
  const raw = readSectors(bin, file.sector, sectorCount);
  return raw.subarray(0, file.size);
}

function findFile(bin: Buffer, rootFiles: IsoFile[], filePath: string): Buffer {
  const parts = filePath.split("/");
  let files = rootFiles;
  const currentBin = bin;

  for (let i = 0; i < parts.length; i++) {
    const target = parts[i] ?? "";
    const entry = files.find((f) => f.name === target);
    if (!entry) {
      throw new Error(`File not found in disc image: ${filePath} (missing "${target}")`);
    }

    if (i < parts.length - 1) {
      // Directory — read and parse it
      const dirData = readSectors(
        currentBin,
        entry.sector,
        Math.ceil(entry.size / SECTOR_DATA_SIZE),
      );
      files = parseDirectory(dirData, entry.size);
    } else {
      return readIsoFile(bin, entry);
    }
  }

  throw new Error(`File not found: ${filePath}`);
}

// ---------------------------------------------------------------------------
// Card stats extraction
// ---------------------------------------------------------------------------

interface CardStats {
  id: number;
  atk: number;
  def: number;
  gs1: string;
  gs2: string;
  type: string;
}

function extractCards(slus: Buffer): CardStats[] {
  const cards: CardStats[] = [];

  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = slus.readUInt32LE(CARD_STATS_OFFSET + i * 4);
    cards.push({
      id: i + 1,
      atk: (raw & 0x1ff) * 10,
      def: ((raw >> 9) & 0x1ff) * 10,
      gs1: GUARDIAN_STARS[(raw >> 18) & 0xf] ?? String((raw >> 18) & 0xf),
      gs2: GUARDIAN_STARS[(raw >> 22) & 0xf] ?? String((raw >> 22) & 0xf),
      type: CARD_TYPES[(raw >> 26) & 0x1f] ?? String((raw >> 26) & 0x1f),
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Fusion table extraction
// ---------------------------------------------------------------------------

interface Fusion {
  material1: number;
  material2: number;
  result: number;
}

function extractFusions(waMrg: Buffer): Fusion[] {
  const data = waMrg.subarray(FUSION_TABLE_OFFSET, FUSION_TABLE_OFFSET + FUSION_TABLE_SIZE);
  const fusions: Fusion[] = [];

  for (let cardI = 0; cardI < NUM_CARDS; cardI++) {
    let offset = data.readUInt16LE(2 + cardI * 2);
    if (offset === 0) continue;

    const countByte = byte(data, offset);
    let count: number;
    if (countByte !== 0) {
      count = countByte;
    } else {
      count = 511 - byte(data, offset + 1);
      offset += 1;
    }

    let pos = offset + 1;
    let read = 0;

    while (read < count) {
      const ctrl = byte(data, pos);
      const b1 = byte(data, pos + 1);
      const b2 = byte(data, pos + 2);
      const b3 = byte(data, pos + 3);
      const b4 = byte(data, pos + 4);

      const mat2a = ((ctrl & 0x03) << 8) | b1;
      const resa = (((ctrl >> 2) & 0x03) << 8) | b2;
      fusions.push({ material1: cardI + 1, material2: mat2a, result: resa });
      read++;

      if (read < count) {
        const mat2b = (((ctrl >> 4) & 0x03) << 8) | b3;
        const resb = (((ctrl >> 6) & 0x03) << 8) | b4;
        fusions.push({ material1: cardI + 1, material2: mat2b, result: resb });
        read++;
      }

      pos += 5;
    }
  }

  return fusions;
}

// ---------------------------------------------------------------------------
// CSV serialization
// ---------------------------------------------------------------------------

function cardsToCsv(cards: CardStats[]): string {
  const header = "id,atk,def,guardian_star_1,guardian_star_2,type";
  const rows = cards.map((c) => `${c.id},${c.atk},${c.def},${c.gs1},${c.gs2},${c.type}`);
  return `${header}\n${rows.join("\n")}\n`;
}

function fusionsToCsv(fusions: Fusion[], cardAtk: Map<number, number>): string {
  const header = "material1_id,material2_id,result_id,result_atk";
  const rows = fusions.map(
    (f) => `${f.material1},${f.material2},${f.result},${cardAtk.get(f.result) ?? 0}`,
  );
  return `${header}\n${rows.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Usage: bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]\n" +
        "\n" +
        "Extracts card stats and fusion table from a YFM PS1 disc image.\n" +
        "Output dir defaults to ./gamedata",
    );
    process.exit(1);
  }

  const binPath = args[0] ?? "";
  const outDir = args[1] ?? "./gamedata";

  console.log(`Reading disc image: ${binPath}`);
  const bin = fs.readFileSync(binPath);
  console.log(`  Size: ${(bin.length / 1024 / 1024).toFixed(1)} MB`);

  // Verify ISO 9660
  const pvd = readSector(bin, PVD_SECTOR);
  if (pvd.subarray(1, 6).toString("ascii") !== "CD001") {
    console.error("Error: not a valid ISO 9660 disc image");
    process.exit(1);
  }

  // Parse root directory
  const rootRecord = pvd.subarray(156, 190);
  const rootExtent = rootRecord.readUInt32LE(2);
  const rootSize = rootRecord.readUInt32LE(10);
  const rootData = readSectors(bin, rootExtent, Math.ceil(rootSize / SECTOR_DATA_SIZE));
  const rootFiles = parseDirectory(rootData, rootSize);

  console.log(`  Root files: ${rootFiles.map((f) => f.name).join(", ")}`);

  // Extract SLUS executable
  const slusEntry = rootFiles.find((f) => f.name.startsWith("SLUS_"));
  if (!slusEntry) {
    console.error("Error: no SLUS_* executable found in disc image");
    process.exit(1);
  }
  console.log(`  Executable: ${slusEntry.name} (${(slusEntry.size / 1024).toFixed(0)} KB)`);
  const slus = readIsoFile(bin, slusEntry);

  // Extract WA_MRG.MRG
  const waMrg = findFile(bin, rootFiles, "DATA/WA_MRG.MRG");
  console.log(`  WA_MRG.MRG: ${(waMrg.length / 1024 / 1024).toFixed(1)} MB`);

  // Extract data
  const cards = extractCards(slus);
  const fusions = extractFusions(waMrg);

  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));

  // Write output
  fs.mkdirSync(outDir, { recursive: true });

  const cardsPath = path.join(outDir, "cards-from-bin.csv");
  fs.writeFileSync(cardsPath, cardsToCsv(cards));
  console.log(`\nWrote ${cards.length} cards to ${cardsPath}`);

  const fusionsPath = path.join(outDir, "fusions-from-bin.csv");
  fs.writeFileSync(fusionsPath, fusionsToCsv(fusions, cardAtk));
  console.log(`Wrote ${fusions.length} fusions to ${fusionsPath}`);
}

main();
