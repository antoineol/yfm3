import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import {
  type DiscFormat,
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./extract/iso9660.ts";
import type { IsoFile } from "./extract/types.ts";
import { discOffset } from "./extract/write-iso.ts";

const CREDIT_INCREMENT_OFFSET = 0x120ac;
const CREDIT_INCREMENT_RAM = 0x800218ac;
const VANILLA_CREDIT_INCREMENT = 0x24420001;

const AWARD_HOOK_OFFSET = 0x12710;
const AWARD_HOOK_RAM = 0x80021f10;
const LOCAL_PROGRAM_OFFSET = 0x12724;
const LOCAL_PROGRAM_RAM = 0x80021f24;

const CREDIT_CARD_RAM = 0x80021894;
const PICK_DROP_RAM = 0x80021810;
const RETURN_RAM = 0x8002209c;
const EXTRA_RANDOM_DROPS = 14;

export interface InstructionPatch {
  fileOffset: number;
  ram: number;
  vanilla: number;
  patched: number;
  label: string;
}

export interface DropX15PatchDefinition {
  id: string;
  name: string;
  serialPattern: RegExp;
  requiredWords: readonly InstructionPatch[];
  writeWords: readonly InstructionPatch[];
  localProgramOffset: number;
  localProgramRam: number;
  localProgramVanilla: readonly number[];
  localProgram: readonly number[];
}

export type DropX15PatchStatus =
  | {
      supported: true;
      enabled: boolean;
      definitionId: string;
      definitionName: string;
      gameSerial: string;
      reason?: string;
    }
  | {
      supported: false;
      enabled: false;
      gameSerial: string | null;
      reason: string;
    };

export interface PatchDropX15Result {
  changed: boolean;
  status: Extract<DropX15PatchStatus, { supported: true }>;
}

export function buildUltimateX15Patch(): DropX15PatchDefinition {
  return {
    id: "ultimate-slus-02711",
    name: "Ultimate SLUS_027.11",
    serialPattern: /^SLUS_027\.11/,
    requiredWords: [
      {
        fileOffset: CREDIT_INCREMENT_OFFSET,
        ram: CREDIT_INCREMENT_RAM,
        vanilla: VANILLA_CREDIT_INCREMENT,
        patched: VANILLA_CREDIT_INCREMENT,
        label: "card-credit increment remains +1",
      },
    ],
    writeWords: [
      {
        fileOffset: AWARD_HOOK_OFFSET,
        ram: AWARD_HOOK_RAM,
        vanilla: 0x8444003c,
        patched: mipsJ(LOCAL_PROGRAM_RAM),
        label: "award.lh->j local x15 routine",
      },
      {
        fileOffset: AWARD_HOOK_OFFSET + 4,
        ram: AWARD_HOOK_RAM + 4,
        vanilla: 0x0c008625,
        patched: mipsNop(),
        label: "award.jal->nop",
      },
    ],
    localProgramOffset: LOCAL_PROGRAM_OFFSET,
    localProgramRam: LOCAL_PROGRAM_RAM,
    localProgramVanilla: buildLocalProgramVanillaWords(),
    localProgram: buildLocalProgramWords(),
  };
}

export function inspectDropX15Patch(discPath: string): DropX15PatchStatus {
  const image = readFileSync(discPath);
  return inspectDropX15Image(image);
}

export function inspectDropX15Image(image: Buffer): DropX15PatchStatus {
  const format = detectDiscFormat(image);
  const slusEntry = findSlusEntry(image, format);
  const definition = DROP_X15_PATCH_DEFINITIONS.find((candidate) =>
    candidate.serialPattern.test(slusEntry.name),
  );
  if (!definition) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason: "Only the tested Ultimate SLUS_027.11 executable is supported for 15-card drops.",
    };
  }
  return inspectPatchState(image, slusEntry.sector, format, definition);
}

export function patchDropX15DiscInPlace(discPath: string): PatchDropX15Result {
  const image = readFileSync(discPath);
  const format = detectDiscFormat(image);
  const slusEntry = findSlusEntry(image, format);
  const definition = DROP_X15_PATCH_DEFINITIONS.find((candidate) =>
    candidate.serialPattern.test(slusEntry.name),
  );
  if (!definition) {
    throw new Error(
      "Only the tested Ultimate SLUS_027.11 executable is supported for 15-card drops.",
    );
  }

  const before = inspectPatchState(image, slusEntry.sector, format, definition);
  if (!before.supported) throw new Error(before.reason);
  if (before.enabled) return { changed: false, status: before };

  writePatch(image, slusEntry.sector, format, definition);
  writeFileSync(discPath, image);

  const after = inspectDropX15Image(readFileSync(discPath));
  if (!after.supported) throw new Error(after.reason);
  if (!after.enabled) throw new Error("15-card drop patch did not persist after writing.");
  return { changed: true, status: after };
}

