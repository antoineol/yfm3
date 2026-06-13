import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  inspectDropX15Image,
  isSupportedDropCount,
  patchDropX15DiscInPlace,
} from "./drop-x15-patch.ts";
import { SECTOR_DATA_SIZE } from "./extract/iso9660.ts";

const GENERAL_DROP_COUNTS = [1, 5, 15, 50, 150, 1000] as const;

describe("drop x15 patch unit inspection", () => {
  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("supports unpatched Ghost/FMR loop-limit %s images", (serial) => {
    const image = makeDiscImage(serial, false);
    seedGhostLoopPatterns(image, "vanilla");
    seedStarchipAward(image, 21, 0x126d4, "vanilla");

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

  test("rejects partial Ghost/FMR loop-limit anchors", () => {
    const image = makeDiscImage("SLUS_014.11", false);
    seedGhostLoopPatterns(image, "vanilla", 1, 0, 1);
    seedStarchipAward(image, 21, 0x126d4, "vanilla");

    expect(inspectDropX15Image(image)).toEqual({
      supported: false,
      enabled: false,
      gameSerial: "SLUS_014.11",
      reason: "Only part of the Ghost/FMR loop-limit x15 anchor set was found.",
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
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-unit-"));
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

  test("reports supported selectable drop counts", () => {
    const image = makeDiscImage("SLUS_014.11", false);
    seedGhostLoopPatterns(image, "vanilla");
    seedStarchipAward(image, 21, 0x126d4, "vanilla");
    const status = inspectDropX15Image(image);

    expect(isSupportedDropCount(status, 15)).toBe(true);
    expect(isSupportedDropCount(status, 1500)).toBe(false);
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

function makeDiscImage(serial: string, seedGhostToolHooks = true): Buffer {
  const slusSector = 21;
  const rootSector = 20;
  const slusSize = 0x19b800;
  const image = Buffer.alloc(
    (slusSector + Math.ceil(slusSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectory(image, rootSector, slusSector, slusSize, serial);
  seedStarchipAward(image, slusSector, 0x126d4, "vanilla");
  if (seedGhostToolHooks) seedGhostToolHooksForNtsc(image, slusSector);

  return image;
}

function seedGhostLoopPatterns(
  image: Buffer,
  mode: keyof typeof GHOST_LOOP_PATTERN_BYTES,
  copies = 1,
  startCopy = 0,
  patternCount: number = GHOST_LOOP_PATTERN_BYTES[mode].length,
): void {
  for (let copy = 0; copy < copies; copy++) {
    for (let i = 0; i < patternCount; i++) {
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

function seedGhostToolHooksForNtsc(image: Buffer, slusSector: number): void {
  writeBytes(image, slusSector, 0x12034, "1880023C8C874224");
  writeBytes(image, slusSector, 0x1246c, "1D80033C0A80013C");
  writeU32(image, slusSector, 0x12474, 0xa422b338);
  writeU32(image, slusSector, 0x12478, 0xa482003c);
  writeU32(image, slusSector, 0x1247c, 0x00021400);
  writeBytes(image, slusSector, 0x12710, "3C0044842586000C");
  writeBytes(image, slusSector, 0x285fc, "30048387C7DF000821286200");
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
