/**
 * DuckStation memcard resolution for the *currently running* game, plus safe
 * write-in-place with rotating backups.
 *
 * The save editor is scoped to the active game — the bridge already knows the
 * serial in RAM and has extracted the card table. So "listing saves" reduces
 * to: find the one `.mcd` in DuckStation's memcards dir whose embedded game
 * code matches the active serial.
 */

import { createHash } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import {
  cleanWindowTitleToGameTitle,
  getProcessMainWindowTitle,
  titleIndicatesNoGameLoaded,
} from "./process-info.ts";
import { findDuckStationDataDir, findSettingsPath } from "./settings.ts";

export const MAX_BACKUPS = 50;
export const BACKUP_DIR_NAME = ".yfm3-backups";

// ── Types ────────────────────────────────────────────────────────

export type ActiveSave = {
  memcardFilename: string;
  memcardPath: string;
  /** Embedded PSX game code from the directory frame (diagnostic only; null when absent). */
  gameCode: string | null;
  sizeBytes: number;
  mtime: string;
  backupCount: number;
};

export type BackupEntry = {
  filename: string;
  timestamp: string;
  sizeBytes: number;
};

// ── Settings.ini parsing (pure) ──────────────────────────────────

export type MemcardConfig = {
  /** Where memcards live (DuckStation: `[MemoryCards] Directory`, default "memcards"). */
  directory: string;
  /** How memcards are keyed (DuckStation: `[MemoryCards] Card1Type`). */
  card1Type: "PerGameTitle" | "PerGame" | "Shared" | "None" | "Unknown";
  /** Slot-1 path override (used by Shared mode). */
  card1Path: string | null;
};

/**
 * Parse the `[MemoryCards]` section of DuckStation's settings.ini. Falls back
 * to documented defaults for keys that are absent.
 */
export function parseMemcardConfig(iniContent: string): MemcardConfig {
  const section = extractSection(iniContent, "MemoryCards");
  const card1Type = section.get("Card1Type") ?? "PerGameTitle"; // DuckStation's current default
  return {
    directory: section.get("Directory") ?? "memcards",
    card1Type: normalizeCardType(card1Type),
    card1Path: section.get("Card1Path") ?? null,
  };
}

function normalizeCardType(raw: string): MemcardConfig["card1Type"] {
  switch (raw) {
    case "PerGameTitle":
    case "PerGame":
    case "Shared":
    case "None":
      return raw;
    default:
      return "Unknown";
  }
}

function extractSection(iniContent: string, sectionName: string): Map<string, string> {
  const lines = iniContent.split(/\r?\n/);
  const header = `[${sectionName}]`;
  const out = new Map<string, string>();
  let inside = false;
  for (const line of lines) {
    const t = line.trim();
    if (t === header) {
      inside = true;
      continue;
    }
    if (inside && t.startsWith("[")) break;
    if (!inside) continue;
    const m = t.match(/^([^=\s]+)\s*=\s*(.*)$/);
    if (m) out.set(m[1]!, (m[2] ?? "").trim());
  }
  return out;
}

/** Resolve the absolute memcards directory: relative paths are joined to dataDir. */
export function resolveMemcardsDir(directoryConfig: string, dataDir: string): string {
  if (isAbsolute(directoryConfig) || /^[A-Za-z]:[\\/]/.test(directoryConfig)) {
    return directoryConfig;
  }
  return join(dataDir, directoryConfig);
}

/**
 * Find the first PSX game code embedded in a memcard's directory frame
 * (first 8 KB). Used for diagnostics only — DuckStation itself keys memcards
 * by *title*, not by this code.
 */
export function extractGameCodeFromMemcard(bytes: Uint8Array): string | null {
  const end = Math.min(bytes.length, 0x2000);
  const re = /^S[CL][A-Z]{2}-\d{5}$/;
  for (let i = 0; i < end - 12; i++) {
    if (bytes[i] !== 0x42 || bytes[i + 1] !== 0x41) continue; // "BA"
    let candidate = "";
    for (let j = 0; j < 10; j++) {
      const c = bytes[i + 2 + j];
      if (c === undefined) break;
      candidate += String.fromCharCode(c);
    }
    if (re.test(candidate)) return candidate;
  }
  return null;
}

/**
 * Approximate DuckStation's title-to-filename sanitization. The source strips
 * characters invalid on Windows filesystems (`<>:"/\\|?*`) and collapses
 * whitespace. Titles that round-trip unchanged (the common case) are safe.
 */
export function sanitizeTitleForFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*]/g, "").trim();
}

// ── Backup name helpers (pure) ───────────────────────────────────

export function formatBackupName(date: Date): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const mi = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  const ms = pad(date.getUTCMilliseconds(), 3);
  return `backup_${y}${m}${d}-${h}${mi}${s}-${ms}.mcd`;
}

