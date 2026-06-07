import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test as baseTest, describe, expect } from "vitest";
import { findAllWaMrgTextBlocks } from "./extract/detect-wamrg-text.ts";
import { loadDiscData } from "./extract/index.ts";
import {
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./extract/iso9660.ts";
import { discOffset } from "./extract/write-iso.ts";
import { getPalFrWordingStatus, patchPalFrWordingEntries } from "./iso-edit.ts";

const PAL_FR_DISC =
  process.env.YFM3_PAL_FR_DISC ??
  "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Vanilla/Yu-Gi-Oh! Forbidden Memories (France).bin";
const test = existsSync(PAL_FR_DISC) ? baseTest : baseTest.skip;

describe("PAL FR ISO editing", () => {
  test("documents the PAL FR runtime glyph table words without the disproven swap", () => {
    const status = getPalFrWordingStatus(PAL_FR_DISC);
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
  }, 45000);

  test("installs the PAL FR oe renderer hook without wording edits", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-pal-fr-renderer-"));
    const disc = join(dir, "pal-fr.bin");
    copyFileSync(PAL_FR_DISC, disc);
    try {
      resetPalFrRendererPatch(disc);
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
      expect(readExeWord(slus, 0x80039700)).toBe(0x0c025411);
      expect(readExeWord(slus, 0x80039704)).toBe(0x00a72824);
      expect(readExeWord(slus, 0x80095044)).toBe(0x27bdffe0);
      expect(readExeWord(slus, 0x80095090)).toBe(0x2406826e);
      expect(readExeWord(slus, 0x800950e4)).toBe(0xa7270000);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  }, 45000);

  test("exposes only C-backed PAL FR card wording tables", () => {
    const status = getPalFrWordingStatus(PAL_FR_DISC);
    expect(status.supported).toBe(true);
    if (!status.supported) return;

    expect(status.entries).toHaveLength(1444);
    expect(status.entries.filter((entry) => entry.kind === "cardName")).toHaveLength(722);
    expect(status.entries.filter((entry) => entry.kind === "cardDescription")).toHaveLength(722);
    expect(status.entries.some((entry) => (entry.kind as string) === "script")).toBe(false);
  }, 15000);

  test("keeps the French card-name table split even when source names are reversed", () => {
    const status = getPalFrWordingStatus(PAL_FR_DISC);
    expect(status.supported).toBe(true);
    if (!status.supported) return;

    expect(cardName(status, 721)?.text).toBe("Magicien Noir du Chaos");
    expect(cardDescription(status, 721)?.text).toContain("Cérémonie");
    expect(cardName(status, 722)?.text).toBe("Rituel de la Magie Noire");
    expect(cardDescription(status, 722)?.text).toContain("Magicien suprême");
  }, 15000);

  test("rebuilds the PAL FR card-name pool without preserving stale offsets", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-pal-fr-wording-"));
    const disc = join(dir, "pal-fr.bin");
    copyFileSync(PAL_FR_DISC, disc);
    try {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const first = cardName(before, 1);
      const second = cardName(before, 2);
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      const third = cardName(before, 3);
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
      const pointerTable = findFrNamePointerTable(waMrg);
      expect(waMrg.readUInt16LE(pointerTable + 2)).toBe((afterFirst.offset & 0xffff) - 0x6000);
      expect(waMrg.readUInt16LE(pointerTable + 4)).toBe(
        ((afterSecond?.offset ?? 0) & 0xffff) - 0x6000,
      );
      expect(waMrg.readUInt16LE(pointerTable + 4)).not.toBe((second.offset & 0xffff) - 0x6000);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  }, 45000);

  test("allows PAL FR card names to use trailing text-block padding", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-pal-fr-wording-"));
    const disc = join(dir, "pal-fr.bin");
    copyFileSync(PAL_FR_DISC, disc);
    try {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const fourth = cardName(before, 4);
      expect(fourth?.text).toBe("Bébé D.");
      if (!fourth) return;

      patchPalFrWordingEntries(disc, [{ entryId: fourth.id, text: "Bébé Drago" }]);

      const after = getPalFrWordingStatus(disc);
      expect(after.supported).toBe(true);
      if (!after.supported) return;
      expect(cardName(after, 4)?.text).toBe("Bébé Drago");

      const { waMrg } = loadDiscData(disc);
      const pointerTable = findFrNamePointerTable(waMrg);
      const afterFourth = cardName(after, 4);
      expect(waMrg.readUInt16LE(pointerTable + 2 + 3 * 2)).toBe(
        ((afterFourth?.offset ?? 0) & 0xffff) - 0x6000,
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  }, 45000);

  test("rejects PAL FR wording replacements that exceed the in-game text block", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-pal-fr-wording-"));
    const disc = join(dir, "pal-fr.bin");
    copyFileSync(PAL_FR_DISC, disc);
    try {
      const before = getPalFrWordingStatus(disc);
      expect(before.supported).toBe(true);
      if (!before.supported) return;

      const first = cardName(before, 1);
      expect(first).toBeDefined();
      if (!first) return;

      expect(() =>
        patchPalFrWordingEntries(disc, [
          { entryId: first.id, text: "Dragon Blanc aux Yeux Bleus" },
        ]),
      ).toThrow(/in-game text block/);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  }, 45000);
});

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

function findFrNamePointerTable(waMrg: Buffer): number {
  const textBlock = findAllWaMrgTextBlocks(waMrg)[1];
  if (!textBlock) throw new Error("Missing PAL FR text block");
  const pattern = Buffer.from([0x04, 0x60, 0x05, 0x60]);
  let best = -1;
  let pos = waMrg.indexOf(pattern);
  while (pos !== -1 && pos < textBlock.nameBlockStart) {
    best = pos;
    pos = waMrg.indexOf(pattern, pos + 1);
  }
  if (best === -1) throw new Error("Missing PAL FR name pointer table");
  return best;
}

function resetPalFrRendererPatch(discPath: string): void {
  const bin = readFileSync(discPath);
  const fmt = detectDiscFormat(bin);
  const pvd = readSectors(bin, PVD_SECTOR, 1, fmt);
  const rootRecord = pvd.subarray(156, 190);
  const rootData = readSectors(
    bin,
    rootRecord.readUInt32LE(2),
    Math.ceil(rootRecord.readUInt32LE(10) / SECTOR_DATA_SIZE),
    fmt,
  );
  const exe = parseDirectory(rootData, rootRecord.readUInt32LE(10)).find(
    (file) => file.name === "SLES_039.48",
  );
  if (!exe) throw new Error("Missing SLES_039.48");
  writeIsoWord(bin, exe.sector, 0x29f00, 0x0c00db19, fmt);
  writeIsoWord(bin, exe.sector, 0x29f04, 0x00a72824, fmt);
  for (let i = 0; i < 70; i++) writeIsoWord(bin, exe.sector, 0x85844 + i * 4, 0, fmt);
  writeFileSync(discPath, bin);
}

function writeIsoWord(
  bin: Buffer,
  sector: number,
  fileOffset: number,
  value: number,
  fmt: ReturnType<typeof detectDiscFormat>,
): void {
  for (let i = 0; i < 4; i++) {
    bin[discOffset(sector, fileOffset + i, fmt)] = (value >>> (i * 8)) & 0xff;
  }
}

function readExeWord(slus: Buffer, ramAddress: number): number {
  const loadAddress = slus.readUInt32LE(0x18);
  return slus.readUInt32LE(0x800 + (ramAddress - loadAddress));
}
