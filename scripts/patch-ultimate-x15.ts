// Patch Yu-Gi-Oh! Forbidden Memories Ultimate (SLUS_027.11) so a won duel
// grants 15 cards. The exact formula is documented in
// docs/dropx15-ultimate-spec.md.
//
// Usage:
//   bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso>

import fs from "node:fs";
import {
  type DiscFormat,
  detectDiscFormat,
  MODE2_2352,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "../bridge/extract/iso9660.ts";
import type { IsoFile } from "../bridge/extract/types.ts";
import { discOffset } from "../bridge/extract/write-iso.ts";

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

export interface UltimateX15Patch {
  requiredWords: readonly InstructionPatch[];
  writeWords: readonly InstructionPatch[];
  localProgramOffset: number;
  localProgramRam: number;
  localProgramVanilla: readonly number[];
  localProgram: readonly number[];
}

export function buildUltimateX15Patch(): UltimateX15Patch {
  return {
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

export function runCli(argv = process.argv): void {
  const src = argv[2];
  const dst = argv[3];
  if (!src || !dst) {
    console.error("Usage: bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso>");
    process.exit(1);
  }

  patchUltimateX15(src, dst);
}

export function patchUltimateX15(src: string, dst: string): void {
  console.log(`Reading ${src}...`);
  fs.copyFileSync(src, dst);
  const image = fs.readFileSync(dst);
  const format = detectDiscFormat(image);
  console.log(
    `  format: ${format === MODE2_2352 ? "MODE2/2352" : "MODE1/2048"}, ${image.length} bytes`,
  );

  const slusEntry = findSlusEntry(image, format);
  console.log(`  SLUS file: ${slusEntry.name} @ sector ${slusEntry.sector} (${slusEntry.size} B)`);
  if (!/^SLUS_027\.11/.test(slusEntry.name)) {
    throw new Error(`Expected Ultimate SLUS_027.11, found ${slusEntry.name}`);
  }

  const patch = buildUltimateX15Patch();
  verifyRequiredWords(image, slusEntry.sector, format, patch);
  writePatch(image, slusEntry.sector, format, patch);
  fs.writeFileSync(dst, image);
  verifyPatchedImage(dst, slusEntry.sector, format, patch);
  console.log(`\nWrote ${dst}`);
}

function verifyRequiredWords(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  patch: UltimateX15Patch,
): void {
  console.log("Pre-flight: verifying Ultimate x15 patch sites...");
  for (const word of [...patch.requiredWords, ...patch.writeWords]) {
    const actual = readU32LeAt(image, slusSector, word.fileOffset, format);
    if (actual !== word.vanilla) {
      throw new Error(
        `${word.label} @ RAM 0x${word.ram.toString(16)}: expected 0x${formatWord(
          word.vanilla,
        )}, got 0x${formatWord(actual)}`,
      );
    }
  }
  for (let i = 0; i < patch.localProgramVanilla.length; i++) {
    const actual = readU32LeAt(image, slusSector, patch.localProgramOffset + i * 4, format);
    const expected = patch.localProgramVanilla[i] ?? 0;
    if (actual !== expected) {
      throw new Error(
        `local program host word ${i}: expected 0x${formatWord(expected)}, got 0x${formatWord(actual)}`,
      );
    }
  }
  console.log("  ok: patch sites match unpatched Ultimate");
}

function writePatch(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  patch: UltimateX15Patch,
): void {
  console.log("Applying Ultimate x15 drop patch...");
  for (const word of patch.writeWords) {
    writeU32LeAt(image, slusSector, word.fileOffset, word.patched, format);
  }
  for (let i = 0; i < patch.localProgram.length; i++) {
    writeU32LeAt(
      image,
      slusSector,
      patch.localProgramOffset + i * 4,
      patch.localProgram[i] ?? 0,
      format,
    );
  }
}

function verifyPatchedImage(
  dst: string,
  slusSector: number,
  format: DiscFormat,
  patch: UltimateX15Patch,
): void {
  const written = fs.readFileSync(dst);
  for (const word of patch.requiredWords) {
    const actual = readU32LeAt(written, slusSector, word.fileOffset, format);
    if (actual !== word.patched) {
      throw new Error(`${word.label} changed unexpectedly after write`);
    }
  }
  for (const word of patch.writeWords) {
    const actual = readU32LeAt(written, slusSector, word.fileOffset, format);
    if (actual !== word.patched) {
      throw new Error(`${word.label} did not persist after write`);
    }
  }
  for (let i = 0; i < patch.localProgram.length; i++) {
    const actual = readU32LeAt(written, slusSector, patch.localProgramOffset + i * 4, format);
    if (actual !== patch.localProgram[i]) {
      throw new Error(`local program word ${i} did not persist after write`);
    }
  }
  console.log(
    `Verify: hook=0x${formatWord(readU32LeAt(written, slusSector, AWARD_HOOK_OFFSET, format))}`,
  );
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

function formatWord(value: number): string {
  return value.toString(16).padStart(8, "0");
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

if (import.meta.main) runCli();