// The optional `_NN` suffix is only used if two writes collide down to the
// millisecond. `_` (0x5F) sorts *after* `.` (0x2E), so lexical sort of these
// filenames stays chronological — important for `prunedBackups`.
const BACKUP_NAME_RE = /^backup_(\d{8})-(\d{6})-(\d{3})(?:_\d{2})?\.mcd$/;

export function parseBackupTimestamp(filename: string): string | null {
  const m = filename.match(BACKUP_NAME_RE);
  if (!m) return null;
  const [, ymd, hms, ms] = m;
  if (!ymd || !hms || !ms) return null;
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T${hms.slice(0, 2)}:${hms.slice(2, 4)}:${hms.slice(4, 6)}.${ms}Z`;
}

export function prunedBackups(
  filenames: readonly string[],
  max: number = MAX_BACKUPS,
): { keep: string[]; drop: string[] } {
  const valid = filenames
    .filter((f) => BACKUP_NAME_RE.test(f))
    .slice()
    .sort();
  if (valid.length <= max) return { keep: valid, drop: [] };
  return { keep: valid.slice(-max), drop: valid.slice(0, -max) };
}

function sanitizeDirName(filename: string): string {
  return filename.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function backupDirFor(memcardPath: string): string {
  const dir = dirname(memcardPath);
  const file = basename(memcardPath);
  return join(dir, BACKUP_DIR_NAME, sanitizeDirName(file));
}

/**
 * mkdirSync({ recursive: true }) can still throw EEXIST on OneDrive-backed
 * paths where the existing directory is a reparse-point placeholder. Treat an
 * EEXIST on a real directory as success.
 */
function ensureDir(dir: string): void {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "EEXIST") throw err;
    if (!statSync(dir).isDirectory()) throw err;
  }
}

// ── Active save resolution ───────────────────────────────────────

export type ActiveSaveDiagnostics = {
  /** Raw window title read from DuckStation via FFI (before suffix cleaning). */
  windowTitle: string | null;
  /** Title used to build the memcard filename (after suffix cleaning). */
  resolvedTitle: string | null;
  /** The `[MemoryCards] Card1Type` value from DuckStation. */
  card1Type: string;
  memcardsDir: string | null;
  /** The filename we expected to find (PerGameTitle: `<title>_1.mcd`). */
  expectedFilename: string | null;
  /** Whether that exact file exists. */
  expectedExists: boolean;
  /** Every .mcd in the memcards dir, for user inspection when no match is found. */
  availableMemcards: string[];
};

export type ActiveSaveResult =
  | { ok: true; save: ActiveSave; diag: ActiveSaveDiagnostics }
  | { ok: false; reason: string; diag: ActiveSaveDiagnostics };

/**
 * Resolve the memcard file for the active game.
 *
 * Flow: read DuckStation's main-window title via user32 FFI → strip the
 * "- DuckStation" suffix → build `<memcardsDir>/<title>_1.mcd`. The window
 * title is exactly what DuckStation uses to name memcards under
 * `Card1Type = PerGameTitle`, regardless of how the disc was loaded
 * (argv, recent files, file dialog, runtime swap).
 */
export async function findActiveSave(pid: number | undefined): Promise<ActiveSaveResult> {
  const diag: ActiveSaveDiagnostics = {
    windowTitle: null,
    resolvedTitle: null,
    card1Type: "?",
    memcardsDir: null,
    expectedFilename: null,
    expectedExists: false,
    availableMemcards: [],
  };

  const dataDir = findDuckStationDataDir(pid);
  const settingsPath = findSettingsPath(pid);
  if (!dataDir || !settingsPath) {
    return { ok: false, reason: "DuckStation settings.ini not found", diag };
  }
  const iniContent = readFileSync(settingsPath, "utf-8");
  const cfg = parseMemcardConfig(iniContent);
  diag.card1Type = cfg.card1Type;
  const memcardsDir = resolveMemcardsDir(cfg.directory, dataDir);
  diag.memcardsDir = memcardsDir;
  if (existsSync(memcardsDir)) {
    diag.availableMemcards = readdirSync(memcardsDir)
      .filter((n) => n.toLowerCase().endsWith(".mcd"))
      .sort();
  }

  // Shared mode short-circuits — no per-game resolution needed.
  if (cfg.card1Type === "Shared") {
    const sharedPath = cfg.card1Path
      ? isAbsolute(cfg.card1Path)
        ? cfg.card1Path
        : join(memcardsDir, cfg.card1Path)
      : join(memcardsDir, "shared_card_1.mcd");
    diag.expectedFilename = basename(sharedPath);
    diag.expectedExists = existsSync(sharedPath);
    return diag.expectedExists
      ? { ok: true, save: buildActiveSave(sharedPath), diag }
      : { ok: false, reason: "Shared memcard file not found", diag };
  }

  if (pid == null) {
    return { ok: false, reason: "No active DuckStation process", diag };
  }

  // Always re-read the window title: DuckStation lets the user swap discs
  // within the same process (PID stays, title changes), so any per-PID cache
  // of the resolved memcard would go stale silently. The FFI call is tens
  // of microseconds; the surrounding fs work is a few ms — cheap enough to
  // redo every request.
  const rawTitle = await getProcessMainWindowTitle(pid);
  diag.windowTitle = rawTitle;
  if (!rawTitle) {
    return {
      ok: false,
      reason: "Couldn't read DuckStation's window title (process gone or no main window)",
      diag,
    };
  }

  const title = cleanWindowTitleToGameTitle(rawTitle);
  diag.resolvedTitle = title;
  if (!title || titleIndicatesNoGameLoaded(title)) {
    return {
      ok: false,
      reason: "DuckStation has no game loaded yet (window title shows no game)",
      diag,
    };
  }

  const expected = `${sanitizeTitleForFilename(title)}_1.mcd`;
  diag.expectedFilename = expected;
  const expectedPath = join(memcardsDir, expected);
  if (existsSync(expectedPath)) {
    diag.expectedExists = true;
    return { ok: true, save: buildActiveSave(expectedPath), diag };
  }

  // Case-insensitive recovery: handle Windows case-fold surprises.
  const lowered = expected.toLowerCase();
  for (const candidate of diag.availableMemcards) {
    if (candidate.toLowerCase() !== lowered) continue;
    const p = join(memcardsDir, candidate);
    diag.expectedExists = true;
    return { ok: true, save: buildActiveSave(p), diag };
  }

  return {
    ok: false,
    reason: `No memcard named "${expected}" in the memcards directory`,
    diag,
  };
}

export function buildActiveSave(memcardPath: string): ActiveSave {
  const stat = statSync(memcardPath);
  return {
    memcardFilename: basename(memcardPath),
    memcardPath,
    gameCode: readMemcardGameCode(memcardPath),
    sizeBytes: stat.size,
    mtime: stat.mtime.toISOString(),
    backupCount: countBackups(memcardPath),
  };
}

function readMemcardGameCode(memcardPath: string): string | null {
  try {
    const fd = openSync(memcardPath, "r");
    try {
      const header = Buffer.alloc(0x2000);
      readSync(fd, header, 0, 0x2000, 0);
      return extractGameCodeFromMemcard(header);
    } finally {
      closeSync(fd);
    }
  } catch {
    return null;
  }
}

// ── Read / write / backups ───────────────────────────────────────

export function readSave(memcardPath: string): Uint8Array {
  return new Uint8Array(readFileSync(memcardPath));
}

export function writeSaveWithBackup(memcardPath: string, bytes: Uint8Array): BackupEntry | null {
  const backup = backupExisting(memcardPath);
  writeFileSync(memcardPath, bytes);
  pruneOldBackups(memcardPath);
  return backup;
}

function backupExisting(memcardPath: string): BackupEntry | null {
  if (!existsSync(memcardPath)) return null;
  const dir = backupDirFor(memcardPath);
  ensureDir(dir);
  const name = uniqueBackupName(dir);
  const dest = join(dir, name);
  copyFileSync(memcardPath, dest);
  const stat = statSync(dest);
  return {
    filename: name,
    timestamp: parseBackupTimestamp(name) ?? stat.mtime.toISOString(),
    sizeBytes: stat.size,
  };
}

function uniqueBackupName(dir: string): string {
  const base = formatBackupName(new Date());
  if (!existsSync(join(dir, base))) return base;
  const stem = base.replace(/\.mcd$/, "");
  for (let i = 1; i < 100; i++) {
    const candidate = `${stem}_${String(i).padStart(2, "0")}.mcd`;
    if (!existsSync(join(dir, candidate))) return candidate;
  }
  const suffix = createHash("sha1").update(`${Date.now()}`).digest("hex").slice(0, 8);
  return `${stem}_${suffix}.mcd`;
}

function countBackups(memcardPath: string): number {
  const dir = backupDirFor(memcardPath);
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir).filter((f) => BACKUP_NAME_RE.test(f)).length;
  } catch {
    return 0;
  }
}

export function listBackups(memcardPath: string): BackupEntry[] {
  const dir = backupDirFor(memcardPath);
  if (!existsSync(dir)) return [];
  const entries: BackupEntry[] = [];
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

function pruneOldBackups(memcardPath: string): void {
  const dir = backupDirFor(memcardPath);
  if (!existsSync(dir)) return;
  const { drop } = prunedBackups(readdirSync(dir));
  for (const name of drop) {
    try {
      unlinkSync(join(dir, name));
    } catch (err) {
      console.warn(`Failed to prune backup ${name}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

export function restoreBackup(memcardPath: string, backupFilename: string): BackupEntry | null {
  if (!BACKUP_NAME_RE.test(backupFilename)) {
    throw new Error(`Invalid backup filename: ${backupFilename}`);
  }
  const dir = backupDirFor(memcardPath);
  const src = join(dir, backupFilename);
  if (!existsSync(src)) throw new Error(`Backup not found: ${backupFilename}`);
  const preRestore = backupExisting(memcardPath);
  copyFileSync(src, memcardPath);
  pruneOldBackups(memcardPath);
  return preRestore;
}