export function patchUltimateX15(src: string, dst: string): PatchDropX15Result {
  copyFileSync(src, dst);
  return patchDropX15DiscInPlace(dst);
}

function inspectPatchState(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  definition: DropX15PatchDefinition,
): DropX15PatchStatus {
  const requiredOk = definition.requiredWords.every(
    (word) => readU32LeAt(image, slusSector, word.fileOffset, format) === word.patched,
  );
  const hooksVanilla = definition.writeWords.every(
    (word) => readU32LeAt(image, slusSector, word.fileOffset, format) === word.vanilla,
  );
  const hooksPatched = definition.writeWords.every(
    (word) => readU32LeAt(image, slusSector, word.fileOffset, format) === word.patched,
  );
  const hostVanilla = wordsMatch(
    image,
    slusSector,
    format,
    definition.localProgramOffset,
    definition.localProgramVanilla,
  );
  const hostPatched = wordsMatch(
    image,
    slusSector,
    format,
    definition.localProgramOffset,
    definition.localProgram,
  );

  if (requiredOk && hooksPatched && hostPatched) {
    return {
      supported: true,
      enabled: true,
      definitionId: definition.id,
      definitionName: definition.name,
      gameSerial: serialFromDefinition(definition),
    };
  }

  if (requiredOk && hooksVanilla && hostVanilla) {
    return {
      supported: true,
      enabled: false,
      definitionId: definition.id,
      definitionName: definition.name,
      gameSerial: serialFromDefinition(definition),
    };
  }

  return {
    supported: false,
    enabled: false,
    gameSerial: serialFromDefinition(definition),
    reason:
      "This SLUS_027.11 executable does not match the tested Ultimate layout or is partially patched.",
  };
}

function writePatch(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  definition: DropX15PatchDefinition,
): void {
  for (const word of definition.writeWords) {
    writeU32LeAt(image, slusSector, word.fileOffset, word.patched, format);
  }
  for (let i = 0; i < definition.localProgram.length; i++) {
    writeU32LeAt(
      image,
      slusSector,
      definition.localProgramOffset + i * 4,
      definition.localProgram[i] ?? 0,
      format,
    );
  }
}

function wordsMatch(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  fileOffset: number,
  expectedWords: readonly number[],
): boolean {
  for (let i = 0; i < expectedWords.length; i++) {
    if (readU32LeAt(image, slusSector, fileOffset + i * 4, format) !== expectedWords[i]) {
      return false;
    }
  }
  return true;
}

function buildLocalProgramWords(): readonly number[] {
  const useComputedPoolRam = LOCAL_PROGRAM_RAM + 52;
  const poolBranchRam = LOCAL_PROGRAM_RAM + 40;
  const extraLoopRam = LOCAL_PROGRAM_RAM + 56;
  const loopBranchRam = LOCAL_PROGRAM_RAM + 84;

  return [
    mipsLw(REG.v0, 0x02e0, REG.gp),
    mipsLh(REG.a0, 0x003c, REG.v0),
    mipsJal(CREDIT_CARD_RAM),
    mipsNop(),
    mipsLw(REG.a0, 0x02e0, REG.gp),
    mipsLbu(REG.v1, 0x0039, REG.a0),
    mipsLbu(REG.v0, 0x0038, REG.a0),
    mipsSltu(REG.v1, REG.zero, REG.v1),
    mipsSll(REG.s1, REG.v1, 1),
    mipsSltiu(REG.v0, REG.v0, 3),
    mipsBeq(REG.v0, REG.zero, useComputedPoolRam, poolBranchRam),
    mipsNop(),
    mipsAddiu(REG.s1, REG.zero, 1),
    mipsAddiu(REG.s0, REG.zero, EXTRA_RANDOM_DROPS),
    mipsAddu(REG.a0, REG.s1, REG.zero),
    mipsJal(PICK_DROP_RAM),
    mipsNop(),
    mipsAddu(REG.a0, REG.v0, REG.zero),
    mipsJal(CREDIT_CARD_RAM),
    mipsNop(),
    mipsAddiu(REG.s0, REG.s0, -1),
    mipsBne(REG.s0, REG.zero, extraLoopRam, loopBranchRam),
    mipsNop(),
    mipsJ(RETURN_RAM),
    mipsNop(),
  ];
}

function buildLocalProgramVanillaWords(): readonly number[] {
  return [
    0x9382025d, 0x278502d0, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518, 0x00000000,
    0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f, 0x8c830000, 0x00000000,
    0xa4620518, 0x9382025d, 0x00000000, 0x38420001, 0x00021080, 0x00452021, 0x8c830000, 0x00000000,
    0x9462051a,
  ];
}

