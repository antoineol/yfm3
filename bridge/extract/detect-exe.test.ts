import { describe, expect, it } from "vitest";
import { cardTypes, guardianStars } from "../../src/engine/data/rp-types.ts";
import { CHAR_TABLE } from "./char-tables.ts";
import {
  detectActiveExeLayout,
  detectAttributeMapping,
  detectDiscExeLayout,
  parsePsxExeHeader,
} from "./detect-exe.ts";
import type { ExeLayout } from "./types.ts";

describe("parsePsxExeHeader", () => {
  function makeExeHeader(loadAddr: number, textSize: number): Buffer {
    const buf = Buffer.alloc(0x800);
    buf.write("PS-X EXE", 0, "ascii");
    buf.writeUInt32LE(loadAddr, 0x18);
    buf.writeUInt32LE(textSize, 0x1c);
    return buf;
  }

  it("parses valid PS-X EXE header", () => {
    const exe = makeExeHeader(0x80010000, 0x100000);
    const header = parsePsxExeHeader(exe);
    expect(header.loadAddr).toBe(0x80010000);
    expect(header.textSize).toBe(0x100000);
  });

  it("throws on buffer too small", () => {
    const tiny = Buffer.alloc(10);
    expect(() => parsePsxExeHeader(tiny)).toThrow("too small");
  });

  it("throws on invalid magic", () => {
    const buf = Buffer.alloc(0x800);
    buf.write("NOT-A-EXE", 0, "ascii");
    expect(() => parsePsxExeHeader(buf)).toThrow("Not a PS-X EXE");
  });
});

describe("detectActiveExeLayout", () => {
  it("selects the card stats table that matches live RAM and detects its name tables", () => {
    const exe = makeExeWithTwoCardStatTables();
    const expected = exe.subarray(0x2000, 0x2000 + 722 * 4);

    const layout = detectActiveExeLayout(exe, { cardStats: expected });

    expect(layout.cardStats).toBe(0x2000);
    expect(layout.typeNamesTable).toBe(0x7000);
    expect(layout.gsNamesTable).toBeGreaterThan(0x7000);
  });

  it("throws instead of guessing when no candidate matches live RAM", () => {
    const exe = makeExeWithTwoCardStatTables();
    const unknownStats = Buffer.alloc(722 * 4, 0xff);

    expect(() => detectActiveExeLayout(exe, { cardStats: unknownStats })).toThrow(
      "Could not locate active card stats table",
    );
  });
});

describe("detectDiscExeLayout", () => {
  it("is the explicit best-effort path for offline disc-only extraction", () => {
    const exe = makeExeWithTwoCardStatTables();

    const layout = detectDiscExeLayout(exe);

    expect(layout.cardStats).toBe(0x1000);
  });
});

describe("detectAttributeMapping", () => {
  const defaultLayout: ExeLayout = {
    cardStats: 0,
    levelAttr: 0,
    nameOffsetTable: -1,
    textPoolBase: -1,
    descOffsetTable: -1,
    descTextPoolBase: -1,
    duelistNames: -1,
    typeNamesTable: -1,
    gsNamesTable: -1,
  };

  it("returns default mapping when nameOffsetTable is -1", () => {
    const exe = Buffer.alloc(0x1000);
    const mapping = detectAttributeMapping(exe, defaultLayout);
    expect(mapping).toEqual({
      0: "Light",
      1: "Dark",
      2: "Earth",
      3: "Water",
      4: "Fire",
      5: "Wind",
    });
  });

  it("keeps PAL attributes canonical when PAL text is loaded from WA_MRG", () => {
    const exe = Buffer.alloc(0x1000);
    const mapping = detectAttributeMapping(exe, defaultLayout, 1);
    expect(mapping[0]).toBe("Light");
    expect(mapping[1]).toBe("Dark");
    expect(mapping[4]).toBe("Fire");
  });

  it("returns RP mapping when color prefix {F8 0A XX} is found", () => {
    // Build a synthetic EXE with name offset table and text pool
    const nameOffsetTable = 0x100;
    const textPoolBase = 0x400;
    const exe = Buffer.alloc(0x800);

    // Write offset 0 for card 0 in the name offset table
    exe.writeUInt16LE(0, nameOffsetTable);
    // Write color prefix at text pool base
    exe[textPoolBase] = 0xf8;
    exe[textPoolBase + 1] = 0x0a;
    exe[textPoolBase + 2] = 0x01; // yellow

    const layout: ExeLayout = {
      ...defaultLayout,
      nameOffsetTable,
      textPoolBase,
    };
    const mapping = detectAttributeMapping(exe, layout);
    expect(mapping).toEqual({
      0: "",
      1: "Light",
      2: "Dark",
      3: "Water",
      4: "Fire",
      5: "Earth",
      6: "Wind",
    });
  });

  it("returns vanilla mapping when no color prefix found", () => {
    const nameOffsetTable = 0x100;
    const textPoolBase = 0x400;
    const exe = Buffer.alloc(0x800);

    // Write offset 0 for first 100 cards
    for (let i = 0; i < 100; i++) {
      exe.writeUInt16LE(i * 5, nameOffsetTable + i * 2);
    }
    // No F8 0A prefix at any of those positions

    const layout: ExeLayout = {
      ...defaultLayout,
      nameOffsetTable,
      textPoolBase,
    };
    const mapping = detectAttributeMapping(exe, layout);
    expect(mapping).toEqual({
      0: "Light",
      1: "Dark",
      2: "Earth",
      3: "Water",
      4: "Fire",
      5: "Wind",
    });
  });
});

function makeExeWithTwoCardStatTables(): Buffer {
  const exe = Buffer.alloc(0x9000);
  exe.write("PS-X EXE", 0, "ascii");
  exe.writeUInt32LE(0x80010000, 0x18);
  exe.writeUInt32LE(0x8800, 0x1c);

  writeCardStatsTable(exe, 0x1000, 21);
  writeLevelAttrTable(exe, 0x3000);

  writeCardStatsTable(exe, 0x2000, 1);
  writeLevelAttrTable(exe, 0x4000);

  let pos = 0x7000;
  for (const name of [...cardTypes, ...guardianStars.slice(1)]) {
    pos = writeTblString(exe, pos, name);
  }

  return exe;
}

function writeCardStatsTable(exe: Buffer, offset: number, card2Type: number): void {
  for (let i = 0; i < 722; i++) {
    const type = i >= 600 ? 20 : 0;
    const atk = i >= 600 ? 0 : 100;
    const def = i >= 600 ? 0 : 100;
    exe.writeUInt32LE(encodeCardStat(atk, def, type), offset + i * 4);
  }
  exe.writeUInt32LE(encodeCardStat(80, 200, card2Type), offset + 4);
}

function writeLevelAttrTable(exe: Buffer, offset: number): void {
  for (let i = 0; i < 722; i++) exe[offset + i] = i >= 600 ? 0 : 4;
}

function encodeCardStat(atk10: number, def10: number, type: number): number {
  return atk10 | (def10 << 9) | (1 << 18) | (1 << 22) | (type << 26);
}

function writeTblString(exe: Buffer, offset: number, value: string): number {
  for (let i = 0; i < value.length; i++) {
    const b = CHAR_TABLE.indexOf(value[i] ?? "");
    if (b === -1) throw new Error(`Missing TBL char ${value[i]}`);
    exe[offset + i] = b;
  }
  exe[offset + value.length] = 0xff;
  return offset + value.length + 1;
}
