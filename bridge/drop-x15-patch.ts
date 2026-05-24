import { readFileSync, writeFileSync } from "node:fs";
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

const AWARD_HOOK_OFFSET = 0x12710;
const VISIBLE_PICK_HOOK_OFFSET = 0x12460;
const LOCAL_PROGRAM_OFFSET = 0x12724;

const GHOST_LOOP_DEFINITION_ID = "ghost-loop-limits";
const GHOST_LOOP_DEFINITION_NAME = "Ghost/FMR loop-limit x15";
const GHOST_NO_ANCHORS_REASON =
  "No Ghost/FMR loop-limit x15 anchors were found in this disc image.";

const GHOST_TOOL_DEFINITION_ID = "ghost-drop-more-cards";
const GHOST_TOOL_DEFINITION_NAME = "Ghost Drop More Cards x15";
const GHOST_TOOL_SLUS_EXPANSION_OFFSET = 0x19b400;
const GHOST_TOOL_DROP_COUNT = 15;
const GHOST_TOOL_FIRST_LIMIT = GHOST_TOOL_DROP_COUNT + 1;
const GHOST_TOOL_LAST_LIMIT = GHOST_TOOL_DROP_COUNT;
const GHOST_TOOL_WA_LIMIT_OFFSETS = [0x78, 0x174, 0x1ec] as const;
const GHOST_TOOL_WA_CLEAN_PREFIX = Buffer.from("0c0007140193143f0200003f0000013f", "hex");
const GHOST_TOOL_NTSC_RNG_CALL = jal(0x8008e590);
const GHOST_TOOL_PAL_RNG_CALL = jal(0x8008f708);

const LEGACY_LOCAL_VISIBLE_PICK = 0x0c008604;
const LEGACY_FREEZE_SELECTOR_VISIBLE_PICK = 0x0c0087da;
const LEGACY_LOCAL_AWARD_JUMP = 0x080087c9;
const LEGACY_LOCAL_AWARD_DELAY = 0x00000000;
const LEGACY_LOCAL_PROGRAM_WORDS = [
  0x8f8202e0, 0x8444003c, 0x0c008625, 0x00000000, 0x8f8402e0, 0x90830039, 0x90820038, 0x0003182b,
  0x00038840, 0x2c420003, 0x10400002, 0x00000000, 0x24110001, 0x2410000e, 0x02202021, 0x0c008604,
  0x00000000, 0x00402021, 0x0c008625, 0x00000000, 0x2610ffff, 0x1600fff8, 0x00000000, 0x08008827,
  0x00000000,
] as const;
const LEGACY_FREEZE_SELECTOR_PROGRAM_WORDS = [
  0x8f8202e0, 0x8444003c, 0x0c008625, 0x00000000, 0x9051003b, 0x2410000e, 0x02202021, 0x0c008604,
  0x00000000, 0x00402021, 0x0c008625, 0x00000000, 0x2610ffff, 0x1600fff8, 0x00000000, 0x08008827,
  0x00000000, 0x03e08821, 0x8f8302e0, 0x0c008604, 0xa064003b, 0x02200008, 0x00000000, 0x00000000,
  0x00000000,
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
const GHOST_TOOL_PAL_EXPANSION = makePalGhostToolExpansion();

function makePalGhostToolExpansion(): Buffer {
  const expansion = Buffer.from(GHOST_TOOL_EXPANSION);
  const blobOffset = (ramAddress: number): number => ramAddress - 0x801aac00;

  writeU32LeToBuffer(expansion, blobOffset(0x801aad38), 0x3c03801c);
  writeU32LeToBuffer(expansion, blobOffset(0x801aad44), j(0x80021d30));
  writeU32LeToBuffer(expansion, blobOffset(0x801aad9c), jal(0x80021950));
  writeU32LeToBuffer(expansion, blobOffset(0x801aadc4), j(0x80021fd8));
  writeU32LeToBuffer(expansion, blobOffset(0x801aae6c), j(0x800218f8));

  const rngCalls = replaceU32LeInBuffer(
    expansion,
    GHOST_TOOL_NTSC_RNG_CALL,
    GHOST_TOOL_PAL_RNG_CALL,
  );
  if (rngCalls !== 7) {
    throw new Error(`PAL Ghost expansion expected 7 RNG calls, found ${rngCalls}.`);
  }

  return expansion;
}

interface GhostToolHook {
  offset: number;
  vanilla: Buffer;
  patched: Buffer;
}

interface GhostToolLayout {
  hooks: readonly GhostToolHook[];
  expansion: Buffer;
  waCopyOffset: number;
  waCopyStride: number;
  waCopyStart: number;
  waCopyCount: number;
  waExtraLimits: readonly { offset: number; value: number }[];
}

const GHOST_TOOL_LAYOUTS: readonly GhostToolLayout[] = [
  {
    hooks: GHOST_TOOL_SLUS_HOOKS,
    expansion: GHOST_TOOL_EXPANSION,
    waCopyOffset: 0xb4c400,
    waCopyStride: 0x75800,
    waCopyStart: 1,
    waCopyCount: 7,
    waExtraLimits: [{ offset: 0xbc17e4, value: GHOST_TOOL_FIRST_LIMIT }],
  },
  {
    hooks: [
      {
        offset: 0x120f0,
        vanilla: Buffer.from("1880023C8C874224", "hex"),
        patched: Buffer.from("95AB060800000000", "hex"),
      },
      {
        offset: 0x12100,
        vanilla: Buffer.from("21800202", "hex"),
        patched: Buffer.from("00000000", "hex"),
      },
      {
        offset: 0x12528,
        vanilla: Buffer.from("1C80033C0A80013C", "hex"),
        patched: Buffer.from("10AB060800000000", "hex"),
      },
      {
        offset: 0x127cc,
        vanilla: Buffer.from("3C0044845486000C", "hex"),
        patched: Buffer.from("53AB060800000000", "hex"),
      },
      {
        offset: 0x28590,
        vanilla: Buffer.from("20048387ACDF000821286200", "hex"),
        patched: Buffer.from("20048387ACDF000821286200", "hex"),
      },
    ],
    expansion: GHOST_TOOL_PAL_EXPANSION,
    waCopyOffset: 0xe25400,
    waCopyStride: 0x78000,
    waCopyStart: 0,
    waCopyCount: 7,
    waExtraLimits: [{ offset: 0xe24fe4, value: GHOST_TOOL_FIRST_LIMIT }],
  },
];

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

  const legacyState = inspectLegacyUnsafePatchState(image, slusEntry, format);
  if (isSpecificLegacyPatchState(legacyState)) return legacyState;

  return ghostToolState;
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
    const legacyState = inspectLegacyUnsafePatchState(image, slusEntry, format);
    if (isSpecificLegacyPatchState(legacyState)) before = legacyState;
  }
  if (!before.supported && isSpecificLegacyPatchState(before)) throw new Error(before.reason);
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

