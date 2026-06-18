/**
 * In-place ISO patching for modding: edits WA_MRG.MRG inside a PS1 disc
 * image, with a rotating backup system mirroring the memcard save editor.
 *
 * This is the "write" counterpart to `extract/` — it assumes the caller has
 * already used the extractors to read current state and wants to apply a
 * targeted patch to one duelist's weight pool.
 */

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  type DropX15PatchStatus,
  inspectDropX15Patch,
  patchDropX15DiscInPlace,
} from "./drop-x15-patch.ts";
import { PAL_CHAR_TABLE } from "./extract/char-tables.ts";
import {
  detectActiveExeLayout,
  detectAttributeMapping,
  parsePsxExeHeader,
} from "./extract/detect-exe.ts";
import { detectWaMrgLayout } from "./extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./extract/detect-wamrg-text.ts";
import { extractDuelists } from "./extract/extract-duelists.ts";
import { extractFusions } from "./extract/extract-fusions.ts";
import { langIdxForSerial, loadDiscData, parseBootExeName } from "./extract/index.ts";
import {
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./extract/iso9660.ts";
import type { DuelistData, Fusion, IsoFile } from "./extract/types.ts";
import {
  DUELIST_BCD_OFFSET,
  DUELIST_DECK_OFFSET,
  DUELIST_ENTRY_SIZE,
  DUELIST_SA_POW_OFFSET,
  DUELIST_SA_TEC_OFFSET,
  FUSION_TABLE_SIZE,
  NUM_CARDS,
  NUM_DUELISTS,
} from "./extract/types.ts";
import { discOffset, writeU16LeArray, writeU16LeAt } from "./extract/write-iso.ts";

export const POOL_SUM = 2048;
export const ISO_BACKUP_DIR_NAME = ".yfm3-iso-backups";
export const MAX_ISO_BACKUPS = 20;
const BACKUP_NAME_RE = /^\d{8}_\d{6}(?:_\d{2})?\.iso$/;

export type PoolType = "deck" | "saPow" | "bcd" | "saTec";
export type PalFrWordingKind = "cardDescription" | "cardName";

export type PalFrWordingStatus =
  | {
      supported: true;
      gameSerial: string;
      discFilename: string;
      glyphRenderingPatch: PalFrGlyphRenderingPatchStatus;
      entries: PalFrWordingEntry[];
    }
  | {
      supported: false;
      gameSerial: string;
      discFilename: string;
      reason: string;
    };

export interface PalFrWordingEntry {
  id: string;
  kind: PalFrWordingKind;
  entryIndex: number;
  offset: number;
  byteLength: number;
  maxByteLength: number;
  text: string;
}

export type PutPalFrWordingResult = {
  backup: IsoBackupEntry | null;
  entry: PalFrWordingEntry;
  entries: PalFrWordingEntry[];
  glyphRenderingPatch: PalFrGlyphRenderingPatchStatus;
};

export type PutPalFrWordingBatchResult = {
  backup: IsoBackupEntry | null;
  entries: PalFrWordingEntry[];
  glyphRenderingPatch: PalFrGlyphRenderingPatchStatus;
};

export interface PalFrWordingChange {
  entryId: string;
  text: string;
}

interface ValidatedPalFrWordingChange {
  encoded: Buffer;
  entry: PalFrWordingEntry;
}

interface PalFrWordingRebuildPlan {
  encodedEntries: Buffer[];
  entries: PalFrWordingEntry[];
  kind: PalFrWordingKind;
  pointerTable: PalFrWordingPointerTable;
  startOffset: number;
  spanLength: number;
}

interface PalFrWordingPointerTable {
  firstCardValueOffset: number;
  valueBase: number;
}

export interface PalFrGlyphRenderingPatchStatus {
  applied: boolean;
  changed: boolean;
  targets: PalFrGlyphRenderingPatchTarget[];
}

export interface PalFrGlyphRenderingPatchTarget {
  label: string;
  rawByte: number;
  tableRamAddress: number;
  fileOffset: number;
  currentWord: number;
  expectedWord: number;
}

const POOL_OFFSETS: Record<PoolType, number> = {
  deck: DUELIST_DECK_OFFSET,
  saPow: DUELIST_SA_POW_OFFSET,
  bcd: DUELIST_BCD_OFFSET,
  saTec: DUELIST_SA_TEC_OFFSET,
};

export function isPoolType(value: unknown): value is PoolType {
  return value === "deck" || value === "saPow" || value === "bcd" || value === "saTec";
}

/**
 * Whether an error from `patchDuelistPool` represents the ISO being held open
 * by another process (typically DuckStation). On Windows, `fs.writeFileSync`
 * against a file open with `FILE_SHARE_READ` but not `FILE_SHARE_WRITE`
 * surfaces as `EBUSY`, `EPERM`, or `EACCES` depending on runtime/path layer.
 * Used by the server to decide whether the close-and-retry fallback applies.
 */
export function isIsoLockedError(err: unknown, discPath: string): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as NodeJS.ErrnoException;
  if (e.code !== "EBUSY" && e.code !== "EPERM" && e.code !== "EACCES") return false;
  // Guard: if a path is attached, make sure it points at our disc — we don't
  // want to misattribute unrelated locking errors from backup writes etc.
  return !e.path || e.path === discPath;
}

export interface IsoBackupEntry {
  filename: string;
  timestamp: string;
  sizeBytes: number;
}

// ── Pool patching ─────────────────────────────────────────────────

/**
 * Apply a new weight array to one duelist's pool in an ISO file, in place.
 *
 * @param discPath Absolute path to a .bin/.iso disc image.
 * @param duelistId 1-based duelist index (1..39).
 * @param poolType Which pool to overwrite.
 * @param weights New weights, length 722, each in [0, 65535].
 */
