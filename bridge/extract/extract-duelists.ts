// ---------------------------------------------------------------------------
// Duelist deck/drop pool extraction
// ---------------------------------------------------------------------------

import { PAL_CHAR_TABLE } from "./char-tables.ts";
import { decodeTblString, extractWaMrgStrings, skipWaMrgEntries } from "./text-decoding.ts";
import type { DuelistData, ExeLayout, WaMrgLayout, WaMrgTextBlock } from "./types.ts";
import {
  DUELIST_BCD_OFFSET,
  DUELIST_DECK_OFFSET,
  DUELIST_ENTRY_SIZE,
  DUELIST_SA_POW_OFFSET,
  DUELIST_SA_TEC_OFFSET,
  NUM_CARDS,
  NUM_DUELISTS,
} from "./types.ts";

/** In the 808-string name block: 722 card names, 1 separator, 24 types,
 *  10 guardian stars, 1 label, then 39 duelist names. */
const WAMRG_NAME_DUELIST_START = 758; // 722 + 1 + 24 + 10 + 1

/** Number of garbage 0xFF-terminated entries to skip at the start of each
 *  PAL language's name block.  [EN, FR, DE, IT, ES]. */
const WAMRG_NAME_SKIP: readonly number[] = [0, 1, 0, 0, 2];

/** Byte 0x3f decodes differently in Spanish (á) vs other PAL languages (œ). */
const ES_CHAR_TABLE: string[] = (() => {
  const t = [...PAL_CHAR_TABLE];
  t[0x3f] = "á";
  return t;
})();

export function extractDuelists(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgLayout: WaMrgLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
  langIdx?: number,
): DuelistData[] {
  const names = extractDuelistNames(slus, waMrg, exeLayout, waMrgTextBlocks, langIdx);
  const duelists: DuelistData[] = [];

  for (let i = 0; i < NUM_DUELISTS; i++) {
    const base = waMrgLayout.duelistTable + DUELIST_ENTRY_SIZE * i;
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

function extractDuelistNames(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
  langIdx?: number,
): string[] {
  if (exeLayout.duelistNames !== -1 && exeLayout.textPoolBase !== -1) {
    const names: string[] = [];
    for (let i = 0; i < NUM_DUELISTS; i++) {
      const off = slus.readUInt16LE(exeLayout.duelistNames + i * 2);
      const addr = exeLayout.textPoolBase + off;
      names.push(decodeTblString(slus, addr, 100));
    }
    return names;
  }
  // PAL fallback: read duelist names from the selected WA_MRG text block
  const blockIdx = langIdx ?? 0;
  const textBlock = waMrgTextBlocks[blockIdx];
  if (textBlock) {
    const skip = WAMRG_NAME_SKIP[blockIdx] ?? 0;
    const start =
      skip > 0 ? skipWaMrgEntries(waMrg, textBlock.nameBlockStart, skip) : textBlock.nameBlockStart;
    const charTable = blockIdx === 4 ? ES_CHAR_TABLE : PAL_CHAR_TABLE;
    const totalEntries = WAMRG_NAME_DUELIST_START + NUM_DUELISTS;
    const allNames = extractWaMrgStrings(waMrg, start, totalEntries, charTable);
    return allNames.slice(WAMRG_NAME_DUELIST_START, totalEntries);
  }
  return Array.from({ length: NUM_DUELISTS }, (_, i) => `Duelist ${i + 1}`);
}

function readU16Array(buf: Buffer, offset: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(buf.readUInt16LE(offset + i * 2));
  }
  return arr;
}