function findSlusEntry(image: Buffer, format: DiscFormat): IsoFile {
  const pvd = readSector(image, PVD_SECTOR, format);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    image,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    format,
  );
  const rootFiles = parseDirectory(rootData, root.readUInt32LE(10));
  const slusEntry = rootFiles.find((file) => /^SLUS_\d{3}\.\d{2}/.test(file.name));
  if (!slusEntry) {
    throw new Error(
      `Could not find SLUS_*.* in root directory: ${rootFiles.map((file) => file.name).join(", ")}`,
    );
  }
  return slusEntry;
}

function readU32LeAt(
  image: Buffer,
  fileStartSector: number,
  fileOffset: number,
  format: DiscFormat,
): number {
  return (
    ((image[discOffset(fileStartSector, fileOffset, format)] ?? 0) |
      ((image[discOffset(fileStartSector, fileOffset + 1, format)] ?? 0) << 8) |
      ((image[discOffset(fileStartSector, fileOffset + 2, format)] ?? 0) << 16) |
      ((image[discOffset(fileStartSector, fileOffset + 3, format)] ?? 0) << 24)) >>>
    0
  );
}

function writeU32LeAt(
  image: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  format: DiscFormat,
): void {
  for (let i = 0; i < 4; i++) {
    image[discOffset(fileStartSector, fileOffset + i, format)] = (value >>> (i * 8)) & 0xff;
  }
}

function serialFromDefinition(definition: DropX15PatchDefinition): string {
  return definition.id === "ultimate-slus-02711" ? "SLUS_027.11" : definition.id;
}

function mipsNop(): number {
  return 0;
}

function mipsAddiu(rt: number, rs: number, imm: number): number {
  return mipsI(0x09, rs, rt, imm);
}

function mipsLw(rt: number, imm: number, rs: number): number {
  return mipsI(0x23, rs, rt, imm);
}

function mipsLh(rt: number, imm: number, rs: number): number {
  return mipsI(0x21, rs, rt, imm);
}

function mipsLbu(rt: number, imm: number, rs: number): number {
  return mipsI(0x24, rs, rt, imm);
}

function mipsSltu(rd: number, rs: number, rt: number): number {
  return mipsR(rs, rt, rd, 0, 0x2b);
}

function mipsSll(rd: number, rt: number, shamt: number): number {
  return mipsR(0, rt, rd, shamt, 0);
}

function mipsSltiu(rt: number, rs: number, imm: number): number {
  return mipsI(0x0b, rs, rt, imm);
}

function mipsBne(rs: number, rt: number, targetRam: number, pc: number): number {
  return mipsBranch(0x05, rs, rt, targetRam, pc);
}

function mipsBeq(rs: number, rt: number, targetRam: number, pc: number): number {
  return mipsBranch(0x04, rs, rt, targetRam, pc);
}

function mipsAddu(rd: number, rs: number, rt: number): number {
  return mipsR(rs, rt, rd, 0, 0x21);
}

function mipsJal(targetRam: number): number {
  return mipsJType(0x03, targetRam);
}

function mipsJ(targetRam: number): number {
  return mipsJType(0x02, targetRam);
}

function mipsBranch(op: number, rs: number, rt: number, targetRam: number, pc: number): number {
  const offset = (targetRam - (pc + 4)) / 4;
  if (!Number.isInteger(offset) || offset < -0x8000 || offset > 0x7fff) {
    throw new Error(
      `Branch target 0x${targetRam.toString(16)} is out of range from 0x${pc.toString(16)}`,
    );
  }
  return mipsI(op, rs, rt, offset);
}

function mipsI(op: number, rs: number, rt: number, imm: number): number {
  return (((op & 0x3f) << 26) | ((rs & 0x1f) << 21) | ((rt & 0x1f) << 16) | (imm & 0xffff)) >>> 0;
}

function mipsR(rs: number, rt: number, rd: number, shamt: number, funct: number): number {
  return (
    (((rs & 0x1f) << 21) |
      ((rt & 0x1f) << 16) |
      ((rd & 0x1f) << 11) |
      ((shamt & 0x1f) << 6) |
      funct) >>>
    0
  );
}

function mipsJType(op: number, targetRam: number): number {
  return (((op & 0x3f) << 26) | ((targetRam >>> 2) & 0x03ff_ffff)) >>> 0;
}

const REG = {
  zero: 0,
  v0: 2,
  v1: 3,
  a0: 4,
  gp: 28,
  s0: 16,
  s1: 17,
} as const;

const DROP_X15_PATCH_DEFINITIONS = [buildUltimateX15Patch()] as const;
