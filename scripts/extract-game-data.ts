/**
 * Extract card stats and fusion table from a Yu-Gi-Oh! Forbidden Memories
 * PS1 disc image (.bin file, MODE2/2352 format).
 *
 * Outputs two CSV files:
 *   - cards-from-bin.csv:   id, name, atk, def, guardian_star_1, guardian_star_2, type, color
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

/** Card name offset table in SLUS_014.11: 722 × uint16LE offsets into text pool */
const NAME_OFFSET_TABLE = 0x1c_6002;
/** Text pool base address in SLUS_014.11 (offsets are added to this) */
const TEXT_POOL_BASE = 0x1c_0800;

/** Card name color codes: byte XX in the {F8 0A XX} prefix before card name text. */
const CARD_COLORS: Record<number, string> = {
  1: "yellow",
  2: "blue",
  3: "green",
  4: "purple",
  5: "orange",
  6: "red",
};

/** Fusion table in WA_MRG.MRG */
const FUSION_TABLE_OFFSET = 0xb8_7800;
const FUSION_TABLE_SIZE = 0x1_0000;

/** Guardian star encoding matches the name table at SLUS offset 0x1C9380. */
const GUARDIAN_STARS: Record<number, string> = {
  0: "None",
  1: "Mars",
  2: "Jupiter",
  3: "Saturn",
  4: "Uranus",
  5: "Pluto",
  6: "Neptune",
  7: "Mercury",
  8: "Sun",
  9: "Moon",
  10: "Venus",
};

/** Konami custom character encoding (TBL), frequency-ordered. 0xFF = terminator. */
// prettier-ignore
const CHAR_TABLE: string[] = (() => {
  const t: string[] = [];
  const m: [number, string][] = [
    [0, " "],
    [1, "e"],
    [2, "t"],
    [3, "a"],
    [4, "o"],
    [5, "i"],
    [6, "n"],
    [7, "s"],
    [8, "r"],
    [9, "h"],
    [10, "l"],
    [11, "."],
    [12, "d"],
    [13, "u"],
    [14, "m"],
    [15, "c"],
    [16, "g"],
    [17, "y"],
    [18, "w"],
    [19, "f"],
    [20, "p"],
    [21, "b"],
    [22, "k"],
    [23, "!"],
    [24, "A"],
    [25, "v"],
    [26, "I"],
    [27, "'"],
    [28, "T"],
    [29, "S"],
    [30, "M"],
    [31, ","],
    [32, "D"],
    [33, "O"],
    [34, "W"],
    [35, "H"],
    [36, "Y"],
    [37, "E"],
    [38, "R"],
    [39, "<"],
    [40, ">"],
    [41, "G"],
    [42, "L"],
    [43, "C"],
    [44, "N"],
    [45, "B"],
    [46, "?"],
    [47, "P"],
    [48, "-"],
    [49, "F"],
    [50, "z"],
    [51, "K"],
    [52, "j"],
    [53, "U"],
    [54, "x"],
    [55, "q"],
    [56, "0"],
    [57, "V"],
    [58, "2"],
    [59, "J"],
    [60, "#"],
    [61, "1"],
    [62, "Q"],
    [63, "Z"],
    [64, '"'],
    [65, "3"],
    [66, "5"],
    [67, "&"],
    [68, "/"],
    [69, "7"],
    [70, "X"],
    [72, ":"],
    [74, "4"],
    [75, ")"],
    [76, "("],
    [78, "6"],
    [80, "*"],
    [86, "+"],
    [87, "8"],
    [89, "9"],
    [91, "%"],
  ];
  for (const [i, ch] of m) t[i] = ch;
  return t;
})();

/**
 * Card type mapping extracted from the type name table at SLUS offset 0x1C92CE.
 * 24 consecutive 0xFF-terminated TBL strings. Types 4 (Beast-Warrior) and 13
 * (Sea Serpent) exist in the table but have zero cards in the game.
 */
const CARD_TYPES: Record<number, string> = {
  0: "Dragon",
  1: "Spellcaster",
  2: "Zombie",
  3: "Warrior",
  4: "Beast-Warrior",
  5: "Beast",
  6: "Winged Beast",
  7: "Fiend",
  8: "Fairy",
  9: "Insect",
  10: "Dinosaur",
  11: "Reptile",
  12: "Fish",
  13: "Sea Serpent",
  14: "Machine",
  15: "Thunder",
  16: "Aqua",
  17: "Pyro",
  18: "Rock",
  19: "Plant",
  20: "Magic",
  21: "Trap",
  22: "Ritual",
  23: "Equip",
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
// Text decoding
// ---------------------------------------------------------------------------

/** Decode a TBL-encoded string from `buf` at `start` until 0xFF or `maxLen`. */
function decodeTblString(buf: Buffer, start: number, maxLen: number): string {
  let result = "";
  for (let i = start; i < start + maxLen && i < buf.length; i++) {
    const b = buf[i] ?? 0;
    if (b === 0xff) break;
    result += CHAR_TABLE[b] ?? `{${b.toString(16).padStart(2, "0")}}`;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Card name extraction
// ---------------------------------------------------------------------------

interface CardText {
  name: string;
  color: string;
}

function extractCardTexts(slus: Buffer): CardText[] {
  const results: CardText[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = slus.readUInt16LE(NAME_OFFSET_TABLE + i * 2);
    let addr = TEXT_POOL_BASE + off;
    let color = "";
    // {F8 0A XX} prefix encodes the card's UI color
    if ((slus[addr] ?? 0) === 0xf8) {
      color = CARD_COLORS[slus[addr + 2] ?? 0] ?? "";
      addr += 3;
    }
    results.push({ name: decodeTblString(slus, addr, 100), color });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Card stats extraction
// ---------------------------------------------------------------------------

interface CardStats {
  id: number;
  name: string;
  atk: number;
  def: number;
  gs1: string;
  gs2: string;
  type: string;
  color: string;
}

function extractCards(slus: Buffer): CardStats[] {
  const texts = extractCardTexts(slus);
  const cards: CardStats[] = [];

  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = slus.readUInt32LE(CARD_STATS_OFFSET + i * 4);
    const text = texts[i] ?? { name: "", color: "" };
    cards.push({
      id: i + 1,
      name: text.name,
      atk: (raw & 0x1ff) * 10,
      def: ((raw >> 9) & 0x1ff) * 10,
      gs1: GUARDIAN_STARS[(raw >> 22) & 0xf] ?? String((raw >> 22) & 0xf),
      gs2: GUARDIAN_STARS[(raw >> 18) & 0xf] ?? String((raw >> 18) & 0xf),
      type: CARD_TYPES[(raw >> 26) & 0x1f] ?? String((raw >> 26) & 0x1f),
      color: text.color,
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
  const header = "id,name,atk,def,guardian_star_1,guardian_star_2,type,color";
  const rows = cards.map(
    (c) =>
      `${c.id},"${c.name.replace(/"/g, '""')}",${c.atk},${c.def},${c.gs1},${c.gs2},${c.type},${c.color}`,
  );
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
