// PoC: convert a Yu-Gi-Oh! Forbidden Memories Ultimate (SLUS_027.11)
// disc image into a 15-card-credit variant.
//
// Usage:
//   bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso> [mode]
//
// The default same-card mode deliberately patches only Ultimate's existing
// card-credit increment. That one-instruction patch was confirmed in-game:
// 15 copies of the displayed reward, no crash.
//
// cave-same-card is a diagnostic mode: it keeps the same +15 behavior but routes
// the final award call through the 0x801aac40 cave. If that crashes, the cave or
// hook shape is the problem rather than random-picker logic.
//
// local-cave-same-card is the same diagnostic routed through code space inside
// the award function instead of the 0x801aac40 zero/data-looking region.
//
// local-hidden-random gives one normal visible reward, then credits 14 hidden
// random cards directly to the collection from the local code-space host.
//
// local-full-random also uses the local code-space host, but sends all 15 drops
// through the game's normal credit routine so the recent/new list is updated.

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
const X15_CREDIT_INCREMENT = 0x2442000f;
const AWARD_HOOK_OFFSET = 0x12710;
const EXPANSION_OFFSET = 0x19b440;
const EXPANSION_RAM = 0x801aac40;
const LOCAL_CAVE_OFFSET = 0x12724;
const LOCAL_CAVE_RAM = 0x80021f24;
const CREDIT_CARD_RAM = 0x80021894;
const PICK_DROP_RAM = 0x80021810;
const RETURN_RAM = 0x8002209c;
const EXTRA_DROP_COUNT = 14;

export type UltimateX15Mode =
  | "same-card"
  | "cave-same-card"
  | "local-cave-same-card"
  | "local-hidden-random"
  | "local-full-random";

export interface WordPatch {
  fileOffset: number;
  ram: number;
  vanilla: number;
  patched: number;
  label: string;
}

export function buildUltimateX15Patches(): readonly WordPatch[] {
  return [
    {
      fileOffset: CREDIT_INCREMENT_OFFSET,
      ram: CREDIT_INCREMENT_RAM,
      vanilla: VANILLA_CREDIT_INCREMENT,
      patched: X15_CREDIT_INCREMENT,
      label: "card-credit increment +1 -> +15",
    },
  ];
}

export function buildUltimateX15CavePatches(): readonly WordPatch[] {
  return [
    ...buildUltimateX15Patches(),
    {
      fileOffset: AWARD_HOOK_OFFSET,
      ram: 0x80021f10,
      vanilla: 0x8444003c,
      patched: mipsJ(EXPANSION_RAM),
      label: "award.lh->j cave smoke routine",
    },
    {
      fileOffset: AWARD_HOOK_OFFSET + 4,
      ram: 0x80021f14,
      vanilla: 0x0c008625,
      patched: mipsNop(),
      label: "award.jal->nop",
    },
  ];
}

export function buildUltimateX15LocalCavePatches(): readonly WordPatch[] {
  return [
    ...buildUltimateX15Patches(),
    {
      fileOffset: AWARD_HOOK_OFFSET,
      ram: 0x80021f10,
      vanilla: 0x8444003c,
      patched: mipsJ(LOCAL_CAVE_RAM),
      label: "award.lh->j local cave smoke routine",
    },
    {
      fileOffset: AWARD_HOOK_OFFSET + 4,
      ram: 0x80021f14,
      vanilla: 0x0c008625,
      patched: mipsNop(),
      label: "award.jal->nop",
    },
  ];
}

export function buildUltimateX15LocalHiddenRandomPatches(): readonly WordPatch[] {
  return [
    {
      fileOffset: AWARD_HOOK_OFFSET,
      ram: 0x80021f10,
      vanilla: 0x8444003c,
      patched: mipsJ(LOCAL_CAVE_RAM),
      label: "award.lh->j local hidden-random routine",
    },
    {
      fileOffset: AWARD_HOOK_OFFSET + 4,
      ram: 0x80021f14,
      vanilla: 0x0c008625,
      patched: mipsNop(),
      label: "award.jal->nop",
    },
  ];
}