export function patchDuelistPool(
  discPath: string,
  duelistId: number,
  poolType: PoolType,
  weights: readonly number[],
): IsoBackupEntry | null {
  validateWeights(weights);
  if (duelistId < 1 || duelistId > NUM_DUELISTS) {
    throw new Error(`duelistId out of range: ${duelistId}`);
  }

  const backup = backupIso(discPath);

  const bin = readFileSync(discPath);
  const fmt = detectDiscFormat(bin);

  const waMrgEntry = findWaMrgEntry(bin, fmt);
  const waMrg = readSectors(
    bin,
    waMrgEntry.sector,
    Math.ceil(waMrgEntry.size / SECTOR_DATA_SIZE),
    fmt,
  ).subarray(0, waMrgEntry.size);
  const layout = detectWaMrgLayout(waMrg);

  const fileOffset =
    layout.duelistTable + (duelistId - 1) * DUELIST_ENTRY_SIZE + POOL_OFFSETS[poolType];
  writeU16LeArray(bin, waMrgEntry.sector, fileOffset, weights, fmt);

  writeFileSync(discPath, bin);
  pruneOldBackups(discPath);
  return backup;
}

export function patchFusionTable(
  discPath: string,
  fusions: readonly Fusion[],
): { backup: IsoBackupEntry | null; fusionTable: Fusion[] } {
  const fusionTable = normalizeFusionTable(fusions);
  const encoded = encodeFusionTable(fusionTable);
  const backup = backupIso(discPath);

  const bin = readFileSync(discPath);
  const fmt = detectDiscFormat(bin);
  const waMrgEntry = findWaMrgEntry(bin, fmt);
  const waMrg = readSectors(
    bin,
    waMrgEntry.sector,
    Math.ceil(waMrgEntry.size / SECTOR_DATA_SIZE),
    fmt,
  ).subarray(0, waMrgEntry.size);
  const layout = detectWaMrgLayout(waMrg);

  writeBytesAt(bin, waMrgEntry.sector, layout.fusionTable, encoded, fmt);
  writeFileSync(discPath, bin);
  pruneOldBackups(discPath);
  return { backup, fusionTable };
}

export function getDropX15PatchStatus(discPath: string): DropX15PatchStatus {
  return inspectDropX15Patch(discPath);
}

export function patchDropX15(
  discPath: string,
  targetDropCount?: number,
): {
  backup: IsoBackupEntry | null;
  changed: boolean;
  status: Extract<DropX15PatchStatus, { supported: true }>;
} {
  const before = inspectDropX15Patch(discPath);
  if (!before.supported) throw new Error(before.reason);
  const desiredDropCount = targetDropCount ?? before.cardDropCount;
  if (
    before.cardDropCount === desiredDropCount &&
    before.starchipMultiplier === desiredDropCount &&
    (before.enabled || desiredDropCount === 1)
  ) {
    return { backup: null, changed: false, status: before };
  }
  if (!before.availableDropCounts.includes(desiredDropCount)) {
    throw new Error(`${before.gameSerial} does not support ${desiredDropCount}-card rewards.`);
  }

  const backup = backupIso(discPath);
  const result = patchDropX15DiscInPlace(discPath, desiredDropCount);
  pruneOldBackups(discPath);
  return { backup, changed: result.changed, status: result.status };
}

export function getPalFrWordingStatus(discPath: string): PalFrWordingStatus {
  const { slus, waMrg, serial } = loadDiscData(discPath);
  const discFilename = basename(discPath);
  if (serial !== PAL_FR_SERIAL) {
    return {
      supported: false,
      gameSerial: serial,
      discFilename,
      reason: "PAL French wording edits are currently supported only for SLES_039.48.",
    };
  }

  const entries = extractPalFrWordingEntries(waMrg);
  return {
    supported: true,
    gameSerial: serial,
    discFilename,
    glyphRenderingPatch: inspectPalFrGlyphRenderingPatch(slus),
    entries,
  };
}

export function patchPalFrWordingEntry(
  discPath: string,
  entryId: string,
  text: string,
): PutPalFrWordingResult {
  const result = patchPalFrWordingEntries(discPath, [{ entryId, text }]);
  const entry = result.entries.find((candidate) => candidate.id === entryId);
  if (!entry) throw new Error(`PAL FR wording entry not found after patch: ${entryId}`);
  return { ...result, entry };
}

export function patchPalFrWordingEntries(
  discPath: string,
  changes: readonly PalFrWordingChange[],
): PutPalFrWordingBatchResult {
  const status = getPalFrWordingStatus(discPath);
  if (!status.supported) throw new Error(status.reason);

  const pending = validatePalFrWordingChanges(status.entries, changes);
  const needsGlyphPatch = !status.glyphRenderingPatch.applied;
  if (pending.length === 0 && !needsGlyphPatch) {
    return {
      backup: null,
      entries: status.entries,
      glyphRenderingPatch: status.glyphRenderingPatch,
    };
  }

  const backup = backupIso(discPath);
  const bin = readFileSync(discPath);
  const fmt = detectDiscFormat(bin);
  const waMrgEntry = findWaMrgEntry(bin, fmt);
  const exeEntry = findExecutableEntry(bin, fmt);
  const waMrg = readSectors(
    bin,
    waMrgEntry.sector,
    Math.ceil(waMrgEntry.size / SECTOR_DATA_SIZE),
    fmt,
  ).subarray(0, waMrgEntry.size);
  const currentEntries = extractPalFrWordingEntries(waMrg);
  const rebuildPlans = buildPalFrWordingRebuildPlans(waMrg, currentEntries, pending);
  const updatedEntries = [...status.entries];

  for (const plan of rebuildPlans) {
    writePalFrWordingRebuildPlan(bin, waMrgEntry.sector, fmt, plan);
    for (const updated of plan.entries) {
      const index = updatedEntries.findIndex((entry) => entry.id === updated.id);
      if (index !== -1) updatedEntries[index] = updated;
    }
  }

  patchPalFrGlyphRendering(bin, exeEntry, fmt, status.glyphRenderingPatch.targets);
  writeFileSync(discPath, bin);
  pruneOldBackups(discPath);

  const patchedTargets = status.glyphRenderingPatch.targets.map((target) => ({
    ...target,
    currentWord: target.expectedWord,
  }));
  return {
    backup,
    entries: updatedEntries,
    glyphRenderingPatch: {
      applied: true,
      changed: needsGlyphPatch,
      targets: patchedTargets,
    },
  };
}

