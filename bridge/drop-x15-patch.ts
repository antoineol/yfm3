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
const GHOST_NO_ANCHORS_REASON =
  "No Ghost/FMR loop-limit x15 anchors were found in this disc image.";

const GHOST_TOOL_DEFINITION_ID = "ghost-drop-more-cards";
const GHOST_TOOL_SLUS_EXPANSION_OFFSET = 0x19b400;
const GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET = 0x19b700;
const GHOST_TOOL_STARCHIP_TRAMPOLINE_DELTA =
  GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET - GHOST_TOOL_SLUS_EXPANSION_OFFSET;
const GHOST_TOOL_STARCHIP_TRAMPOLINE_MAX_LENGTH = 0x40;
const GHOST_TOOL_STARCHIP_TRAMPOLINE_RAM = 0x801aaf00;
const GHOST_TOOL_NTSC_DISPLAY_CAP_HOOK_OFFSET = 0x12508;
const GHOST_TOOL_NTSC_DISPLAY_CAP_HELPER_RAM = 0x801aaee0;
const GHOST_TOOL_NTSC_DISPLAY_CAP_HELPER_OFFSET =
  GHOST_TOOL_NTSC_DISPLAY_CAP_HELPER_RAM - 0x801aac00;
const GHOST_TOOL_NTSC_DISPLAY_CAP_RETURN_RAM = 0x80021d10;
const GHOST_TOOL_DROP_COUNT = 15;
const GHOST_TOOL_FIRST_LIMIT = GHOST_TOOL_DROP_COUNT + 1;
const GHOST_TOOL_VISIBLE_REWARD_RESTORE_OFFSET = 0xf4;
const GHOST_TOOL_LOAD_FIRST_PICKED_REWARD = 0x97a20022;
const GHOST_TOOL_SELECTABLE_DROP_COUNTS = [1, 5, 15, 50, 150, 1000] as const;
const GHOST_TOOL_RECOGNIZED_DROP_COUNTS = [1, 5, 15, 30, 50, 150, 1000] as const;
const GHOST_LOOP_RECOGNIZED_DROP_COUNTS = [1, 5, 15] as const;
const GHOST_TOOL_WA_LIMIT_OFFSETS = [0x78, 0x174, 0x1ec] as const;
const GHOST_TOOL_WA_CLEAN_PREFIX = Buffer.from("0c0007140193143f0200003f0000013f", "hex");
const GHOST_TOOL_NTSC_DISPLAY_CAP_ORIGINAL = Buffer.from("3a00629000000000", "hex");
const GHOST_TOOL_NTSC_DISPLAY_CAP_PATCHED = wordsBuffer([
  j(GHOST_TOOL_NTSC_DISPLAY_CAP_HELPER_RAM),
  0,
]);
const PAL_REWARD_COUNTER_HALFWORD_OPS = [
  { offset: 0x6c, word: 0x97b60020 },
  { offset: 0x80, word: 0xa7a00020 },
  { offset: 0x84, word: 0xa7b60020 },
  { offset: 0x168, word: 0x96560020 },
  { offset: 0x17c, word: 0xa6400020 },
  { offset: 0x180, word: 0xa6560020 },
  { offset: 0x1e0, word: 0x94560020 },
  { offset: 0x1f4, word: 0xa4400020 },
  { offset: 0x1f8, word: 0xa4560020 },
] as const;
const GHOST_TOOL_NTSC_RNG_CALL = jal(0x8008e590);
const GHOST_TOOL_PAL_RNG_CALL = jal(0x8008f708);
const STARCHIP_X15_VANILLA = Buffer.from("3a004390e005828c0000000021104300e00582ac", "hex");
const STARCHIP_X15_PATCHED = Buffer.from("3a004390e005828c002903002318a30021104300e00582ac", "hex");
const STARCHIP_VANILLA_PATCH_SITE = Buffer.from("0000000021104300e00582ac", "hex");
const STARCHIP_PATCH_SITE_OFFSET = 8;
const STARCHIP_HOOK_WORD_COUNT = 3;
const PSX_EXE_FILE_OFFSET_TO_RAM_DELTA = 0x8000f800;

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
const GHOST_LOOP_STARCHIP_LAYOUT: GhostToolLayout = {
  hooks: [],
  expansion: GHOST_TOOL_EXPANSION,
  selectableDropCounts: GHOST_LOOP_RECOGNIZED_DROP_COUNTS,
  recognizedDropCounts: GHOST_LOOP_RECOGNIZED_DROP_COUNTS,
  scratchBase: 0xac00,
  waCopyOffset: 0,
  waCopyStride: 0,
  waCopyStart: 0,
  waCopyCount: 0,
  waExtraLimits: [],
  starchipAwardOffset: 0x126d4,
};
const GHOST_TOOL_PAL_EXPANSION = makePalGhostToolExpansion();

