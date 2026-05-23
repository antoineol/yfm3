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
const BUFFERED_PICKER_DEFINITION_ID = "buffered-picker-x15";
const BUFFERED_PICKER_DEFINITION_NAME = "Buffered original-picker x15";
const LOCAL_STATE_OFFSET_FROM_PROGRAM = 0x110;
const BUFFERED_DROP_COUNT = 15;
const PAL_FR_EXECUTABLE_SHIFT = 0xbc;

const GHOST_TOOL_DEFINITION_ID = "ghost-drop-more-cards";
const GHOST_TOOL_DEFINITION_NAME = "Ghost Drop More Cards x15";
const GHOST_TOOL_COPY_OFFSET = 0xb4bf00;
const GHOST_TOOL_COPY_STRIDE = 0x75800;
const GHOST_TOOL_COPY_COUNT = 7;
const GHOST_TOOL_SLUS_EXPANSION_OFFSET = 0x19b440;
const GHOST_TOOL_DROP_COUNT = 15;
const GHOST_TOOL_FIRST_LIMIT = GHOST_TOOL_DROP_COUNT + 1;
const GHOST_TOOL_LAST_LIMIT = GHOST_TOOL_DROP_COUNT;
const GHOST_TOOL_WA_LIMIT_OFFSETS = [0x78, 0x174, 0x1ec] as const;
const GHOST_TOOL_WA_EXTRA_LIMITS = [
  { offset: 0xbc1888, value: GHOST_TOOL_FIRST_LIMIT },
  { offset: 0xbc13f4, value: GHOST_TOOL_FIRST_LIMIT },
  { offset: 0xbc19fc, value: GHOST_TOOL_LAST_LIMIT },
] as const;

const GHOST_TOOL_SLUS_HOOKS = [
  {
    offset: 0x12034,
    vanilla: Buffer.from("1880023C8C874224", "hex"),
    patched: Buffer.from("95AB060800000000", "hex"),
  },
  {
    offset: 0x1246c,
    vanilla: Buffer.from("1D80033C0A80013C", "hex"),
    patched: Buffer.from("10AB060800000000", "hex"),
  },
  {
    offset: 0x12710,
    vanilla: Buffer.from("3C0044842586000C", "hex"),
    patched: Buffer.from("53AB060800000000", "hex"),
  },
  {
    offset: 0x285fc,
    vanilla: Buffer.from("30048387C7DF000821286200", "hex"),
    patched: Buffer.from("9DAB06080000000000000000", "hex"),
  },
] as const;

const GHOST_TOOL_EXPANSION = Buffer.from(
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001B001D3C00ACBD270000A2AF0400A3AF0800B0AF0C00A4AF1000A5AF1400BFAF1800B6AF1C00B7AF2000A0A32000B693000000000100D626100017241D00D7122000A0A32000B6A31B80103C50AE108E00000000A8AB060800000000FF0742300100452421200000211880000000029600000000212082002A108500060040100100622401006324D2026228F7FF40140200102621100000020017241800F60212B8000021B8B7032000E2A61BAB0608000000000000A28F000000000400A38F000000000800B08F000000000C00A48F000000001000A58F000000001400BF8F000000001800B68F000000001C00B78F0000000020801D3C1D80033C0A80013C28FFBD271D870008000000001B80043C00AC8424000092AC21908000040056AE080057AE200040A220005692000000000100D626100017240C00D712200040A2200056A2020017241800F60212B8000021B857022000E496000000002586000C000000005AAB0608000000000400568E000000000800578E000000000000528E00000000C6870008000000001B80023C00AC4224000056AC040057AC080044AC20005690000000000100D6260F0017240200D712200040A0200056A0020017241800F60212B8000021B857002000F796000000001D80043C300497A7A85697A40000568C000000000400578C000000000800448C00000000008002343004838700000000C7DF0008212862000000000020801D3C1B80033C50AE63241880023C8C87422421800202000070AC0F860008000000002080023CA0FE422406004810008002343004838700000000C7DF0008212862000000000073AB0608000000006439020C000000006439020C000000006439020C000000006439020C000000006439020C000000006439020C000000006439020C0000000027AB06080000000000000000000000000000000000000000",
  "hex",
);

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

