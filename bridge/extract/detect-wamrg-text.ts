// ---------------------------------------------------------------------------
// WA_MRG text block scanning (PAL/EU versions)
// ---------------------------------------------------------------------------

import type { WaMrgTextBlock } from "./types.ts";

/** Binary signature at the start of every card description section.
 *  Appears exactly once per language in PAL WA_MRG. */
const DESC_HEADER_MARKER = Buffer.from([0x31, 0xf8, 0x03, 0x8c, 0xf8, 0x1b, 0x80]);

/** Find ALL PAL text blocks in WA_MRG (one per language).
 *  Returns an array of up to 5 blocks sorted by offset, or an empty array
 *  if the file doesn't contain embedded text (US/RP versions). */
export function findAllWaMrgTextBlocks(waMrg: Buffer): WaMrgTextBlock[] {
  const blocks: WaMrgTextBlock[] = [];

  // Step 1: Find all occurrences of the description header marker
  const descStarts: number[] = [];
  for (let i = 0; i < waMrg.length - DESC_HEADER_MARKER.length; i++) {
    if (waMrg.subarray(i, i + DESC_HEADER_MARKER.length).equals(DESC_HEADER_MARKER)) {
      const end = waMrg.indexOf(0xff, i);
      if (end !== -1 && end - i < 200) {
        descStarts.push(i);
      }
    }
  }

  if (descStarts.length === 0) return [];

  // Step 2: For each description marker, find the corresponding name block
  for (const descStart of descStarts) {
    let pos = descStart;
    let strCount = 0;
    while (pos < waMrg.length && strCount < 800) {
      const end = waMrg.indexOf(0xff, pos);
      if (end === -1 || end - pos > 500) break;
      strCount++;
      pos = end + 1;
    }

    let nameStart = -1;
    let scanPos = pos;
    while (scanPos < waMrg.length && scanPos < descStart + 0x30000) {
      const runStart = scanPos;
      let runLen = 0;
      let p = scanPos;
      while (p < waMrg.length && runLen < 900) {
        const end = waMrg.indexOf(0xff, p);
        if (end === -1 || end - p > 500) break;
        runLen++;
        p = end + 1;
      }
      if (runLen >= 800) {
        nameStart = runStart;
        break;
      }
      scanPos = p;
      while (scanPos < waMrg.length) {
        const end = waMrg.indexOf(0xff, scanPos);
        if (end === -1) break;
        if (end - scanPos < 500) break;
        scanPos = end + 1;
      }
    }

    if (nameStart !== -1) {
      blocks.push({ descBlockStart: descStart, nameBlockStart: nameStart });
    }
  }

  return blocks;
}