function makePalGhostToolExpansion(): Buffer {
  const expansion = Buffer.from(GHOST_TOOL_EXPANSION);
  const blobOffset = (ramAddress: number): number => ramAddress - 0x801aac00;

  writeU32LeToBuffer(expansion, blobOffset(0x801aad38), 0x3c03801c);
  writeU32LeToBuffer(expansion, blobOffset(0x801aad44), j(0x80021d30));
  writeU32LeToBuffer(expansion, blobOffset(0x801aad9c), jal(0x80021950));
  writeU32LeToBuffer(expansion, blobOffset(0x801aadc4), j(0x80021fd8));
  writeU32LeToBuffer(expansion, blobOffset(0x801aae6c), j(0x800218f8));
  writePalRewardCounterHalfwordOps(expansion);

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

function writePalRewardCounterHalfwordOps(expansion: Buffer): void {
  for (const op of PAL_REWARD_COUNTER_HALFWORD_OPS) {
    writeU32LeToBuffer(expansion, op.offset, op.word);
  }
}

interface GhostToolHook {
  offset: number;
  vanilla: Buffer;
  patched: Buffer;
}

interface GhostToolLayout {
  hooks: readonly GhostToolHook[];
  expansion: Buffer;
  selectableDropCounts: readonly number[];
  recognizedDropCounts: readonly number[];
  scratchBase: number;
  waCopyOffset: number;
  waCopyStride: number;
  waCopyStart: number;
  waCopyCount: number;
  waExtraLimits: readonly { offset: number; value: number }[];
  starchipAwardOffset: number;
  displayCapHook?: {
    offset: number;
    original: Buffer;
    patched: Buffer;
  };
}

const GHOST_TOOL_NTSC_LAYOUT: GhostToolLayout = {
  hooks: GHOST_TOOL_SLUS_HOOKS,
  expansion: GHOST_TOOL_EXPANSION,
  selectableDropCounts: GHOST_TOOL_SELECTABLE_DROP_COUNTS,
  recognizedDropCounts: GHOST_TOOL_RECOGNIZED_DROP_COUNTS,
  scratchBase: 0xb000,
  waCopyOffset: 0xb4c400,
  waCopyStride: 0x75800,
  waCopyStart: 1,
  waCopyCount: 7,
  waExtraLimits: [{ offset: 0xbc17e4, value: GHOST_TOOL_FIRST_LIMIT }],
  starchipAwardOffset: 0x126d4,
  displayCapHook: {
    offset: GHOST_TOOL_NTSC_DISPLAY_CAP_HOOK_OFFSET,
    original: GHOST_TOOL_NTSC_DISPLAY_CAP_ORIGINAL,
    patched: GHOST_TOOL_NTSC_DISPLAY_CAP_PATCHED,
  },
};

const GHOST_TOOL_LAYOUTS: readonly GhostToolLayout[] = [
  GHOST_TOOL_NTSC_LAYOUT,
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
    selectableDropCounts: GHOST_TOOL_SELECTABLE_DROP_COUNTS,
    recognizedDropCounts: GHOST_TOOL_RECOGNIZED_DROP_COUNTS,
    scratchBase: 0xb500,
    waCopyOffset: 0xe25400,
    waCopyStride: 0x78000,
    waCopyStart: 0,
    waCopyCount: 7,
    waExtraLimits: [{ offset: 0xe24fe4, value: GHOST_TOOL_FIRST_LIMIT }],
    starchipAwardOffset: 0x12790,
  },
];

const GHOST_LOOP_PATTERNS = [
  {
    label: "reward pick loop",
    bytePrefix: Buffer.from("2000a0a32000b693000000000100d626", "hex"),
    suffix: Buffer.from("1d00d712", "hex"),
    loopLimit: firstLoopLimit,
  },
  {
    label: "reward transfer loop",
    bytePrefix: Buffer.from("200040a220005692000000000100d626", "hex"),
    suffix: Buffer.from("0c00d712", "hex"),
    loopLimit: firstLoopLimit,
  },
  {
    label: "reward display loop",
    bytePrefix: Buffer.from("080044ac20005690000000000100d626", "hex"),
    suffix: Buffer.from("0200d712", "hex"),
    loopLimit: (dropCount: number) => dropCount,
  },
] as const;

