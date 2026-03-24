import { describe, expect, it } from "vitest";
import { detectAttributeMapping, parsePsxExeHeader } from "./detect-exe.ts";
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

describe("detectAttributeMapping", () => {
  const defaultLayout: ExeLayout = {
    cardStats: 0,
    levelAttr: 0,
    nameOffsetTable: -1,
    textPoolBase: -1,
    descOffsetTable: -1,
    descTextPoolBase: -1,
    duelistNames: -1,
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
