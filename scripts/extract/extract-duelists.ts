// ---------------------------------------------------------------------------
// Duelist deck/drop pool extraction
// ---------------------------------------------------------------------------

import { decodeTblString, PAL_CHAR_TABLE } from "./text-decoding.ts";
import type { DuelistData, ExeLayout, WaMrgLayout, WaMrgTextBlock } from "./types.ts";
import { NUM_CARDS, NUM_DUELISTS } from "./types.ts";

const DUELIST_ENTRY_SIZE = 0x1800;
const DUELIST_DECK_OFFSET = 0x000;
const DUELIST_SA_POW_OFFSET = 0x5b4;
const DUELIST_BCD_OFFSET = 0xb68;
const DUELIST_SA_TEC_OFFSET = 0x111c;

/** In the 808-string name block: 722 card names, 1 separator, 24 types,
 *  10 guardian stars, 1 label, then 39 duelist names. */
const WAMRG_NAME_DUELIST_START = 758; // 722 + 1 + 24 + 10 + 1

/** Extract 0xFF-terminated strings from a buffer starting at `offset`. */
function extractWaMrgStrings(
  buf: Buffer,
  offset: number,
  count: number,
  charTable: string[] = PAL_CHAR_TABLE,
): string[] {
  const strings: string[] = [];
  let pos = offset;
  for (let i = 0; i < count && pos < buf.length; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1 || end - pos > 500) {
      strings.push("");
      break;
    }
    strings.push(decodeTblString(buf, pos, end - pos, charTable));
    pos = end + 1;
  }
  return strings;
}

function extractDuelistNames(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
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
  // PAL fallback: read duelist names from WA_MRG text block
  const textBlock = waMrgTextBlocks[0];
  if (textBlock) {
    const allNames = extractWaMrgStrings(
      waMrg,
      textBlock.nameBlockStart,
      WAMRG_NAME_DUELIST_START + NUM_DUELISTS,
    );
    return allNames.slice(WAMRG_NAME_DUELIST_START, WAMRG_NAME_DUELIST_START + NUM_DUELISTS);
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

export function extractDuelists(
  slus: Buffer,
  waMrg: Buffer,
  exeLayout: ExeLayout,
  waMrgLayout: WaMrgLayout,
  waMrgTextBlocks: WaMrgTextBlock[],
): DuelistData[] {
  const names = extractDuelistNames(slus, waMrg, exeLayout, waMrgTextBlocks);
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