const PAL_FR_SERIAL = "SLES_039.48";
const PAL_FR_LANG_IDX = 1;
const PAL_FR_DESC_CARD_START = 2;
const PAL_FR_DESC_POINTER_VALUE_BASE = 0xc800;
const PAL_FR_NAME_POINTER_VALUE_BASE = 0x6000;
const PAL_FR_NAME_POINTER_TABLE_PREFIX = [0x6004, 0x6005] as const;
const PAL_FR_DESC_POINTER_TABLE_PREFIX = [0x2618, 0x2619] as const;
const WORDING_KINDS = [
  "cardName",
  "cardDescription",
] as const satisfies readonly PalFrWordingKind[];
const PAL_FR_GLYPH_TABLE_RAM = 0x801d9000;
const PAL_FR_RENDERER_CALL_SITE_RAM = 0x80039700;
const PAL_FR_RENDERER_CALL_DELAY_WORD = 0x00a72824;
const PAL_FR_RENDERER_ORIGINAL_CALL_WORD = 0x0c00db19;
const PAL_FR_RENDERER_HOOK_RAM = 0x80095044;
const PAL_FR_RENDERER_HOOK_CALL_WORD = jalWord(PAL_FR_RENDERER_HOOK_RAM);
// FUN_800393b8 calls FUN_80036c64 after resolving a glyph word through
// DAT_801d9000. The hook calls the original emitter, inspects the emitted slot,
// and expands only the two PAL FR ligature slots that are wrong in the normal
// menu font: 0x59 (Œ) -> O+E and 0x74 (œ) -> o+e.
const PAL_FR_RENDERER_HOOK_WORDS = [
  0x27bdffe0, 0xafbf001c, 0xafa40018, 0x0c00db19, 0x00000000, 0x8fa80018, 0x8d090020, 0x2529ffea,
  0x912a000e, 0x240b0059, 0x114b0006, 0x00000000, 0x240b0074, 0x114b0009, 0x00000000, 0x0802543f,
  0x00000000, 0x240c002e, 0x240d0024, 0x2406826e, 0x24078264, 0x0802542c, 0x00000000, 0x240c0048,
  0x240d003e, 0x2406828f, 0x24078285, 0xa12c000e, 0xa5260000, 0x8d190020, 0x272e0000, 0x240f0016,
  0x91380000, 0xa1d80000, 0x25290001, 0x25ce0001, 0x25efffff, 0x15e0fffa, 0x00000000, 0xa32d000e,
  0xa7270000, 0x932b0002, 0x256b0004, 0xa32b0002, 0xad0e0020, 0xa1c0000f, 0x8fbf001c, 0x27bd0020,
  0x03e00008, 0x00000000,
] as const;
const PAL_FR_GLYPH_RENDERING_OBSERVATIONS = [
  {
    label: "œ",
    rawByte: 0x3f,
    expectedWord: 0x074089e7,
  },
  {
    label: "à",
    rawByte: 0x3e,
    expectedWord: 0x075089ce,
  },
  {
    label: "Œ",
    rawByte: 0x69,
    expectedWord: 0x059089b2,
  },
  {
    label: "À",
    rawByte: 0x6d,
    expectedWord: 0x05a089b4,
  },
] as const;

const PAL_FR_WORDING_CHAR_TABLE: string[] = (() => {
  const table = [...PAL_CHAR_TABLE];
  table[0x15] = "!";
  table[0x2f] = "?";
  table[0x48] = ":";
  table[0x55] = "ù";
  table[0x61] = "ç";
  table[0x6b] = "4";
  table[0x6d] = "À";
  return table;
})();

const PAL_FR_WORDING_BYTE_BY_CHAR: ReadonlyMap<string, number> = (() => {
  const map = new Map<string, number>();
  for (let i = 0; i < PAL_FR_WORDING_CHAR_TABLE.length; i++) {
    const ch = PAL_FR_WORDING_CHAR_TABLE[i];
    if (ch && !map.has(ch)) map.set(ch, i);
  }
  return map;
})();

function validatePalFrWordingChanges(
  entries: readonly PalFrWordingEntry[],
  changes: readonly PalFrWordingChange[],
): ValidatedPalFrWordingChange[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  return changes.map((change) => {
    if (seen.has(change.entryId)) {
      throw new Error(`Duplicate PAL FR wording entry in save request: ${change.entryId}`);
    }
    seen.add(change.entryId);

    const entry = byId.get(change.entryId);
    if (!entry) throw new Error(`PAL FR wording entry not found: ${change.entryId}`);
    validatePalFrWordingDisplayText(entry.kind, change.text);
    const encoded = encodePalFrWordingText(change.text);
    return { entry, encoded };
  });
}

function validatePalFrWordingDisplayText(kind: PalFrWordingKind, text: string): void {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const maxEntryLength = kind === "cardName" ? 33 : 124;
  const maxLineLength = kind === "cardName" ? 33 : 29;
  if (kind === "cardName" && lines.length > 1) {
    throw new Error("PAL FR card names must fit on one line.");
  }
  if (normalized.length > maxEntryLength) {
    throw new Error(
      `PAL FR ${palFrWordingKindLabel(kind)} must fit in ${maxEntryLength} characters.`,
    );
  }
  if (lines.some((line) => line.length > maxLineLength)) {
    throw new Error(
      `PAL FR ${palFrWordingKindLabel(kind)} lines must fit in ${maxLineLength} characters.`,
    );
  }
}

function palFrWordingKindLabel(kind: PalFrWordingKind): string {
  return kind === "cardName" ? "card names" : "card descriptions";
}

