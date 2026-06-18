import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { PAL_CHAR_TABLE } from "./extract/char-tables.ts";
import { extractFusions } from "./extract/extract-fusions.ts";
import { loadDiscData } from "./extract/index.ts";
import { SECTOR_DATA_SIZE } from "./extract/iso9660.ts";
import type { WaMrgLayout } from "./extract/types.ts";
import {
  encodeFusionTable,
  getPalFrWordingStatus,
  normalizeFusionTable,
  patchPalFrWordingEntries,
} from "./iso-edit.ts";

const PAL_FR_SERIAL = "SLES_039.48";
const EXE_SECTOR = 21;
const EXE_LOAD_ADDRESS = 0x80010000;
const EXE_TEXT_SIZE = 0x1d0000;
const EXE_SIZE = 0x800 + EXE_TEXT_SIZE;
const WA_MRG_SIZE = 0x29000;

const GLYPH_TABLE_RAM = 0x801d9000;
const RENDERER_CALL_SITE_RAM = 0x80039700;
const RENDERER_HOOK_RAM = 0x80095044;
const RENDERER_ORIGINAL_CALL_WORD = 0x0c00db19;
const RENDERER_DELAY_WORD = 0x00a72824;
const RENDERER_HOOK_CALL_WORD = jalWord(RENDERER_HOOK_RAM);

const NAME_POINTER_TABLE = 0x11000;
const NAME_BLOCK_START = 0x1c005;
const DESC_POINTER_TABLE = 0x0800;
const DESC_BLOCK_START = 0xee19;

const FUSION_TEST_LAYOUT: WaMrgLayout = {
  artworkBlockSize: 0x3800,
  duelistTable: 0,
  equipTable: 0,
  fusionTable: 0,
  starchipTable: 0,
};

describe("fusion table ISO editing", () => {
  test("normalizes, packs, and round-trips fusion triples", () => {
    const normalized = normalizeFusionTable([
      { material1: 7, material2: 2, result: 10 },
      { material1: 2, material2: 7, result: 99 },
      { material1: 1, material2: 3, result: 5 },
      { material1: 1, material2: 300, result: 301 },
    ]);

    expect(normalized).toEqual([
      { material1: 1, material2: 3, result: 5 },
      { material1: 1, material2: 300, result: 301 },
      { material1: 2, material2: 7, result: 10 },
    ]);
    expect(extractFusions(encodeFusionTable(normalized), FUSION_TEST_LAYOUT)).toEqual(normalized);
  });
});