export type DropX15PatchStatus =
  | {
      supported: true;
      enabled: boolean;
      definitionId: string;
      definitionName: string;
      cardDropCount: number;
      starchipMultiplier: number;
      availableDropCounts: number[];
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

export function isSupportedDropCount(status: DropX15PatchStatus, dropCount: number): boolean {
  return status.supported && status.availableDropCounts.includes(dropCount);
}

export function inspectDropX15Patch(discPath: string): DropX15PatchStatus {
  const image = readFileSync(discPath);
  return inspectDropX15Image(image);
}

export function inspectDropX15Image(image: Buffer): DropX15PatchStatus {
  const format = detectDiscFormat(image);
  const slusEntry = findExecutableEntry(image, format);
  const ghostState = inspectGhostLoopPatchState(image, slusEntry, format);
  const ghostToolState = inspectGhostToolPatchState(image, slusEntry, format);
  if (shouldPreferGhostToolState(ghostToolState, ghostState)) return ghostToolState;
  if (ghostState.supported || ghostState.reason !== GHOST_NO_ANCHORS_REASON) {
    return ghostState;
  }

  const legacyState = inspectLegacyUnsafePatchState(image, slusEntry, format);
  if (isSpecificLegacyPatchState(legacyState)) return legacyState;

  return ghostToolState;
}

export function patchDropX15DiscInPlace(
  discPath: string,
  targetDropCount?: number,
): PatchDropX15Result {
  const image = readFileSync(discPath);
  const format = detectDiscFormat(image);
  const slusEntry = findExecutableEntry(image, format);

  const ghostState = inspectGhostLoopPatchState(image, slusEntry, format);
  const ghostToolState = inspectGhostToolPatchState(image, slusEntry, format);
  let before: DropX15PatchStatus = shouldPreferGhostToolState(ghostToolState, ghostState)
    ? ghostToolState
    : ghostState;
  if (!before.supported) {
    const legacyState = inspectLegacyUnsafePatchState(image, slusEntry, format);
    if (isSpecificLegacyPatchState(legacyState)) before = legacyState;
  }
  if (!before.supported && isSpecificLegacyPatchState(before)) throw new Error(before.reason);
  if (!before.supported) throw new Error(before.reason);
  const desiredDropCount = targetDropCount ?? before.cardDropCount;
  if (
    before.cardDropCount === desiredDropCount &&
    before.starchipMultiplier === desiredDropCount &&
    (before.enabled || desiredDropCount === 1)
  ) {
    return { changed: false, status: before };
  }
  if (!isSupportedDropCount(before, desiredDropCount)) {
    throw new Error(
      `${before.gameSerial} does not support ${desiredDropCount}-card rewards through this patch.`,
    );
  }

  if (before.definitionId === GHOST_LOOP_DEFINITION_ID) {
    normalizeGhostLoopPatchToGhostTool(image, slusEntry, format, desiredDropCount);
  } else {
    writeGhostToolPatch(image, slusEntry, format, desiredDropCount);
  }
  writeFileSync(discPath, image);

  const after = inspectDropX15Image(readFileSync(discPath));
  if (!after.supported) throw new Error(after.reason);
  if (after.cardDropCount !== desiredDropCount || after.starchipMultiplier !== desiredDropCount) {
    throw new Error("Drop reward patch did not persist after writing.");
  }
  if (desiredDropCount !== 1 && !after.enabled) {
    throw new Error("Drop reward patch did not persist after writing.");
  }
  return { changed: true, status: after };
}

function shouldPreferGhostToolState(
  ghostToolState: DropX15PatchStatus,
  ghostState: DropX15PatchStatus,
): ghostToolState is Extract<DropX15PatchStatus, { supported: true }> {
  if (!ghostToolState.supported) return false;
  if (ghostToolState.availableDropCounts.length > 1) return true;
  return !ghostState.supported || ghostToolState.cardDropCount > ghostState.cardDropCount;
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
    const starchipState = inspectGhostToolStarchipPatchState(
      image,
      slusEntry,
      waEntry,
      format,
      layout,
    );
    const hooksVanilla = ghostToolHooksMatch(image, slusEntry, format, layout, "vanilla");
    const hooksPatched = ghostToolHooksMatch(image, slusEntry, format, layout, "patched");
    const currentDropCount =
      hooksPatched && waEntry
        ? ghostToolPatchedDropCount(image, slusEntry, waEntry, format, layout)
        : null;
    const legacyVisibleDropCount =
      hooksPatched && waEntry
        ? ghostToolLegacyVisibleDropCount(image, slusEntry, waEntry, format, layout)
        : null;
    const patchedDropCount = currentDropCount ?? legacyVisibleDropCount;
    const cardLayoutUpgradeable =
      hooksPatched &&
      ghostToolExpansionPatched(image, slusEntry.sector, format, layout, "base") &&
      !!waEntry &&
      ghostToolWaCopiesPatched(image, waEntry, format, layout, 15, "base");
    const cardLayoutClean =
      hooksVanilla && waEntry && ghostToolWaTargetsClean(image, waEntry, format, layout);
    const cardLayoutPatched = patchedDropCount != null;

    if (
      (cardLayoutClean || cardLayoutPatched || cardLayoutUpgradeable) &&
      !starchipState.supported
    ) {
      return {
        supported: false,
        enabled: false,
        gameSerial: slusEntry.name,
        reason: "No compatible starchip reward-save anchor was found.",
      };
    }

    if (cardLayoutPatched) {
      const cardDropCount = patchedDropCount ?? 1;
      return {
        supported: true,
        enabled:
          currentDropCount != null &&
          cardDropCount > 1 &&
          starchipState.multiplier === cardDropCount &&
          starchipState.current,
        definitionId: GHOST_TOOL_DEFINITION_ID,
        definitionName: ghostToolDefinitionName(cardDropCount),
        cardDropCount,
        starchipMultiplier: starchipState.multiplier,
        availableDropCounts: [...layout.selectableDropCounts],
        gameSerial: slusEntry.name,
      };
    }

    if (
      (cardLayoutClean || cardLayoutPatched || cardLayoutUpgradeable) &&
      starchipState.supported
    ) {
      return {
        supported: true,
        enabled: false,
        definitionId: GHOST_TOOL_DEFINITION_ID,
        definitionName: ghostToolDefinitionName(cardLayoutUpgradeable ? 15 : 1),
        cardDropCount: cardLayoutUpgradeable ? 15 : 1,
        starchipMultiplier: starchipState.multiplier,
        availableDropCounts: [...layout.selectableDropCounts],
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

function writeGhostToolPatch(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
  targetDropCount: number,
): void {
  const waEntry = findWaMrgEntry(image, format);
  if (!waEntry) throw new Error("DATA/WA_MRG.MRG was not found.");
  const layout = findGhostToolPatchLayout(image, slusEntry, waEntry, format);
  if (!layout) throw new Error("DATA/WA_MRG.MRG does not match a verified Ghost layout.");

  writeGhostToolPatchWithLayout(image, slusEntry, waEntry, format, layout, targetDropCount);
}

function writeGhostToolPatchWithLayout(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  targetDropCount: number,
  forceRewrite = false,
): void {
  if (forceRewrite || ghostToolHooksMatch(image, slusEntry, format, layout, "vanilla")) {
    for (const hook of layout.hooks) {
      writeBytesAt(image, slusEntry.sector, hook.offset, hook.patched, format);
    }
  }

  if (
    forceRewrite ||
    !ghostToolExpansionPatched(image, slusEntry.sector, format, layout, targetDropCount) ||
    !ghostToolWaCopiesPatched(image, waEntry, format, layout, targetDropCount)
  ) {
    const expansion = ghostToolExpansionForDropCount(layout, targetDropCount);
    writeBytesAt(image, slusEntry.sector, GHOST_TOOL_SLUS_EXPANSION_OFFSET, expansion, format);

    for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
      writeBytesAt(image, waEntry.sector, copyOffset, expansion, format);
      writeGhostToolWaLimit(
        image,
        waEntry,
        format,
        copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[0],
        firstLoopLimit(targetDropCount),
      );
      writeGhostToolWaLimit(
        image,
        waEntry,
        format,
        copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[1],
        firstLoopLimit(targetDropCount),
      );
      writeGhostToolWaLimit(
        image,
        waEntry,
        format,
        copyOffset + GHOST_TOOL_WA_LIMIT_OFFSETS[2],
        targetDropCount,
      );
    }
    for (const limit of layout.waExtraLimits) {
      writeGhostToolWaLimit(image, waEntry, format, limit.offset, firstLoopLimit(targetDropCount));
    }
  }
  writeGhostToolStarchipPatch(image, slusEntry, waEntry, format, layout, targetDropCount);
  writeGhostToolDisplayCapHook(image, slusEntry, format, layout, targetDropCount);
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

function findGhostToolPatchLayout(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile,
  format: DiscFormat,
): GhostToolLayout | null {
  return (
    GHOST_TOOL_LAYOUTS.find(
      (layout) =>
        (ghostToolHooksMatch(image, slusEntry, format, layout, "vanilla") &&
          ghostToolWaTargetsClean(image, waEntry, format, layout)) ||
        (ghostToolHooksMatch(image, slusEntry, format, layout, "patched") &&
          (ghostToolPatchedDropCount(image, slusEntry, waEntry, format, layout) != null ||
            ghostToolLegacyVisibleDropCount(image, slusEntry, waEntry, format, layout) != null ||
            (ghostToolExpansionPatched(image, slusEntry.sector, format, layout, "base") &&
              ghostToolWaCopiesPatched(image, waEntry, format, layout, 15, "base")))),
    ) ?? null
  );
}

function ghostToolPatchedDropCount(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
): number | null {
  for (const dropCount of layout.recognizedDropCounts) {
    if (
      ghostToolExpansionPatched(image, slusEntry.sector, format, layout, dropCount) &&
      ghostToolWaCopiesPatched(image, waEntry, format, layout, dropCount) &&
      ghostToolDisplayCapHookPatched(image, slusEntry, format, layout, dropCount)
    ) {
      return dropCount;
    }
  }
  if (
    layout.recognizedDropCounts.includes(15) &&
    ghostToolExpansionPatched(image, slusEntry.sector, format, layout, "base") &&
    ghostToolWaCopiesPatched(image, waEntry, format, layout, 15, "base") &&
    ghostToolDisplayCapHookPatched(image, slusEntry, format, layout, 15)
  ) {
    return 15;
  }
  return null;
}

function ghostToolLegacyVisibleDropCount(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
): number | null {
  for (const dropCount of layout.recognizedDropCounts) {
    if (
      legacyGhostToolExpansionPatched(image, slusEntry.sector, format, layout, dropCount) &&
      legacyGhostToolWaCopiesPatched(image, waEntry, format, layout, dropCount)
    ) {
      return dropCount;
    }
    if (
      staleDisplayCapGhostToolExpansionPatched(
        image,
        slusEntry.sector,
        format,
        layout,
        dropCount,
      ) &&
      staleDisplayCapGhostToolWaCopiesPatched(image, waEntry, format, layout, dropCount)
    ) {
      return dropCount;
    }
  }
  return null;
}

function ghostToolExpansionPatched(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCountOrVariant: number | "base",
): boolean {
  return bytesMatchAt(
    image,
    slusSector,
    GHOST_TOOL_SLUS_EXPANSION_OFFSET,
    dropCountOrVariant === "base"
      ? layout.expansion
      : ghostToolExpansionForDropCount(layout, dropCountOrVariant),
    format,
  );
}

function legacyGhostToolExpansionPatched(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): boolean {
  return bytesMatchAt(
    image,
    slusSector,
    GHOST_TOOL_SLUS_EXPANSION_OFFSET,
    legacyGhostToolExpansionForDropCount(layout, dropCount),
    format,
  );
}

function ghostToolWaCopiesPatched(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
  variant: "target" | "base" = "target",
): boolean {
  const expansion =
    variant === "target" ? ghostToolExpansionForDropCount(layout, dropCount) : layout.expansion;
  const extraLimit = variant === "target" ? firstLoopLimit(dropCount) : GHOST_TOOL_FIRST_LIMIT;
  return ghostToolWaCopiesMatchExpansion(image, waEntry, format, layout, expansion, extraLimit);
}

function legacyGhostToolWaCopiesPatched(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): boolean {
  return ghostToolWaCopiesMatchExpansion(
    image,
    waEntry,
    format,
    layout,
    legacyGhostToolExpansionForDropCount(layout, dropCount),
    firstLoopLimit(dropCount),
  );
}

function staleDisplayCapGhostToolExpansionPatched(
  image: Buffer,
  slusSector: number,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): boolean {
  return bytesMatchAt(
    image,
    slusSector,
    GHOST_TOOL_SLUS_EXPANSION_OFFSET,
    staleDisplayCapGhostToolExpansionForDropCount(layout, dropCount),
    format,
  );
}

function staleDisplayCapGhostToolWaCopiesPatched(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): boolean {
  return ghostToolWaCopiesMatchExpansion(
    image,
    waEntry,
    format,
    layout,
    staleDisplayCapGhostToolExpansionForDropCount(layout, dropCount),
    firstLoopLimit(dropCount),
  );
}

function ghostToolDisplayCapHookPatched(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): boolean {
  if (!layout.displayCapHook) return true;
  const expected =
    dropCount > GHOST_TOOL_DROP_COUNT
      ? layout.displayCapHook.patched
      : layout.displayCapHook.original;
  return bytesMatchAt(image, slusEntry.sector, layout.displayCapHook.offset, expected, format);
}

function ghostToolWaCopiesMatchExpansion(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  expansion: Buffer,
  extraLimit: number,
): boolean {
  if (!ghostToolWaCopiesInRange(waEntry, layout)) return false;
  for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
    if (!bytesMatchAt(image, waEntry.sector, copyOffset, expansion, format)) return false;
  }
  return layout.waExtraLimits.every((limit) =>
    ghostToolWaLimitMatches(image, waEntry, format, limit.offset, extraLimit),
  );
}

function ghostToolExpansionForDropCount(layout: GhostToolLayout, dropCount: number): Buffer {
  const expansion = staleDisplayCapGhostToolExpansionForDropCount(layout, dropCount);
  writeGhostToolDisplayCapHelper(expansion, layout, dropCount);
  return expansion;
}

function staleDisplayCapGhostToolExpansionForDropCount(
  layout: GhostToolLayout,
  dropCount: number,
): Buffer {
  const expansion = legacyGhostToolExpansionForDropCount(layout, dropCount);
  writeU32LeToBuffer(
    expansion,
    GHOST_TOOL_VISIBLE_REWARD_RESTORE_OFFSET,
    GHOST_TOOL_LOAD_FIRST_PICKED_REWARD,
  );
  return expansion;
}

function legacyGhostToolExpansionForDropCount(layout: GhostToolLayout, dropCount: number): Buffer {
  const expansion = Buffer.from(layout.expansion);
  if (dropCount > 0xff) writePalRewardCounterHalfwordOps(expansion);
  writeAddiuImmediate(expansion, 0x44, layout.scratchBase);
  writeAddiuImmediate(expansion, 0x78, firstLoopLimit(dropCount));
  writeAddiuImmediate(expansion, 0x150, layout.scratchBase);
  writeAddiuImmediate(expansion, 0x174, firstLoopLimit(dropCount));
  writeAddiuImmediate(expansion, 0x1d0, layout.scratchBase);
  writeAddiuImmediate(expansion, 0x1ec, dropCount);
  return expansion;
}

function writeGhostToolDisplayCapHelper(
  expansion: Buffer,
  layout: GhostToolLayout,
  dropCount: number,
): void {
  if (!layout.displayCapHook || dropCount <= GHOST_TOOL_DROP_COUNT) return;
  wordsBuffer([0x2402000f, j(GHOST_TOOL_NTSC_DISPLAY_CAP_RETURN_RAM), 0]).copy(
    expansion,
    GHOST_TOOL_NTSC_DISPLAY_CAP_HELPER_OFFSET,
  );
}

function writeGhostToolDisplayCapHook(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  dropCount: number,
): void {
  if (!layout.displayCapHook) return;
  const bytes =
    dropCount > GHOST_TOOL_DROP_COUNT
      ? layout.displayCapHook.patched
      : layout.displayCapHook.original;
  writeBytesAt(image, slusEntry.sector, layout.displayCapHook.offset, bytes, format);
}

function writeAddiuImmediate(buffer: Buffer, offset: number, immediate: number): void {
  const instruction = buffer.readUInt32LE(offset);
  buffer.writeUInt32LE(((instruction & 0xffff0000) | (immediate & 0xffff)) >>> 0, offset);
}

function firstLoopLimit(dropCount: number): number {
  return dropCount + 1;
}

function ghostToolDefinitionName(dropCount: number): string {
  return `Ghost Drop More Cards x${dropCount}`;
}

function ghostLoopDefinitionName(dropCount: number): string {
  return `Ghost/FMR loop-limit x${dropCount}`;
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
  const lastHelperOffset =
    lastCopyOffset +
    GHOST_TOOL_STARCHIP_TRAMPOLINE_DELTA +
    GHOST_TOOL_STARCHIP_TRAMPOLINE_MAX_LENGTH;
  return (
    Math.max(lastCopyOffset + layout.expansion.length, lastHelperOffset) <= waEntry.size &&
    lastExtraOffset < waEntry.size
  );
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
  const targetOffset = discOffset(waEntry.sector, offset, format);
  if (value <= 0xff) {
    image[targetOffset] = value;
    return;
  }
  image.writeUInt16LE(value, targetOffset);
}

function ghostToolWaLimitMatches(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  offset: number,
  value: number,
): boolean {
  const targetOffset = discOffset(waEntry.sector, offset, format);
  if (value <= 0xff) return image[targetOffset] === value;
  return image.readUInt16LE(targetOffset) === value;
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

function inspectGhostLoopPatchState(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
): DropX15PatchStatus {
  const matches = GHOST_LOOP_PATTERNS.map((pattern) => inspectGhostLoopPattern(image, pattern));
  const starchipState = inspectGhostToolStarchipPatchState(
    image,
    slusEntry,
    null,
    format,
    GHOST_LOOP_STARCHIP_LAYOUT,
  );
  const totals = matches.map((match) => match.total);
  const hasAnyGhostAnchor = totals.some((total) => total > 0);

  if (!hasAnyGhostAnchor) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason: GHOST_NO_ANCHORS_REASON,
    };
  }

  const hasAllLoops = totals.every((total) => total > 0);
  if (!hasAllLoops) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason: "Only part of the Ghost/FMR loop-limit x15 anchor set was found.",
    };
  }

  if (!starchipState.supported) {
    return {
      supported: false,
      enabled: false,
      gameSerial: slusEntry.name,
      reason: "No compatible starchip reward x15 anchor was found.",
    };
  }

  const cardDropCount = currentGhostLoopDropCount(matches);

  return {
    supported: true,
    enabled:
      cardDropCount > 1 &&
      matches.every((match) => (match.byDropCount.get(cardDropCount)?.length ?? 0) > 0) &&
      starchipState.multiplier === cardDropCount &&
      starchipState.current,
    definitionId: GHOST_LOOP_DEFINITION_ID,
    definitionName: ghostLoopDefinitionName(cardDropCount),
    cardDropCount,
    starchipMultiplier: starchipState.multiplier,
    availableDropCounts: [...GHOST_TOOL_SELECTABLE_DROP_COUNTS],
    gameSerial: slusEntry.name,
  };
}