export interface BufferedPickerX15PatchDefinition {
  id: string;
  name: string;
  gameSerial: string;
  pickDropRam: number;
  creditCardRam: number;
  returnRam: number;
  localProgramRam: number;
  creditHookRam: number;
  localStateRam: number;
  requiredWords: readonly InstructionPatch[];
  writeWords: readonly InstructionPatch[];
  localProgramOffset: number;
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

export function buildBufferedPickerX15Patch(gameSerial: string): BufferedPickerX15PatchDefinition {
  const shift = bufferedPickerShift(gameSerial);
  const pickDropRam = PICK_DROP_RAM + shift;
  const creditCardRam = CREDIT_CARD_RAM + shift;
  const returnRam = RETURN_RAM + shift;
  const localProgramRam = LOCAL_PROGRAM_RAM + shift;
  const creditHookRam = localProgramRam + buildBufferedPickHookWords().length * 4;
  const localStateRam = localProgramRam + LOCAL_STATE_OFFSET_FROM_PROGRAM;

  return {
    id: BUFFERED_PICKER_DEFINITION_ID,
    name: BUFFERED_PICKER_DEFINITION_NAME,
    gameSerial,
    pickDropRam,
    creditCardRam,
    returnRam,
    localProgramRam,
    creditHookRam,
    localStateRam,
    requiredWords: [
      {
        fileOffset: CREDIT_INCREMENT_OFFSET + shift,
        ram: CREDIT_INCREMENT_RAM + shift,
        vanilla: VANILLA_CREDIT_INCREMENT,
        patched: VANILLA_CREDIT_INCREMENT,
        label: "card-credit increment remains +1",
      },
    ],
    writeWords: [
      {
        fileOffset: VISIBLE_PICK_HOOK_OFFSET + shift,
        ram: 0x80021c60 + shift,
        vanilla: mipsJal(pickDropRam),
        patched: mipsJal(localProgramRam),
        label: "reward picker->buffered x15 picker",
      },
      {
        fileOffset: AWARD_HOOK_OFFSET + shift,
        ram: AWARD_HOOK_RAM + shift,
        vanilla: 0x8444003c,
        patched: mipsJ(creditHookRam),
        label: "award.lh->j buffered x15 credit routine",
      },
      {
        fileOffset: AWARD_HOOK_OFFSET + shift + 4,
        ram: AWARD_HOOK_RAM + shift + 4,
        vanilla: mipsJal(creditCardRam),
        patched: mipsNop(),
        label: "award.jal->nop",
      },
    ],
    localProgramOffset: LOCAL_PROGRAM_OFFSET + shift,
    localProgramVanilla: buildBufferedPickerProgramVanillaWords(shift),
    localProgram: buildBufferedPickerProgramWords({
      pickDropRam,
      creditCardRam,
      returnRam,
      localProgramRam,
      creditHookRam,
      localStateRam,
    }),
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

  const ghostToolState = inspectGhostToolPatchState(image, slusEntry, format);
  if (ghostToolState.supported) return ghostToolState;

  const definition = buildLocalX15Patch(slusEntry.name);
  return inspectLegacyLocalPatchState(image, slusEntry.sector, format, definition);
}

export function patchDropX15DiscInPlace(discPath: string): PatchDropX15Result {
  const image = readFileSync(discPath);
  const format = detectDiscFormat(image);
  const slusEntry = findExecutableEntry(image, format);

  const ghostState = inspectGhostLoopPatchState(image, slusEntry.name);
  let before: DropX15PatchStatus = ghostState;
  if (!before.supported) {
    before = inspectGhostToolPatchState(image, slusEntry, format);
  }
  if (!before.supported) {
    before = inspectLegacyLocalPatchState(
      image,
      slusEntry.sector,
      format,
      buildLocalX15Patch(slusEntry.name),
    );
  }
  if (!before.supported) throw new Error(before.reason);
  if (before.enabled) return { changed: false, status: before };

  if (before.definitionId === GHOST_LOOP_DEFINITION_ID) {
    writeGhostLoopPatch(image);
  } else {
    writeGhostToolPatch(image, slusEntry, format);
  }
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

function inspectGhostToolPatchState(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
): DropX15PatchStatus {
  const waEntry = findWaMrgEntry(image, format);
  if (!waEntry) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason: "DATA/WA_MRG.MRG was not found; Ghost Drop More Cards requires both SLUS and WA_MRG.",
    };
  }

  const hooksVanilla = GHOST_TOOL_SLUS_HOOKS.every((hook) =>
    bytesMatchAt(image, slusEntry.sector, hook.offset, hook.vanilla, format),
  );
  const hooksPatched = GHOST_TOOL_SLUS_HOOKS.every((hook) =>
    bytesMatchAt(image, slusEntry.sector, hook.offset, hook.patched, format),
  );
  const slusExpansionPatched = bytesMatchAt(
    image,
    slusEntry.sector,
    GHOST_TOOL_SLUS_EXPANSION_OFFSET,
    GHOST_TOOL_EXPANSION,
    format,
  );
  const waExpansionPatched = ghostToolWaCopiesPatched(image, waEntry, format);

  if (hooksPatched && slusExpansionPatched && waExpansionPatched) {
    return {
      supported: true,
      enabled: true,
      definitionId: GHOST_TOOL_DEFINITION_ID,
      definitionName: GHOST_TOOL_DEFINITION_NAME,
      gameSerial: slusEntry.name,
    };
  }

  if (hooksVanilla && ghostToolWaCopiesInRange(waEntry)) {
    return {
      supported: true,
      enabled: false,
      definitionId: GHOST_TOOL_DEFINITION_ID,
      definitionName: GHOST_TOOL_DEFINITION_NAME,
      gameSerial: slusEntry.name,
    };
  }

  return {
    supported: false,
    enabled: false,
    gameSerial: slusEntry.name,
    reason:
      "The executable does not match the Ghost Drop More Cards hook layout; refusing the unverified x15 patch.",
  };
}

function writeGhostToolPatch(image: Buffer, slusEntry: IsoFile, format: DiscFormat): void {
  const waEntry = findWaMrgEntry(image, format);
  if (!waEntry) throw new Error("DATA/WA_MRG.MRG was not found.");

  for (const hook of GHOST_TOOL_SLUS_HOOKS) {
    writeBytesAt(image, slusEntry.sector, hook.offset, hook.patched, format);
  }
  writeBytesAt(
    image,
    slusEntry.sector,
    GHOST_TOOL_SLUS_EXPANSION_OFFSET,
    GHOST_TOOL_EXPANSION,
    format,
  );

  for (let copy = 1; copy <= GHOST_TOOL_COPY_COUNT; copy++) {
    const copyOffset = GHOST_TOOL_COPY_OFFSET + copy * GHOST_TOOL_COPY_STRIDE;
    writeBytesAt(image, waEntry.sector, copyOffset, GHOST_TOOL_EXPANSION, format);
    writeGhostToolWaLimit(
      image,
      waEntry,
      format,
      copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[0],
      GHOST_TOOL_FIRST_LIMIT,
    );
    writeGhostToolWaLimit(
      image,
      waEntry,
      format,
      copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[1],
      GHOST_TOOL_FIRST_LIMIT,
    );
    writeGhostToolWaLimit(
      image,
      waEntry,
      format,
      copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[2],
      GHOST_TOOL_LAST_LIMIT,
    );
  }
  for (const limit of GHOST_TOOL_WA_EXTRA_LIMITS) {
    writeGhostToolWaLimit(image, waEntry, format, limit.offset, limit.value);
  }
}

function ghostToolWaCopiesPatched(image: Buffer, waEntry: IsoFile, format: DiscFormat): boolean {
  if (!ghostToolWaCopiesInRange(waEntry)) return false;
  for (let copy = 1; copy <= GHOST_TOOL_COPY_COUNT; copy++) {
    const copyOffset = GHOST_TOOL_COPY_OFFSET + copy * GHOST_TOOL_COPY_STRIDE;
    if (!bytesMatchAt(image, waEntry.sector, copyOffset, GHOST_TOOL_EXPANSION, format))
      return false;
  }
  return GHOST_TOOL_WA_EXTRA_LIMITS.every(
    (limit) => image[discOffset(waEntry.sector, limit.offset, format)] === limit.value,
  );
}

function ghostToolWaCopiesInRange(waEntry: IsoFile): boolean {
  const lastCopyOffset = GHOST_TOOL_COPY_OFFSET + GHOST_TOOL_COPY_COUNT * GHOST_TOOL_COPY_STRIDE;
  const lastExtraOffset = Math.max(...GHOST_TOOL_WA_EXTRA_LIMITS.map((limit) => limit.offset));
  return (
    lastCopyOffset + GHOST_TOOL_EXPANSION.length <= waEntry.size && lastExtraOffset < waEntry.size
  );
}

function writeGhostToolWaLimit(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  offset: number,
  value: number,
): void {
  image[discOffset(waEntry.sector, offset, format)] = value;
}

function findWaMrgEntry(image: Buffer, format: DiscFormat): IsoFile | null {
  const pvd = readSector(image, PVD_SECTOR, format);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    image,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    format,
  );
  const rootFiles = parseDirectory(rootData, root.readUInt32LE(10));
  const dataDir = rootFiles.find((file) => file.isDir && file.name === "DATA");
  if (!dataDir) return null;
  const dataDirData = readSectors(
    image,
    dataDir.sector,
    Math.ceil(dataDir.size / SECTOR_DATA_SIZE),
    format,
  );
  return (
    parseDirectory(dataDirData, dataDir.size).find((file) => file.name === "WA_MRG.MRG") ?? null
  );
}