describe("PAL FR ISO editing", () => {
  test("documents the PAL FR runtime glyph table words without the disproven swap", () => {
    withPalFrDisc((disc) => {
      const status = getPalFrWordingStatus(disc);
      expect(status.supported).toBe(true);
      if (!status.supported) return;

      expect(target(status, "œ")).toMatchObject({
        rawByte: 0x3f,
        tableRamAddress: 0x801d90fc,
        fileOffset: 0x1c98fc,
        currentWord: 0x074089e7,
        expectedWord: 0x074089e7,
      });
      expect(target(status, "Œ")).toMatchObject({
        rawByte: 0x69,
        tableRamAddress: 0x801d91a4,
        fileOffset: 0x1c99a4,
        currentWord: 0x059089b2,
        expectedWord: 0x059089b2,
      });
    });
  });

  test("installs the PAL FR oe renderer hook without wording edits", () => {
    withPalFrDisc((disc) => {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;
      expect(before.glyphRenderingPatch.applied).toBe(false);

      const result = patchPalFrWordingEntries(disc, []);
      expect(result.backup).not.toBeNull();
      expect(result.glyphRenderingPatch).toMatchObject({ applied: true, changed: true });

      const after = getPalFrWordingStatus(disc);
      expect(after.supported).toBe(true);
      if (!after.supported) return;
      expect(after.glyphRenderingPatch.applied).toBe(true);
      expect(target(after, "œ").currentWord).toBe(0x074089e7);
      expect(target(after, "Œ").currentWord).toBe(0x059089b2);

      const { slus } = loadDiscData(disc);
      expect(readExeWord(slus, 0x80039700)).toBe(RENDERER_HOOK_CALL_WORD);
      expect(readExeWord(slus, 0x80039704)).toBe(RENDERER_DELAY_WORD);
      expect(readExeWord(slus, 0x80095044)).toBe(0x27bdffe0);
      expect(readExeWord(slus, 0x80095090)).toBe(0x2406826e);
      expect(readExeWord(slus, 0x800950e4)).toBe(0xa7270000);
    });
  });

  test("exposes only C-backed PAL FR card wording tables", () => {
    withPalFrDisc((disc) => {
      const status = getPalFrWordingStatus(disc);
      expect(status.supported).toBe(true);
      if (!status.supported) return;

      expect(status.entries).toHaveLength(1444);
      expect(status.entries.filter((entry) => entry.kind === "cardName")).toHaveLength(722);
      expect(status.entries.filter((entry) => entry.kind === "cardDescription")).toHaveLength(722);
      expect(status.entries.some((entry) => (entry.kind as string) === "script")).toBe(false);
    });
  });

  test("keeps the French card-name table split even when source names are reversed", () => {
    withPalFrDisc((disc) => {
      const status = getPalFrWordingStatus(disc);
      expect(status.supported).toBe(true);
      if (!status.supported) return;

      expect(cardName(status, 721)?.text).toBe("Magicien Noir du Chaos");
      expect(cardDescription(status, 721)?.text).toBe("Description Alpha");
      expect(cardName(status, 722)?.text).toBe("Rituel de la Magie Noire");
      expect(cardDescription(status, 722)?.text).toBe("Description Beta");
    });
  });

  test("rebuilds the PAL FR card-name pool without preserving stale offsets", () => {
    withPalFrDisc((disc) => {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const first = cardName(before, 1);
      const second = cardName(before, 2);
      const third = cardName(before, 3);
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(third).toBeDefined();
      if (!first || !second || !third) return;
      expect(first.id).toBe("pal-fr:cardName:0");

      expect(second.maxByteLength).toBeLessThan("Elfe Mystique Renommee".length);

      patchPalFrWordingEntries(disc, [
        { entryId: first.id, text: "Truc aux Yeux Bleus" },
        { entryId: second.id, text: "Elfe Mystique Renommee" },
        { entryId: third.id, text: "Hitotsu" },
      ]);

      const after = getPalFrWordingStatus(disc);
      expect(after.supported).toBe(true);
      if (!after.supported) return;
      const afterFirst = cardName(after, 1);
      const afterSecond = cardName(after, 2);
      const afterThird = cardName(after, 3);
      expect(afterFirst?.id).toBe("pal-fr:cardName:0");
      expect(afterFirst?.text).toBe("Truc aux Yeux Bleus");
      expect(afterSecond?.text).toBe("Elfe Mystique Renommee");
      expect(afterThird?.text).toBe("Hitotsu");
      expect(afterFirst?.offset).toBe(first.offset);
      expect(afterSecond?.offset).toBe(first.offset + (afterFirst?.byteLength ?? 0) + 1);
      expect(afterThird?.offset).toBe(
        (afterSecond?.offset ?? 0) + (afterSecond?.byteLength ?? 0) + 1,
      );
      expect(afterSecond?.offset).not.toBe(second.offset);
      expect(afterSecond?.byteLength).toBeGreaterThan(second.maxByteLength);

      const { waMrg } = loadDiscData(disc);
      if (!afterFirst) return;
      expect(waMrg[afterFirst.offset + afterFirst.byteLength]).toBe(0xff);
      expect(waMrg.readUInt16LE(NAME_POINTER_TABLE + 2)).toBe(
        (afterFirst.offset & 0xffff) - 0x6000,
      );
      expect(waMrg.readUInt16LE(NAME_POINTER_TABLE + 4)).toBe(
        ((afterSecond?.offset ?? 0) & 0xffff) - 0x6000,
      );
      expect(waMrg.readUInt16LE(NAME_POINTER_TABLE + 4)).not.toBe(
        (second.offset & 0xffff) - 0x6000,
      );
    });
  });

  test("allows PAL FR card names to use trailing text-block padding", () => {
    withPalFrDisc((disc) => {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const fourth = cardName(before, 4);
      expect(fourth?.text).toBe("Bebe D");
      if (!fourth) return;

      patchPalFrWordingEntries(disc, [{ entryId: fourth.id, text: "Bebe Drago" }]);

      const after = getPalFrWordingStatus(disc);
      expect(after.supported).toBe(true);
      if (!after.supported) return;
      expect(cardName(after, 4)?.text).toBe("Bebe Drago");

      const { waMrg } = loadDiscData(disc);
      const afterFourth = cardName(after, 4);
      expect(waMrg.readUInt16LE(NAME_POINTER_TABLE + 2 + 3 * 2)).toBe(
        ((afterFourth?.offset ?? 0) & 0xffff) - 0x6000,
      );
    });
  });

  test("rejects PAL FR wording replacements that exceed the in-game text block", () => {
    withPalFrDisc((disc) => {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const first = cardName(before, 1);
      expect(first).toBeDefined();
      if (!first) return;

      expect(() =>
        patchPalFrWordingEntries(disc, [
          { entryId: first.id, text: "Dragon Blanc aux Yeux Bleus" },
          { entryId: "pal-fr:cardName:1", text: "Elfe Mystique Renommee" },
          { entryId: "pal-fr:cardName:2", text: "Magicien Noir du Chaos" },
          { entryId: "pal-fr:cardName:3", text: "Rituel de la Magie Noire" },
        ]),
      ).toThrow(/in-game text block/);
    });
  });
});