function inspectGhostLoopPattern(
  image: Buffer,
  pattern: (typeof GHOST_LOOP_PATTERNS)[number],
): { total: number; byDropCount: Map<number, number[]> } {
  const byDropCount = new Map<number, number[]>();
  for (const dropCount of GHOST_LOOP_RECOGNIZED_DROP_COUNTS) {
    const offsets = findPatternOffsets(image, ghostLoopPatternBytes(pattern, dropCount));
    if (offsets.length === 0) continue;
    byDropCount.set(dropCount, offsets);
  }
  return {
    total: [...byDropCount.values()].reduce((sum, entries) => sum + entries.length, 0),
    byDropCount,
  };
}

function currentGhostLoopDropCount(matches: Array<{ byDropCount: Map<number, number[]> }>): number {
  const candidates = GHOST_LOOP_RECOGNIZED_DROP_COUNTS.filter((dropCount) =>
    matches.every((match) => (match.byDropCount.get(dropCount)?.length ?? 0) > 0),
  );
  const nonVanilla = candidates.filter((dropCount) => dropCount > 1);
  return nonVanilla.length > 0 ? Math.max(...nonVanilla) : 1;
}

function normalizeGhostLoopPatchToGhostTool(
  image: Buffer,
  slusEntry: IsoFile,
  format: DiscFormat,
  targetDropCount: number,
): void {
  const waEntry = findWaMrgEntry(image, format);
  if (!waEntry) throw new Error("DATA/WA_MRG.MRG was not found.");
  writeGhostToolPatchWithLayout(
    image,
    slusEntry,
    waEntry,
    format,
    GHOST_TOOL_NTSC_LAYOUT,
    targetDropCount,
    true,
  );
}

