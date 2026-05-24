// ---------------------------------------------------------------------------
// Card stats, names, descriptions, starchip/password extraction
// ---------------------------------------------------------------------------

import { cardTypes, guardianStars } from "../../src/engine/data/rp-types.ts";
import { PAL_CHAR_TABLE } from "./char-tables.ts";
import {
  CHAR_TABLE,
  decodeTblString,
  extractWaMrgStrings,
  skipWaMrgEntries,
} from "./text-decoding.ts";
import type {
  CardStats,
  CardText,
  ExeLayout,
  Starchip,
  WaMrgLayout,
  WaMrgTextBlock,
} from "./types.ts";
import { NUM_CARDS } from "./types.ts";

/** Card name/label color codes: byte XX in the {F8 0A XX} prefix before card name text. */
const LABEL_COLORS: Record<number, string> = {
  1: "yellow",
  2: "blue",
  3: "green",
  4: "purple",
  5: "orange",
  6: "red",
  7: "purple",
};

/** Packed Gold color-category table codes. Monster codes line up with rendered frames. */
const FRAME_COLORS: Record<number, string> = {
  0: "yellow",
  1: "green",
  2: "pink",
  3: "blue",
  4: "purple",
  5: "orange",
};

const FRAME_COLOR_TABLE_BYTES = Math.ceil(NUM_CARDS / 2);
const FRAME_COLOR_PROBES: readonly [cardId: number, code: number][] = [
  [1, 0],
  [2, 0],
  [301, 1],
  [329, 2],
  [356, 3],
  [380, 4],
  [613, 4],
  [716, 3],
];
const NON_MONSTER_FRAME_COLORS: Record<string, string> = {
  Magic: "green",
  Equip: "green",
  Ritual: "blue",
  Trap: "pink",
};

const NUM_TYPE_NAMES = 24;
const DEFAULT_CARD_TYPES = indexedNames(cardTypes);
const DEFAULT_GUARDIAN_STARS = indexedNames(guardianStars);
const STORED_GUARDIAN_STARS = guardianStars.slice(1);

/** WA_MRG text block layout: skip 2 header strings before card descriptions. */
const WAMRG_DESC_CARD_START = 2;

/** Number of garbage 0xFF-terminated entries to skip at the start of each
 *  PAL language's name block.  [EN, FR, DE, IT, ES]. */
const WAMRG_NAME_SKIP: readonly number[] = [0, 1, 0, 0, 2];

/** Byte 0x3f decodes differently in Spanish (á) vs other PAL languages (œ). */
const ES_CHAR_TABLE: string[] = (() => {
  const t = [...PAL_CHAR_TABLE];
  t[0x3f] = "á";
  return t;
})();

/** WA_MRG name block layout:
 *  722 card names, 1 separator, 24 type names, 10 GS names (indices 1–10), 1 label, 39 duelists.
 *  Type names start at entry 723, GS names at entry 747. */
const WAMRG_NAME_TYPE_START = 723; // 722 cards + 1 separator
const WAMRG_NAME_GS_START = 747; // 722 + 1 + 24
const WAMRG_NAME_GS_COUNT = 10; // GS indices 1–10 (index 0 = "None" is not stored)

