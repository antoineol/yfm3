// ---------------------------------------------------------------------------
// TBL string decoding & shared WA_MRG text extraction
// ---------------------------------------------------------------------------

import { CHAR_TABLE, PAL_CHAR_TABLE } from "./char-tables.ts";

// Re-export character tables so existing consumers don't need to change imports
export { CHAR_TABLE, PAL_CHAR_TABLE } from "./char-tables.ts";

/** Check if `buf[addr]` starts a valid TBL string (bytes 0x00–0xF8 ending with 0xFF within limit). */
export function isTblString(buf: Buffer, addr: number, limit = 100): boolean {
  for (let i = 0; i < limit && addr + i < buf.length; i++) {
    const b = buf[addr + i];
    if (b === undefined) return false;
    if (b === 0xff) return i > 0; // found terminator after at least 1 char
    if (b === 0xfe) continue; // newline
    if (b === 0xf8) {
      i += 2;
      continue;
    } // control sequence
    if (CHAR_TABLE[b] === undefined) return false; // invalid TBL byte
  }
  return false;
}

/** Decode a TBL-encoded string from `buf` at `start` until 0xFF or `maxLen`.
 *  0xFE = newline, 0xF8 starts a multi-byte control sequence (skipped).
 *  `charTable` selects the encoding: CHAR_TABLE for NTSC-U, PAL_CHAR_TABLE for EU. */
export function decodeTblString(
  buf: Buffer,
  start: number,
  maxLen: number,
  charTable: string[] = CHAR_TABLE,
): string {
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
    result += charTable[b] ?? `{${b.toString(16).padStart(2, "0")}}`;
  }
  return result;
}

/** Extract 0xFF-terminated strings from a buffer starting at `offset`.
 *  Uses PAL_CHAR_TABLE by default. */
export function extractWaMrgStrings(
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