function ghostLoopPatternBytes(
  pattern: (typeof GHOST_LOOP_PATTERNS)[number],
  dropCount: number,
): Buffer {
  const limit = pattern.loopLimit(dropCount);
  const immediate = Buffer.alloc(4);
  immediate.writeUInt32LE((0x24170000 | (limit & 0xffff)) >>> 0, 0);
  return Buffer.concat([pattern.bytePrefix, immediate, pattern.suffix]);
}

function inspectGhostToolStarchipPatchState(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile | null,
  format: DiscFormat,
  layout: GhostToolLayout,
): { supported: boolean; multiplier: number; current: boolean } {
  if (
    bytesMatchAt(image, slusEntry.sector, layout.starchipAwardOffset, STARCHIP_X15_VANILLA, format)
  ) {
    return { supported: true, multiplier: 1, current: true };
  }
  if (
    bytesMatchAt(image, slusEntry.sector, layout.starchipAwardOffset, STARCHIP_X15_PATCHED, format)
  ) {
    return { supported: true, multiplier: 15, current: true };
  }

  const hookOffset = layout.starchipAwardOffset + STARCHIP_PATCH_SITE_OFFSET;
  const hookMatches =
    readU32LeAt(image, slusEntry.sector, hookOffset, format) ===
      j(GHOST_TOOL_STARCHIP_TRAMPOLINE_RAM) &&
    readU32LeAt(image, slusEntry.sector, hookOffset + 4, format) === 0 &&
    readU32LeAt(image, slusEntry.sector, hookOffset + 8, format) === 0;
  if (!hookMatches) return { supported: false, multiplier: 1, current: false };

  const returnAddress =
    PSX_EXE_FILE_OFFSET_TO_RAM_DELTA + layout.starchipAwardOffset + STARCHIP_X15_PATCHED.length;
  const legacyReturnAddress =
    PSX_EXE_FILE_OFFSET_TO_RAM_DELTA + layout.starchipAwardOffset + STARCHIP_X15_VANILLA.length;
  for (const multiplier of layout.recognizedDropCounts) {
    const currentHelper = starchipTrampolineForMultiplier(multiplier, returnAddress);
    if (
      bytesMatchAt(
        image,
        slusEntry.sector,
        GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET,
        currentHelper,
        format,
      )
    ) {
      return {
        supported: true,
        multiplier,
        current:
          !waEntry ||
          ghostToolWaStarchipHelpersPatched(image, waEntry, format, layout, currentHelper),
      };
    }
    if (
      bytesMatchAt(
        image,
        slusEntry.sector,
        GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET,
        legacyStarchipTrampolineForMultiplier(multiplier, legacyReturnAddress),
        format,
      )
    ) {
      return { supported: true, multiplier, current: false };
    }
    if (
      bytesMatchAt(
        image,
        slusEntry.sector,
        GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET,
        staleLoadDelayStarchipTrampolineForMultiplier(multiplier, returnAddress),
        format,
      )
    ) {
      return { supported: true, multiplier, current: false };
    }
  }
  return { supported: false, multiplier: 1, current: false };
}