function isSpecificLegacyPatchState(status: DropX15PatchStatus): boolean {
  return (
    !status.supported &&
    (status.reason.startsWith("This disc has the legacy local x15 trampoline installed.") ||
      status.reason.startsWith("An unsafe legacy 15-card-drop patch is installed."))
  );
}

function inspectGhostToolPatchState(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
): DropX15PatchStatus {
  const waEntry = findWaMrgEntry(image, format);

  for (const layout of GHOST_TOOL_LAYOUTS) {
    const hooksVanilla = ghostToolHooksMatch(image, slusEntry, format, layout, "vanilla");
    const hooksPatched = ghostToolHooksMatch(image, slusEntry, format, layout, "patched");
    const slusExpansionPatched = bytesMatchAt(
      image,
      slusEntry.sector,
      GHOST_TOOL_SLUS_EXPANSION_OFFSET,
      layout.expansion,
      format,
    );
    const waExpansionPatched = waEntry
      ? ghostToolWaCopiesPatched(image, waEntry, format, layout)
      : false;

    if (hooksPatched && slusExpansionPatched && waExpansionPatched) {
      return {
        supported: true,
        enabled: true,
        definitionId: GHOST_TOOL_DEFINITION_ID,
        definitionName: GHOST_TOOL_DEFINITION_NAME,
        gameSerial: slusEntry.name,
      };
    }

    if (hooksVanilla && waEntry && ghostToolWaTargetsClean(image, waEntry, format, layout)) {
      return {
        supported: true,
        enabled: false,
        definitionId: GHOST_TOOL_DEFINITION_ID,
        definitionName: GHOST_TOOL_DEFINITION_NAME,
        gameSerial: slusEntry.name,
      };
    }

    if ((hooksVanilla || hooksPatched) && !waEntry) {
      return {
        supported: false,
        enabled: false,
        gameSerial: slusEntry.name,
        reason:
          "DATA/WA_MRG.MRG was not found; Ghost Drop More Cards requires both SLUS and WA_MRG.",
      };
    }

    if (hooksVanilla && waEntry && ghostToolWaCopiesInRange(waEntry, layout)) {
      return {
        supported: false,
        enabled: false,
        gameSerial: slusEntry.name,
        reason:
          "DATA/WA_MRG.MRG does not match the verified Ghost Drop More Cards injection layout.",
      };
    }
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
  const layout = findCleanGhostToolLayout(image, slusEntry, waEntry, format);
  if (!layout) throw new Error("DATA/WA_MRG.MRG does not match a verified Ghost layout.");

  for (const hook of layout.hooks) {
    writeBytesAt(image, slusEntry.sector, hook.offset, hook.patched, format);
  }
  writeBytesAt(image, slusEntry.sector, GHOST_TOOL_SLUS_EXPANSION_OFFSET, layout.expansion, format);

  for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
    writeBytesAt(image, waEntry.sector, copyOffset, layout.expansion, format);
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
  for (const limit of layout.waExtraLimits) {
    writeGhostToolWaLimit(image, waEntry, format, limit.offset, limit.value);
  }
}

function ghostToolHooksMatch(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  state: "vanilla" | "patched",
): boolean {
  return layout.hooks.every((hook) =>
    bytesMatchAt(image, slusEntry.sector, hook.offset, hook[state], format),
  );
}

function findCleanGhostToolLayout(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile,
  format: DiscFormat,
): GhostToolLayout | null {
  return (
    GHOST_TOOL_LAYOUTS.find(
      (layout) =>
        ghostToolHooksMatch(image, slusEntry, format, layout, "vanilla") &&
        ghostToolWaTargetsClean(image, waEntry, format, layout),
    ) ?? null
  );
}

function ghostToolWaCopiesPatched(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
): boolean {
  if (!ghostToolWaCopiesInRange(waEntry, layout)) return false;
  for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
    if (!bytesMatchAt(image, waEntry.sector, copyOffset, layout.expansion, format)) return false;
  }
  return layout.waExtraLimits.every(
    (limit) => image[discOffset(waEntry.sector, limit.offset, format)] === limit.value,
  );
}

