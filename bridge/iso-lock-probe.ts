/**
 * Detects which ISO files another process (typically DuckStation) has open
 * with a non-sharing lock, via a direct `CreateFileW` FFI call against
 * kernel32. Windows-only — POSIX has no equivalent because its advisory
 * locks don't block concurrent opens.
 *
 * We ask Windows for exclusive access (`dwShareMode = 0`). If another
 * process already holds the file open with any share mode, Windows rejects
 * our open with `ERROR_SHARING_VIOLATION`. We read `GetLastError()` as the
 * primary signal — robust against pointer-to-number precision loss in FFI
 * marshalling (INVALID_HANDLE_VALUE = 0xFFFFFFFFFFFFFFFF can't be faithfully
 * represented as a JS number).
 *
 * Sub-millisecond per probe — orders of magnitude faster than spawning a
 * PowerShell subprocess (~500 ms startup).
 */

import { existsSync } from "node:fs";
import { platform } from "node:os";

const IS_WINDOWS = platform() === "win32";

// Win32 constants
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
let loadAttempted = false;

async function load(): Promise<Kernel32 | null> {
  if (loadAttempted) return k32 ?? null;
  loadAttempted = true;
  if (!IS_WINDOWS) {
    k32 = null;
    return null;
  }
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

/** UTF-16LE null-terminated path buffer for Win32 W-suffix APIs. */
function toWidePath(s: string): Buffer {
  return Buffer.from(`${s}\0`, "utf16le");
}

/**
 * Return the subset of `paths` that are locked by another process (cannot be
 * opened with no-sharing access). Empty set on non-Windows or when FFI is
 * unavailable — callers must not treat an empty result as evidence that no
 * file is locked.
 */
export async function probeLockedIsos(paths: readonly string[]): Promise<Set<string>> {
  const locked = new Set<string>();
  if (paths.length === 0) return locked;
  const k = await load();
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