function writeGhostToolStarchipPatch(
  image: Buffer,
  slusEntry: IsoFile,
  waEntry: IsoFile | null,
  format: DiscFormat,
  layout: GhostToolLayout,
  multiplier: number,
): void {
  if (layout.selectableDropCounts.length === 1 || multiplier === 15) {
    writeBytesAt(image, slusEntry.sector, layout.starchipAwardOffset, STARCHIP_X15_PATCHED, format);
    return;
  }

  const patchSiteOffset = layout.starchipAwardOffset + STARCHIP_PATCH_SITE_OFFSET;
  if (multiplier === 1) {
    writeBytesAt(image, slusEntry.sector, patchSiteOffset, STARCHIP_VANILLA_PATCH_SITE, format);
    return;
  }

  for (let i = 0; i < STARCHIP_HOOK_WORD_COUNT; i++) {
    writeU32LeAt(
      image,
      slusEntry.sector,
      patchSiteOffset + i * 4,
      i === 0 ? j(GHOST_TOOL_STARCHIP_TRAMPOLINE_RAM) : 0,
      format,
    );
  }
  const returnAddress =
    PSX_EXE_FILE_OFFSET_TO_RAM_DELTA + layout.starchipAwardOffset + STARCHIP_X15_PATCHED.length;
  const helper = starchipTrampolineForMultiplier(multiplier, returnAddress);
  writeBytesAt(image, slusEntry.sector, GHOST_TOOL_STARCHIP_TRAMPOLINE_OFFSET, helper, format);
  if (waEntry) {
    for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
      writeBytesAt(
        image,
        waEntry.sector,
        copyOffset + GHOST_TOOL_STARCHIP_TRAMPOLINE_DELTA,
        helper,
        format,
      );
    }
  }
}

