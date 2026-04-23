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

/** Private-Use-Area base for inline icon tokens emitted by decodeTblString.
 *  A `F8 0B XX` control sequence becomes a single char at `ICON_TOKEN_BASE + XX`,
 *  where `XX` is the monster-type index (0=Dragon, 1=Spellcaster, …).
 *  Consumers can detect tokens with `isIconToken` and recover `XX` via `iconTokenType`. */
export const ICON_TOKEN_BASE = 0xe100;
export const ICON_TOKEN_END = 0xe17f;

export function isIconToken(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= ICON_TOKEN_BASE && c <= ICON_TOKEN_END;
}

export function iconTokenType(ch: string): number {
  return ch.charCodeAt(0) - ICON_TOKEN_BASE;
}

/** Decode a TBL-encoded string from `buf` at `start` until 0xFF or `maxLen`.
 *  0xFE = newline. 0xF8 XX YY is a control sequence: `F8 0B XX` is an inline
 *  type-icon (emitted as a single PUA char, see `ICON_TOKEN_BASE`); all other
 *  F8 sequences are skipped (3 bytes total).
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
    if (b === 0xf8) {
      const sub = buf[i + 1] ?? 0;
      const arg = buf[i + 2] ?? 0;
      if (sub === 0x0b && arg <= ICON_TOKEN_END - ICON_TOKEN_BASE) {
        result += String.fromCharCode(ICON_TOKEN_BASE + arg);
      }
      i += 2;
      continue;
    }
    result += charTable[b] ?? `{${b.toString(16).padStart(2, "0")}}`;
  }
  return result;
}

/** Skip `count` 0xFF-terminated entries in a buffer starting at `offset`.
 *  Returns the byte offset just past the last skipped terminator. */
export function skipWaMrgEntries(buf: Buffer, offset: number, count: number): number {
  let pos = offset;
  for (let i = 0; i < count; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1) break;
    pos = end + 1;
  }
  return pos;
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