function buildPalFrWordingRebuildPlans(
  waMrg: Buffer,
  currentEntries: readonly PalFrWordingEntry[],
  pending: readonly ValidatedPalFrWordingChange[],
): PalFrWordingRebuildPlan[] {
  const changesByKind = groupPalFrWordingChangesByKind(pending);
  return WORDING_KINDS.flatMap((kind) => {
    const changes = changesByKind.get(kind);
    if (!changes?.size) return [];
    return [
      buildPalFrWordingRebuildPlan(
        kind,
        currentEntries.filter((entry) => entry.kind === kind),
        changes,
        waMrg,
      ),
    ];
  });
}

function groupPalFrWordingChangesByKind(
  pending: readonly ValidatedPalFrWordingChange[],
): Map<PalFrWordingKind, Map<string, Buffer>> {
  const byKind = new Map<PalFrWordingKind, Map<string, Buffer>>();
  for (const change of pending) {
    const changes = byKind.get(change.entry.kind) ?? new Map<string, Buffer>();
    changes.set(change.entry.id, change.encoded);
    byKind.set(change.entry.kind, changes);
  }
  return byKind;
}

function buildPalFrWordingRebuildPlan(
  kind: PalFrWordingKind,
  entries: readonly PalFrWordingEntry[],
  changes: ReadonlyMap<string, Buffer>,
  waMrg: Buffer,
): PalFrWordingRebuildPlan {
  if (entries.length !== NUM_CARDS) {
    throw new Error(
      `PAL FR ${palFrWordingKindLabel(kind)} table has ${entries.length} entries; expected ${NUM_CARDS}.`,
    );
  }
  const sorted = [...entries].sort((a, b) => a.entryIndex - b.entryIndex);
  const startOffset = sorted[0]?.offset;
  const last = sorted[sorted.length - 1];
  if (startOffset == null || !last) {
    throw new Error(`PAL FR ${palFrWordingKindLabel(kind)} table is empty.`);
  }
  const lastEnd = waMrg.indexOf(0xff, last.offset);
  if (lastEnd === -1) {
    throw new Error(`PAL FR ${palFrWordingKindLabel(kind)} table terminator was not found.`);
  }
  const spanLength = findPalFrWordingSpanEnd(waMrg, lastEnd) - startOffset;
  const encodedEntries = sorted.map(
    (entry) => changes.get(entry.id) ?? encodePalFrWordingText(entry.text),
  );
  const encodedLength = encodedEntries.reduce((sum, encoded) => sum + encoded.length + 1, 0);
  if (encodedLength > spanLength) {
    throw new Error(
      `PAL FR ${palFrWordingKindLabel(kind)} table is ${encodedLength - spanLength} encoded bytes over its in-game text block.`,
    );
  }
  const plannedEntries = makePlannedPalFrWordingEntries(kind, sorted, encodedEntries, startOffset);
  const pointerTable = findPalFrWordingPointerTable(kind, waMrg);
  return { encodedEntries, entries: plannedEntries, kind, pointerTable, startOffset, spanLength };
}

function makePlannedPalFrWordingEntries(
  kind: PalFrWordingKind,
  sorted: readonly PalFrWordingEntry[],
  encodedEntries: readonly Buffer[],
  startOffset: number,
): PalFrWordingEntry[] {
  const planned: PalFrWordingEntry[] = [];
  let offset = startOffset;
  for (let i = 0; i < sorted.length; i++) {
    const original = sorted[i];
    if (!original) continue;
    const encoded = encodedEntries[i] ?? Buffer.alloc(0);
    const byteLength = encoded.length;
    planned.push({
      ...original,
      id: palFrWordingEntryId(kind, original.entryIndex),
      offset,
      byteLength,
      maxByteLength: byteLength,
      text: decodePalFrWordingText(encoded, 0, byteLength),
    });
    offset += byteLength + 1;
  }
  return planned;
}

function findPalFrWordingSpanEnd(waMrg: Buffer, lastEnd: number): number {
  let end = lastEnd + 1;
  while (end < waMrg.length && waMrg[end] === 0xff) end++;
  return end;
}

function writePalFrWordingRebuildPlan(
  bin: Buffer,
  waMrgSector: number,
  fmt: ReturnType<typeof detectDiscFormat>,
  plan: PalFrWordingRebuildPlan,
): void {
  const bytes = encodePalFrWordingRebuildPlan(plan);
  for (let i = 0; i < bytes.length; i++) {
    bin[discOffset(waMrgSector, plan.startOffset + i, fmt)] = bytes[i] ?? 0;
  }
  writePalFrWordingPointerTable(bin, waMrgSector, fmt, plan);
}

function encodePalFrWordingRebuildPlan(plan: PalFrWordingRebuildPlan): Buffer {
  const out = Buffer.alloc(plan.spanLength, 0xff);
  let pos = 0;
  for (let i = 0; i < plan.encodedEntries.length; i++) {
    const encoded = plan.encodedEntries[i] ?? Buffer.alloc(0);
    encoded.copy(out, pos);
    pos += encoded.length;
    out[pos] = 0xff;
    pos++;
  }
  return out;
}

function writePalFrWordingPointerTable(
  bin: Buffer,
  waMrgSector: number,
  fmt: ReturnType<typeof detectDiscFormat>,
  plan: PalFrWordingRebuildPlan,
): void {
  for (let i = 0; i < plan.entries.length; i++) {
    const entry = plan.entries[i];
    if (!entry) continue;
    const value = (entry.offset & 0xffff) - plan.pointerTable.valueBase;
    if (value < 0 || value > 0xffff) {
      throw new Error(
        `PAL FR ${palFrWordingKindLabel(plan.kind)} #${entry.entryIndex + 1} pointer 0x${value.toString(16)} is outside the runtime text table range.`,
      );
    }
    writeU16LeAt(bin, waMrgSector, plan.pointerTable.firstCardValueOffset + i * 2, value, fmt);
  }
}

