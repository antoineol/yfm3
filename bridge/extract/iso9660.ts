// ---------------------------------------------------------------------------
// Disc image reading & ISO 9660 filesystem parsing
// ---------------------------------------------------------------------------

import type { IsoFile } from "./types.ts";

// ── Disc format detection ───────────────────────────────────────

/** Sector geometry for a disc image. */
export interface DiscFormat {
  sectorSize: number;
  dataOffset: number;
}

/** PS1 CD-ROM MODE2/2352 (.bin files): 12 sync + 4 header + 8 subheader + 2048 data + 280 ECC */
export const MODE2_2352: DiscFormat = { sectorSize: 2352, dataOffset: 24 };

/** Standard ISO 9660 MODE1/2048 (.iso files): raw 2048-byte sectors, no CD-ROM framing */
export const MODE1_2048: DiscFormat = { sectorSize: 2048, dataOffset: 0 };

export const SECTOR_DATA_SIZE = 2048;

/** ISO 9660 Primary Volume Descriptor is always at sector 16 */
export const PVD_SECTOR = 16;

/**
 * Auto-detect disc format by probing for the ISO 9660 PVD signature ("CD001")
 * at sector 16 in both MODE2/2352 and MODE1/2048 layouts.
 */
export function detectDiscFormat(bin: Buffer): DiscFormat {
  for (const fmt of [MODE2_2352, MODE1_2048]) {
    const offset = PVD_SECTOR * fmt.sectorSize + fmt.dataOffset;
    if (
      bin.length > offset + 6 &&
      bin.subarray(offset + 1, offset + 6).toString("ascii") === "CD001"
    )
      return fmt;
  }
  throw new Error("Cannot detect disc format: no ISO 9660 PVD found at sector 16");
}

/** Read a single byte from a buffer, throwing on out-of-bounds. */
export function byte(buf: Buffer, offset: number): number {
  const v = buf[offset];
  if (v === undefined) throw new Error(`Read out of bounds at offset ${offset}`);
  return v;
}

export function readSector(bin: Buffer, sector: number, fmt: DiscFormat = MODE2_2352): Buffer {
  const offset = sector * fmt.sectorSize + fmt.dataOffset;
  return bin.subarray(offset, offset + SECTOR_DATA_SIZE);
}

/** Read a contiguous range of sectors and return the concatenated data bytes. */
export function readSectors(
  bin: Buffer,
  startSector: number,
  count: number,
  fmt: DiscFormat = MODE2_2352,
): Buffer {
  const out = Buffer.alloc(count * SECTOR_DATA_SIZE);
  for (let i = 0; i < count; i++) {
    readSector(bin, startSector + i, fmt).copy(out, i * SECTOR_DATA_SIZE);
  }
  return out;
}

export function parseDirectory(dirData: Buffer, dirSize: number): IsoFile[] {
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

export function readIsoFile(bin: Buffer, file: IsoFile, fmt: DiscFormat = MODE2_2352): Buffer {
  const sectorCount = Math.ceil(file.size / SECTOR_DATA_SIZE);
  const raw = readSectors(bin, file.sector, sectorCount, fmt);
  return raw.subarray(0, file.size);
}

export function findFile(
  bin: Buffer,
  rootFiles: IsoFile[],
  filePath: string,
  fmt: DiscFormat = MODE2_2352,
): Buffer {
  const parts = filePath.split("/");
  let files = rootFiles;

  for (let i = 0; i < parts.length; i++) {
    const target = parts[i] ?? "";
    const entry = files.find((f) => f.name === target);
    if (!entry) {
      throw new Error(`File not found in disc image: ${filePath} (missing "${target}")`);
    }

    if (i < parts.length - 1) {
      const dirData = readSectors(bin, entry.sector, Math.ceil(entry.size / SECTOR_DATA_SIZE), fmt);
      files = parseDirectory(dirData, entry.size);
    } else {
      return readIsoFile(bin, entry, fmt);
    }
  }

  throw new Error(`File not found: ${filePath}`);
}
