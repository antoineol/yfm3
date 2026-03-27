/**
 * Auto-enable DuckStation's "Export Shared Memory" setting.
 *
 * DuckStation stores settings in `Documents\DuckStation\settings.ini` (new
 * versions use FOLDERID_Documents) or `%LOCALAPPDATA%\DuckStation\settings.ini`
 * (older versions). The relevant key is:
 *
 *   [Hacks]
 *   ExportSharedMemory = true
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ── Pure INI patching ─────────────────────────────────────────────

/**
 * Patch INI content to ensure `[Hacks] ExportSharedMemory = true`.
 * Preserves original line-ending style (CRLF / LF).
 */
export function patchSettingsIni(content: string): { patched: boolean; content: string } {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);

  let hacksIdx = -1;
  let nextSectionIdx = -1;
  let exportLineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]?.trim();
    if (trimmed === undefined) continue;

    if (trimmed === "[Hacks]") {
      hacksIdx = i;
      continue;
    }

    // Inside [Hacks] section — look for ExportSharedMemory or next section
    if (hacksIdx >= 0 && nextSectionIdx < 0) {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        nextSectionIdx = i;
      } else if (/^ExportSharedMemory\s*=/i.test(trimmed)) {
        exportLineIdx = i;
      }
    }
  }

  // Already enabled
  if (exportLineIdx >= 0) {
    const value = lines[exportLineIdx]?.match(/=\s*(.+)/)?.[1]?.trim();
    if (value === "true") {
      return { patched: false, content };
    }
    // Overwrite with true
    lines[exportLineIdx] = "ExportSharedMemory = true";
    return { patched: true, content: lines.join(eol) };
  }

  // [Hacks] exists but no ExportSharedMemory key — insert at end of section
  if (hacksIdx >= 0) {
    const insertAt = nextSectionIdx >= 0 ? nextSectionIdx : lines.length;
    lines.splice(insertAt, 0, "ExportSharedMemory = true");
    return { patched: true, content: lines.join(eol) };
  }

  // No [Hacks] section at all — append
  const suffix =
    content.length > 0 && !content.endsWith("\n") && !content.endsWith("\r") ? eol : "";
  const appended = `${content}${suffix}[Hacks]${eol}ExportSharedMemory = true${eol}`;
  return { patched: true, content: appended };
}

// ── Path resolution ───────────────────────────────────────────────

/**
 * Locate DuckStation's settings.ini on disk.
 *
 * New DuckStation versions store data under the system Documents folder
 * (resolved via FOLDERID_Documents, which may be redirected — e.g. OneDrive).
 * Older versions used %LOCALAPPDATA%\DuckStation.
 */
export function findSettingsPath(): string | null {
  // 1. New DuckStation: Documents\DuckStation\settings.ini
  const docsDir = getDocumentsPath();
  if (docsDir) {
    const p = join(docsDir, "DuckStation", "settings.ini");
    if (existsSync(p)) return p;
  }

  // 2. Old DuckStation: %LOCALAPPDATA%\DuckStation\settings.ini
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const p = join(localAppData, "DuckStation", "settings.ini");
    if (existsSync(p)) return p;
  }

  return null;
}

/**
 * Get the Windows "Documents" folder path via PowerShell.
 * This calls the same underlying API (SHGetKnownFolderPath / FOLDERID_Documents)
 * that DuckStation uses, so it handles OneDrive redirection correctly.
 */
function getDocumentsPath(): string | null {
  try {
    return execSync(
      "powershell -NoProfile -Command \"[Environment]::GetFolderPath('MyDocuments')\"",
      { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] },
    ).trim();
  } catch {
    return null;
  }
}

// ── Main entry point ──────────────────────────────────────────────

/**
 * Check and patch DuckStation settings to enable shared memory export.
 */
export function ensureSharedMemoryEnabled(): {
  patched: boolean;
  enabled: boolean;
  error?: string;
} {
  const settingsPath = findSettingsPath();
  if (!settingsPath) {
    return { patched: false, enabled: false, error: "DuckStation settings.ini not found" };
  }

  let content: string;
  try {
    content = readFileSync(settingsPath, "utf-8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { patched: false, enabled: false, error: `Cannot read ${settingsPath}: ${msg}` };
  }

  const result = patchSettingsIni(content);
  if (!result.patched) return { patched: false, enabled: true };

  try {
    writeFileSync(settingsPath, result.content, "utf-8");
    return { patched: true, enabled: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      patched: false,
      enabled: false,
      error: `Cannot write ${settingsPath}: ${msg}`,
    };
  }
}
