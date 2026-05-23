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
const VISIBLE_PICK_HOOK_OFFSET = 0x12460;
const LOCAL_PROGRAM_OFFSET = 0x12724;
const LOCAL_PROGRAM_RAM = 0x80021f24;

const CREDIT_CARD_RAM = 0x80021894;
const PICK_DROP_RAM = 0x80021810;
const RETURN_RAM = 0x8002209c;
const EXTRA_RANDOM_DROPS = 14;

const GHOST_LOOP_DEFINITION_ID = "ghost-loop-limits";
const GHOST_LOOP_DEFINITION_NAME = "Ghost/FMR loop-limit x15";
const GHOST_NO_ANCHORS_REASON =
  "No Ghost/FMR loop-limit x15 anchors were found in this disc image.";

const GHOST_LOOP_PATTERNS = [
  {
    label: "reward pick loop",
    vanilla: Buffer.from("2000a0a32000b693000000000100d626060017241d00d712", "hex"),
    patched: Buffer.from("2000a0a32000b693000000000100d626100017241d00d712", "hex"),
  },
  {
    label: "reward transfer loop",
    vanilla: Buffer.from("200040a220005692000000000100d626060017240c00d712", "hex"),
    patched: Buffer.from("200040a220005692000000000100d626100017240c00d712", "hex"),
  },
  {
    label: "reward display loop",
    vanilla: Buffer.from("080044ac20005690000000000100d626050017240200d712", "hex"),
    patched: Buffer.from("080044ac20005690000000000100d6260f0017240200d712", "hex"),
  },
] as const;

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
  gameSerial: string;
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