function ghostToolWaStarchipHelpersPatched(
  image: Buffer,
  waEntry: IsoFile,
  format: DiscFormat,
  layout: GhostToolLayout,
  helper: Buffer,
): boolean {
  if (!ghostToolWaCopiesInRange(waEntry, layout)) return false;
  for (const copyOffset of ghostToolWaCopyOffsets(layout)) {
    if (
      !bytesMatchAt(
        image,
        waEntry.sector,
        copyOffset + GHOST_TOOL_STARCHIP_TRAMPOLINE_DELTA,
        helper,
        format,
      )
    ) {
      return false;
    }
  }
  return true;
}

function starchipTrampolineForMultiplier(multiplier: number, returnAddress: number): Buffer {
  const words = [
    ...starchipMultiplierWords(multiplier),
    0x8c8205e0,
    0,
    addu(2, 2, 3),
    0xac8205e0,
    j(returnAddress),
    0,
  ];
  return wordsBuffer(words);
}

function staleLoadDelayStarchipTrampolineForMultiplier(
  multiplier: number,
  returnAddress: number,
): Buffer {
  const words = [
    ...starchipMultiplierWords(multiplier),
    0x8c8205e0,
    addu(2, 2, 3),
    0xac8205e0,
    j(returnAddress),
    0,
  ];
  return wordsBuffer(words);
}