function bytesMatchAt(
  image: Buffer,
  fileStartSector: number,
  fileOffset: number,
  expected: Buffer,
  format: DiscFormat,
): boolean {
  for (let i = 0; i < expected.length; i++) {
    if (image[discOffset(fileStartSector, fileOffset + i, format)] !== expected[i]) return false;
  }
  return true;
}

function writeBytesAt(
  image: Buffer,
  fileStartSector: number,
  fileOffset: number,
  bytes: Buffer,
  format: DiscFormat,
): void {
  for (let i = 0; i < bytes.length; i++) {
    image[discOffset(fileStartSector, fileOffset + i, format)] = bytes[i] ?? 0;
  }
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

function bufferedPickerShift(gameSerial: string): number {
  return gameSerial === "SLES_039.48" ? PAL_FR_EXECUTABLE_SHIFT : 0;
}

interface BufferedPickerProgramAddresses {
  pickDropRam: number;
  creditCardRam: number;
  returnRam: number;
  localProgramRam: number;
  creditHookRam: number;
  localStateRam: number;
}

function buildBufferedPickerProgramWords(
  addresses: BufferedPickerProgramAddresses,
): readonly number[] {
  return [...buildBufferedPickHookWords(addresses), ...buildBufferedCreditHookWords(addresses)];
}

function buildBufferedPickHookWords(
  addresses: Partial<BufferedPickerProgramAddresses> = {},
): readonly number[] {
  const pickDropRam = addresses.pickDropRam ?? PICK_DROP_RAM;
  const localStateRam =
    addresses.localStateRam ?? LOCAL_PROGRAM_RAM + LOCAL_STATE_OFFSET_FROM_PROGRAM;

  return [
    mipsAddiu(REG.sp, REG.sp, -32),
    mipsSw(REG.ra, 28, REG.sp),
    mipsLui(REG.t0, upper16(localStateRam)),
    mipsOri(REG.t0, REG.t0, lower16(localStateRam)),
    mipsSh(REG.a0, 0, REG.t0),
    mipsJal(pickDropRam),
    mipsNop(),
    mipsLui(REG.t0, upper16(localStateRam)),
    mipsOri(REG.t0, REG.t0, lower16(localStateRam)),
    mipsSh(REG.v0, 2, REG.t0),
    mipsLw(REG.ra, 28, REG.sp),
    mipsJr(REG.ra),
    mipsAddiu(REG.sp, REG.sp, 32),
  ];
}

function buildBufferedCreditHookWords(
  addresses: BufferedPickerProgramAddresses,
): readonly number[] {
  const loopRam = addresses.creditHookRam + 48;
  const loopBranchRam = addresses.creditHookRam + 84;

  return [
    mipsAddiu(REG.sp, REG.sp, -24),
    mipsSw(REG.ra, 20, REG.sp),
    mipsSw(REG.s0, 16, REG.sp),
    mipsSw(REG.s1, 12, REG.sp),
    mipsLui(REG.t0, upper16(addresses.localStateRam)),
    mipsOri(REG.t0, REG.t0, lower16(addresses.localStateRam)),
    mipsLhu(REG.s1, 0, REG.t0),
    mipsLhu(REG.a0, 2, REG.t0),
    mipsJal(addresses.creditCardRam),
    mipsNop(),
    mipsAddiu(REG.s0, REG.zero, 1),
    mipsAddu(REG.a0, REG.s1, REG.zero),
    mipsJal(addresses.pickDropRam),
    mipsNop(),
    mipsAddu(REG.a0, REG.v0, REG.zero),
    mipsJal(addresses.creditCardRam),
    mipsNop(),
    mipsAddiu(REG.s0, REG.s0, 1),
    mipsSltiu(REG.t2, REG.s0, BUFFERED_DROP_COUNT),
    mipsBne(REG.t2, REG.zero, loopRam, loopBranchRam),
    mipsNop(),
    mipsLw(REG.s1, 12, REG.sp),
    mipsLw(REG.s0, 16, REG.sp),
    mipsLw(REG.ra, 20, REG.sp),
    mipsJ(addresses.returnRam),
    mipsAddiu(REG.sp, REG.sp, 24),
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

function buildBufferedPickerProgramVanillaWords(shift: number): readonly number[] {
  if (shift === PAL_FR_EXECUTABLE_SHIFT) {
    return [
      0x938202ec, 0x27850260, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518,
      0x00000000, 0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f,
      0x8c830000, 0x00000000, 0xa4620518, 0x938202ec, 0x00000000, 0x38420001, 0x00021080,
      0x00452021, 0x8c830000, 0x00000000, 0x9462051a, 0x00000000, 0x24420001, 0xa462051a,
      0x3042ffff, 0x2c422710, 0x1440003f, 0x2402270f, 0x8c830000, 0x08008856, 0xa462051a,
      0x3c02800a, 0x9442c728, 0x00000000, 0x3042a000, 0x1040002a, 0x00000000, 0x8f820270,
      0x00000000, 0x90430037, 0x00000000, 0x24630001, 0xa0430037, 0x3c02800a,
    ];
  }

  return [
    0x9382025d, 0x278502d0, 0x00021080, 0x00452021, 0x8c830000, 0x00000000, 0x94620518, 0x00000000,
    0x24420001, 0xa4620518, 0x3042ffff, 0x2c422710, 0x14400004, 0x2402270f, 0x8c830000, 0x00000000,
    0xa4620518, 0x9382025d, 0x00000000, 0x38420001, 0x00021080, 0x00452021, 0x8c830000, 0x00000000,
    0x9462051a, 0x00000000, 0x24420001, 0xa462051a, 0x3042ffff, 0x2c422710, 0x1440003f, 0x2402270f,
    0x8c830000, 0x08008827, 0xa462051a, 0x3c02800a, 0x9442b394, 0x00000000, 0x3042a000, 0x1040002a,
    0x00000000, 0x8f8202e0, 0x00000000, 0x90430037, 0x00000000, 0x24630001, 0xa0430037, 0x3c02800a,
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

function mipsLhu(rt: number, imm: number, rs: number): number {
  return mipsI(0x25, rs, rt, imm);
}

function mipsSw(rt: number, imm: number, rs: number): number {
  return mipsI(0x2b, rs, rt, imm);
}

function mipsSh(rt: number, imm: number, rs: number): number {
  return mipsI(0x29, rs, rt, imm);
}

function mipsSb(rt: number, imm: number, rs: number): number {
  return mipsI(0x28, rs, rt, imm);
}

function mipsLui(rt: number, imm: number): number {
  return mipsI(0x0f, 0, rt, imm);
}

function mipsOri(rt: number, rs: number, imm: number): number {
  return mipsI(0x0d, rs, rt, imm);
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

function upper16(value: number): number {
  return (value >>> 16) & 0xffff;
}

function lower16(value: number): number {
  return value & 0xffff;
}

const REG = {
  zero: 0,
  v0: 2,
  v1: 3,
  a0: 4,
  t0: 8,
  t1: 9,
  t2: 10,
  sp: 29,
  ra: 31,
  gp: 28,
  s0: 16,
  s1: 17,
} as const;
