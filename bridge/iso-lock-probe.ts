/**
 * Detects which ISO files another process (typically DuckStation) has open
 * with a non-sharing lock. Two transports, same Win32 semantics in both:
 *
 * - **Windows native**: direct FFI to `CreateFileW(dwShareMode=0)` via
 *   `kernel32.dll`. Sub-millisecond per probe.
 * - **WSL/Linux**: shell out to `powershell.exe` and call
 *   `[System.IO.File]::Open(path, 'Open', 'Read', 'None')`. `FileShare.None`
 *   maps to `dwShareMode=0`, so both code paths observe the same lock state
 *   — we never have to explain away "prod says locked, dev doesn't" bugs.
 *   ~1 s cold-start per probe; fine for the once-per-game-load usage.
 *
 * Pure Linux (no WSL interop) returns an empty set — callers must not treat
 * that as evidence of no locks. `pickWinningDisc` in `game-data.ts` handles
 * that by falling through to hash disambiguation, and surfaces `ambiguous`
 * when multiple discs match and no other signal narrows them down.
 */

import { execFile } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { platform, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const IS_WINDOWS = platform() === "win32";
const IS_WSL = platform() === "linux" && !!process.env.WSL_DISTRO_NAME;

// ── Public API ────────────────────────────────────────────────────

/**
 * Return the subset of `paths` that are locked by another process. Empty set
 * on unsupported platforms or when the underlying transport is unavailable —
 * callers must not treat an empty result as evidence that no file is locked.
 */
export async function probeLockedIsos(paths: readonly string[]): Promise<Set<string>> {
  if (paths.length === 0) return new Set();
  if (IS_WINDOWS) return probeViaFfi(paths);
  if (IS_WSL) return probeViaPowershell(paths);
  return new Set();
}

// ── Windows native: kernel32 FFI ──────────────────────────────────

const GENERIC_READ = 0x80000000;
const OPEN_EXISTING = 3;
const FILE_ATTRIBUTE_NORMAL = 0x80;
const ERROR_SHARING_VIOLATION = 32;

type Kernel32 = {
  CreateFileW: (
    path: Buffer,
    access: number,
    share: number,
    sec: null,
    disp: number,
    attr: number,
    tpl: null,
  ) => unknown;
  CloseHandle: (h: unknown) => number;
  GetLastError: () => number;
  SetLastError: (err: number) => void;
};

let k32: Kernel32 | null | undefined;
let ffiLoadAttempted = false;

async function loadKernel32(): Promise<Kernel32 | null> {
  if (ffiLoadAttempted) return k32 ?? null;
  ffiLoadAttempted = true;
  try {
    const { dlopen } = await import("bun:ffi");
    const { symbols } = dlopen("kernel32.dll", {
      CreateFileW: {
        args: ["ptr", "u32", "u32", "ptr", "u32", "u32", "ptr"],
        returns: "ptr",
      },
      CloseHandle: { args: ["ptr"], returns: "i32" },
      GetLastError: { args: [], returns: "u32" },
      SetLastError: { args: ["u32"], returns: "void" },
    });
    k32 = symbols as unknown as Kernel32;
    console.log("iso-lock-probe: kernel32.dll loaded");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`iso-lock-probe: FFI load failed (${msg}) — lock probe disabled`);
    k32 = null;
  }
  return k32;
}

function toWidePath(s: string): Buffer {
  return Buffer.from(`${s}\0`, "utf16le");
}

async function probeViaFfi(paths: readonly string[]): Promise<Set<string>> {
  const locked = new Set<string>();
  const k = await loadKernel32();
  if (!k) return locked;

  for (const path of paths) {
    if (!existsSync(path)) continue;
    // Clear the thread's last-error so we can tell success from failure
    // regardless of how the return pointer is marshalled.
    k.SetLastError(0);
    const handle = k.CreateFileW(
      toWidePath(path),
      GENERIC_READ,
      0, // dwShareMode = 0: request exclusive access
      null,
      OPEN_EXISTING,
      FILE_ATTRIBUTE_NORMAL,
      null,
    );
    const err = k.GetLastError();
    if (err === ERROR_SHARING_VIOLATION) {
      locked.add(path);
      // handle is INVALID_HANDLE_VALUE — nothing to close.
    } else if (err === 0) {
      // CreateFileW succeeded; close the handle we just opened.
      k.CloseHandle(handle);
    }
    // Any other error (ACCESS_DENIED, FILE_NOT_FOUND races, etc.) is not a
    // lock signal — skip silently.
  }
  return locked;
}

