// ---------------------------------------------------------------------------
// Card stats, names, descriptions, starchip/password extraction
// ---------------------------------------------------------------------------

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

/** Card name color codes: byte XX in the {F8 0A XX} prefix before card name text. */
const CARD_COLORS: Record<number, string> = {
  1: "yellow",
  2: "blue",
  3: "green",
  4: "purple",
  5: "orange",
  6: "red",
};

const NUM_TYPE_NAMES = 24;
const NUM_GS_NAMES = 11;

/** Fallback guardian star names (English) for when exe extraction is unavailable. */
const DEFAULT_GUARDIAN_STARS: Record<number, string> = {
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

/** Fallback card type names (English) for when exe extraction is unavailable. */
const DEFAULT_CARD_TYPES: Record<number, string> = {
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
  let gsNames = extractNameTable(
    slus,
    exeLayout.gsNamesTable,
    NUM_GS_NAMES,
    DEFAULT_GUARDIAN_STARS,
  );

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
  const starchips = extractStarchips(waMrg, waMrgLayout);
  const cards: CardStats[] = [];

  for (let i = 0; i < NUM_CARDS; i++) {
    const raw = slus.readUInt32LE(exeLayout.cardStats + i * 4);
    const text = texts[i] ?? { name: "", color: "" };
    const levelAttr = exeLayout.levelAttr >= 0 ? (slus[exeLayout.levelAttr + i] ?? 0) : 0;
    const sc = starchips[i] ?? { cost: 0, password: "" };
    cards.push({
      id: i + 1,
      name: text.name,
      atk: (raw & 0x1ff) * 10,
      def: ((raw >> 9) & 0x1ff) * 10,
      gs1: gsNames[(raw >> 22) & 0xf] ?? String((raw >> 22) & 0xf),
      gs2: gsNames[(raw >> 18) & 0xf] ?? String((raw >> 18) & 0xf),
      type: cardTypes[(raw >> 26) & 0x1f] ?? String((raw >> 26) & 0x1f),
      color: text.color,
      level: levelAttr & 0xf,
      attribute: cardAttributes[(levelAttr >> 4) & 0xf] ?? String((levelAttr >> 4) & 0xf),
      description: descriptions[i] ?? "",
      starchipCost: sc.cost,
      password: sc.password,
    });
  }

  return cards;
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
      let addr = exeLayout.textPoolBase + off;
      let color = "";
      if ((slus[addr] ?? 0) === 0xf8) {
        color = CARD_COLORS[slus[addr + 2] ?? 0] ?? "";
        addr += 3;
      }
      results.push({ name: decodeTblString(slus, addr, 100), color });
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
    const names = extractWaMrgStrings(waMrg, start, NUM_CARDS, charTable);
    return names.map((name) => ({ name, color: "" }));
  }
  return Array.from({ length: NUM_CARDS }, () => ({ name: "", color: "" }));
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
