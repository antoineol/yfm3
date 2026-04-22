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
import { detectAttributeMapping, detectExeLayout } from "./extract/detect-exe.ts";
import { detectWaMrgLayout } from "./extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./extract/detect-wamrg-text.ts";
import { extractDuelists } from "./extract/extract-duelists.ts";
import { langIdxForSerial, loadDiscData } from "./extract/index.ts";
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
import { writeU16LeArray } from "./extract/write-iso.ts";

export const POOL_SUM = 2048;
export const ISO_BACKUP_DIR_NAME = ".yfm3-iso-backups";
export const MAX_ISO_BACKUPS = 20;
const BACKUP_NAME_RE = /^\d{8}_\d{6}(?:_\d{2})?\.iso$/;

export type PoolType = "deck" | "saPow" | "bcd" | "saTec";

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
 * surfaces as `EBUSY` or `EPERM`. Used by the server to decide whether the
 * close-and-retry fallback applies.
 */
export function isIsoLockedError(err: unknown, discPath: string): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as NodeJS.ErrnoException;
  if (e.code !== "EBUSY" && e.code !== "EPERM") return false;
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
export function reReadDuelists(discPath: string): DuelistData[] {
  const { slus, waMrg, serial } = loadDiscData(discPath);
  const exeLayout = detectExeLayout(slus);
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
