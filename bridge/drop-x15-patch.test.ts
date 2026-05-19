import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  buildSlus014X15Patch,
  inspectDropX15Image,
  patchDropX15DiscInPlace,
} from "./drop-x15-patch.ts";
import { SECTOR_DATA_SIZE } from "./extract/iso9660.ts";

describe("drop x15 patch inspection", () => {
  test("supports unpatched SLUS_014.11 vanilla-family executables", () => {
    const image = makeDiscImage("SLUS_014.11");

    expect(inspectDropX15Image(image)).toEqual({
      supported: true,
      enabled: false,
      definitionId: "slus-01411-local",
      definitionName: "SLUS_014.11 vanilla-family",
      gameSerial: "SLUS_014.11",
    });
  });

  test("patches SLUS_014.11 vanilla-family executables in place", () => {
    const dir = mkdtempSync(join(tmpdir(), "yfm3-drop-x15-"));
    const discPath = join(dir, "mod15.iso");
    writeFileSync(discPath, makeDiscImage("SLUS_014.11"));

    try {
      const result = patchDropX15DiscInPlace(discPath);

      expect(result.changed).toBe(true);
      expect(result.status.enabled).toBe(true);
      expect(inspectDropX15Image(readFileSync(discPath))).toMatchObject({
        supported: true,
        enabled: true,
        definitionId: "slus-01411-local",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function makeDiscImage(serial: string): Buffer {
  const slusSector = 21;
  const rootSector = 20;
  const patch = buildSlus014X15Patch();
  const slusSize = patch.localProgramOffset + patch.localProgram.length * 4 + 0x100;
  const image = Buffer.alloc(
    (slusSector + Math.ceil(slusSize / SECTOR_DATA_SIZE) + 1) * SECTOR_DATA_SIZE,
  );

  writePrimaryVolumeDescriptor(image, rootSector);
  writeRootDirectory(image, rootSector, slusSector, slusSize, serial);
  seedUnpatchedExecutable(image, slusSector, patch);

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
  patch: ReturnType<typeof buildSlus014X15Patch>,
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
