import { describe, expect, it } from "vitest";
import {
  byte,
  detectDiscFormat,
  MODE1_2048,
  MODE2_2352,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./iso9660.ts";

const SECTOR_SIZE = 2352;
const SECTOR_DATA_OFFSET = 24;

/** Build a minimal MODE2/2352 sector with `data` at the data region. */
function makeSector(data: Buffer): Buffer {
  const sector = Buffer.alloc(SECTOR_SIZE);
  // 12 sync + 4 header + 8 subheader = 24 bytes before data
  data.copy(sector, SECTOR_DATA_OFFSET);
  return sector;
}

/** Build a disc image buffer from an array of 2048-byte data payloads. */
function makeDisc(sectors: Buffer[]): Buffer {
  const buf = Buffer.alloc(sectors.length * SECTOR_SIZE);
  for (let i = 0; i < sectors.length; i++) {
    const sec = makeSector(sectors[i] ?? Buffer.alloc(SECTOR_DATA_SIZE));
    sec.copy(buf, i * SECTOR_SIZE);
  }
  return buf;
}

describe("byte", () => {
  it("returns value at valid offset", () => {
    const buf = Buffer.from([0x00, 0x42, 0xff]);
    expect(byte(buf, 0)).toBe(0x00);
    expect(byte(buf, 1)).toBe(0x42);
    expect(byte(buf, 2)).toBe(0xff);
  });

  it("throws on out-of-bounds offset", () => {
    const buf = Buffer.from([0x01]);
    expect(() => byte(buf, 1)).toThrow("out of bounds");
    expect(() => byte(buf, 100)).toThrow("out of bounds");
  });
});

describe("readSector", () => {
  it("extracts the 2048-byte data region from a MODE2/2352 sector", () => {
    const data = Buffer.alloc(SECTOR_DATA_SIZE);
    data[0] = 0xaa;
    data[2047] = 0xbb;
    const disc = makeDisc([data]);

    const result = readSector(disc, 0);
    expect(result.length).toBe(SECTOR_DATA_SIZE);
    expect(result[0]).toBe(0xaa);
    expect(result[2047]).toBe(0xbb);
  });

  it("reads the correct sector by index", () => {
    const data0 = Buffer.alloc(SECTOR_DATA_SIZE, 0x11);
    const data1 = Buffer.alloc(SECTOR_DATA_SIZE, 0x22);
    const disc = makeDisc([data0, data1]);

    const result = readSector(disc, 1);
    expect(result[0]).toBe(0x22);
    expect(result[1023]).toBe(0x22);
  });
});

describe("readSectors", () => {
  it("concatenates multiple sectors into a single buffer", () => {
    const data0 = Buffer.alloc(SECTOR_DATA_SIZE, 0xaa);
    const data1 = Buffer.alloc(SECTOR_DATA_SIZE, 0xbb);
    const data2 = Buffer.alloc(SECTOR_DATA_SIZE, 0xcc);
    const disc = makeDisc([data0, data1, data2]);

    const result = readSectors(disc, 0, 3);
    expect(result.length).toBe(3 * SECTOR_DATA_SIZE);
    expect(result[0]).toBe(0xaa);
    expect(result[SECTOR_DATA_SIZE]).toBe(0xbb);
    expect(result[2 * SECTOR_DATA_SIZE]).toBe(0xcc);
  });

  it("reads a sub-range of sectors", () => {
    const data0 = Buffer.alloc(SECTOR_DATA_SIZE, 0x00);
    const data1 = Buffer.alloc(SECTOR_DATA_SIZE, 0x11);
    const data2 = Buffer.alloc(SECTOR_DATA_SIZE, 0x22);
    const disc = makeDisc([data0, data1, data2]);

    const result = readSectors(disc, 1, 2);
    expect(result.length).toBe(2 * SECTOR_DATA_SIZE);
    expect(result[0]).toBe(0x11);
    expect(result[SECTOR_DATA_SIZE]).toBe(0x22);
  });
});

describe("parseDirectory", () => {
  /** Build an ISO 9660 directory record. */
  function makeDirRecord(opts: {
    extent: number;
    size: number;
    flags: number;
    name: string;
  }): Buffer {
    const nameBytes = Buffer.from(opts.name, "ascii");
    const recordLen = 33 + nameBytes.length;
    const rec = Buffer.alloc(recordLen);
    rec[0] = recordLen;
    rec.writeUInt32LE(opts.extent, 2); // extent LE
    rec.writeUInt32BE(opts.extent, 6); // extent BE (both-endian)
    rec.writeUInt32LE(opts.size, 10); // size LE
    rec.writeUInt32BE(opts.size, 14); // size BE
    rec[25] = opts.flags;
    rec[32] = nameBytes.length;
    nameBytes.copy(rec, 33);
    return rec;
  }

  it("parses directory records, skipping . and .. entries", () => {
    const dot = Buffer.alloc(34);
    dot[0] = 34;
    dot[32] = 1;
    dot[33] = 0x00; // "." entry

    const dotdot = Buffer.alloc(34);
    dotdot[0] = 34;
    dotdot[32] = 1;
    dotdot[33] = 0x01; // ".." entry

    const file1 = makeDirRecord({
      extent: 100,
      size: 4096,
      flags: 0,
      name: "FILE1.DAT;1",
    });

    const dir1 = makeDirRecord({
      extent: 200,
      size: 2048,
      flags: 0x02,
      name: "SUBDIR",
    });

    const dirData = Buffer.concat([dot, dotdot, file1, dir1]);
    const files = parseDirectory(dirData, dirData.length);

    expect(files).toHaveLength(2);
    expect(files[0]).toEqual({
      name: "FILE1.DAT",
      sector: 100,
      size: 4096,
      isDir: false,
    });
    expect(files[1]).toEqual({
      name: "SUBDIR",
      sector: 200,
      size: 2048,
      isDir: true,
    });
  });

  it("handles sector-boundary skip when recordLen is 0", () => {
    const file1 = makeDirRecord({
      extent: 10,
      size: 100,
      flags: 0,
      name: "A.TXT;1",
    });

    // Place file1 near end of first sector so next record would cross boundary
    const dirData = Buffer.alloc(SECTOR_DATA_SIZE * 2);
    file1.copy(dirData, 0);
    // Zero byte at file1.length signals end-of-sector padding

    const file2 = makeDirRecord({
      extent: 20,
      size: 200,
      flags: 0,
      name: "B.TXT;1",
    });
    file2.copy(dirData, SECTOR_DATA_SIZE); // start of second sector

    const files = parseDirectory(dirData, SECTOR_DATA_SIZE + file2.length);

    expect(files).toHaveLength(2);
    expect(files[0]?.name).toBe("A.TXT");
    expect(files[1]?.name).toBe("B.TXT");
  });

  it("returns empty array for empty directory data", () => {
    const dirData = Buffer.alloc(SECTOR_DATA_SIZE);
    const files = parseDirectory(dirData, SECTOR_DATA_SIZE);
    expect(files).toEqual([]);
  });
});

describe("detectDiscFormat", () => {
  /** Build a minimal disc with a PVD containing "CD001" at sector 16. */
  function makeDiscWithPvd(fmt: { sectorSize: number; dataOffset: number }): Buffer {
    const minSize = 17 * fmt.sectorSize + fmt.dataOffset + SECTOR_DATA_SIZE;
    const buf = Buffer.alloc(minSize);
    // Write "CD001" at PVD offset + 1 (ISO 9660 standard)
    const pvdStart = 16 * fmt.sectorSize + fmt.dataOffset;
    buf.write("CD001", pvdStart + 1, "ascii");
    return buf;
  }

  it("detects MODE2/2352 format", () => {
    const disc = makeDiscWithPvd(MODE2_2352);
    expect(detectDiscFormat(disc)).toEqual(MODE2_2352);
  });

  it("detects MODE1/2048 format", () => {
    const disc = makeDiscWithPvd(MODE1_2048);
    expect(detectDiscFormat(disc)).toEqual(MODE1_2048);
  });

  it("throws for unrecognized format", () => {
    const disc = Buffer.alloc(100_000);
    expect(() => detectDiscFormat(disc)).toThrow("Cannot detect disc format");
  });
});

describe("readSector with MODE1/2048", () => {
  /** Build a MODE1/2048 disc from raw 2048-byte sectors. */
  function makeIsoDisc(sectors: Buffer[]): Buffer {
    return Buffer.concat(
      sectors.map((s) => {
        const sec = Buffer.alloc(SECTOR_DATA_SIZE);
        s.copy(sec);
        return sec;
      }),
    );
  }

  it("reads sectors from a MODE1/2048 disc", () => {
    const data0 = Buffer.alloc(SECTOR_DATA_SIZE, 0xaa);
    const data1 = Buffer.alloc(SECTOR_DATA_SIZE, 0xbb);
    const disc = makeIsoDisc([data0, data1]);

    const result = readSector(disc, 0, MODE1_2048);
    expect(result[0]).toBe(0xaa);

    const result1 = readSector(disc, 1, MODE1_2048);
    expect(result1[0]).toBe(0xbb);
  });

  it("readSectors concatenates MODE1/2048 sectors", () => {
    const data0 = Buffer.alloc(SECTOR_DATA_SIZE, 0x11);
    const data1 = Buffer.alloc(SECTOR_DATA_SIZE, 0x22);
    const disc = makeIsoDisc([data0, data1]);

    const result = readSectors(disc, 0, 2, MODE1_2048);
    expect(result.length).toBe(2 * SECTOR_DATA_SIZE);
    expect(result[0]).toBe(0x11);
    expect(result[SECTOR_DATA_SIZE]).toBe(0x22);
  });
});
