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
import { dirname, join } from "node:path";

// ── Load state hotkey bindings ───────────────────────────────────

/**
 * Hotkey bindings that map F5–F12 to LoadGameState1–LoadGameState8.
 * Slot→key mapping must match LOAD_STATE_VK in input.ts.
 *
 * SaveGameState keys are intentionally NEVER bound.
 */
const LOAD_STATE_HOTKEYS: Record<string, string> = {
  LoadGameState1: "Keyboard/F5",
  LoadGameState2: "Keyboard/F6",
  LoadGameState3: "Keyboard/F7",
  LoadGameState4: "Keyboard/F8",
  LoadGameState5: "Keyboard/F9",
  LoadGameState6: "Keyboard/F10",
  LoadGameState7: "Keyboard/F11",
  LoadGameState8: "Keyboard/F12",
};

// ── Pure INI patching ─────────────────────────────────────────────

/**
 * Patch INI content to ensure `[Hotkeys]` has LoadGameState1–8 bindings.
 * Preserves original line-ending style (CRLF / LF).
 * Never writes SaveGameState bindings.
 */
export function patchLoadStateHotkeys(content: string): { patched: boolean; content: string } {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);

  let hotkeysIdx = -1;
  let nextSectionIdx = -1;
  const existingKeys = new Map<string, number>(); // key → line index

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]?.trim();
    if (trimmed === undefined) continue;

    if (trimmed === "[Hotkeys]") {
      hotkeysIdx = i;
      continue;
    }

    if (hotkeysIdx >= 0 && nextSectionIdx < 0) {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        nextSectionIdx = i;
      } else {
        const match = trimmed.match(/^(\w+)\s*=/);
        if (match?.[1]) existingKeys.set(match[1], i);
      }
    }
  }

  let changed = false;

  // Update existing keys or collect missing ones
  const missing: string[] = [];
  for (const [key, value] of Object.entries(LOAD_STATE_HOTKEYS)) {
    const lineIdx = existingKeys.get(key);
    if (lineIdx !== undefined) {
      const current = lines[lineIdx]?.match(/=\s*(.+)/)?.[1]?.trim();
      if (current !== value) {
        lines[lineIdx] = `${key} = ${value}`;
        changed = true;
      }
    } else {
      missing.push(`${key} = ${value}`);
    }
  }

  if (missing.length === 0 && !changed) {
    return { patched: false, content };
  }

  if (missing.length > 0) {
    if (hotkeysIdx >= 0) {
      const insertAt = nextSectionIdx >= 0 ? nextSectionIdx : lines.length;
      lines.splice(insertAt, 0, ...missing);
    } else {
      // No [Hotkeys] section — append
      const suffix =
        content.length > 0 && !content.endsWith("\n") && !content.endsWith("\r") ? eol : "";
      return {
        patched: true,
        content: `${content}${suffix}[Hotkeys]${eol}${missing.join(eol)}${eol}`,
      };
    }
    changed = true;
  }

  return { patched: changed, content: lines.join(eol) };
}

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
 * Resolve the executable path for a Windows process by PID.
 */
export function getExePathForPid(pid: number): string | null {
  try {
    return (
      execSync(`powershell -NoProfile -Command "(Get-Process -Id ${pid}).Path"`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 5000,
      }).trim() || null
    );
  } catch {
    return null;
  }
}

/**
 * Locate the DuckStation data directory on disk.
 *
 * New DuckStation versions store data under the system Documents folder
 * (resolved via FOLDERID_Documents, which may be redirected — e.g. OneDrive).
 * Older versions used %LOCALAPPDATA%\DuckStation.
 * Romstation (and other launchers) use portable mode — data lives next to the exe.
 *
 * @param pid  Optional running DuckStation PID, used for portable mode detection.
 */
export function findDuckStationDataDir(pid?: number): string | null {
  // 1. New DuckStation: Documents\DuckStation
  const docsDir = getDocumentsPath();
  if (docsDir) {
    const p = join(docsDir, "DuckStation");
    if (existsSync(p)) return p;
  }

  // 2. Old DuckStation: %LOCALAPPDATA%\DuckStation
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const p = join(localAppData, "DuckStation");
    if (existsSync(p)) return p;
  }

  // 3. Portable mode: settings live next to the exe (portable.txt marker)
  if (pid != null) {
    const exePath = getExePathForPid(pid);
    if (exePath) {
      const exeDir = dirname(exePath);
      if (existsSync(join(exeDir, "portable.txt"))) return exeDir;
    }
  }

  return null;
}

/**
 * Locate DuckStation's settings.ini on disk.
 *
 * @param pid  Optional running DuckStation PID, used for portable mode detection.
 */
export function findSettingsPath(pid?: number): string | null {
  const dataDir = findDuckStationDataDir(pid);
  if (dataDir) {
    const p = join(dataDir, "settings.ini");
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Get the Windows "Documents" folder path via PowerShell.
 * This calls the same underlying API (SHGetKnownFolderPath / FOLDERID_Documents)
 * that DuckStation uses, so it handles OneDrive redirection correctly.
 *
 * Result is memoized for the bridge process lifetime — the folder doesn't
 * move while the OS is running, and each PowerShell spawn costs ~400ms on
 * Windows. Without this cache, every `findActiveSave` pays that twice.
 */
let documentsPathCache: string | null | undefined;
function getDocumentsPath(): string | null {
  if (documentsPathCache !== undefined) return documentsPathCache;
  try {
    documentsPathCache =
      execSync("powershell -NoProfile -Command \"[Environment]::GetFolderPath('MyDocuments')\"", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim() || null;
  } catch {
    documentsPathCache = null;
  }
  return documentsPathCache;
}

// ── Main entry point ──────────────────────────────────────────────

/**
 * Check and patch DuckStation settings to enable shared memory export.
 *
 * @param pid  Optional running DuckStation PID, used for portable mode detection.
 */
export function ensureSharedMemoryEnabled(pid?: number): {
  patched: boolean;
  enabled: boolean;
  error?: string;
} {
  const settingsPath = findSettingsPath(pid);
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

/**
 * Ensure DuckStation's settings.ini has LoadGameState1–8 hotkeys bound.
 * Does NOT bind any SaveGameState keys.
 *
 * @param pid  Optional running DuckStation PID, used for portable mode detection.
 */
export function ensureLoadStateHotkeys(pid?: number): {
  patched: boolean;
  ready: boolean;
  error?: string;
} {
  const settingsPath = findSettingsPath(pid);
  if (!settingsPath) {
    return { patched: false, ready: false, error: "DuckStation settings.ini not found" };
  }

  let content: string;
  try {
    content = readFileSync(settingsPath, "utf-8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { patched: false, ready: false, error: `Cannot read ${settingsPath}: ${msg}` };
  }

  const result = patchLoadStateHotkeys(content);
  if (!result.patched) return { patched: false, ready: true };

  try {
    writeFileSync(settingsPath, result.content, "utf-8");
    return { patched: true, ready: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { patched: false, ready: false, error: `Cannot write ${settingsPath}: ${msg}` };
  }
}