export function buildUltimateX15LocalFullRandomPatches(): readonly WordPatch[] {
  return [
    {
      fileOffset: AWARD_HOOK_OFFSET,
      ram: 0x80021f10,
      vanilla: 0x8444003c,
      patched: mipsJ(LOCAL_CAVE_RAM),
      label: "award.lh->j local full-random routine",
    },
    {
      fileOffset: AWARD_HOOK_OFFSET + 4,
      ram: 0x80021f14,
      vanilla: 0x0c008625,
      patched: mipsNop(),
      label: "award.jal->nop",
    },
  ];
}

export function buildUltimateX15CaveProgram(): readonly number[] {
  return [
    mipsLw(REG.v0, 0x02e0, REG.gp),
    mipsLh(REG.a0, 0x003c, REG.v0),
    mipsJal(CREDIT_CARD_RAM),
    mipsNop(),
    mipsJ(RETURN_RAM),
    mipsNop(),
  ];
}

export function buildUltimateX15LocalCaveProgram(): readonly number[] {
  return buildUltimateX15CaveProgram();
}

export function buildUltimateX15LocalHiddenRandomProgram(): readonly number[] {
  const useComputedPoolRam = LOCAL_CAVE_RAM + 52;
  const poolBranchRam = LOCAL_CAVE_RAM + 40;
  const extraLoopRam = LOCAL_CAVE_RAM + 56;
  const storeHiddenDropRam = LOCAL_CAVE_RAM + 112;
  const capBranchRam = LOCAL_CAVE_RAM + 100;
  const loopBranchRam = LOCAL_CAVE_RAM + 120;

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
    mipsAddiu(REG.s0, REG.zero, EXTRA_DROP_COUNT),
    mipsAddu(REG.a0, REG.s1, REG.zero),
    mipsJal(PICK_DROP_RAM),
    mipsNop(),
    mipsLui(REG.a2, 0x801d),
    mipsAddiu(REG.a2, REG.a2, 0x0200),
    mipsAddiu(REG.v0, REG.v0, 0x004f),
    mipsAddu(REG.v1, REG.v0, REG.a2),
    mipsLbu(REG.v0, 0, REG.v1),
    mipsNop(),
    mipsAddiu(REG.v0, REG.v0, 1),
    mipsSltiu(REG.a0, REG.v0, 251),
    mipsBne(REG.a0, REG.zero, storeHiddenDropRam, capBranchRam),
    mipsNop(),
    mipsAddiu(REG.v0, REG.zero, 250),
    mipsSb(REG.v0, 0, REG.v1),
    mipsAddiu(REG.s0, REG.s0, -1),
    mipsBne(REG.s0, REG.zero, extraLoopRam, loopBranchRam),
    mipsNop(),
    mipsJ(RETURN_RAM),
    mipsNop(),
  ];
}

