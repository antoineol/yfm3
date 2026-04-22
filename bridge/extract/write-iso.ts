// ---------------------------------------------------------------------------
// In-place writes to a raw PS1 disc image (.bin / .iso).
//
// Wraps sector-aware offset math so callers can think in terms of logical file
// offsets (what `readIsoFile` returns) rather than raw byte offsets into the
// MODE2/2352 stream. Works for both MODE2/2352 and MODE1/2048.
// ---------------------------------------------------------------------------

import { type DiscFormat, SECTOR_DATA_SIZE } from "./iso9660.ts";

/**
 * Translate a logical (sector-relative) file offset to an absolute byte offset
 * in the raw disc image buffer, accounting for per-sector headers.
 */
export function discOffset(fileStartSector: number, fileOffset: number, fmt: DiscFormat): number {
  const sector = fileStartSector + Math.floor(fileOffset / SECTOR_DATA_SIZE);
  const within = fmt.dataOffset + (fileOffset % SECTOR_DATA_SIZE);
  return sector * fmt.sectorSize + within;
}

/** Write a little-endian uint16 at a logical file offset, byte-by-byte so it
 *  tolerates writes that straddle a sector boundary. */
export function writeU16LeAt(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  fmt: DiscFormat,
): void {
  bin[discOffset(fileStartSector, fileOffset, fmt)] = value & 0xff;
  bin[discOffset(fileStartSector, fileOffset + 1, fmt)] = (value >> 8) & 0xff;
}

/** Write a contiguous run of u16LE values at a logical file offset. */
export function writeU16LeArray(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  values: readonly number[],
  fmt: DiscFormat,
): void {
  for (let i = 0; i < values.length; i++) {
    writeU16LeAt(bin, fileStartSector, fileOffset + i * 2, values[i] ?? 0, fmt);
  }
}