function findPalFrWordingPointerTable(
  kind: PalFrWordingKind,
  waMrg: Buffer,
): PalFrWordingPointerTable {
  if (kind === "cardName") {
    const tableStart = findPalFrNamePointerTable(waMrg);
    return {
      firstCardValueOffset: tableStart + 2,
      valueBase: PAL_FR_NAME_POINTER_VALUE_BASE,
    };
  }

  const tableStart = findPalFrDescPointerTable(waMrg);
  return {
    firstCardValueOffset: tableStart + 2,
    valueBase: PAL_FR_DESC_POINTER_VALUE_BASE,
  };
}

function findPalFrNamePointerTable(waMrg: Buffer): number {
  const hits = findPalFrPointerTableCandidates(waMrg, PAL_FR_NAME_POINTER_TABLE_PREFIX);
  const hit = hits[PAL_FR_LANG_IDX];
  if (hit == null) throw new Error("PAL FR card-name pointer table was not found.");
  return hit;
}

function findPalFrDescPointerTable(waMrg: Buffer): number {
  const textBlock = findAllWaMrgTextBlocks(waMrg)[PAL_FR_LANG_IDX];
  if (!textBlock) throw new Error("PAL FR text block not found in WA_MRG.MRG.");
  const hits = findPalFrPointerTableCandidates(waMrg, PAL_FR_DESC_POINTER_TABLE_PREFIX);
  const beforeDescBlock = hits.filter((hit) => hit < textBlock.descBlockStart);
  const hit = beforeDescBlock[beforeDescBlock.length - 1];
  if (hit == null) throw new Error("PAL FR card-description pointer table was not found.");
  return hit;
}

function findPalFrPointerTableCandidates(waMrg: Buffer, values: readonly number[]): number[] {
  const pattern = Buffer.alloc(values.length * 2);
  for (let i = 0; i < values.length; i++) pattern.writeUInt16LE(values[i] ?? 0, i * 2);

  const hits: number[] = [];
  let pos = waMrg.indexOf(pattern);
  while (pos !== -1) {
    hits.push(pos);
    pos = waMrg.indexOf(pattern, pos + 1);
  }
  return hits;
}

function inspectPalFrGlyphRenderingPatch(slus: Buffer): PalFrGlyphRenderingPatchStatus {
  const header = parsePsxExeHeader(slus);
  const targets = PAL_FR_GLYPH_RENDERING_OBSERVATIONS.map((observation) => {
    const fileOffset = psxRamToExeFileOffset(
      PAL_FR_GLYPH_TABLE_RAM + observation.rawByte * 4,
      header,
    );
    const currentWord = slus.readUInt32LE(fileOffset);
    return {
      label: observation.label,
      rawByte: observation.rawByte,
      tableRamAddress: PAL_FR_GLYPH_TABLE_RAM + observation.rawByte * 4,
      fileOffset,
      currentWord,
      expectedWord: observation.expectedWord,
    };
  });
  const callSiteOffset = psxRamToExeFileOffset(PAL_FR_RENDERER_CALL_SITE_RAM, header);
  const hookOffset = psxRamToExeFileOffset(PAL_FR_RENDERER_HOOK_RAM, header);
  const callSiteWord = slus.readUInt32LE(callSiteOffset);
  const callDelayWord = slus.readUInt32LE(callSiteOffset + 4);
  const hookApplied = PAL_FR_RENDERER_HOOK_WORDS.every(
    (word, index) => slus.readUInt32LE(hookOffset + index * 4) === word,
  );
  return {
    applied:
      callSiteWord === PAL_FR_RENDERER_HOOK_CALL_WORD &&
      callDelayWord === PAL_FR_RENDERER_CALL_DELAY_WORD &&
      hookApplied &&
      targets.every((target) => target.currentWord === target.expectedWord),
    changed: false,
    targets,
  };
}

function patchPalFrGlyphRendering(
  bin: Buffer,
  exeEntry: IsoFile,
  fmt: ReturnType<typeof detectDiscFormat>,
  targets: readonly PalFrGlyphRenderingPatchTarget[],
): void {
  const slus = readSectors(
    bin,
    exeEntry.sector,
    Math.ceil(exeEntry.size / SECTOR_DATA_SIZE),
    fmt,
  ).subarray(0, exeEntry.size);
  const header = parsePsxExeHeader(slus);
  const callSiteOffset = psxRamToExeFileOffset(PAL_FR_RENDERER_CALL_SITE_RAM, header);
  const callSiteWord = slus.readUInt32LE(callSiteOffset);
  if (
    callSiteWord !== PAL_FR_RENDERER_ORIGINAL_CALL_WORD &&
    callSiteWord !== PAL_FR_RENDERER_HOOK_CALL_WORD
  ) {
    throw new Error(
      `PAL FR glyph renderer callsite is 0x${callSiteWord.toString(16)}; expected the original or YFM3 hook.`,
    );
  }
  if (slus.readUInt32LE(callSiteOffset + 4) !== PAL_FR_RENDERER_CALL_DELAY_WORD) {
    throw new Error("PAL FR glyph renderer delay slot changed; refusing to patch.");
  }

  writeU32LeToIso(bin, exeEntry.sector, callSiteOffset, PAL_FR_RENDERER_HOOK_CALL_WORD, fmt);
  writeU32LeToIso(bin, exeEntry.sector, callSiteOffset + 4, PAL_FR_RENDERER_CALL_DELAY_WORD, fmt);
  const hookOffset = psxRamToExeFileOffset(PAL_FR_RENDERER_HOOK_RAM, header);
  for (let i = 0; i < PAL_FR_RENDERER_HOOK_WORDS.length; i++) {
    writeU32LeToIso(
      bin,
      exeEntry.sector,
      hookOffset + i * 4,
      PAL_FR_RENDERER_HOOK_WORDS[i] ?? 0,
      fmt,
    );
  }
  for (const target of targets) {
    writeU32LeToIso(bin, exeEntry.sector, target.fileOffset, target.expectedWord, fmt);
  }
}