function starchipMultiplierWords(multiplier: number): number[] {
  if (multiplier === 1) return [];
  if (multiplier === 5) return [sll(5, 3, 2), addu(3, 5, 3)];
  if (multiplier === 15) return [sll(5, 3, 4), subu(3, 5, 3)];
  if (multiplier === 30) return [sll(2, 3, 5), sll(5, 3, 1), subu(3, 2, 5)];
  if (multiplier === 50) {
    return [sll(2, 3, 5), sll(5, 3, 4), addu(2, 2, 5), sll(5, 3, 1), addu(3, 2, 5)];
  }
  if (multiplier === 150) {
    return [
      sll(2, 3, 7),
      sll(5, 3, 4),
      addu(2, 2, 5),
      sll(5, 3, 2),
      addu(2, 2, 5),
      sll(5, 3, 1),
      addu(3, 2, 5),
    ];
  }
  if (multiplier === 1000) {
    return [sll(2, 3, 10), sll(5, 3, 4), subu(2, 2, 5), sll(5, 3, 3), subu(3, 2, 5)];
  }
  throw new Error(`Unsupported starchip multiplier x${multiplier}.`);
}

function legacyStarchipTrampolineForMultiplier(multiplier: number, returnAddress: number): Buffer {
  const words = [
    ...legacyStarchipMultiplierWords(multiplier),
    addu(2, 2, 3),
    0xac8205e0,
    j(returnAddress),
    0,
  ];
  return wordsBuffer(words);
}

function wordsBuffer(words: readonly number[]): Buffer {
  const buffer = Buffer.alloc(words.length * 4);
  for (let i = 0; i < words.length; i++) {
    buffer.writeUInt32LE(words[i] ?? 0, i * 4);
  }
  return buffer;
}

function legacyStarchipMultiplierWords(multiplier: number): number[] {
  if (multiplier === 1) return [];
  if (multiplier === 5) return [sll(5, 3, 2), addu(3, 5, 3)];
  if (multiplier === 15) return [sll(5, 3, 4), subu(3, 5, 3)];
  if (multiplier === 30) return [sll(5, 3, 5), sll(8, 3, 1), subu(3, 5, 8)];
  if (multiplier === 50) {
    return [sll(8, 3, 5), sll(5, 3, 4), addu(8, 8, 5), sll(5, 3, 1), addu(3, 8, 5)];
  }
  if (multiplier === 150) {
    return [
      sll(8, 3, 7),
      sll(5, 3, 4),
      addu(8, 8, 5),
      sll(5, 3, 2),
      addu(8, 8, 5),
      sll(5, 3, 1),
      addu(3, 8, 5),
    ];
  }
  if (multiplier === 1000) {
    return [sll(8, 3, 10), sll(5, 3, 4), subu(8, 8, 5), sll(5, 3, 3), subu(3, 8, 5)];
  }
  throw new Error(`Unsupported legacy starchip multiplier x${multiplier}.`);
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

function writeU32LeAt(
  image: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  format: DiscFormat,
): void {
  image.writeUInt32LE(value >>> 0, discOffset(fileStartSector, fileOffset, format));
}

function j(address: number): number {
  return (0x08000000 | ((address >>> 2) & 0x03ffffff)) >>> 0;
}

function jal(address: number): number {
  return (0x0c000000 | ((address >>> 2) & 0x03ffffff)) >>> 0;
}

function sll(rd: number, rt: number, shift: number): number {
  return ((rt << 16) | (rd << 11) | (shift << 6)) >>> 0;
}

function addu(rd: number, rs: number, rt: number): number {
  return ((rs << 21) | (rt << 16) | (rd << 11) | 0x21) >>> 0;
}

function subu(rd: number, rs: number, rt: number): number {
  return ((rs << 21) | (rt << 16) | (rd << 11) | 0x23) >>> 0;
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
