/**
 * Read another Windows process's main-window title via bun:ffi.
 *
 * DuckStation sets its window title to the active game's display title — the
 * same string it uses to build the per-game memcard filename
 * (`<title>_1.mcd`). The title tracks runtime disc swaps and is correct
 * regardless of how the game was loaded (argv, recent files, file dialog).
 *
 * Implementation: enumerate top-level windows (`EnumWindows`), pick the
 * visible un-owned one whose owner PID matches, then call `GetWindowTextW`.
 * Direct user32 syscalls — tens of microseconds total — vs. ~500 ms for
 * `powershell (Get-Process).MainWindowTitle`.
 */

// ── Lazy FFI binding ───────────────────────────────────────────────
// `bun:ffi` is unresolvable under Vitest/Vite; defer the import until the
// first real FFI call so test files that import pure helpers still load.

type FfiBindings = {
  enumWindows: (cbPtr: unknown, lparam: bigint) => number;
  getWindowThreadProcessId: (hwnd: unknown, pidBuf: Buffer) => number;
  isWindowVisible: (hwnd: unknown) => number;
  getWindow: (hwnd: unknown, cmd: number) => unknown;
  getWindowTextLengthW: (hwnd: unknown) => number;
  getWindowTextW: (hwnd: unknown, buf: Buffer, maxChars: number) => number;
  // Constructor for FFI callbacks
  makeCallback: (fn: (hwnd: unknown) => number) => { ptr: unknown; close: () => void };
};

const GW_OWNER = 4;

let bindings: FfiBindings | null = null;

async function loadBindings(): Promise<FfiBindings> {
  if (bindings) return bindings;
  const { dlopen, JSCallback } = await import("bun:ffi");
  const { symbols: u32 } = dlopen("user32.dll", {
    EnumWindows: { args: ["ptr", "i64"], returns: "i32" },
    GetWindowThreadProcessId: { args: ["ptr", "ptr"], returns: "u32" },
    IsWindowVisible: { args: ["ptr"], returns: "i32" },
    GetWindow: { args: ["ptr", "u32"], returns: "ptr" },
    GetWindowTextLengthW: { args: ["ptr"], returns: "i32" },
    GetWindowTextW: { args: ["ptr", "ptr", "i32"], returns: "i32" },
  });
  bindings = {
    enumWindows: (cbPtr, lparam) => u32.EnumWindows(cbPtr as never, lparam) as number,
    getWindowThreadProcessId: (hwnd, pidBuf) =>
      u32.GetWindowThreadProcessId(hwnd as never, pidBuf) as number,
    isWindowVisible: (hwnd) => u32.IsWindowVisible(hwnd as never) as number,
    getWindow: (hwnd, cmd) => u32.GetWindow(hwnd as never, cmd) as unknown,
    getWindowTextLengthW: (hwnd) => u32.GetWindowTextLengthW(hwnd as never) as number,
    getWindowTextW: (hwnd, buf, maxChars) =>
      u32.GetWindowTextW(hwnd as never, buf, maxChars) as number,
    makeCallback: (fn) => {
      const cb = new JSCallback((hwnd: unknown) => fn(hwnd), {
        args: ["ptr", "i64"],
        returns: "i32",
      });
      return { ptr: cb.ptr as unknown, close: () => cb.close() };
    },
  };
  return bindings;
}

/**
 * Find the top-level main window owned by a process.
 *
 * "Main window" = visible, has no owner (not a tooltip / dialog spawned
 * by another window). Matches the `MainWindowHandle` heuristic that
 * `(Get-Process).MainWindowHandle` exposes.
 */
async function findMainHwndForPid(pid: number): Promise<unknown | null> {
  const ffi = await loadBindings();
  let found: unknown = null;
  const cb = ffi.makeCallback((hwnd) => {
    const pidBuf = Buffer.alloc(4);
    ffi.getWindowThreadProcessId(hwnd, pidBuf);
    const wndPid = pidBuf.readUInt32LE(0);
    if (wndPid !== pid) return 1; // keep enumerating
    if (!ffi.isWindowVisible(hwnd)) return 1;
    const owner = ffi.getWindow(hwnd, GW_OWNER);
    if (owner) return 1; // child/owned window — keep going
    found = hwnd;
    return 0; // stop
  });
  try {
    ffi.enumWindows(cb.ptr, 0n);
  } finally {
    cb.close();
  }
  return found;
}

/**
 * Return the main-window title for a process, or null on any failure
 * (process gone, no main window, FFI unavailable).
 */
export async function getProcessMainWindowTitle(pid: number): Promise<string | null> {
  let ffi: FfiBindings;
  try {
    ffi = await loadBindings();
  } catch {
    return null;
  }
  const hwnd = await findMainHwndForPid(pid);
  if (!hwnd) return null;
  const len = ffi.getWindowTextLengthW(hwnd); // chars, no NUL
  if (len <= 0) return null;
  const buf = Buffer.alloc((len + 1) * 2);
  const written = ffi.getWindowTextW(hwnd, buf, len + 1); // returns chars without NUL
  if (written <= 0) return null;
  return buf.toString("utf16le", 0, written * 2);
}

// ── Pure parsing helpers (unit-testable) ───────────────────────────

/**
 * Strip common DuckStation window-title decorations to recover the bare
 * game title that DuckStation also uses for memcard naming.
 *
 * DuckStation builds titles like:
 *   `Game Title`
 *   `Game Title - DuckStation`
 *   `Game Title (Paused) - DuckStation`
 * We trim the `- DuckStation` / `| DuckStation` suffix and any parenthetical
 * status. Titles that round-trip unchanged (the common case) are passthrough.
 */
const SUFFIX_RE = /\s*[-|]\s*DuckStation\b.*$/i;
const STATUS_PAREN_RE = /\s*\((?:Paused|Disconnected|Stopped)\)\s*$/i;

export function cleanWindowTitleToGameTitle(title: string): string {
  let t = title.trim();
  t = t.replace(SUFFIX_RE, "");
  t = t.replace(STATUS_PAREN_RE, "");
  return t.trim();
}

/**
 * DuckStation's main window shows just its name (older builds) or its name
 * plus version (`DuckStation 0.1-11026`, recent builds) when no game is
 * running. Distinguishes "idle library view" from a real game title.
 */
const NO_GAME_TITLE_RE = /^DuckStation(\s|$)/i;

export function titleIndicatesNoGameLoaded(title: string): boolean {
  return NO_GAME_TITLE_RE.test(title.trim());
}