export function buildLocalX15Patch(gameSerial: string): DropX15PatchDefinition {
  return {
    id: "local-award-trampoline",
    name: "Local x15-compatible layout",
    gameSerial,
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
  const slusEntry = findExecutableEntry(image, format);
  const ghostState = inspectGhostLoopPatchState(image, slusEntry.name);
  if (ghostState.supported || ghostState.reason !== GHOST_NO_ANCHORS_REASON) {
    return ghostState;
  }

  const definition = buildLocalX15Patch(slusEntry.name);
  return inspectLegacyLocalPatchState(image, slusEntry.sector, format, definition);
}

export function patchDropX15DiscInPlace(discPath: string): PatchDropX15Result {
  const image = readFileSync(discPath);
  const format = detectDiscFormat(image);
  const slusEntry = findExecutableEntry(image, format);

  const before = inspectGhostLoopPatchState(image, slusEntry.name);
  if (!before.supported) throw new Error(before.reason);
  if (before.enabled) return { changed: false, status: before };

  writeGhostLoopPatch(image);
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

function inspectGhostLoopPatchState(image: Buffer, gameSerial: string): DropX15PatchStatus {
  const matches = GHOST_LOOP_PATTERNS.map((pattern) => ({
    vanilla: findPatternOffsets(image, pattern.vanilla),
    patched: findPatternOffsets(image, pattern.patched),
  }));
  const totals = matches.map((match) => match.vanilla.length + match.patched.length);
  const hasAnyGhostAnchor = totals.some((total) => total > 0);

  if (!hasAnyGhostAnchor) {
    return {
      supported: false,
      enabled: false,
      gameSerial,
      reason: GHOST_NO_ANCHORS_REASON,
    };
  }

  const hasAllLoops = totals.every((total) => total > 0);
  if (!hasAllLoops) {
    return {
      supported: false,
      enabled: false,
      gameSerial,
      reason: "Only part of the Ghost/FMR loop-limit x15 anchor set was found.",
    };
  }

  const enabled = matches.every((match) => match.patched.length > 0 && match.vanilla.length <= 1);

  return {
    supported: true,
    enabled,
    definitionId: GHOST_LOOP_DEFINITION_ID,
    definitionName: GHOST_LOOP_DEFINITION_NAME,
    gameSerial,
  };
}

function writeGhostLoopPatch(image: Buffer): void {
  for (const pattern of GHOST_LOOP_PATTERNS) {
    for (const offset of findPatternOffsets(image, pattern.vanilla)) {
      pattern.patched.copy(image, offset);
    }
  }
}

function findPatternOffsets(image: Buffer, pattern: Buffer): number[] {
  const offsets: number[] = [];
  let offset = 0;
  while (offset < image.length) {
    const matchOffset = image.indexOf(pattern, offset);
    if (matchOffset === -1) break;
    offsets.push(matchOffset);
    offset = matchOffset + 1;
  }
  return offsets;
}

function inspectLegacyLocalPatchState(
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
  const visiblePickVanilla =
    readU32LeAt(image, slusSector, VISIBLE_PICK_HOOK_OFFSET, format) === mipsJal(PICK_DROP_RAM);
  const unsafeFreezeSelectorPatched = isUnsafeFreezeSelectorPatch(
    image,
    slusSector,
    format,
    definition,
  );

  if (requiredOk && hooksPatched && hostPatched && visiblePickVanilla) {
    return {
      supported: false,
      enabled: false,
      gameSerial: definition.gameSerial,
      reason:
        "This disc has the legacy local x15 trampoline installed. It is no longer treated as safe; use a Ghost/FMR loop-limit x15 image or restore an unpatched backup.",
    };
  }

  if (requiredOk && hooksVanilla && hostVanilla) {
    return {
      supported: false,
      enabled: false,
      gameSerial: definition.gameSerial,
      reason:
        "This executable matches the legacy local x15 layout, but no Ghost/FMR loop-limit anchors were found. The bridge will not install the legacy trampoline.",
    };
  }

  if (requiredOk && unsafeFreezeSelectorPatched) {
    return {
      supported: false,
      enabled: false,
      gameSerial: definition.gameSerial,
      reason:
        "An unsafe legacy 15-card-drop patch is installed. Restore an unpatched backup or use a Ghost/FMR loop-limit x15 image.",
    };
  }

  return {
    supported: false,
    enabled: false,
    gameSerial: definition.gameSerial,
    reason:
      "The active executable does not match the tested local 15-card-drop layout or is partially patched.",
  };
}

function isUnsafeFreezeSelectorPatch(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  definition: DropX15PatchDefinition,
): boolean {
  const visibleHookUnsafe =
    readU32LeAt(image, slusSector, VISIBLE_PICK_HOOK_OFFSET, format) === mipsJal(0x80021f68);
  const awardHookOld =
    readU32LeAt(image, slusSector, AWARD_HOOK_OFFSET, format) === mipsJ(LOCAL_PROGRAM_RAM);
  const awardDelayPatched =
    readU32LeAt(image, slusSector, AWARD_HOOK_OFFSET + 4, format) === mipsNop();

  return (
    visibleHookUnsafe &&
    awardHookOld &&
    awardDelayPatched &&
    wordsMatch(
      image,
      slusSector,
      format,
      definition.localProgramOffset,
      buildUnsafeFreezeSelectorProgramWords(),
    )
  );
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

function buildUnsafeFreezeSelectorProgramWords(): readonly number[] {
  const extraLoopRam = LOCAL_PROGRAM_RAM + 24;
  const loopBranchRam = LOCAL_PROGRAM_RAM + 52;

  return [
    mipsLw(REG.v0, 0x02e0, REG.gp),
    mipsLh(REG.a0, 0x003c, REG.v0),
    mipsJal(CREDIT_CARD_RAM),
    mipsNop(),
    mipsLbu(REG.s1, 0x003b, REG.v0),
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
    mipsAddu(REG.s1, REG.ra, REG.zero),
    mipsLw(REG.v1, 0x02e0, REG.gp),
    mipsJal(PICK_DROP_RAM),
    mipsSb(REG.a0, 0x003b, REG.v1),
    mipsJr(REG.s1),
    mipsNop(),
    mipsNop(),
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

function findExecutableEntry(image: Buffer, format: DiscFormat): IsoFile {
  const pvd = readSector(image, PVD_SECTOR, format);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    image,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    format,
  );
  const rootFiles = parseDirectory(rootData, root.readUInt32LE(10));
  const slusEntry = rootFiles.find((file) => /^S[A-Z]{3}_\d{3}\.\d{2}/.test(file.name));
  if (!slusEntry) {
    throw new Error(
      `Could not find PSX executable in root directory: ${rootFiles.map((file) => file.name).join(", ")}`,
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

function mipsJr(rs: number): number {
  return mipsR(rs, 0, 0, 0, 0x08);
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
  ra: 31,
  gp: 28,
  s0: 16,
  s1: 17,
} as const;
