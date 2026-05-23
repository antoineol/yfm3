import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
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
    "SLES_039.48",
  ])("supports unpatched local x15-compatible %s executables", (serial) => {
    const image = makeDiscImage(serial);

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "local-award-trampoline",
      definitionName: "Local x15-compatible layout",
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
    writeFileSync(discPath, makeDiscImage(serial));

    try {
      const result = patchDropX15DiscInPlace(discPath);

      expect(result.changed).toBe(true);
      expect(result.status.enabled).toBe(true);
      expect(inspectDropX15Image(readFileSync(discPath))).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "local-award-trampoline",
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

  test("treats the unsafe freeze-selector patch as upgradeable", () => {
    const serial = "SLUS_000.04";
    const image = makeDiscImage(serial);
    seedUnsafeFreezeSelectorPatch(image, 21);

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "local-award-trampoline",
      definitionName: "Local x15-compatible layout",
      gameSerial: serial,
      reason:
        "An unsafe 15-card-drop patch is installed; re-enable the patch to restore the tested reward routine.",
    });
  });
});

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
  for (const word of patch.requiredWords) {
    writeU32(image, slusSector, word.fileOffset, word.vanilla);
  }
  for (const word of patch.writeWords) {
    writeU32(image, slusSector, word.fileOffset, word.vanilla);
  }
  for (let i = 0; i < patch.localProgramVanilla.length; i++) {
    writeU32(
      image,
      slusSector,
      patch.localProgramOffset + i * 4,
      patch.localProgramVanilla[i] ?? 0,
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
