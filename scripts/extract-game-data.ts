/**
 * Extract card stats and fusion table from a Yu-Gi-Oh! Forbidden Memories
 * PS1 disc image (.bin file, MODE2/2352 format).
 *
 * Outputs two CSV files:
 *   - cards-from-bin.csv:   id, name, atk, def, guardian_star_1, guardian_star_2, type, color, level, attribute, description
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

// sharp lives in scripts/package.json to avoid bloating the Vercel deployment.
// Run `cd scripts && bun install` before using this script.
// biome-ignore lint/suspicious/noExplicitAny: dynamic import avoids build-time dependency
const sharp: any = await import("sharp")
  .then((m) => m.default)
  .catch(() => {
    console.error("sharp is required: run `cd scripts && bun install`");
    process.exit(1);
  });

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

/** Card level + attribute packed byte table in SLUS_014.11: 722 × uint8
 *  Low nibble = level (1–12), high nibble = attribute (0–7).
 *  Confirmed by fmlib-cpp and fmscrambler. */
const LEVEL_ATTR_OFFSET = 0x1c_5b33;

/** Card name offset table in SLUS_014.11: 722 × uint16LE offsets into text pool */
const NAME_OFFSET_TABLE = 0x1c_6002;
/** Text pool base address in SLUS_014.11 (offsets are added to this) */
const TEXT_POOL_BASE = 0x1c_0800;

/** Card description offset table in SLUS_014.11: 722 × uint16LE offsets */
const DESC_OFFSET_TABLE = 0x1b_0a02;
/** Description text pool base: descriptions start at 0x1B11F4 - 0x9F4 = 0x1B0800 */
const DESC_TEXT_POOL_BASE = 0x1b_0800;

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

/** Equip table in WA_MRG.MRG: variable-length entries until equipId==0 */
const EQUIP_TABLE_OFFSET = 0xb8_5000;
const EQUIP_TABLE_SIZE = 0x2800;

/** Starchip cost/password table in WA_MRG.MRG: 722 × 8 bytes (4B cost + 4B password) */
const STARCHIP_TABLE_OFFSET = 0xfb_9808;

/** Duelist data in WA_MRG.MRG and SLUS */
const NUM_DUELISTS = 39;
const DUELIST_TABLE_OFFSET = 0xe9_b000;
const DUELIST_ENTRY_SIZE = 0x1800;
const DUELIST_DECK_OFFSET = 0x000;
const DUELIST_SA_POW_OFFSET = 0x5b4;
const DUELIST_BCD_OFFSET = 0xb68;
const DUELIST_SA_TEC_OFFSET = 0x111c;
const DUELIST_NAMES_OFFSET = 0x1c_6652;

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

/** Card attribute encoding. High nibble of the level/attribute byte.
 *  Attribute 0 is used for non-monster cards (Magic, Trap, Equip, Ritual). */