function ghostToolWaTargetsClean(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
): boolean {
  if (!ghostToolWaCopiesInRange(waEntry, layout)) return false;
  for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
    if (!bytesMatchAt(image, waEntry.sector, copyOffset, GHOST_TOOL_WA_CLEAN_PREFIX, format)) {
      return false;
    }
  }
  return true;
}

function ghostToolWaCopiesInRange(waEntry: IsoFile, layout: GhostToolLayout): boolean {
  const offsets = ghostToolWaCopyOffsets(layout);
  const lastCopyOffset = offsets[offsets.length - 1] ?? 0;
  const lastExtraOffset = Math.max(...layout.waExtraLimits.map((limit) => limit.offset));
  return lastCopyOffset + layout.expansion.length <= waEntry.size && lastExtraOffset < waEntry.size;
}

function ghostToolWaCopyOffsets(layout: GhostToolLayout): number[] {
  return Array.from(
    { length: layout.waCopyCount },
    (_, i) => layout.waCopyOffset + (layout.waCopyStart + i) * layout.waCopyStride,
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

function inspectLegacyUnsafePatchState(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
): DropX15PatchStatus {
  const slusSector = slusEntry.sector;
  const visiblePick = readU32LeAt(image, slusSector, VISIBLE_PICK_HOOK_OFFSET, format);
  const awardJump = readU32LeAt(image, slusSector, AWARD_HOOK_OFFSET, format);
  const awardDelay = readU32LeAt(image, slusSector, AWARD_HOOK_OFFSET + 4, format);
  const legacyAwardHook =
    awardJump === LEGACY_LOCAL_AWARD_JUMP && awardDelay === LEGACY_LOCAL_AWARD_DELAY;

  if (
    legacyAwardHook &&
    visiblePick === LEGACY_LOCAL_VISIBLE_PICK &&
    wordsMatch(image, slusSector, format, LOCAL_PROGRAM_OFFSET, LEGACY_LOCAL_PROGRAM_WORDS)
  ) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason:
        "This disc has the legacy local x15 trampoline installed. It is no longer treated as safe; use a Ghost/FMR loop-limit x15 image or restore an unpatched backup.",
    };
  }

  if (
    legacyAwardHook &&
    visiblePick === LEGACY_FREEZE_SELECTOR_VISIBLE_PICK &&
    wordsMatch(
      image,
      slusSector,
      format,
      LOCAL_PROGRAM_OFFSET,
      LEGACY_FREEZE_SELECTOR_PROGRAM_WORDS,
    )
  ) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason:
        "An unsafe legacy 15-card-drop patch is installed. Restore an unpatched backup or use a Ghost/FMR loop-limit x15 image.",
    };
  }

  return {
    supported: false,
    enabled: false,
    gameSerial: slusEntry.name,
    reason:
      "No compatible 15-card drop patch layout was found. Supported layouts are Ghost/FMR loop limits and Ghost Drop More Cards.",
  };
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

function j(address: number): number {
  return (0x08000000 | ((address >>> 2) & 0x03ffffff)) >>> 0;
}

function jal(address: number): number {
  return (0x0c000000 | ((address >>> 2) & 0x03ffffff)) >>> 0;
}

function writeU32LeToBuffer(buffer: Buffer, offset: number, value: number): void {
  buffer.writeUInt32LE(value >>> 0, offset);
}

function replaceU32LeInBuffer(buffer: Buffer, from: number, to: number): number {
  let count = 0;
  for (let offset = 0; offset <= buffer.length - 4; offset += 4) {
    if (buffer.readUInt32LE(offset) === from >>> 0) {
      buffer.writeUInt32LE(to >>> 0, offset);
      count++;
    }
  }
  return count;
}