export function buildUltimateX15LocalFullRandomProgram(): readonly number[] {
  const useComputedPoolRam = LOCAL_CAVE_RAM + 52;
  const poolBranchRam = LOCAL_CAVE_RAM + 40;
  const extraLoopRam = LOCAL_CAVE_RAM + 56;
  const loopBranchRam = LOCAL_CAVE_RAM + 84;

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
    mipsAddiu(REG.s0, REG.zero, EXTRA_DROP_COUNT),
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

export function patchUltimateX15(
  src: string,
  dst: string,
  mode: UltimateX15Mode = "same-card",
): void {
  console.log(`Reading ${src}...`);
  fs.copyFileSync(src, dst);
  const bin = fs.readFileSync(dst);
  const fmt = detectDiscFormat(bin);
  console.log(`  format: ${fmt === MODE2_2352 ? "MODE2/2352" : "MODE1/2048"}, ${bin.length} bytes`);

  const slusEntry = findSlusEntry(bin, fmt);
  console.log(`  SLUS file: ${slusEntry.name} @ sector ${slusEntry.sector} (${slusEntry.size} B)`);
  if (!/^SLUS_027\.11/.test(slusEntry.name)) {
    throw new Error(`Expected Ultimate SLUS_027.11, found ${slusEntry.name}`);
  }

  const patches = buildPatchesForMode(mode);
  console.log(`  mode: ${mode}`);
  console.log(`Pre-flight: verifying ${patches.length} instruction patch(es)...`);
  for (const patch of patches) {
    const actual = readU32LeAt(bin, slusEntry.sector, patch.fileOffset, fmt);
    if (actual !== patch.vanilla) {
      throw new Error(
        `${patch.label} @ RAM 0x${patch.ram.toString(16)}: expected 0x${formatWord(
          patch.vanilla,
        )}, got 0x${formatWord(actual)}`,
      );
    }
  }
  console.log("  ok: patch sites match unpatched Ultimate");

  let program: readonly number[] = [];
  let programOffset = 0;
  if (mode === "cave-same-card") {
    program = buildUltimateX15CaveProgram();
    programOffset = EXPANSION_OFFSET;
    verifyExpansionArea(bin, slusEntry.sector, fmt, program.length * 4);
  }
  if (mode === "local-cave-same-card") {
    program = buildUltimateX15LocalCaveProgram();
    programOffset = LOCAL_CAVE_OFFSET;
    verifyLocalCaveArea(bin, slusEntry.sector, fmt, program.length);
  }
  if (mode === "local-hidden-random") {
    program = buildUltimateX15LocalHiddenRandomProgram();
    programOffset = LOCAL_CAVE_OFFSET;
    verifyLocalCaveArea(bin, slusEntry.sector, fmt, program.length);
  }
  if (mode === "local-full-random") {
    program = buildUltimateX15LocalFullRandomProgram();
    programOffset = LOCAL_CAVE_OFFSET;
    verifyLocalCaveArea(bin, slusEntry.sector, fmt, program.length);
  }

  console.log("Applying x15 patch...");
  for (const patch of patches) {
    writeU32LeAt(bin, slusEntry.sector, patch.fileOffset, patch.patched, fmt);
  }
  for (let i = 0; i < program.length; i++) {
    writeU32LeAt(bin, slusEntry.sector, programOffset + i * 4, program[i] ?? 0, fmt);
  }

  fs.writeFileSync(dst, bin);
  verifyPatchedImage(dst, slusEntry.sector, fmt, patches, program, programOffset);
  console.log(`\nWrote ${dst}`);
}

export function runCli(argv = process.argv): void {
  const src = argv[2];
  const dst = argv[3];
  const mode = parseMode(argv[4]);
  if (!src || !dst) {
    console.error(
      "Usage: bun scripts/patch-ultimate-x15.ts <input.iso> <output.iso> [same-card|cave-same-card|local-cave-same-card|local-hidden-random|local-full-random]",
    );
    process.exit(1);
  }

  patchUltimateX15(src, dst, mode);
}

function verifyPatchedImage(
  dst: string,
  slusSector: number,
  fmt: DiscFormat,
  patches: readonly WordPatch[],
  program: readonly number[],
  programOffset: number,
): void {
  const written = fs.readFileSync(dst);
  for (const patch of patches) {
    const actual = readU32LeAt(written, slusSector, patch.fileOffset, fmt);
    if (actual !== patch.patched) {
      throw new Error(`${patch.label} did not persist after write`);
    }
  }
  for (let i = 0; i < program.length; i++) {
    const actual = readU32LeAt(written, slusSector, programOffset + i * 4, fmt);
    if (actual !== program[i]) {
      throw new Error(`Cave word ${i} did not persist after write`);
    }
  }
  console.log(
    `Verify: 0x${CREDIT_INCREMENT_RAM.toString(16)}=0x${formatWord(
      readU32LeAt(written, slusSector, CREDIT_INCREMENT_OFFSET, fmt),
    )}`,
  );
}

function buildPatchesForMode(mode: UltimateX15Mode): readonly WordPatch[] {
  if (mode === "same-card") return buildUltimateX15Patches();
  if (mode === "cave-same-card") return buildUltimateX15CavePatches();
  if (mode === "local-cave-same-card") return buildUltimateX15LocalCavePatches();
  if (mode === "local-hidden-random") return buildUltimateX15LocalHiddenRandomPatches();
  return buildUltimateX15LocalFullRandomPatches();
}

function verifyExpansionArea(
  bin: Buffer,
  slusSector: number,
  fmt: DiscFormat,
  byteLength: number,
): void {
  console.log(
    `Pre-flight: verifying ${byteLength}-byte cave area at file 0x${EXPANSION_OFFSET.toString(16)}...`,
  );
  for (let i = 0; i < byteLength; i++) {
    if ((bin[discOffset(slusSector, EXPANSION_OFFSET + i, fmt)] ?? 0) !== 0) {
      throw new Error(`Cave area is not empty at +0x${i.toString(16)}; refusing to stack patches`);
    }
  }
  console.log("  ok: cave area is empty");
}

function verifyLocalCaveArea(
  bin: Buffer,
  slusSector: number,
  fmt: DiscFormat,
  wordLength: number,
): void {
  const vanillaWords = [
    0x9382025d, 0x278502d0, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518, 0x00000000,
    0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f, 0x8c830000, 0x00000000,
    0xa4620518, 0x9382025d, 0x00000000, 0x38420001, 0x00021080, 0x00452021, 0x8c830000, 0x00000000,
    0x9462051a, 0x00000000, 0x24420001, 0xa462051a, 0x3042ffff, 0x2c422710, 0x1440003f, 0x2402270f,
    0x8c830000, 0x08008827,
  ];
  if (wordLength > vanillaWords.length) {
    throw new Error(
      `Local cave verifier only covers ${vanillaWords.length} words, asked for ${wordLength}`,
    );
  }
  console.log(
    `Pre-flight: verifying local cave area at file 0x${LOCAL_CAVE_OFFSET.toString(16)}...`,
  );
  for (let i = 0; i < wordLength; i++) {
    const actual = readU32LeAt(bin, slusSector, LOCAL_CAVE_OFFSET + i * 4, fmt);
    const expected = vanillaWords[i] ?? 0;
    if (actual !== expected) {
      throw new Error(
        `Local cave word ${i}: expected 0x${formatWord(expected)}, got 0x${formatWord(actual)}`,
      );
    }
  }
  console.log("  ok: local cave area matches unpatched Ultimate");
}

function parseMode(rawMode: string | undefined): UltimateX15Mode {
  if (!rawMode || rawMode === "same-card") return "same-card";
  if (rawMode === "cave-same-card") return rawMode;
  if (rawMode === "local-cave-same-card") return rawMode;
  if (rawMode === "local-hidden-random") return rawMode;
  if (rawMode === "local-full-random") return rawMode;
  throw new Error(`Unknown x15 patch mode: ${rawMode}`);
}

function findSlusEntry(bin: Buffer, fmt: DiscFormat): IsoFile {
  const pvd = readSector(bin, PVD_SECTOR, fmt);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    bin,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    fmt,
  );
  const rootFiles = parseDirectory(rootData, root.readUInt32LE(10));
  const slusEntry = rootFiles.find((f) => /^SLUS_\d{3}\.\d{2}/.test(f.name));
  if (!slusEntry) {
    throw new Error(
      `Could not find SLUS_*.* in root directory: ${rootFiles.map((f) => f.name).join(", ")}`,
    );
  }
  return slusEntry;
}

function readU32LeAt(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  fmt: DiscFormat,
): number {
  return (
    ((bin[discOffset(fileStartSector, fileOffset, fmt)] ?? 0) |
      ((bin[discOffset(fileStartSector, fileOffset + 1, fmt)] ?? 0) << 8) |
      ((bin[discOffset(fileStartSector, fileOffset + 2, fmt)] ?? 0) << 16) |
      ((bin[discOffset(fileStartSector, fileOffset + 3, fmt)] ?? 0) << 24)) >>>
    0
  );
}

function writeU32LeAt(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  fmt: DiscFormat,
): void {
  for (let i = 0; i < 4; i++) {
    bin[discOffset(fileStartSector, fileOffset + i, fmt)] = (value >>> (i * 8)) & 0xff;
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

function mipsLui(rt: number, imm: number): number {
  return mipsI(0x0f, 0, rt, imm);
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

function mipsSb(rt: number, imm: number, rs: number): number {
  return mipsI(0x28, rs, rt, imm);
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
  a2: 6,
  gp: 28,
  s0: 16,
  s1: 17,
} as const;

if (import.meta.main) runCli();