export function extractCards(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgLayout: WaMrgLayout,
  cardAttributes: Record<number, string>,
  waMrgTextBlocks: WaMrgTextBlock[],
  langIdx?: number,
): CardStats[] {
  let cardTypes = extractNameTable(
    slus,
    exeLayout.typeNamesTable,
    NUM_TYPE_NAMES,
    DEFAULT_CARD_TYPES,
  );
  let gsNames = extractGuardianStarNames(slus, exeLayout.gsNamesTable, DEFAULT_GUARDIAN_STARS);

  // PAL: override type & GS names from the WA_MRG name block (correct language)
  const blockIdx = langIdx ?? 0;
  const palBlock = waMrgTextBlocks[blockIdx];
  if (exeLayout.typeNamesTable === -1 && palBlock) {
    const skip = WAMRG_NAME_SKIP[blockIdx] ?? 0;
    const start =
      skip > 0 ? skipWaMrgEntries(waMrg, palBlock.nameBlockStart, skip) : palBlock.nameBlockStart;
    const charTable = blockIdx === 4 ? ES_CHAR_TABLE : PAL_CHAR_TABLE;
    const allNames = extractWaMrgStrings(
      waMrg,
      start,
      WAMRG_NAME_GS_START + WAMRG_NAME_GS_COUNT,
      charTable,
    );
    // Type names (24 entries → indices 0–23)
    const types: Record<number, string> = {};
    for (let i = 0; i < NUM_TYPE_NAMES; i++) {
      const name = allNames[WAMRG_NAME_TYPE_START + i];
      if (name) types[i] = name;
    }
    if (Object.keys(types).length > 0) cardTypes = types;
    // GS names (10 entries → GS indices 1–10; index 0 stays as default "None")
    const gs: Record<number, string> = { 0: gsNames[0] ?? "None" };
    for (let i = 0; i < WAMRG_NAME_GS_COUNT; i++) {
      const name = allNames[WAMRG_NAME_GS_START + i];
      if (name) gs[i + 1] = name;
    }
    if (Object.keys(gs).length > 1) gsNames = gs;
  }

  const texts = extractCardTexts(slus, waMrg, exeLayout, waMrgTextBlocks, langIdx);
  const iconNames = Array.from({ length: NUM_TYPE_NAMES }, (_, i) => cardTypes[i] ?? `Type ${i}`);
  const descriptions = extractCardDescriptions(
    slus,
    waMrg,
    exeLayout,
    waMrgTextBlocks,
    langIdx,
    iconNames,
  );
  const frameColors = extractFrameColors(slus);
  const starchips = extractStarchips(waMrg, waMrgLayout);
  const cards: CardStats[] = [];

  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = slus.readUInt32LE(exeLayout.cardStats + i * 4);
    const text = texts[i] ?? { name: "", color: "" };
    const rawType = (raw >> 26) & 0x1f;
    const type = cardTypes[rawType] ?? String(rawType);
    const levelAttr = exeLayout.levelAttr >= 0 ? (slus[exeLayout.levelAttr + i] ?? 0) : 0;
    const sc = starchips[i] ?? { cost: 0, password: "" };
    cards.push({
      id: i + 1,
      name: text.name,
      atk: (raw & 0x1ff) * 10,
      def: ((raw >> 9) & 0x1ff) * 10,
      gs1: gsNames[(raw >> 22) & 0xf] ?? String((raw >> 22) & 0xf),
      gs2: gsNames[(raw >> 18) & 0xf] ?? String((raw >> 18) & 0xf),
      type,
      color: resolveFrameColor(frameColors[i], type, rawType < 20),
      labelColor: text.color,
      level: levelAttr & 0xf,
      attribute: cardAttributes[(levelAttr >> 4) & 0xf] ?? String((levelAttr >> 4) & 0xf),
      description: descriptions[i] ?? "",
      starchipCost: sc.cost,
      password: sc.password,
    });
  }

  return cards;
}

function resolveFrameColor(
  frameColor: string | undefined,
  cardType: string,
  isMonster: boolean,
): string {
  if (!isMonster) return NON_MONSTER_FRAME_COLORS[cardType] ?? frameColor ?? "";
  if (frameColor === "green" || frameColor === "pink" || frameColor === "orange") return "yellow";
  return frameColor || "";
}

function extractFrameColors(exe: Buffer): (string | undefined)[] {
  const table = findPackedFrameColorTable(exe);
  if (table === -1) return [];
  return Array.from(
    { length: NUM_CARDS },
    (_, i) => FRAME_COLORS[readFrameColorCode(exe, table, i)] ?? "",
  );
}

function findPackedFrameColorTable(exe: Buffer): number {
  for (let offset = 0; offset <= exe.length - FRAME_COLOR_TABLE_BYTES; offset++) {
    if (isPackedFrameColorTable(exe, offset)) return offset;
  }
  return -1;
}

