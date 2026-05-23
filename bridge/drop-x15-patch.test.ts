import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  buildBufferedPickerX15Patch,
  buildLocalX15Patch,
  type DropX15PatchDefinition,
  inspectDropX15Image,
  patchDropX15DiscInPlace,
} from "./drop-x15-patch.ts";
import { SECTOR_DATA_SIZE } from "./extract/iso9660.ts";

describe("drop x15 patch inspection", () => {
  test.each([
    "SLUS_014.11",
    "SLUS_000.04",
    "SLUS_999.99",
  ])("supports unpatched Ghost/FMR loop-limit %s images", (serial) => {
    const image = makeDiscImage(serial, false);
    seedGhostLoopPatterns(image, "vanilla");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "ghost-loop-limits",
      definitionName: "Ghost/FMR loop-limit x15",
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
    const image = makeDiscImage(serial, false);
    seedGhostLoopPatterns(image, "vanilla");
    writeFileSync(discPath, image);

    try {
      const result = patchDropX15DiscInPlace(discPath);

      expect(result.changed).toBe(true);
      expect(result.status.enabled).toBe(true);
      expect(inspectDropX15Image(readFileSync(discPath))).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "ghost-loop-limits",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("recognizes the common Ghost state with one stale vanilla copy and seven patched copies", () => {
    const image = makeDiscImage("SLUS_014.11", false);
    seedGhostLoopPatterns(image, "vanilla", 1);
    seedGhostLoopPatterns(image, "patched", 7);

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: true,
      definitionId: "ghost-loop-limits",
      definitionName: "Ghost/FMR loop-limit x15",
      gameSerial: "SLUS_014.11",
    });
  });

  test("supports the clean buffered original-picker layout used by Gold-like executables", () => {
    const image = makeDiscImage("SLUS_000.04");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "buffered-picker-x15",
      definitionName: "Buffered original-picker x15",
      gameSerial: "SLUS_000.04",
    });
  });

  test("patches the buffered original-picker layout in place", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "disc.iso");
    writeFileSync(discPath, makeDiscImage("SLUS_000.04"));

    try {
      const result = patchDropX15DiscInPlace(discPath);

      expect(result.changed).toBe(true);
      expect(result.status).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "buffered-picker-x15",
      });
      expect(inspectDropX15Image(readFileSync(discPath))).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "buffered-picker-x15",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rejects unknown executables when the local x15 layout does not match", () => {
    const image = makeDiscImage("SLUS_999.99", false);

    expect(inspectDropX15Image(image)).toEqual({
      supported: false,
      enabled: false,
      gameSerial: "SLUS_999.99",
      reason:
        "The active executable does not match the tested local 15-card-drop layout or is partially patched.",
    });
  });

  test("reports the unsafe freeze-selector patch as legacy unsafe", () => {
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

function makeDiscImage(serial: string, seed = true): Buffer {
  const slusSector = 21;
  const rootSector = 20;
  const patch = buildLocalX15Patch(serial);
  const slusSize = patch.localProgramOffset + patch.localProgram.length * 4 + 0x100;
  const image = Buffer.alloc(
    (slusSector + Math.ceil(slusSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectory(image, rootSector, slusSector, slusSize, serial);
  if (seed) seedUnpatchedExecutable(image, slusSector, patch);

  return image;
}

function seedGhostLoopPatterns(
  image: Buffer,
  mode: keyof typeof GHOST_LOOP_PATTERN_BYTES,
  copies = 1,
): void {
  for (let copy = 0; copy < copies; copy++) {
    for (let i = 0; i < GHOST_LOOP_PATTERN_BYTES[mode].length; i++) {
      const pattern = Buffer.from(GHOST_LOOP_PATTERN_BYTES[mode][i] ?? "", "hex");
      pattern.copy(image, 0x3000 + copy * 0x400 + i * 0x80);
    }
  }
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

function seedUnpatchedExecutable(
  image: Buffer,
  slusSector: number,
  patch: DropX15PatchDefinition,
): void {
  const bufferedPatch = buildBufferedPickerX15Patch(patch.gameSerial);

  for (const word of patch.requiredWords) {
    writeU32(image, slusSector, word.fileOffset, word.vanilla);
  }
  for (const word of bufferedPatch.writeWords) {
    writeU32(image, slusSector, word.fileOffset, word.vanilla);
  }
  for (let i = 0; i < bufferedPatch.localProgramVanilla.length; i++) {
    writeU32(
      image,
      slusSector,
      bufferedPatch.localProgramOffset + i * 4,
      bufferedPatch.localProgramVanilla[i] ?? 0,
    );
  }
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