function psxRamToExeFileOffset(ramAddress: number, header: ReturnType<typeof parsePsxExeHeader>) {
  const fileOffset = 0x800 + (ramAddress - header.loadAddr);
  if (fileOffset < 0x800 || fileOffset + 4 > 0x800 + header.textSize) {
    throw new Error(
      `PAL FR glyph table address 0x${ramAddress.toString(16)} is outside the executable payload.`,
    );
  }
  return fileOffset;
}

function extractPalFrWordingEntries(waMrg: Buffer): PalFrWordingEntry[] {
  const entries: PalFrWordingEntry[] = [];
  entries.push(
    ...extractPalFrPointerTableEntries(
      "cardDescription",
      waMrg,
      findPalFrWordingPointerTable("cardDescription", waMrg),
      PAL_FR_DESC_CARD_START,
    ),
  );
  entries.push(
    ...extractPalFrPointerTableEntries(
      "cardName",
      waMrg,
      findPalFrWordingPointerTable("cardName", waMrg),
      0,
    ),
  );
  return entries;
}

function extractPalFrPointerTableEntries(
  kind: PalFrWordingKind,
  waMrg: Buffer,
  pointerTable: PalFrWordingPointerTable,
  firstEntryIndex: number,
): PalFrWordingEntry[] {
  const entries: PalFrWordingEntry[] = [];
  const offsetBase = pointerTableOffsetBase(pointerTable.firstCardValueOffset);
  for (let i = 0; i < NUM_CARDS; i++) {
    const value = waMrg.readUInt16LE(pointerTable.firstCardValueOffset + i * 2);
    const offset = offsetBase + pointerTable.valueBase + value;
    const entry = makePalFrWordingEntry(kind, firstEntryIndex + i, offset, waMrg);
    if (entry) entries.push(entry);
  }
  return entries;
}

function pointerTableOffsetBase(pointerOffset: number): number {
  return pointerOffset & 0xffff0000;
}

function makePalFrWordingEntry(
  kind: PalFrWordingKind,
  entryIndex: number,
  offset: number,
  waMrg: Buffer,
): PalFrWordingEntry | null {
  const end = waMrg.indexOf(0xff, offset);
  if (end === -1 || end < offset) return null;
  const maxByteLength = end - offset;
  return {
    id: palFrWordingEntryId(kind, entryIndex),
    kind,
    entryIndex,
    offset,
    byteLength: trimRightSpaceBytes(waMrg, offset, end) - offset,
    maxByteLength,
    text: decodePalFrWordingText(waMrg, offset, maxByteLength),
  };
}

function palFrWordingEntryId(kind: PalFrWordingKind, entryIndex: number): string {
  return `pal-fr:${kind}:${entryIndex}`;
}

function decodePalFrWordingText(buf: Buffer, start: number, byteLength: number): string {
  let result = "";
  for (let i = start; i < start + byteLength && i < buf.length; i++) {
    const b = buf[i] ?? 0;
    if (b === 0xff) break;
    if (b === 0xfe) {
      result += "\n";
      continue;
    }
    if (b === 0xf8 && i + 2 < start + byteLength) {
      result += `{f8 ${hexByte(buf[i + 1] ?? 0)} ${hexByte(buf[i + 2] ?? 0)}}`;
      i += 2;
      continue;
    }
    if (b >= 0xf0 || PAL_FR_WORDING_CHAR_TABLE[b] === undefined) {
      result += `{${hexByte(b)}}`;
      continue;
    }
    result += PAL_FR_WORDING_CHAR_TABLE[b];
  }
  return result.trimEnd();
}

function encodePalFrWordingText(text: string): Buffer {
  const bytes: number[] = [];
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/’/g, "'")
    .replace(/…/g, "...");
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i] ?? "";
    if (ch === "\n") {
      bytes.push(0xfe);
      continue;
    }
    if (ch === "{") {
      const close = normalized.indexOf("}", i + 1);
      if (close !== -1) {
        const token = normalized.slice(i + 1, close).trim();
        const tokenBytes = encodePalFrWordingToken(token);
        if (tokenBytes) {
          bytes.push(...tokenBytes);
          i = close;
          continue;
        }
      }
    }
    const byte = PAL_FR_WORDING_BYTE_BY_CHAR.get(ch);
    if (byte === undefined) {
      throw new Error(`Unsupported PAL FR character: ${ch}`);
    }
    bytes.push(byte);
  }
  return Buffer.from(bytes);
}

function encodePalFrWordingToken(token: string): number[] | null {
  const parts = token.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const byte = parseHexByte(parts[0] ?? "");
    if (byte == null || byte === 0xff) return null;
    return [byte];
  }
  if (parts.length === 3 && parts[0]?.toLowerCase() === "f8") {
    const second = parseHexByte(parts[1] ?? "");
    const third = parseHexByte(parts[2] ?? "");
    if (second == null || third == null) return null;
    return [0xf8, second, third];
  }
  return null;
}

function parseHexByte(value: string): number | null {
  const normalized = value.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{1,2}$/.test(normalized)) return null;
  const byte = Number.parseInt(normalized, 16);
  return byte >= 0 && byte <= 0xff ? byte : null;
}

function trimRightSpaceBytes(buf: Buffer, start: number, end: number): number {
  let pos = end;
  while (pos > start && buf[pos - 1] === 0x00) pos--;
  return pos;
}

function hexByte(value: number): string {
  return value.toString(16).padStart(2, "0");
}

