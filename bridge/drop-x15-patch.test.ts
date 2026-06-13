import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { inspectDropX15Image, patchDropX15DiscInPlace } from "./drop-x15-patch.ts";
import { SECTOR_DATA_SIZE } from "./extract/iso9660.ts";

const GENERAL_DROP_COUNTS = [1, 5, 15, 50, 150, 1000] as const;

describe("drop x15 patch inspection", () => {
  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("supports unpatched Ghost/FMR loop-limit %s images", (serial) => {
    const image = makeCommunityGhostLoopDiscImage(serial);
    seedGhostLoopPatterns(image, "vanilla");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "ghost-loop-limits",
      definitionName: "Ghost/FMR loop-limit x5",
      cardDropCount: 5,
      starchipMultiplier: 1,
      availableDropCounts: [...GENERAL_DROP_COUNTS],
      gameSerial: serial,
    });
  });

  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("patches %s executables in place", (serial) => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeCommunityGhostLoopDiscImage(serial);
    seedGhostLoopPatterns(image, "vanilla");
    writeFileSync(discPath, image);

    try {
      const result = patchDropX15DiscInPlace(discPath, 15);

      expect(result.changed).toBe(true);
      expect(result.status.enabled).toBe(true);
      expect(inspectDropX15Image(readFileSync(discPath))).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("recognizes the common Ghost state with one stale vanilla copy and seven patched copies", () => {
    const image = makeDiscImage("SLUS_014.11", false);
    seedGhostLoopPatterns(image, "vanilla", 1);
    seedGhostLoopPatterns(image, "patched", 7);
    seedStarchipAward(image, 21, 0x126d4, "patched");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: true,
      definitionId: "ghost-loop-limits",
      definitionName: "Ghost/FMR loop-limit x15",
      cardDropCount: 15,
      starchipMultiplier: 15,
      availableDropCounts: [...GENERAL_DROP_COUNTS],
      gameSerial: "SLUS_014.11",
    });
  });

  test("normalizes the community RP x15 loop-limit image before applying x1000", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeCommunityGhostLoopDiscImage("SLUS_014.11");
    seedGhostLoopPatterns(image, "vanilla", 1, 0);
    seedGhostLoopPatterns(image, "patched", 7, 1);
    writeFileSync(discPath, image);

    try {
      expect(inspectDropX15Image(image)).toMatchObject({
        supported: true,
        enabled: false,
        definitionId: "ghost-loop-limits",
        cardDropCount: 15,
        starchipMultiplier: 1,
        availableDropCounts: [...GENERAL_DROP_COUNTS],
      });

      const result = patchDropX15DiscInPlace(discPath, 1000);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });
      expect(inspectDropX15Image(patched)).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });
      expect(
        patched.subarray(21 * SECTOR_DATA_SIZE + 0x19b440, 21 * SECTOR_DATA_SIZE + 0x19b448),
      ).toEqual(Buffer.from("1B001D3C00B0BD27", "hex"));
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b550)).toBe(0x2484b000);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b5d0)).toBe(0x2442b000);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x12508)).toBe(0x0806abb8);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x1250c)).toBe(0);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b6e0)).toBe(0x2402000f);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b6e4)).toBe(0x08008744);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b6e8)).toBe(0);
      expect(patched.readUInt16LE(21 * SECTOR_DATA_SIZE + 0x19b478)).toBe(1001);
      expect(patched.readUInt16LE(21 * SECTOR_DATA_SIZE + 0x19b574)).toBe(1001);
      expect(patched.readUInt16LE(21 * SECTOR_DATA_SIZE + 0x19b5ec)).toBe(1000);
      expect(patched.readUInt16LE(waOffset(0xbc1c78))).toBe(1001);
      expect(patched.readUInt16LE(waOffset(0xbc1d74))).toBe(1001);
      expect(patched.readUInt16LE(waOffset(0xbc1dec))).toBe(1000);
      expect(patched.readUInt32LE(waOffset(0xbc1ee0))).toBe(0x2402000f);
      expect(patched.readUInt32LE(waOffset(0xbc1ee4))).toBe(0x08008744);
      expect(patched.readUInt32LE(waOffset(0xbc1ee8))).toBe(0);
      expect(patched.readUInt16LE(waOffset(0xbc17e4))).toBe(1001);
      expect(executeStarchipSaveUpdate(patched, 0x126d4, 2727, 5)).toBe(7727);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refreshes stale NTSC x1000 images that are missing the result-screen display cap", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeCommunityGhostLoopDiscImage("SLUS_014.11");
    seedGhostLoopPatterns(image, "patched", 7, 1);
    writeFileSync(discPath, image);

    try {
      patchDropX15DiscInPlace(discPath, 1000);
      const stale = readFileSync(discPath);
      Buffer.from("3a00629000000000", "hex").copy(stale, 21 * SECTOR_DATA_SIZE + 0x12508);
      Buffer.alloc(12).copy(stale, 21 * SECTOR_DATA_SIZE + 0x19b6e0);
      for (const base of ntscWaCopyOffsets()) {
        Buffer.alloc(12).copy(stale, waOffset(base + 0x2e0));
      }
      writeFileSync(discPath, stale);

      expect(inspectDropX15Image(stale)).toMatchObject({
        supported: true,
        enabled: false,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });

      const result = patchDropX15DiscInPlace(discPath, 1000);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x12508)).toBe(0x0806abb8);
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b6e0)).toBe(0x2402000f);
      expect(patched.readUInt32LE(waOffset(0xbc1ee0))).toBe(0x2402000f);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("supports the clean Ghost Drop More Cards layout by structure for %s", (serial) => {
    const image = makeGhostToolDiscImage(serial);

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x1",
      cardDropCount: 1,
      starchipMultiplier: 1,
      availableDropCounts: [...GENERAL_DROP_COUNTS],
      gameSerial: serial,
    });
  });

  test("rejects Gold when DATA/WA_MRG.MRG is unavailable", () => {
    const image = makeDiscImage("SLUS_000.04");

    expect(inspectDropX15Image(image)).toMatchObject({
      supported: false,
      enabled: false,
      gameSerial: "SLUS_000.04",
    });
  });

  test("patches Gold with the Ghost Drop More Cards layout and preserves its continuation", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeGhostToolDiscImage("SLUS_000.04", 0x24050101);
    writeFileSync(discPath, image);

    try {
      const result = patchDropX15DiscInPlace(discPath, 15);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
      });
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x1247c)).toBe(0x24050101);
      expect(
        patched.subarray(21 * SECTOR_DATA_SIZE + 0x19b400, 21 * SECTOR_DATA_SIZE + 0x19b410),
      ).toEqual(Buffer.alloc(16));
      expect(
        patched.subarray(21 * SECTOR_DATA_SIZE + 0x19b440, 21 * SECTOR_DATA_SIZE + 0x19b448),
      ).toEqual(Buffer.from("1B001D3C00B0BD27", "hex"));
      expect(patched[waOffset(0xbc1c78)]).toBe(16);
      expect(patched[waOffset(0xbc1d74)]).toBe(16);
      expect(patched[waOffset(0xbc1dec)]).toBe(15);
      expect(patched[waOffset(0xbc17e4)]).toBe(16);
      expectStarchipX15(patched, 21 * SECTOR_DATA_SIZE + 0x126d4);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("supports the verified PAL France Ghost Drop More Cards layout", () => {
    const image = makePalGhostToolDiscImage("SLES_039.48");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x1",
      cardDropCount: 1,
      starchipMultiplier: 1,
      availableDropCounts: [1, 5, 15, 50, 150, 1000],
      gameSerial: "SLES_039.48",
    });
  });

  test("rejects PAL France when the shared text-renderer hook is modified", () => {
    const image = makePalGhostToolDiscImage("SLES_039.48");
    writeBytes(image, 21, 0x28590, "9DAB06080000000000000000");

    expect(inspectDropX15Image(image)).toMatchObject({
      supported: false,
      enabled: false,
      gameSerial: "SLES_039.48",
    });
  });

  test("rejects legacy local trampoline images instead of upgrading them", () => {
    const image = makeDiscImage("SLUS_014.11");
    seedLegacyLocalPatch(image, 21);

    expect(inspectDropX15Image(image)).toEqual({
      supported: false,
      enabled: false,
      gameSerial: "SLUS_014.11",
      reason:
        "This disc has the legacy local x15 trampoline installed. It is no longer treated as safe; use a Ghost/FMR loop-limit x15 image or restore an unpatched backup.",
    });
  });

  test("does not patch legacy local trampoline images", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeDiscImage("SLUS_014.11");
    seedLegacyLocalPatch(image, 21);
    writeFileSync(discPath, image);

    try {
      expect(() => patchDropX15DiscInPlace(discPath)).toThrow(
        "This disc has the legacy local x15 trampoline installed.",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("patches the Ghost Drop More Cards layout in place", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makeGhostToolDiscImage("SLUS_014.11"));

    try {
      const result = patchDropX15DiscInPlace(discPath, 15);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 15,
      });
      expect(inspectDropX15Image(patched)).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 15,
      });
      expect(
        patched.subarray(21 * SECTOR_DATA_SIZE + 0x19b400, 21 * SECTOR_DATA_SIZE + 0x19b410),
      ).toEqual(Buffer.alloc(16));
      expect(
        patched.subarray(21 * SECTOR_DATA_SIZE + 0x19b440, 21 * SECTOR_DATA_SIZE + 0x19b448),
      ).toEqual(Buffer.from("1B001D3C00B0BD27", "hex"));
      expect(patched[waOffset(0xbc1c78)]).toBe(16);
      expect(patched[waOffset(0xbc1d74)]).toBe(16);
      expect(patched[waOffset(0xbc1dec)]).toBe(15);
      expect(patched[waOffset(0xbc17e4)]).toBe(16);
      expectStarchipX15(patched, 21 * SECTOR_DATA_SIZE + 0x126d4);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("patches the PAL France Ghost Drop More Cards layout in place", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);
      const slusBase = 21 * SECTOR_DATA_SIZE;

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expect(inspectDropX15Image(patched)).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expect(patched.subarray(slusBase + 0x120f0, slusBase + 0x120f8)).toEqual(
        Buffer.from("95AB060800000000", "hex"),
      );
      expect(patched.subarray(slusBase + 0x12100, slusBase + 0x12104)).toEqual(
        Buffer.from("00000000", "hex"),
      );
      expect(patched.subarray(slusBase + 0x28590, slusBase + 0x2859c)).toEqual(
        Buffer.from("20048387ACDF000821286200", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b400, slusBase + 0x19b410)).toEqual(Buffer.alloc(16));
      expect(patched.subarray(slusBase + 0x19b440, slusBase + 0x19b448)).toEqual(
        Buffer.from("1B001D3C00B5BD27", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b478, slusBase + 0x19b47c)).toEqual(
        Buffer.from("97001724", "hex"),
      );
      expect(patched.readUInt32LE(slusBase + 0x19b4f4)).toBe(0x97a20022);
      expect(patched.subarray(slusBase + 0x19b550, slusBase + 0x19b554)).toEqual(
        Buffer.from("00B58424", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b574, slusBase + 0x19b578)).toEqual(
        Buffer.from("97001724", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b5d0, slusBase + 0x19b5d4)).toEqual(
        Buffer.from("00B54224", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b5ec, slusBase + 0x19b5f0)).toEqual(
        Buffer.from("96001724", "hex"),
      );
      expect(patched.readUInt32LE(slusBase + 0x19b538)).toBe(0x3c03801c);
      expect(patched.readUInt32LE(slusBase + 0x19b544)).toBe(0x0800874c);
      expect(patched.readUInt32LE(slusBase + 0x19b59c)).toBe(0x0c008654);
      expect(patched.readUInt32LE(slusBase + 0x19b5c4)).toBe(0x080087f6);
      expect(patched.readUInt32LE(slusBase + 0x19b66c)).toBe(0x0800863e);

      for (let copy = 0; copy < 7; copy++) {
        const base = 0xe25400 + copy * 0x78000;
        expect(patched.subarray(waOffset(base + 0x44), waOffset(base + 0x48))).toEqual(
          Buffer.from("00B5BD27", "hex"),
        );
        expect(patched[waOffset(base + 0x78)]).toBe(151);
        expect(patched[waOffset(base + 0x174)]).toBe(151);
        expect(patched[waOffset(base + 0x1ec)]).toBe(150);
        expect(patched.readUInt32LE(waOffset(base + 0xf4))).toBe(0x97a20022);
      }
      expect(patched[waOffset(0xe24fe4)]).toBe(151);
      expect(patched[waOffset(0x116d400)]).toBe(0);
      expectPalStarchipMultiplier(patched, slusBase, 150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("patches the PAL France Ghost Drop More Cards layout to x1000", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      const result = patchDropX15DiscInPlace(discPath, 1000);
      const patched = readFileSync(discPath);
      const slusBase = 21 * SECTOR_DATA_SIZE;

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });
      expect(inspectDropX15Image(patched)).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        cardDropCount: 1000,
        starchipMultiplier: 1000,
      });
      expect(patched.subarray(slusBase + 0x19b478, slusBase + 0x19b47c)).toEqual(
        Buffer.from("E9031724", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b574, slusBase + 0x19b578)).toEqual(
        Buffer.from("E9031724", "hex"),
      );
      expect(patched.subarray(slusBase + 0x19b5ec, slusBase + 0x19b5f0)).toEqual(
        Buffer.from("E8031724", "hex"),
      );
      expectRewardCounterOps(patched, slusBase + 0x19b400);
      for (let copy = 0; copy < 7; copy++) {
        const base = 0xe25400 + copy * 0x78000;
        expectRewardCounterOps(patched, waOffset(base));
        expect(patched.readUInt16LE(waOffset(base + 0x78))).toBe(1001);
        expect(patched.readUInt16LE(waOffset(base + 0x174))).toBe(1001);
        expect(patched.readUInt16LE(waOffset(base + 0x1ec))).toBe(1000);
      }
      expect(patched.readUInt16LE(waOffset(0xe24fe4))).toBe(1001);
      expect(executeStarchipSaveUpdate(patched, 0x12790, 2727, 5)).toBe(7727);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refreshes PAL x150 when the visible result card still restores the vanilla pick", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const oldVisibleReward = readFileSync(discPath);
      oldVisibleReward.writeUInt32LE(0x8fa20000, 21 * SECTOR_DATA_SIZE + 0x19b4f4);
      for (let copy = 0; copy < 7; copy++) {
        oldVisibleReward.writeUInt32LE(0x8fa20000, waOffset(0xe25400 + copy * 0x78000 + 0xf4));
      }
      writeFileSync(discPath, oldVisibleReward);

      expect(inspectDropX15Image(oldVisibleReward)).toMatchObject({
        supported: true,
        enabled: false,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });

      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expect(patched.readUInt32LE(21 * SECTOR_DATA_SIZE + 0x19b4f4)).toBe(0x97a20022);
      for (let copy = 0; copy < 7; copy++) {
        expect(patched.readUInt32LE(waOffset(0xe25400 + copy * 0x78000 + 0xf4))).toBe(0x97a20022);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test.each([
    { multiplier: 150, rankStarchips: 5, before: 2727, after: 3477 },
    { multiplier: 150, rankStarchips: 22, before: 2727, after: 6027 },
    { multiplier: 50, rankStarchips: 5, before: 2727, after: 2977 },
    { multiplier: 1000, rankStarchips: 5, before: 2727, after: 7727 },
  ])("executes the PAL x$multiplier starchip helper as save += rankStarchips * multiplier", ({
    multiplier,
    rankStarchips,
    before,
    after,
  }) => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, multiplier);
      const patched = readFileSync(discPath);

      expect(executeStarchipSaveUpdate(patched, 0x12790, before, rankStarchips)).toBe(after);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("upgrades existing PAL x150 cards from starchip x15 to matching x150", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makePalGhostToolDiscImage("SLES_039.48");
    writeFileSync(discPath, image);

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const withOldStarchips = readFileSync(discPath);
      seedStarchipAward(withOldStarchips, 21, 0x12790, "patched");
      writeFileSync(discPath, withOldStarchips);

      expect(inspectDropX15Image(withOldStarchips)).toMatchObject({
        supported: true,
        enabled: false,
        cardDropCount: 150,
        starchipMultiplier: 15,
      });

      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expectPalStarchipMultiplier(patched, 21 * SECTOR_DATA_SIZE, 150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refreshes PAL x150 when the root starchip helper is missing from WA copies", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const rootOnlyHelper = readFileSync(discPath);
      for (let copy = 0; copy < 7; copy++) {
        Buffer.alloc(PAL_STARCHIP_X150_HELPER.length).copy(
          rootOnlyHelper,
          waOffset(0xe25400 + copy * 0x78000 + 0x300),
        );
      }
      writeFileSync(discPath, rootOnlyHelper);

      expect(inspectDropX15Image(rootOnlyHelper)).toMatchObject({
        supported: true,
        enabled: false,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });

      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expectPalStarchipMultiplier(patched, 21 * SECTOR_DATA_SIZE, 150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refreshes the PAL x150 helper that missed the MIPS load-delay slot", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const staleHelper = readFileSync(discPath);
      writeBytes(
        staleHelper,
        21,
        0x19b700,
        PAL_STARCHIP_X150_STALE_LOAD_DELAY_HELPER.toString("hex"),
      );
      for (let copy = 0; copy < 7; copy++) {
        PAL_STARCHIP_X150_STALE_LOAD_DELAY_HELPER.copy(
          staleHelper,
          waOffset(0xe25400 + copy * 0x78000 + 0x300),
        );
      }
      writeFileSync(discPath, staleHelper);

      expect(inspectDropX15Image(staleHelper)).toMatchObject({
        supported: true,
        enabled: false,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expect(executeStarchipSaveUpdate(staleHelper, 0x12790, 2727, 5)).toBe(1490);

      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expect(executeStarchipSaveUpdate(patched, 0x12790, 2727, 5)).toBe(3477);
      expectPalStarchipMultiplier(patched, 21 * SECTOR_DATA_SIZE, 150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refreshes the first PAL x150 starchip helper variant", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const oldHelper = readFileSync(discPath);
      writeBytes(
        oldHelper,
        21,
        0x19b700,
        "c041030000290300214005018028030021400501402803002118050121104300e00582ace987000800000000",
      );
      writeFileSync(discPath, oldHelper);

      expect(inspectDropX15Image(oldHelper)).toMatchObject({
        supported: true,
        enabled: false,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });

      const result = patchDropX15DiscInPlace(discPath, 150);
      const patched = readFileSync(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: true,
        cardDropCount: 150,
        starchipMultiplier: 150,
      });
      expectPalStarchipMultiplier(patched, 21 * SECTOR_DATA_SIZE, 150);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("can revert PAL card and starchip rewards to x1", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makePalGhostToolDiscImage("SLES_039.48"));

    try {
      patchDropX15DiscInPlace(discPath, 150);
      const result = patchDropX15DiscInPlace(discPath, 1);
      const patched = readFileSync(discPath);
      const slusBase = 21 * SECTOR_DATA_SIZE;

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        enabled: false,
        cardDropCount: 1,
        starchipMultiplier: 1,
      });
      expect(patched.subarray(slusBase + 0x12790, slusBase + 0x127a4)).toEqual(
        Buffer.from(STARCHIP_AWARD_BYTES.vanilla, "hex"),
      );
      expect(inspectDropX15Image(patched)).toMatchObject({
        enabled: false,
        cardDropCount: 1,
        starchipMultiplier: 1,
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects card-only Ghost/FMR images because normalization needs WA_MRG", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    const image = makeDiscImage("SLUS_014.11", false);
    seedGhostLoopPatterns(image, "patched");
    seedStarchipAward(image, 21, 0x126d4, "vanilla");
    writeFileSync(discPath, image);

    try {
      expect(inspectDropX15Image(image)).toMatchObject({
        supported: true,
        enabled: false,
        definitionId: "ghost-loop-limits",
      });

      expect(() => patchDropX15DiscInPlace(discPath, 15)).toThrow("DATA/WA_MRG.MRG was not found.");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects unknown executables without a compatible Ghost layout", () => {
    const image = makeDiscImage("SLUS_999.99", false);

    expect(inspectDropX15Image(image)).toEqual({
      supported: false,
      enabled: false,
      gameSerial: "SLUS_999.99",
      reason:
        "The executable does not match the Ghost Drop More Cards hook layout; refusing the unverified x15 patch.",
    });
  });

  test("rejects the unsafe freeze-selector patch", () => {
    const serial = "SLUS_000.04";
    const image = makeDiscImage(serial);
    seedUnsafeFreezeSelectorPatch(image, 21);

    expect(inspectDropX15Image(image)).toEqual({
      supported: false,
      enabled: false,
      gameSerial: serial,
      reason:
        "An unsafe legacy 15-card-drop patch is installed. Restore an unpatched backup or use a Ghost/FMR loop-limit x15 image.",
    });
  });
});

const GHOST_LOOP_PATTERN_BYTES = {
  vanilla: [
    "2000a0a32000b693000000000100d626060017241d00d712",
    "200040a220005692000000000100d626060017240c00d712",
    "080044ac20005690000000000100d626050017240200d712",
  ],
  patched: [
    "2000a0a32000b693000000000100d626100017241d00d712",
    "200040a220005692000000000100d626100017240c00d712",
    "080044ac20005690000000000100d6260f0017240200d712",
  ],
} as const;
const STARCHIP_AWARD_BYTES = {
  vanilla: "3a004390e005828c0000000021104300e00582ac",
  patched: "3a004390e005828c002903002318a30021104300e00582ac",
} as const;

function makeDiscImage(serial: string, seed = true): Buffer {
  const slusSector = 21;
  const rootSector = 20;
  const slusSize = 0x19b800;
  const image = Buffer.alloc(
    (slusSector + Math.ceil(slusSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectory(image, rootSector, slusSector, slusSize, serial);
  seedStarchipAward(image, slusSector, 0x126d4, "vanilla");
  if (seed) seedGhostToolHooks(image, slusSector);

  return image;
}

function makeGhostToolDiscImage(serial: string, continuationWord = 0x00021400): Buffer {
  const rootSector = 20;
  const slusSector = 21;
  const dataSector = 1000;
  const waSector = 1001;
  const slusSize = 0x19b800;
  const waSize = 0xe84000;
  const image = Buffer.alloc(
    (waSector + Math.ceil(waSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectoryWithData(image, rootSector, slusSector, slusSize, serial, dataSector);
  writeDirRecord(image, dataSector * SECTOR_DATA_SIZE, {
    extent: waSector,
    size: waSize,
    flags: 0,
    name: "WA_MRG.MRG;1",
  });
  seedGhostToolHooks(image, slusSector, continuationWord);
  seedGhostToolWaCleanPrefixes(image);
  seedStarchipAward(image, slusSector, 0x126d4, "vanilla");
  return image;
}

function makeCommunityGhostLoopDiscImage(serial: string): Buffer {
  const image = makeGhostToolDiscImage(serial);
  seedGhostToolPatchedHooks(image, 21);
  return image;
}

function makePalGhostToolDiscImage(serial: string): Buffer {
  const rootSector = 20;
  const slusSector = 21;
  const dataSector = 1000;
  const waSector = 1001;
  const slusSize = 0x19b800;
  const waSize = 0x1180000;
  const image = Buffer.alloc(
    (waSector + Math.ceil(waSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectoryWithData(image, rootSector, slusSector, slusSize, serial, dataSector);
  writeDirRecord(image, dataSector * SECTOR_DATA_SIZE, {
    extent: waSector,
    size: waSize,
    flags: 0,
    name: "WA_MRG.MRG;1",
  });
  seedPalGhostToolHooks(image, slusSector);
  seedPalGhostToolWaCleanPrefixes(image);
  seedStarchipAward(image, slusSector, 0x12790, "vanilla");
  return image;
}

function seedGhostLoopPatterns(
  image: Buffer,
  mode: keyof typeof GHOST_LOOP_PATTERN_BYTES,
  copies = 1,
  startCopy = 0,
): void {
  for (let copy = 0; copy < copies; copy++) {
    for (let i = 0; i < GHOST_LOOP_PATTERN_BYTES[mode].length; i++) {
      const pattern = Buffer.from(GHOST_LOOP_PATTERN_BYTES[mode][i] ?? "", "hex");
      pattern.copy(image, 0x3000 + (startCopy + copy) * 0x400 + i * 0x80);
    }
  }
}

function seedStarchipAward(
  image: Buffer,
  slusSector: number,
  fileOffset: number,
  mode: keyof typeof STARCHIP_AWARD_BYTES,
): void {
  writeBytes(image, slusSector, fileOffset, STARCHIP_AWARD_BYTES[mode]);
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

function writeRootDirectory(
  image: Buffer,
  rootSector: number,
  slusSector: number,
  slusSize: number,
  serial: string,
): void {
  writeDirRecord(image, rootSector * SECTOR_DATA_SIZE, {
    extent: slusSector,
    size: slusSize,
    flags: 0,
    name: `${serial};1`,
  });
}

function writeRootDirectoryWithData(
  image: Buffer,
  rootSector: number,
  slusSector: number,
  slusSize: number,
  serial: string,
  dataSector: number,
): void {
  let offset = rootSector * SECTOR_DATA_SIZE;
  writeDirRecord(image, offset, {
    extent: slusSector,
    size: slusSize,
    flags: 0,
    name: `${serial};1`,
  });
  offset += image[offset] ?? 0;
  writeDirRecord(image, offset, {
    extent: dataSector,
    size: SECTOR_DATA_SIZE,
    flags: 0x02,
    name: "DATA",
  });
}

function seedGhostToolHooks(
  image: Buffer,
  slusSector: number,
  continuationWord = 0x00021400,
): void {
  writeBytes(image, slusSector, 0x12034, "1880023C8C874224");
  writeBytes(image, slusSector, 0x1246c, "1D80033C0A80013C");
  writeU32(image, slusSector, 0x12474, 0xa422b338);
  writeU32(image, slusSector, 0x12478, 0xa482003c);
  writeU32(image, slusSector, 0x1247c, continuationWord);
  writeBytes(image, slusSector, 0x12710, "3C0044842586000C");
  writeBytes(image, slusSector, 0x285fc, "30048387C7DF000821286200");
}

function seedGhostToolPatchedHooks(image: Buffer, slusSector: number): void {
  writeBytes(image, slusSector, 0x12034, "95AB060800000000");
  writeBytes(image, slusSector, 0x1246c, "10AB060800000000");
  writeBytes(image, slusSector, 0x12710, "53AB060800000000");
  writeBytes(image, slusSector, 0x285fc, "9DAB06080000000000000000");
}

function seedPalGhostToolHooks(image: Buffer, slusSector: number): void {
  writeBytes(image, slusSector, 0x120f0, "1880023C8C874224");
  writeBytes(image, slusSector, 0x12100, "21800202");
  writeBytes(image, slusSector, 0x12528, "1C80033C0A80013C");
  writeBytes(image, slusSector, 0x127cc, "3C0044845486000C");
  writeBytes(image, slusSector, 0x28590, "20048387ACDF000821286200");
}

function seedUnsafeFreezeSelectorPatch(image: Buffer, slusSector: number): void {
  writeU32(image, slusSector, 0x12460, 0x0c0087da);
  writeU32(image, slusSector, 0x12710, 0x080087c9);
  writeU32(image, slusSector, 0x12714, 0x00000000);

  const words = [
    0x8f8202e0, 0x8444003c, 0x0c008625, 0x00000000, 0x9051003b, 0x2410000e, 0x02202021, 0x0c008604,
    0x00000000, 0x00402021, 0x0c008625, 0x00000000, 0x2610ffff, 0x1600fff8, 0x00000000, 0x08008827,
    0x00000000, 0x03e08821, 0x8f8302e0, 0x0c008604, 0xa064003b, 0x02200008, 0x00000000, 0x00000000,
    0x00000000,
  ];
  for (let i = 0; i < words.length; i++) {
    writeU32(image, slusSector, 0x12724 + i * 4, words[i] ?? 0);
  }
}

function seedGhostToolWaCleanPrefixes(image: Buffer): void {
  const prefix = Buffer.from("0c0007140193143f0200003f0000013f", "hex");
  for (let copy = 1; copy <= 7; copy++) {
    prefix.copy(image, waOffset(0xb4c400 + copy * 0x75800));
  }
}

function seedPalGhostToolWaCleanPrefixes(image: Buffer): void {
  const prefix = Buffer.from("0c0007140193143f0200003f0000013f", "hex");
  for (let copy = 0; copy < 7; copy++) {
    prefix.copy(image, waOffset(0xe25400 + copy * 0x78000));
  }
}

function seedLegacyLocalPatch(image: Buffer, slusSector: number): void {
  writeU32(image, slusSector, 0x12460, 0x0c008604);
  writeU32(image, slusSector, 0x12710, 0x080087c9);
  writeU32(image, slusSector, 0x12714, 0x00000000);

  const words = [
    0x8f8202e0, 0x8444003c, 0x0c008625, 0x00000000, 0x8f8402e0, 0x90830039, 0x90820038, 0x0003182b,
    0x00038840, 0x2c420003, 0x10400002, 0x00000000, 0x24110001, 0x2410000e, 0x02202021, 0x0c008604,
    0x00000000, 0x00402021, 0x0c008625, 0x00000000, 0x2610ffff, 0x1600fff8, 0x00000000, 0x08008827,
    0x00000000,
  ];
  for (let i = 0; i < words.length; i++) {
    writeU32(image, slusSector, 0x12724 + i * 4, words[i] ?? 0);
  }
}

function writeDirRecord(
  image: Buffer,
  offset: number,
  opts: { extent: number; size: number; flags: number; name: string },
): void {
  const name = Buffer.from(opts.name, "ascii");
  const length = 33 + name.length + ((33 + name.length) % 2 === 0 ? 0 : 1);
  image[offset] = length;
  image.writeUInt32LE(opts.extent, offset + 2);
  image.writeUInt32BE(opts.extent, offset + 6);
  image.writeUInt32LE(opts.size, offset + 10);
  image.writeUInt32BE(opts.size, offset + 14);
  image[offset + 25] = opts.flags;
  image[offset + 32] = name.length;
  name.copy(image, offset + 33);
}

function writeU32(image: Buffer, slusSector: number, fileOffset: number, value: number): void {
  image.writeUInt32LE(value, slusSector * SECTOR_DATA_SIZE + fileOffset);
}

function writeBytes(image: Buffer, slusSector: number, fileOffset: number, hex: string): void {
  Buffer.from(hex, "hex").copy(image, slusSector * SECTOR_DATA_SIZE + fileOffset);
}

function waOffset(fileOffset: number): number {
  const waSector = 1001;
  return waSector * SECTOR_DATA_SIZE + fileOffset;
}

function ntscWaCopyOffsets(): number[] {
  return Array.from({ length: 7 }, (_, i) => 0xb4c400 + (i + 1) * 0x75800);
}

function expectStarchipX15(image: Buffer, offset: number): void {
  expect(image.subarray(offset, offset + 24)).toEqual(
    Buffer.from(STARCHIP_AWARD_BYTES.patched, "hex"),
  );
}

function executeStarchipSaveUpdate(
  image: Buffer,
  starchipAwardOffset: number,
  starchipsBefore: number,
  rankStarchips: number,
): number {
  const slusBase = 21 * SECTOR_DATA_SIZE;
  const fileToRamDelta = 0x8000f800;
  const returnAddress = fileToRamDelta + starchipAwardOffset + 24;
  const memory = Buffer.alloc(0x2000);
  const resultPointer = 0x10000000;
  const savePointer = resultPointer + 0x1000;
  const registers = new Uint32Array(32);
  let pendingLoad: { register: number; value: number } | null = null;
  registers[2] = resultPointer;
  registers[4] = savePointer;
  memory[0x3a] = rankStarchips;
  memory.writeUInt32LE(starchipsBefore, 0x1000 + 0x5e0);

  let pc = fileToRamDelta + starchipAwardOffset;
  for (let step = 0; step < 40 && pc !== returnAddress; step++) {
    pc = executeInstruction(readInstruction(image, slusBase, fileToRamDelta, pc), pc);
  }
  expect(pc).toBe(returnAddress);
  return memory.readUInt32LE(0x1000 + 0x5e0);

  function executeInstruction(instruction: number, currentPc: number): number {
    const opcode = instruction >>> 26;
    if (opcode === 0x02) {
      const target = ((currentPc + 4) & 0xf0000000) | ((instruction & 0x03ff_ffff) << 2);
      applyLoadDelay(null);
      executeWithLoadDelay(readInstruction(image, slusBase, fileToRamDelta, currentPc + 4));
      registers[0] = 0;
      return target >>> 0;
    }
    executeWithLoadDelay(instruction);
    registers[0] = 0;
    return (currentPc + 4) >>> 0;
  }

  function executeWithLoadDelay(instruction: number): void {
    const sourceRegisters = pendingLoad ? new Uint32Array(registers) : registers;
    if (pendingLoad) registers[pendingLoad.register] = pendingLoad.value;
    pendingLoad = executeNonBranch(instruction, sourceRegisters);
    registers[0] = 0;
  }

  function applyLoadDelay(nextLoad: { register: number; value: number } | null): void {
    if (pendingLoad) registers[pendingLoad.register] = pendingLoad.value;
    pendingLoad = nextLoad;
    registers[0] = 0;
  }

  function executeNonBranch(
    instruction: number,
    sourceRegisters: Uint32Array,
  ): { register: number; value: number } | null {
    const opcode = instruction >>> 26;
    if (instruction === 0) return null;
    if (opcode === 0) {
      executeSpecial(instruction, sourceRegisters);
      return null;
    }

    const rs = (instruction >>> 21) & 0x1f;
    const rt = (instruction >>> 16) & 0x1f;
    const immediate = instruction & 0xffff;
    const signedImmediate = immediate & 0x8000 ? immediate | 0xffff_0000 : immediate;
    const address = ((sourceRegisters[rs] ?? 0) + signedImmediate) >>> 0;

    if (opcode === 0x23) {
      return { register: rt, value: readDataWord(address) };
    }
    if (opcode === 0x24) {
      return { register: rt, value: readDataByte(address) };
    }
    if (opcode === 0x2b) {
      writeDataWord(address, sourceRegisters[rt] ?? 0);
      return null;
    }
    throw new Error(`Unsupported test MIPS opcode 0x${opcode.toString(16)}.`);
  }

  function executeSpecial(instruction: number, sourceRegisters: Uint32Array): void {
    const rs = (instruction >>> 21) & 0x1f;
    const rt = (instruction >>> 16) & 0x1f;
    const rd = (instruction >>> 11) & 0x1f;
    const shift = (instruction >>> 6) & 0x1f;
    const funct = instruction & 0x3f;
    if (funct === 0x00) {
      registers[rd] = ((sourceRegisters[rt] ?? 0) << shift) >>> 0;
      return;
    }
    if (funct === 0x21) {
      registers[rd] = ((sourceRegisters[rs] ?? 0) + (sourceRegisters[rt] ?? 0)) >>> 0;
      return;
    }
    if (funct === 0x23) {
      registers[rd] = ((sourceRegisters[rs] ?? 0) - (sourceRegisters[rt] ?? 0)) >>> 0;
      return;
    }
    throw new Error(`Unsupported test MIPS function 0x${funct.toString(16)}.`);
  }

  function readDataByte(address: number): number {
    return memory[address - resultPointer] ?? 0;
  }

  function readDataWord(address: number): number {
    return memory.readUInt32LE(address - resultPointer);
  }

  function writeDataWord(address: number, value: number): void {
    memory.writeUInt32LE(value >>> 0, address - resultPointer);
  }
}

function readInstruction(
  image: Buffer,
  slusBase: number,
  fileToRamDelta: number,
  pc: number,
): number {
  return image.readUInt32LE(slusBase + pc - fileToRamDelta);
}

const PAL_STARCHIP_X150_HELPER = Buffer.from(
  "c0110300002903002110450080280300211045004028030021184500e005828c0000000021104300e00582acea87000800000000",
  "hex",
);

const PAL_STARCHIP_X150_STALE_LOAD_DELAY_HELPER = Buffer.from(
  "c0110300002903002110450080280300211045004028030021184500e005828c21104300e00582acea87000800000000",
  "hex",
);

const PAL_REWARD_COUNTER_OPS = [
  { offset: 0x6c, word: 0x97b60020 },
  { offset: 0x80, word: 0xa7a00020 },
  { offset: 0x84, word: 0xa7b60020 },
  { offset: 0x168, word: 0x96560020 },
  { offset: 0x17c, word: 0xa6400020 },
  { offset: 0x180, word: 0xa6560020 },
  { offset: 0x1e0, word: 0x94560020 },
  { offset: 0x1f4, word: 0xa4400020 },
  { offset: 0x1f8, word: 0xa4560020 },
] as const;

function expectPalStarchipMultiplier(image: Buffer, slusBase: number, multiplier: 150): void {
  expect(multiplier).toBe(150);
  expect(image.subarray(slusBase + 0x12798, slusBase + 0x127a4)).toEqual(
    Buffer.from("c0ab06080000000000000000", "hex"),
  );
  expect(
    image.subarray(slusBase + 0x19b700, slusBase + 0x19b700 + PAL_STARCHIP_X150_HELPER.length),
  ).toEqual(PAL_STARCHIP_X150_HELPER);
  expect(image.subarray(slusBase + 0x19b734, slusBase + 0x19b740)).toEqual(Buffer.alloc(0x0c));
  for (let copy = 0; copy < 7; copy++) {
    const helperOffset = waOffset(0xe25400 + copy * 0x78000 + 0x300);
    expect(image.subarray(helperOffset, helperOffset + PAL_STARCHIP_X150_HELPER.length)).toEqual(
      PAL_STARCHIP_X150_HELPER,
    );
  }
}

function expectRewardCounterOps(image: Buffer, expansionOffset: number): void {
  for (const op of PAL_REWARD_COUNTER_OPS) {
    expect(image.readUInt32LE(expansionOffset + op.offset)).toBe(op.word);
  }
}