function isPackedFrameColorTable(exe: Buffer, offset: number): boolean {
  const counts = Array(Object.keys(FRAME_COLORS).length).fill(0) as number[];
  for (let i = 0; i < NUM_CARDS; i++) {
    const code = readFrameColorCode(exe, offset, i);
    if (!(code in FRAME_COLORS)) return false;
    counts[code] = (counts[code] ?? 0) + 1;
  }
  for (const [cardId, code] of FRAME_COLOR_PROBES) {
    if (readFrameColorCode(exe, offset, cardId - 1) !== code) return false;
  }
  return (
    (counts[0] ?? 0) > 500 &&
    (counts[1] ?? 0) > 50 &&
    (counts[2] ?? 0) > 5 &&
    (counts[3] ?? 0) > 5 &&
    (counts[4] ?? 0) > 20
  );
}

function readFrameColorCode(exe: Buffer, offset: number, index: number): number {
  const packed = exe[offset + Math.floor(index / 2)] ?? 0;
  return index % 2 === 0 ? packed >> 4 : packed & 0xf;
}

function extractNameTable(
  exe: Buffer,
  offset: number,
  count: number,
  defaults: Record<number, string>,
): Record<number, string> {
  if (offset !== -1) {
    const names = extractWaMrgStrings(exe, offset, count, CHAR_TABLE);
    if (names.length === count && names.every((n) => n && n === n.trim() && !n.includes("{"))) {
      const result: Record<number, string> = {};
      for (let i = 0; i < names.length; i++) result[i] = names[i] as string;
      return result;
    }
  }
  return defaults;
}

function extractGuardianStarNames(
  exe: Buffer,
  offset: number,
  defaults: Record<number, string>,
): Record<number, string> {
  if (offset === -1) return defaults;
  const indexedNames = extractWaMrgStrings(
    exe,
    offset,
    STORED_GUARDIAN_STARS.length + 1,
    CHAR_TABLE,
  );
  if (
    indexedNames.length === STORED_GUARDIAN_STARS.length + 1 &&
    indexedNames.every((name) => name && name === name.trim() && !name.includes("{")) &&
    !indexedNames
      .slice(0, STORED_GUARDIAN_STARS.length)
      .every((name, i) => name === STORED_GUARDIAN_STARS[i])
  ) {
    const result: Record<number, string> = {};
    for (let i = 0; i < indexedNames.length; i++) result[i] = indexedNames[i] as string;
    return result;
  }
  const names = indexedNames.slice(0, STORED_GUARDIAN_STARS.length);
  if (!names.every((name, i) => name === STORED_GUARDIAN_STARS[i])) return defaults;
  const result: Record<number, string> = { 0: defaults[0] ?? "None" };
  for (let i = 0; i < names.length; i++) result[i + 1] = names[i] as string;
  return result;
}

function indexedNames(names: readonly string[]): Record<number, string> {
  const result: Record<number, string> = {};
  for (let i = 0; i < names.length; i++) result[i] = names[i] as string;
  return result;
}

export function extractCardTexts(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
  langIdx?: number,
): CardText[] {
  if (exeLayout.nameOffsetTable !== -1 && exeLayout.textPoolBase !== -1) {
    const results: CardText[] = [];
    for (let i = 0; i < NUM_CARDS; i++) {
      const off = slus.readUInt16LE(exeLayout.nameOffsetTable + i * 2);
      results.push(decodeCardText(slus, exeLayout.textPoolBase + off, 100, CHAR_TABLE));
    }
    return results;
  }
  // PAL fallback: read card names from the selected WA_MRG text block
  const blockIdx = langIdx ?? 0;
  const textBlock = waMrgTextBlocks[blockIdx];
  if (textBlock) {
    const skip = WAMRG_NAME_SKIP[blockIdx] ?? 0;
    const start =
      skip > 0 ? skipWaMrgEntries(waMrg, textBlock.nameBlockStart, skip) : textBlock.nameBlockStart;
    const charTable = blockIdx === 4 ? ES_CHAR_TABLE : PAL_CHAR_TABLE;
    return extractWaMrgCardTexts(waMrg, start, NUM_CARDS, charTable);
  }
  return Array.from({ length: NUM_CARDS }, () => ({ name: "", color: "" }));
}