export function normalizeFusionTable(fusions: readonly Fusion[]): Fusion[] {
  const byMaterial1 = new Map<number, Fusion[]>();
  const seen = new Set<string>();
  for (const fusion of fusions) {
    validateFusionId("material1", fusion.material1);
    validateFusionId("material2", fusion.material2);
    validateFusionId("result", fusion.result);
    const material1 = Math.min(fusion.material1, fusion.material2);
    const material2 = Math.max(fusion.material1, fusion.material2);
    const key = `${material1},${material2}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const normalized = { material1, material2, result: fusion.result };
    const group = byMaterial1.get(material1) ?? [];
    group.push(normalized);
    byMaterial1.set(material1, group);
  }

  const out: Fusion[] = [];
  for (let material1 = 1; material1 <= NUM_CARDS; material1++) {
    out.push(...(byMaterial1.get(material1) ?? []));
  }
  return out;
}

export function encodeFusionTable(fusions: readonly Fusion[]): Buffer {
  const headerSize = 2 + NUM_CARDS * 2;
  const out = Buffer.alloc(FUSION_TABLE_SIZE);
  const byMaterial1 = new Map<number, Fusion[]>();
  for (const fusion of fusions) {
    const group = byMaterial1.get(fusion.material1) ?? [];
    group.push(fusion);
    byMaterial1.set(fusion.material1, group);
  }

  let pos = headerSize;
  for (let material1 = 1; material1 <= NUM_CARDS; material1++) {
    const group = byMaterial1.get(material1);
    if (!group?.length) continue;
    if (group.length > 511) {
      throw new Error(`card #${material1} has ${group.length} fusions; max is 511`);
    }
    out.writeUInt16LE(pos, 2 + (material1 - 1) * 2);
    if (group.length <= 255) {
      out[pos] = group.length;
      pos++;
    } else {
      out[pos] = 0;
      out[pos + 1] = 511 - group.length;
      pos += 2;
    }

    for (let i = 0; i < group.length; i += 2) {
      if (pos + 5 > FUSION_TABLE_SIZE) {
        throw new Error("fusion table does not fit in the 64 KiB WA_MRG block");
      }
      const first = group[i];
      const second = group[i + 1];
      if (!first) continue;
      encodeFusionGroup(
        out,
        pos,
        first.material2,
        first.result,
        second?.material2 ?? 0,
        second?.result ?? 0,
      );
      pos += 5;
    }
  }
  return out;
}

function encodeFusionGroup(
  out: Buffer,
  offset: number,
  material2a: number,
  resultA: number,
  material2b: number,
  resultB: number,
): void {
  out[offset] =
    ((material2a >> 8) & 0x03) |
    (((resultA >> 8) & 0x03) << 2) |
    (((material2b >> 8) & 0x03) << 4) |
    (((resultB >> 8) & 0x03) << 6);
  out[offset + 1] = material2a & 0xff;
  out[offset + 2] = resultA & 0xff;
  out[offset + 3] = material2b & 0xff;
  out[offset + 4] = resultB & 0xff;
}

function validateFusionId(field: string, value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > NUM_CARDS) {
    throw new Error(`invalid fusion ${field}: ${value}`);
  }
}

function validateWeights(weights: readonly number[]): void {
  if (weights.length !== NUM_CARDS) {
    throw new Error(`weights must have ${NUM_CARDS} entries, got ${weights.length}`);
  }
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i];
    if (typeof w !== "number" || !Number.isInteger(w) || w < 0 || w > 0xffff) {
      throw new Error(`invalid weight at index ${i}: ${w}`);
    }
  }
}

/**
 * Walk the ISO 9660 filesystem to locate the WA_MRG.MRG file entry.
 * Tries DATA/WA_MRG.MRG first (standard layout) then falls back to scanning
 * subdirectories for the largest compatible file — mirrors the reader logic
 * in `bridge/extract/index.ts` so mods with reshuffled layouts still work.
 */
function findWaMrgEntry(bin: Buffer, fmt: ReturnType<typeof detectDiscFormat>): IsoFile {
  const rootFiles = readRootFiles(bin, fmt);

  const standard = traverse(bin, rootFiles, ["DATA", "WA_MRG.MRG"], fmt);
  if (standard) return standard;

  for (const dir of rootFiles) {
    if (!dir.isDir) continue;
    const dirData = readSectors(bin, dir.sector, Math.ceil(dir.size / SECTOR_DATA_SIZE), fmt);
    const files = parseDirectory(dirData, dir.size);
    for (const f of files) {
      if (!f.isDir && f.size > 10_000_000) {
        try {
          const data = readSectors(
            bin,
            f.sector,
            Math.ceil(f.size / SECTOR_DATA_SIZE),
            fmt,
          ).subarray(0, f.size);
          detectWaMrgLayout(data);
          return f;
        } catch {
          /* not compatible, try next */
        }
      }
    }
  }

  throw new Error("WA_MRG.MRG not found in disc image");
}

function findExecutableEntry(bin: Buffer, fmt: ReturnType<typeof detectDiscFormat>): IsoFile {
  const rootFiles = readRootFiles(bin, fmt);
  const standard = rootFiles.find((file) => /^S[CL][A-Z]{2}_\d/.test(file.name));
  if (standard) return standard;

  const cnfEntry = rootFiles.find((file) => file.name === "SYSTEM.CNF");
  if (!cnfEntry) throw new Error("SYSTEM.CNF not found in disc image");
  const cnf = readSectors(bin, cnfEntry.sector, Math.ceil(cnfEntry.size / SECTOR_DATA_SIZE), fmt)
    .subarray(0, cnfEntry.size)
    .toString("ascii");
  const exeName = parseBootExeName(cnf)?.split("\\").pop()?.split("/").pop();
  const exeEntry = exeName ? rootFiles.find((file) => file.name === exeName) : null;
  if (!exeEntry) throw new Error("PS1 executable not found in disc image");
  return exeEntry;
}

function writeU32LeToIso(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  fmt: ReturnType<typeof detectDiscFormat>,
): void {
  for (let i = 0; i < 4; i++) {
    bin[discOffset(fileStartSector, fileOffset + i, fmt)] = (value >>> (i * 8)) & 0xff;
  }
}

function writeBytesAt(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  bytes: Buffer,
  fmt: ReturnType<typeof detectDiscFormat>,
): void {
  for (let i = 0; i < bytes.length; i++) {
    bin[discOffset(fileStartSector, fileOffset + i, fmt)] = bytes[i] ?? 0;
  }
}