// ── WSL: shell out to PowerShell ──────────────────────────────────

const execFileAsync = promisify(execFile);

/**
 * PowerShell script that probes each argument with FileShare.None semantics
 * (same as the FFI's dwShareMode=0). Output is a JSON array of *indices*
 * into the input argv — not paths — so we don't have to round-trip unicode
 * through the PowerShell console encoding, which mangles characters like
 * em-dashes in path names.
 */
const PROBE_SCRIPT = `
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$paths = $args
$lockedIndices = New-Object System.Collections.Generic.List[int]
for ($i = 0; $i -lt $paths.Count; $i++) {
  try {
    $fs = [System.IO.File]::Open($paths[$i], 'Open', 'Read', 'None')
    $fs.Close()
  } catch [System.IO.IOException] {
    $lockedIndices.Add($i)
  } catch {
    # Permission errors, missing files, etc. — not a lock signal.
  }
}
Write-Output (ConvertTo-Json -InputObject @($lockedIndices) -Compress -Depth 1)
`;

let scriptPathCache: string | null = null;
let powershellDisabled = false;

/**
 * Write the probe script to a temp file on first use and reuse the path.
 * Using a file (vs `-Command` with a here-string) avoids complex cross-shell
 * quoting and keeps PowerShell's argv parsing free for our path arguments.
 */
function ensureScriptPath(): string {
  if (scriptPathCache && existsSync(scriptPathCache)) return scriptPathCache;
  const path = join(tmpdir(), "yfm3-iso-lock-probe.ps1");
  writeFileSync(path, PROBE_SCRIPT, "utf-8");
  scriptPathCache = path;
  return path;
}

/**
 * Convert a WSL path under `/mnt/<drive>/...` to its Windows equivalent so
 * PowerShell can open it. Returns the input unchanged for already-Windows
 * paths (C:\\...) and for paths we can't translate (non-/mnt Linux paths).
 */
function toWindowsPath(p: string): string {
  if (/^[A-Za-z]:[\\/]/.test(p)) return p;
  const m = p.match(/^\/mnt\/([a-z])\/(.*)$/);
  if (!m) return p;
  const drive = (m[1] ?? "").toUpperCase();
  const rest = (m[2] ?? "").replace(/\//g, "\\");
  return `${drive}:\\${rest}`;
}

async function probeViaPowershell(paths: readonly string[]): Promise<Set<string>> {
  const locked = new Set<string>();
  if (powershellDisabled) return locked;

  const winPaths = paths.map(toWindowsPath);
  const scriptPath = ensureScriptPath();
  const scriptWin = toWindowsPath(scriptPath);

  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptWin, "--", ...winPaths],
      { timeout: 5000, encoding: "utf-8", maxBuffer: 1024 * 1024 },
    );
    const indices = parseLockedIndices(stdout);
    for (const i of indices) {
      const origPath = paths[i];
      if (origPath !== undefined) locked.add(origPath);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Disable for the rest of this bridge run so we don't pay the timeout
    // cost on every poll. ambiguity-refusal in game-data.ts still keeps
    // saves safe — worst case dev has to move one of the colliding ISOs.
    powershellDisabled = true;
    console.warn(`iso-lock-probe: PowerShell probe failed (${msg}) — lock probe disabled`);
  }
  return locked;
}

/**
 * Parse the PowerShell script's JSON output. `ConvertTo-Json` has two quirks
 * we have to handle:
 *   - single-element arrays → a bare number, not a 1-element array
 *   - empty arrays → empty string (no output)
 * Testing this pure parser is easier than testing the whole PowerShell round-trip.
 */
export function parseLockedIndices(stdout: string): number[] {
  const trimmed = stdout.trim();
  if (trimmed === "") return [];
  const parsed: unknown = JSON.parse(trimmed);
  if (typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0) {
    return [parsed];
  }
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (x): x is number => typeof x === "number" && Number.isInteger(x) && x >= 0,
    );
  }
  return [];
}