function withPalFrDisc(run: (discPath: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), "yfm3-pal-fr-unit-"));
  const disc = join(dir, "pal-fr.iso");
  writeFileSync(disc, makePalFrDiscImage());
  try {
    run(disc);
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
}

function target(
  status: Extract<ReturnType<typeof getPalFrWordingStatus>, { supported: true }>,
  label: string,
) {
  const found = status.glyphRenderingPatch.targets.find((candidate) => candidate.label === label);
  if (!found) throw new Error(`Missing glyph patch target: ${label}`);
  return found;
}

function cardName(
  status: Extract<ReturnType<typeof getPalFrWordingStatus>, { supported: true }>,
  cardId: number,
) {
  return status.entries.find(
    (entry) => entry.kind === "cardName" && entry.entryIndex === cardId - 1,
  );
}

function cardDescription(
  status: Extract<ReturnType<typeof getPalFrWordingStatus>, { supported: true }>,
  cardId: number,
) {
  return status.entries.find(
    (entry) => entry.kind === "cardDescription" && entry.entryIndex === cardId + 1,
  );
}

function makePalFrDiscImage(): Buffer {
  const rootSector = 20;
  const dataSector = EXE_SECTOR + Math.ceil(EXE_SIZE / SECTOR_DATA_SIZE) + 1;
  const waMrgSector = dataSector + 1;
  const image = Buffer.alloc(
    (waMrgSector + Math.ceil(WA_MRG_SIZE / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectoryWithData(image, rootSector, dataSector);
  writeDirRecord(image, dataSector * SECTOR_DATA_SIZE, {
    extent: waMrgSector,
    size: WA_MRG_SIZE,
    flags: 0,
    name: "WA_MRG.MRG;1",
  });

  makePalFrExe().copy(image, EXE_SECTOR * SECTOR_DATA_SIZE);
  makePalFrWaMrg().copy(image, waMrgSector * SECTOR_DATA_SIZE);
  return image;
}

function makePalFrExe(): Buffer {
  const exe = Buffer.alloc(EXE_SIZE);
  exe.write("PS-X EXE", 0, "ascii");
  exe.writeUInt32LE(EXE_LOAD_ADDRESS, 0x18);
  exe.writeUInt32LE(EXE_TEXT_SIZE, 0x1c);

  writeExeWord(exe, RENDERER_CALL_SITE_RAM, RENDERER_ORIGINAL_CALL_WORD);
  writeExeWord(exe, RENDERER_CALL_SITE_RAM + 4, RENDERER_DELAY_WORD);
  writeExeWord(exe, GLYPH_TABLE_RAM + 0x3f * 4, 0x074089e7);
  writeExeWord(exe, GLYPH_TABLE_RAM + 0x3e * 4, 0x075089ce);
  writeExeWord(exe, GLYPH_TABLE_RAM + 0x69 * 4, 0x059089b2);
  writeExeWord(exe, GLYPH_TABLE_RAM + 0x6d * 4, 0x05a089b4);
  return exe;
}

function makePalFrWaMrg(): Buffer {
  const waMrg = Buffer.alloc(WA_MRG_SIZE, 0xff);
  seedDummyTextBlock(waMrg);

  const descOffsets = writeStringBlock(waMrg, DESC_BLOCK_START, makeDescriptions(), 48);
  const nameOffsets = writeStringBlock(waMrg, NAME_BLOCK_START, makeNames(), 48);
  writePointerTable(waMrg, 0x0400, 0x2618, 0x2619, [0x2619, 0x2620]);
  writePointerTable(
    waMrg,
    DESC_POINTER_TABLE,
    0x2618,
    0x2619,
    offsetsToValues(descOffsets, 0, 0xc800),
  );
  writePointerTable(waMrg, 0x1000, 0x6004, 0x6005, [0x6005, 0x6009]);
  writePointerTable(
    waMrg,
    NAME_POINTER_TABLE,
    0x6004,
    0x6005,
    offsetsToValues(nameOffsets, 0x10000, 0x6000),
  );
  return waMrg;
}

function makeNames(): string[] {
  const names = Array.from({ length: 722 }, () => "Nom");
  names[0] = "Dragon";
  names[1] = "Elfe";
  names[2] = "Mage";
  names[3] = "Bebe D";
  names[720] = "Magicien Noir du Chaos";
  names[721] = "Rituel de la Magie Noire";
  return names;
}

function makeDescriptions(): string[] {
  const descriptions = Array.from({ length: 722 }, () => "Description");
  descriptions[0] = "{31 f8 03 8c f8 1b 80}";
  descriptions[722 - 1] = "Description Beta";
  descriptions[721 - 1] = "Description Alpha";
  return descriptions;
}

function seedDummyTextBlock(waMrg: Buffer): void {
  const desc = ["{31 f8 03 8c f8 1b 80}", ...Array.from({ length: 721 }, () => "Dummy")];
  const names = Array.from({ length: 722 }, () => "Dummy");
  writeStringBlock(waMrg, 0x3000, desc, 100);
  writeStringBlock(waMrg, 0x9000, names, 100);
}

function writeStringBlock(
  buf: Buffer,
  start: number,
  strings: readonly string[],
  paddingBytes: number,
): number[] {
  const offsets: number[] = [];
  let pos = start;
  for (const text of strings) {
    offsets.push(pos);
    const encoded = encodeFixtureText(text);
    encoded.copy(buf, pos);
    pos += encoded.length;
    buf[pos] = 0xff;
    pos++;
  }
  buf.fill(0xff, pos, pos + paddingBytes);
  pos += paddingBytes;
  for (let i = strings.length; i < 800; i++) {
    const encoded = encodeFixtureText("Filler");
    encoded.copy(buf, pos);
    pos += encoded.length;
    buf[pos] = 0xff;
    pos++;
  }
  return offsets;
}

function writePointerTable(
  buf: Buffer,
  offset: number,
  firstPrefix: number,
  secondPrefix: number,
  values: readonly number[],
): void {
  buf.writeUInt16LE(firstPrefix, offset);
  buf.writeUInt16LE(secondPrefix, offset + 2);
  for (let i = 0; i < values.length; i++) {
    buf.writeUInt16LE(values[i] ?? 0, offset + 2 + i * 2);
  }
}

function offsetsToValues(
  offsets: readonly number[],
  offsetBase: number,
  valueBase: number,
): number[] {
  return offsets.map((offset) => offset - offsetBase - valueBase);
}

function encodeFixtureText(text: string): Buffer {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      const close = text.indexOf("}", i + 1);
      if (close !== -1) {
        bytes.push(
          ...text
            .slice(i + 1, close)
            .trim()
            .split(/\s+/)
            .map((part) => Number.parseInt(part, 16)),
        );
        i = close;
        continue;
      }
    }
    const byte = PAL_CHAR_TABLE.indexOf(text[i] ?? "");
    if (byte < 0) throw new Error(`Fixture text cannot encode "${text[i]}" in "${text}"`);
    bytes.push(byte);
  }
  return Buffer.from(bytes);
}

function writePrimaryVolumeDescriptor(image: Buffer, rootSector: number): void {
  const pvd = 16 * SECTOR_DATA_SIZE;
  image[pvd] = 1;
  image.write("CD001", pvd + 1, "ascii");
  image[pvd + 6] = 1;
  writeDirRecord(image, pvd + 156, {
    extent: rootSector,
    size: SECTOR_DATA_SIZE,
    flags: 0x02,
    name: "\x00",
  });
}

function writeRootDirectoryWithData(image: Buffer, rootSector: number, dataSector: number): void {
  let offset = rootSector * SECTOR_DATA_SIZE;
  writeDirRecord(image, offset, {
    extent: EXE_SECTOR,
    size: EXE_SIZE,
    flags: 0,
    name: `${PAL_FR_SERIAL};1`,
  });
  offset += image[offset] ?? 0;
  writeDirRecord(image, offset, {
    extent: dataSector,
    size: SECTOR_DATA_SIZE,
    flags: 0x02,
    name: "DATA",
  });
}

function writeDirRecord(
  image: Buffer,
  offset: number,
  entry: { extent: number; size: number; flags: number; name: string },
): void {
  const nameBytes = Buffer.from(entry.name, "ascii");
  const len = 33 + nameBytes.length + (nameBytes.length % 2 === 0 ? 1 : 0);
  image[offset] = len;
  image[offset + 1] = 0;
  image.writeUInt32LE(entry.extent, offset + 2);
  image.writeUInt32BE(entry.extent, offset + 6);
  image.writeUInt32LE(entry.size, offset + 10);
  image.writeUInt32BE(entry.size, offset + 14);
  image[offset + 25] = entry.flags;
  image[offset + 28] = 1;
  image[offset + 32] = nameBytes.length;
  nameBytes.copy(image, offset + 33);
}

function writeExeWord(exe: Buffer, ramAddress: number, value: number): void {
  exe.writeUInt32LE(value, exeOffset(ramAddress));
}

function readExeWord(slus: Buffer, ramAddress: number): number {
  const loadAddress = slus.readUInt32LE(0x18);
  return slus.readUInt32LE(0x800 + (ramAddress - loadAddress));
}

function exeOffset(ramAddress: number): number {
  return 0x800 + (ramAddress - EXE_LOAD_ADDRESS);
}

function jalWord(target: number): number {
  return 0x0c000000 | ((target >>> 2) & 0x03ffffff);
}