const CARD_ATTRIBUTES: Record<number, string> = {
  0: "",
  1: "Light",
  2: "Dark",
  3: "Water",
  4: "Fire",
  5: "Earth",
  6: "Wind",
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

/** Decode a TBL-encoded string from `buf` at `start` until 0xFF or `maxLen`.
 *  0xFE = newline, 0xF8 starts a multi-byte control sequence (skipped). */
function decodeTblString(buf: Buffer, start: number, maxLen: number): string {
  let result = "";
  for (let i = start; i < start + maxLen && i < buf.length; i++) {
    const b = buf[i] ?? 0;
    if (b === 0xff) break;
    if (b === 0xfe) {
      result += "\n";
      continue;
    }
    // F8 XX YY is a control/color prefix — skip 3 bytes total
    if (b === 0xf8) {
      i += 2;
      continue;
    }
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

function extractCardDescriptions(slus: Buffer): string[] {
  const results: string[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = slus.readUInt16LE(DESC_OFFSET_TABLE + i * 2);
    const addr = DESC_TEXT_POOL_BASE + off;
    results.push(decodeTblString(slus, addr, 500));
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
  level: number;
  attribute: string;
  description: string;
  starchipCost: number;
  password: string;
}

function extractCards(slus: Buffer, waMrg: Buffer): CardStats[] {
  const texts = extractCardTexts(slus);
  const descriptions = extractCardDescriptions(slus);
  const starchips = extractStarchips(waMrg);
  const cards: CardStats[] = [];

  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = slus.readUInt32LE(CARD_STATS_OFFSET + i * 4);
    const text = texts[i] ?? { name: "", color: "" };
    const levelAttr = slus[LEVEL_ATTR_OFFSET + i] ?? 0;
    const sc = starchips[i] ?? { cost: 0, password: "" };
    cards.push({
      id: i + 1,
      name: text.name,
      atk: (raw & 0x1ff) * 10,
      def: ((raw >> 9) & 0x1ff) * 10,
      gs1: GUARDIAN_STARS[(raw >> 22) & 0xf] ?? String((raw >> 22) & 0xf),
      gs2: GUARDIAN_STARS[(raw >> 18) & 0xf] ?? String((raw >> 18) & 0xf),
      type: CARD_TYPES[(raw >> 26) & 0x1f] ?? String((raw >> 26) & 0x1f),
      color: text.color,
      level: levelAttr & 0xf,
      attribute: CARD_ATTRIBUTES[(levelAttr >> 4) & 0xf] ?? String((levelAttr >> 4) & 0xf),
      description: descriptions[i] ?? "",
      starchipCost: sc.cost,
      password: sc.password,
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
// Starchip cost/password extraction
// ---------------------------------------------------------------------------

interface Starchip {
  cost: number;
  password: string;
}

function extractStarchips(waMrg: Buffer): Starchip[] {
  const results: Starchip[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = STARCHIP_TABLE_OFFSET + i * 8;
    const cost = waMrg.readUInt32LE(off);
    // Password is 4 bytes read big-endian as hex string
    const passBytes = waMrg.subarray(off + 4, off + 8);
    const passHex = [passBytes[3], passBytes[2], passBytes[1], passBytes[0]]
      .map((b) => (b ?? 0).toString(16).padStart(2, "0"))
      .join("");
    const password = passHex === "fffffffe" ? "" : passHex.replace(/^0+/, "") || "0";
    results.push({ cost, password });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Equip table extraction
// ---------------------------------------------------------------------------

interface EquipEntry {
  equipId: number;
  monsterIds: number[];
}

function extractEquips(waMrg: Buffer): EquipEntry[] {
  const data = waMrg.subarray(EQUIP_TABLE_OFFSET, EQUIP_TABLE_OFFSET + EQUIP_TABLE_SIZE);
  const equips: EquipEntry[] = [];
  let pos = 0;

  while (pos < data.length - 1) {
    const equipId = data.readUInt16LE(pos);
    pos += 2;
    if (equipId === 0) break;

    const monsterCount = data.readUInt16LE(pos);
    pos += 2;

    const monsterIds: number[] = [];
    for (let j = 0; j < monsterCount; j++) {
      monsterIds.push(data.readUInt16LE(pos));
      pos += 2;
    }
    equips.push({ equipId, monsterIds });
  }

  return equips;
}

// ---------------------------------------------------------------------------
// Duelist decks/drops extraction
// ---------------------------------------------------------------------------

interface DuelistData {
  id: number;
  name: string;
  deck: number[];
  saPow: number[];
  bcd: number[];
  saTec: number[];
}

function extractDuelistNames(slus: Buffer): string[] {
  const names: string[] = [];
  for (let i = 0; i < NUM_DUELISTS; i++) {
    const off = slus.readUInt16LE(DUELIST_NAMES_OFFSET + i * 2);
    const addr = TEXT_POOL_BASE + off;
    names.push(decodeTblString(slus, addr, 100));
  }
  return names;
}

function readU16Array(buf: Buffer, offset: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(buf.readUInt16LE(offset + i * 2));
  }
  return arr;
}

function extractDuelists(slus: Buffer, waMrg: Buffer): DuelistData[] {
  const names = extractDuelistNames(slus);
  const duelists: DuelistData[] = [];

  for (let i = 0; i < NUM_DUELISTS; i++) {
    const base = DUELIST_TABLE_OFFSET + DUELIST_ENTRY_SIZE * i;
    duelists.push({
      id: i + 1,
      name: names[i] ?? `Duelist ${i + 1}`,
      deck: readU16Array(waMrg, base + DUELIST_DECK_OFFSET, NUM_CARDS),
      saPow: readU16Array(waMrg, base + DUELIST_SA_POW_OFFSET, NUM_CARDS),
      bcd: readU16Array(waMrg, base + DUELIST_BCD_OFFSET, NUM_CARDS),
      saTec: readU16Array(waMrg, base + DUELIST_SA_TEC_OFFSET, NUM_CARDS),
    });
  }

  return duelists;
}

// ---------------------------------------------------------------------------
// Card image extraction
// ---------------------------------------------------------------------------

function rgb555toRGBA(val: number, transparent: boolean): [number, number, number, number] {
  if (transparent) return [0, 0, 0, 0];
  const r = Math.round(((val & 0x1f) * 255) / 31);
  const g = Math.round((((val >> 5) & 0x1f) * 255) / 31);
  const b = Math.round((((val >> 10) & 0x1f) * 255) / 31);
  return [r, g, b, 255];
}

// Card thumbnails (40×32, 8bpp, 64 colors) at WA_MRG offset 0x000000.
// One per 2048-byte sector: 1280B pixels + 128B palette + 640B padding.
// Uncomment extractCardImage + main() call to extract.
//
// const CARD_IMG_WIDTH = 40;
// const CARD_IMG_HEIGHT = 32;
// const CARD_IMG_PIXELS = CARD_IMG_WIDTH * CARD_IMG_HEIGHT;
// const CARD_IMG_PAL_OFFSET = CARD_IMG_PIXELS;
// const CARD_IMG_PAL_COLORS = 64;
// const CARD_IMG_SECTOR_SIZE = 2048;
//
// function extractCardImage(waMrg: Buffer, cardIndex: number): Buffer {
//   const start = cardIndex * CARD_IMG_SECTOR_SIZE;
//   const rgba = Buffer.alloc(CARD_IMG_PIXELS * 4);
//   for (let p = 0; p < CARD_IMG_PIXELS; p++) {
//     const idx = byte(waMrg, start + p);
//     const isTransparent = idx >= CARD_IMG_PAL_COLORS;
//     const colorVal = isTransparent ? 0 : waMrg.readUInt16LE(start + CARD_IMG_PAL_OFFSET + idx * 2);
//     const [r, g, b, a] = rgb555toRGBA(colorVal, isTransparent);
//     rgba[p * 4] = r;
//     rgba[p * 4 + 1] = g;
//     rgba[p * 4 + 2] = b;
//     rgba[p * 4 + 3] = a;
//   }
//   return rgba;
// }

// ---------------------------------------------------------------------------
// Full card artwork extraction (102×96, 8bpp, 256 colors)
// ---------------------------------------------------------------------------

/** Full card artwork in WA_MRG.MRG: 722 cards starting at offset 0x169000.
 *  Each card block is 0x3800 (14336) bytes:
 *    +0x0000: 102×96 8bpp pixel data (9792 bytes)
 *    +0x2640: 256-color RGB555 CLUT (512 bytes)
 *    +0x2840: card name image (4bpp, not extracted)
 *    +0x2AE0: 256-color thumbnail (not used, we have the 64-color ones)
 *  Source: TCRF documentation. */
const FULL_IMG_START = 0x16_9000;
const FULL_IMG_BLOCK = 0x3800;
const FULL_IMG_WIDTH = 102;
const FULL_IMG_HEIGHT = 96;
const FULL_IMG_PIXELS = FULL_IMG_WIDTH * FULL_IMG_HEIGHT;
const FULL_IMG_CLUT_OFFSET = 0x2640;

function extractFullCardImage(waMrg: Buffer, cardIndex: number): Buffer {
  const blockStart = FULL_IMG_START + cardIndex * FULL_IMG_BLOCK;
  const rgba = Buffer.alloc(FULL_IMG_PIXELS * 4);

  for (let p = 0; p < FULL_IMG_PIXELS; p++) {
    const idx = byte(waMrg, blockStart + p);
    const colorVal = waMrg.readUInt16LE(blockStart + FULL_IMG_CLUT_OFFSET + idx * 2);
    const [r, g, b, a] = rgb555toRGBA(
      colorVal,
      (colorVal & 0x7fff) === 0 && (colorVal & 0x8000) !== 0,
    );
    rgba[p * 4] = r;
    rgba[p * 4 + 1] = g;
    rgba[p * 4 + 2] = b;
    rgba[p * 4 + 3] = a;
  }

  return rgba;
}

async function writeWebp(
  rgba: Buffer,
  width: number,
  height: number,
  filePath: string,
): Promise<void> {
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ quality: 50 })
    .toFile(filePath);
}

// ---------------------------------------------------------------------------
// CSV serialization
// ---------------------------------------------------------------------------

function cardsToCsv(cards: CardStats[]): string {
  const header =
    "id,name,atk,def,guardian_star_1,guardian_star_2,type,color,level,attribute,starchip_cost,password,description";
  const rows = cards.map(
    (c) =>
      `${c.id},"${c.name.replace(/"/g, '""')}",${c.atk},${c.def},${c.gs1},${c.gs2},${c.type},${c.color},${c.level},${c.attribute},${c.starchipCost},${c.password},"${c.description.replace(/"/g, '""').replace(/\n/g, "\\n")}"`,
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

function equipsToCsv(equips: EquipEntry[]): string {
  const header = "equip_id,monster_id";
  const rows: string[] = [];
  for (const eq of equips) {
    for (const mid of eq.monsterIds) {
      rows.push(`${eq.equipId},${mid}`);
    }
  }
  return `${header}\n${rows.join("\n")}\n`;
}

function duelistsToCsv(duelists: DuelistData[]): string {
  const header = "duelist_id,duelist_name,card_id,deck,sa_pow,bcd,sa_tec";
  const rows: string[] = [];
  for (const d of duelists) {
    for (let c = 0; c < NUM_CARDS; c++) {
      const deck = d.deck[c] ?? 0;
      const saPow = d.saPow[c] ?? 0;
      const bcd = d.bcd[c] ?? 0;
      const saTec = d.saTec[c] ?? 0;
      if (deck > 0 || saPow > 0 || bcd > 0 || saTec > 0) {
        rows.push(`${d.id},"${d.name}",${c + 1},${deck},${saPow},${bcd},${saTec}`);
      }
    }
  }
  return `${header}\n${rows.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Usage: bun run scripts/extract-game-data.ts <path-to.bin> [output-dir]\n" +
        "\n" +
        "Extracts card stats and fusion table from a YFM PS1 disc image.\n" +
        "Output dir defaults to ./public/data",
    );
    process.exit(1);
  }

  const binPath = args[0] ?? "";
  const outDir = args[1] ?? "./public/data";

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
  const cards = extractCards(slus, waMrg);
  const fusions = extractFusions(waMrg);
  const equips = extractEquips(waMrg);
  const duelists = extractDuelists(slus, waMrg);

  const cardAtk = new Map(cards.map((c) => [c.id, c.atk]));

  // Write output
  fs.mkdirSync(outDir, { recursive: true });

  const cardsPath = path.join(outDir, "cards.csv");
  fs.writeFileSync(cardsPath, cardsToCsv(cards));
  console.log(`\nWrote ${cards.length} cards to ${cardsPath}`);

  const fusionsPath = path.join(outDir, "fusions.csv");
  fs.writeFileSync(fusionsPath, fusionsToCsv(fusions, cardAtk));
  console.log(`Wrote ${fusions.length} fusions to ${fusionsPath}`);

  const equipsPath = path.join(outDir, "equips.csv");
  const equipPairs = equips.reduce((n, eq) => n + eq.monsterIds.length, 0);
  fs.writeFileSync(equipsPath, equipsToCsv(equips));
  console.log(`Wrote ${equips.length} equip cards (${equipPairs} pairs) to ${equipsPath}`);

  const duelistsPath = path.join(outDir, "duelists.csv");
  fs.writeFileSync(duelistsPath, duelistsToCsv(duelists));
  console.log(`Wrote ${duelists.length} duelists to ${duelistsPath}`);

  // Extract full card artwork (102×96)
  const artDir = "./public/images/artwork";
  fs.mkdirSync(artDir, { recursive: true });
  const artPromises: Promise<void>[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const rgba = extractFullCardImage(waMrg, i);
    const filePath = path.join(artDir, `${String(i + 1).padStart(3, "0")}.webp`);
    artPromises.push(writeWebp(rgba, FULL_IMG_WIDTH, FULL_IMG_HEIGHT, filePath));
  }
  await Promise.all(artPromises);
  console.log(`Wrote ${NUM_CARDS} card artwork images to ${artDir}/`);
}

void main();