function jalWord(ramAddress: number): number {
  return (0x0c000000 | ((ramAddress >>> 2) & 0x03ffffff)) >>> 0;
}

function readRootFiles(bin: Buffer, fmt: ReturnType<typeof detectDiscFormat>): IsoFile[] {
  const pvd = readSector(bin, PVD_SECTOR, fmt);
  const root = pvd.subarray(156, 190);
  const rootData = readSectors(
    bin,
    root.readUInt32LE(2),
    Math.ceil(root.readUInt32LE(10) / SECTOR_DATA_SIZE),
    fmt,
  );
  return parseDirectory(rootData, root.readUInt32LE(10));
}

function traverse(
  bin: Buffer,
  startFiles: IsoFile[],
  parts: readonly string[],
  fmt: ReturnType<typeof detectDiscFormat>,
): IsoFile | null {
  let files = startFiles;
  for (let i = 0; i < parts.length; i++) {
    const entry = files.find((f) => f.name === parts[i]);
    if (!entry) return null;
    if (i === parts.length - 1) return entry;
    const dirData = readSectors(bin, entry.sector, Math.ceil(entry.size / SECTOR_DATA_SIZE), fmt);
    files = parseDirectory(dirData, entry.size);
  }
  return null;
}

// ── Backups ───────────────────────────────────────────────────────

function backupDirFor(discPath: string): string {
  return join(dirname(discPath), ISO_BACKUP_DIR_NAME, sanitizeName(basename(discPath)));
}

function sanitizeName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function backupIso(discPath: string): IsoBackupEntry | null {
  if (!existsSync(discPath)) return null;
  const dir = backupDirFor(discPath);
  mkdirSync(dir, { recursive: true });
  const filename = uniqueBackupName(dir);
  const dest = join(dir, filename);
  copyFileSync(discPath, dest);
  const stat = statSync(dest);
  return {
    filename,
    timestamp: parseBackupTimestamp(filename) ?? stat.mtime.toISOString(),
    sizeBytes: stat.size,
  };
}

function formatBackupName(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.iso`
  );
}

function parseBackupTimestamp(name: string): string | null {
  const m = name.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`).toISOString();
}

function uniqueBackupName(dir: string): string {
  const base = formatBackupName(new Date());
  if (!existsSync(join(dir, base))) return base;
  const stem = base.replace(/\.iso$/, "");
  for (let i = 1; i < 100; i++) {
    const candidate = `${stem}_${String(i).padStart(2, "0")}.iso`;
    if (!existsSync(join(dir, candidate))) return candidate;
  }
  const suffix = createHash("sha1").update(`${Date.now()}`).digest("hex").slice(0, 8);
  return `${stem}_${suffix}.iso`;
}

function pruneOldBackups(discPath: string): void {
  const dir = backupDirFor(discPath);
  if (!existsSync(dir)) return;
  const names = readdirSync(dir)
    .filter((f) => BACKUP_NAME_RE.test(f))
    .sort();
  const drop = names.slice(0, Math.max(0, names.length - MAX_ISO_BACKUPS));
  for (const name of drop) {
    try {
      unlinkSync(join(dir, name));
    } catch (err) {
      console.warn(
        `Failed to prune ISO backup ${name}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}

// ── Re-read helper (for refreshing gameData after a patch) ─────────

/**
 * Re-extract the duelist table (names + 4 pools each) from a (possibly just
 * patched) ISO. Skips artwork, cards, and fusion extraction since those are
 * untouched by pool edits — this keeps the post-save refresh under a few
 * hundred ms even on a cold disk cache.
 */
export function reReadDuelists(discPath: string, cardStats: Uint8Array): DuelistData[] {
  const { slus, waMrg, serial } = loadDiscData(discPath);
  const exeLayout = detectActiveExeLayout(slus, { cardStats });
  const waMrgLayout = detectWaMrgLayout(waMrg);
  const langIdx = langIdxForSerial(serial);
  // Attribute mapping is unused for duelist pools but the text-block detector
  // depends on nameOffsetTable being resolved first — this mirrors the setup
  // in game-data.ts so PAL discs keep their fallback path.
  void detectAttributeMapping(slus, exeLayout, langIdx);
  const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];
  return extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks, langIdx);
}

export function reReadFusionTable(discPath: string): Fusion[] {
  const { waMrg } = loadDiscData(discPath);
  return extractFusions(waMrg, detectWaMrgLayout(waMrg));
}

export function listIsoBackups(discPath: string): IsoBackupEntry[] {
  const dir = backupDirFor(discPath);
  if (!existsSync(dir)) return [];
  const entries: IsoBackupEntry[] = [];
  for (const name of readdirSync(dir)) {
    if (!BACKUP_NAME_RE.test(name)) continue;
    const stat = statSync(join(dir, name));
    entries.push({
      filename: name,
      timestamp: parseBackupTimestamp(name) ?? stat.mtime.toISOString(),
      sizeBytes: stat.size,
    });
  }
  return entries.sort((a, b) => (a.filename < b.filename ? 1 : -1));
}

/**
 * Restore the ISO from a previously-recorded backup, after saving the current
 * state as a fresh "pre-restore" backup. Returns the pre-restore entry so the
 * caller can surface it as an undo point.
 */
export function restoreIsoBackup(discPath: string, backupFilename: string): IsoBackupEntry | null {
  if (!BACKUP_NAME_RE.test(backupFilename)) {
    throw new Error(`Invalid backup filename: ${backupFilename}`);
  }
  const dir = backupDirFor(discPath);
  const src = join(dir, backupFilename);
  if (!existsSync(src)) throw new Error(`Backup not found: ${backupFilename}`);

  const preRestore = backupIso(discPath);
  const tmp = `${discPath}.restoring`;
  copyFileSync(src, tmp);
  renameSync(tmp, discPath);
  pruneOldBackups(discPath);
  return preRestore;
}
