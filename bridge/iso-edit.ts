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
import { langIdxForSerial, loadDiscData, parseBootExeName } from "./extract/index.ts";
import {
  detectDiscFormat,
  PVD_SECTOR,
  parseDirectory,
  readSector,
  readSectors,
  SECTOR_DATA_SIZE,
} from "./extract/iso9660.ts";
import type { DuelistData, IsoFile } from "./extract/types.ts";
import {
  DUELIST_BCD_OFFSET,
  DUELIST_DECK_OFFSET,
  DUELIST_ENTRY_SIZE,
  DUELIST_SA_POW_OFFSET,
  DUELIST_SA_TEC_OFFSET,
  NUM_CARDS,
  NUM_DUELISTS,
} from "./extract/types.ts";
import { discOffset, writeU16LeArray } from "./extract/write-iso.ts";

export const POOL_SUM = 2048;
export const ISO_BACKUP_DIR_NAME = ".yfm3-iso-backups";
export const MAX_ISO_BACKUPS = 20;
const BACKUP_NAME_RE = /^\d{8}_\d{6}(?:_\d{2})?\.iso$/;

export type PoolType = "deck" | "saPow" | "bcd" | "saTec";
export type PalFrWordingKind = "cardDescription" | "cardName" | "script";

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
  const updatedEntries = [...status.entries];

  for (const change of pending) {
    const current = currentEntries.find((candidate) => candidate.id === change.entry.id);
    if (
      !current ||
      current.offset !== change.entry.offset ||
      current.maxByteLength !== change.entry.maxByteLength
    ) {
      throw new Error(
        "PAL FR wording entry moved while patching; reload the active ISO and retry.",
      );
    }

    for (let i = 0; i < change.entry.maxByteLength; i++) {
      const value = change.encoded[i] ?? 0x00;
      bin[discOffset(waMrgEntry.sector, change.entry.offset + i, fmt)] = value;
    }

    const updated = {
      ...change.entry,
      byteLength: change.encoded.length,
      text: decodePalFrWordingText(
        Buffer.concat([
          change.encoded,
          Buffer.alloc(change.entry.maxByteLength - change.encoded.length, 0x00),
        ]),
        0,
        change.entry.maxByteLength,
      ),
    };
    const index = updatedEntries.findIndex((entry) => entry.id === updated.id);
    if (index !== -1) updatedEntries[index] = updated;
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
const PAL_FR_NAME_SKIP = 1;
const PAL_FR_MAX_SCRIPT_ENTRY_BYTES = 500;
const PAL_FR_GLYPH_TABLE_RAM = 0x801d9000;
const PAL_FR_GLYPH_ID_MASK = 0x0ff00000;
const PAL_FR_GLYPH_RENDERING_FIXES = [
  {
    label: "œ",
    rawByte: 0x3f,
    expectedGlyphId: 0x75,
  },
  {
    label: "à",
    rawByte: 0x3e,
    expectedGlyphId: 0x74,
  },
  {
    label: "Œ",
    rawByte: 0x69,
    expectedGlyphId: 0x5a,
  },
  {
    label: "À",
    rawByte: 0x6d,
    expectedGlyphId: 0x59,
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
): { entry: PalFrWordingEntry; encoded: Buffer }[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  return changes.map((change) => {
    if (seen.has(change.entryId)) {
      throw new Error(`Duplicate PAL FR wording entry in save request: ${change.entryId}`);
    }
    seen.add(change.entryId);

    const entry = byId.get(change.entryId);
    if (!entry) throw new Error(`PAL FR wording entry not found: ${change.entryId}`);
    const encoded = encodePalFrWordingText(change.text);
    if (encoded.length > entry.maxByteLength) {
      throw new Error(
        `Encoded text is ${encoded.length} bytes; this entry can hold ${entry.maxByteLength}.`,
      );
    }
    return { entry, encoded };
  });
}

function inspectPalFrGlyphRenderingPatch(slus: Buffer): PalFrGlyphRenderingPatchStatus {
  const header = parsePsxExeHeader(slus);
  const targets = PAL_FR_GLYPH_RENDERING_FIXES.map((fix) => {
    const fileOffset = psxRamToExeFileOffset(PAL_FR_GLYPH_TABLE_RAM + fix.rawByte * 4, header);
    const currentWord = slus.readUInt32LE(fileOffset);
    const expectedWord =
      ((currentWord & ~PAL_FR_GLYPH_ID_MASK) | (fix.expectedGlyphId << 20)) >>> 0;
    return {
      label: fix.label,
      rawByte: fix.rawByte,
      tableRamAddress: PAL_FR_GLYPH_TABLE_RAM + fix.rawByte * 4,
      fileOffset,
      currentWord,
      expectedWord,
    };
  });
  return {
    applied: targets.every((target) => target.currentWord === target.expectedWord),
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
  for (const target of targets) {
    if (target.currentWord === target.expectedWord) continue;
    const offset = target.fileOffset;
    writeU32LeToIso(bin, exeEntry.sector, offset, target.expectedWord, fmt);
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
  const textBlock = findAllWaMrgTextBlocks(waMrg)[PAL_FR_LANG_IDX];
  if (!textBlock) throw new Error("PAL FR text block not found in WA_MRG.MRG.");

  const entries: PalFrWordingEntry[] = [];
  entries.push(
    ...extractSequentialPalFrEntries(
      waMrg,
      textBlock.descBlockStart,
      PAL_FR_DESC_CARD_START + NUM_CARDS,
      (entryIndex, offset) =>
        entryIndex >= PAL_FR_DESC_CARD_START
          ? makePalFrWordingEntry("cardDescription", entryIndex, offset, waMrg)
          : null,
    ),
  );
  entries.push(
    ...extractPalFrScriptEntries(
      waMrg,
      skipWaMrgEntriesForWording(
        waMrg,
        textBlock.descBlockStart,
        PAL_FR_DESC_CARD_START + NUM_CARDS,
      ),
      textBlock.nameBlockStart,
    ),
  );

  const nameStart = skipWaMrgEntriesForWording(waMrg, textBlock.nameBlockStart, PAL_FR_NAME_SKIP);
  entries.push(
    ...extractSequentialPalFrEntries(waMrg, nameStart, NUM_CARDS, (entryIndex, offset) =>
      makePalFrWordingEntry("cardName", entryIndex, offset, waMrg),
    ),
  );
  return entries;
}

function extractSequentialPalFrEntries(
  waMrg: Buffer,
  start: number,
  count: number,
  makeEntry: (entryIndex: number, offset: number) => PalFrWordingEntry | null,
): PalFrWordingEntry[] {
  const entries: PalFrWordingEntry[] = [];
  let pos = start;
  for (let entryIndex = 0; entryIndex < count && pos < waMrg.length; entryIndex++) {
    const end = waMrg.indexOf(0xff, pos);
    if (end === -1 || end - pos > PAL_FR_MAX_SCRIPT_ENTRY_BYTES) break;
    const entry = makeEntry(entryIndex, pos);
    if (entry) entries.push(entry);
    pos = end + 1;
  }
  return entries;
}

function extractPalFrScriptEntries(waMrg: Buffer, start: number, end: number): PalFrWordingEntry[] {
  const entries: PalFrWordingEntry[] = [];
  let pos = start;
  let entryIndex = 0;
  while (pos < end) {
    const term = waMrg.indexOf(0xff, pos);
    if (term === -1 || term >= end) break;
    const byteLength = term - pos;
    if (byteLength > 0 && byteLength <= PAL_FR_MAX_SCRIPT_ENTRY_BYTES) {
      const entry = makePalFrWordingEntry("script", entryIndex, pos, waMrg);
      if (entry && looksLikeEditablePalFrText(entry.text)) entries.push(entry);
    }
    pos = term + 1;
    entryIndex++;
  }
  return entries;
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
    id: `pal-fr:${kind}:${offset.toString(16)}`,
    kind,
    entryIndex,
    offset,
    byteLength: trimRightSpaceBytes(waMrg, offset, end) - offset,
    maxByteLength,
    text: decodePalFrWordingText(waMrg, offset, maxByteLength),
  };
}

function looksLikeEditablePalFrText(text: string): boolean {
  const plain = text.replace(/\{[0-9a-f ]+\}/gi, "");
  return /[A-Za-zÀ-ÿœŒ]/.test(plain) && plain.trim().length >= 3;
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

function skipWaMrgEntriesForWording(buf: Buffer, offset: number, count: number): number {
  let pos = offset;
  for (let i = 0; i < count; i++) {
    const end = buf.indexOf(0xff, pos);
    if (end === -1) return pos;
    pos = end + 1;
  }
  return pos;
}

function trimRightSpaceBytes(buf: Buffer, start: number, end: number): number {
  let pos = end;
  while (pos > start && buf[pos - 1] === 0x00) pos--;
  return pos;
}

function hexByte(value: number): string {
  return value.toString(16).padStart(2, "0");
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
  const standard = rootFiles.find((f) => /^S[CL][A-Z]{2}_\d/.test(f.name));
  if (standard) return standard;

  const cnfEntry = rootFiles.find((f) => f.name === "SYSTEM.CNF");
  if (!cnfEntry) {
    throw new Error(
      `No PS1 executable found in disc image (files: ${rootFiles.map((f) => f.name).join(", ")})`,
    );
  }
  const cnfData = readSectors(
    bin,
    cnfEntry.sector,
    Math.ceil(cnfEntry.size / SECTOR_DATA_SIZE),
    fmt,
  )
    .subarray(0, cnfEntry.size)
    .toString("ascii");
  const bootName = parseBootExeName(cnfData);
  if (!bootName) throw new Error("Could not parse BOOT entry from SYSTEM.CNF");
  const exeEntry = rootFiles.find((f) => f.name === bootName);
  if (!exeEntry) throw new Error(`Boot executable '${bootName}' not found on disc`);
  return exeEntry;
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

function writeU32LeToIso(
  bin: Buffer,
  fileStartSector: number,
  fileOffset: number,
  value: number,
  fmt: ReturnType<typeof detectDiscFormat>,
): void {
  bin[discOffset(fileStartSector, fileOffset, fmt)] = value & 0xff;
  bin[discOffset(fileStartSector, fileOffset + 1, fmt)] = (value >>> 8) & 0xff;
  bin[discOffset(fileStartSector, fileOffset + 2, fmt)] = (value >>> 16) & 0xff;
  bin[discOffset(fileStartSector, fileOffset + 3, fmt)] = (value >>> 24) & 0xff;
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