function decodeCardText(buf: Buffer, start: number, maxLen: number, charTable: string[]): CardText {
  if ((buf[start] ?? 0) !== 0xf8 || (buf[start + 1] ?? 0) !== 0x0a) {
    return { name: decodeTblString(buf, start, maxLen, charTable), color: "" };
  }
  return {
    name: decodeTblString(buf, start + 3, Math.max(0, maxLen - 3), charTable),
    color: LABEL_COLORS[buf[start + 2] ?? 0] ?? "",
  };
}

function extractWaMrgCardTexts(
  buf: Buffer,
  offset: number,
  count: number,
  charTable: string[],
): CardText[] {
  const texts: CardText[] = [];
  let pos = offset;
  for (let i = 0; i < count && pos < buf.length; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1 || end - pos > 500) {
      texts.push({ name: "", color: "" });
      break;
    }
    texts.push(decodeCardText(buf, pos, end - pos, charTable));
    pos = end + 1;
  }
  return texts;
}

export function extractCardDescriptions(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
  langIdx?: number,
  iconNames?: readonly string[],
): string[] {
  if (exeLayout.descOffsetTable !== -1 && exeLayout.descTextPoolBase !== -1) {
    const results: string[] = [];
    for (let i = 0; i < NUM_CARDS; i++) {
      const off = slus.readUInt16LE(exeLayout.descOffsetTable + i * 2);
      const addr = exeLayout.descTextPoolBase + off;
      results.push(decodeTblString(slus, addr, 500, CHAR_TABLE, iconNames));
    }
    return results;
  }
  // PAL fallback: read card descriptions from the selected WA_MRG text block
  const blockIdx = langIdx ?? 0;
  const textBlock = waMrgTextBlocks[blockIdx];
  if (textBlock) {
    const charTable = blockIdx === 4 ? ES_CHAR_TABLE : PAL_CHAR_TABLE;
    const allDescs = extractWaMrgStringsWithIcons(
      waMrg,
      textBlock.descBlockStart,
      WAMRG_DESC_CARD_START + NUM_CARDS,
      charTable,
      iconNames,
    );
    return allDescs.slice(WAMRG_DESC_CARD_START, WAMRG_DESC_CARD_START + NUM_CARDS);
  }
  return Array.from({ length: NUM_CARDS }, () => "");
}

/** Variant of `extractWaMrgStrings` that forwards an `iconNames` table to the
 *  TBL decoder so card descriptions get readable `[TypeName]` markers for the
 *  PAL path too. */
function extractWaMrgStringsWithIcons(
  buf: Buffer,
  offset: number,
  count: number,
  charTable: string[],
  iconNames?: readonly string[],
): string[] {
  const out: string[] = [];
  let pos = offset;
  for (let i = 0; i < count && pos < buf.length; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1 || end - pos > 500) {
      out.push("");
      break;
    }
    out.push(decodeTblString(buf, pos, end - pos, charTable, iconNames));
    pos = end + 1;
  }
  return out;
}

function extractStarchips(waMrg: Buffer, waMrgLayout: WaMrgLayout): Starchip[] {
  const results: Starchip[] = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    const off = waMrgLayout.starchipTable + i * 8;
    const cost = waMrg.readUInt32LE(off);
    const passBytes = waMrg.subarray(off + 4, off + 8);
    const passHex = [passBytes[3], passBytes[2], passBytes[1], passBytes[0]]
      .map((b) => (b ?? 0).toString(16).padStart(2, "0"))
      .join("");
    const password = passHex === "fffffffe" ? "" : passHex.replace(/^0+/, "") || "0";
    results.push({ cost, password });
  }
  return results;
}
