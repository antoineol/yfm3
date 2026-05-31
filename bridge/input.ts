/**
 * DuckStation input controller for Windows.
 *
 * Sends PS1 controller inputs to DuckStation via keybd_event with stealth
 * focus steal/restore. The approach:
 *   1. Save current foreground window
 *   2. Alt-trick SetForegroundWindow to DuckStation (~0ms)
 *   3. keybd_event to press/release the key (~80ms)
 *   4. Restore focus to previous window (~0ms)
 *
 * Key bindings are read from DuckStation's settings.ini [Pad1] section
 * at init time, so they work with any configuration (RomStation, custom, etc.).
 *
 * Uses user32.dll via bun:ffi (Windows-only, same pattern as memory.ts).
 */

import type { Pointer } from "bun:ffi";
import { execFile, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { findDuckStationDataDir } from "./settings.ts";

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

// ── Types ────────────────────────────────────────────────────────

/** Window handle (HWND) — a branded Pointer from bun:ffi. */
export type Hwnd = Pointer;

export type Ps1Button =
  | "up"
  | "down"
  | "left"
  | "right"
  | "cross"
  | "circle"
  | "square"
  | "triangle"
  | "l1"
  | "r1"
  | "l2"
  | "r2"
  | "start"
  | "select";

// ── Save state load hotkeys ─────────────────────────────────────
// Bound in DuckStation settings.ini by patchLoadStateHotkeys().
// F5–F12 → LoadGameState1–LoadGameState8.

const LOAD_STATE_VK: Record<number, number> = {
  1: 0x74, // F5
  2: 0x75, // F6
  3: 0x76, // F7
  4: 0x77, // F8
  5: 0x78, // F9
  6: 0x79, // F10
  7: 0x7a, // F11
  8: 0x7b, // F12
};

// ── Blocked keys (safety) ───────────────────────────────────────
// F2 = DuckStation default "save state" — NEVER send this.

const BLOCKED_VK = new Set([0x71]);

// ── Windows constants ───────────────────────────────────────────

const VK_MENU = 0x12; // Alt key
const VK_S = 0x53;
const VK_DOWN = 0x28;
const VK_RETURN = 0x0d;
const KEYEVENTF_KEYUP = 0x0002;
const GW_OWNER = 4;

// ── user32.dll FFI ──────────────────────────────────────────────

const USER32_DEFINITIONS = {
  keybd_event: {
    args: ["u8", "u8", "u32", "u64"],
    returns: "void",
  },
  SetForegroundWindow: {
    args: ["ptr"],
    returns: "i32",
  },
  GetForegroundWindow: {
    args: [],
    returns: "ptr",
  },
  ShowWindow: {
    args: ["ptr", "i32"],
    returns: "i32",
  },
  EnumWindows: {
    args: ["ptr", "i64"],
    returns: "i32",
  },
  GetWindowThreadProcessId: {
    args: ["ptr", "ptr"],
    returns: "u32",
  },
  IsWindowVisible: {
    args: ["ptr"],
    returns: "i32",
  },
  GetWindow: {
    args: ["ptr", "u32"],
    returns: "ptr",
  },
} as const;

function loadUser32() {
  const { dlopen } = loadBunFfi();
  return dlopen("user32.dll", USER32_DEFINITIONS).symbols;
}

function loadBunFfi(): typeof import("bun:ffi") {
  return require("bun:ffi");
}

let user32: ReturnType<typeof loadUser32> | null = null;

function getUser32(): ReturnType<typeof loadUser32> {
  user32 ??= loadUser32();
  return user32;
}

// ── Key name → VK code mapping ──────────────────────────────────

const KEY_NAME_TO_VK: Record<string, number> = {
  // Letters
  A: 0x41,
  B: 0x42,
  C: 0x43,
  D: 0x44,
  E: 0x45,
  F: 0x46,
  G: 0x47,
  H: 0x48,
  I: 0x49,
  J: 0x4a,
  K: 0x4b,
  L: 0x4c,
  M: 0x4d,
  N: 0x4e,
  O: 0x4f,
  P: 0x50,
  Q: 0x51,
  R: 0x52,
  S: 0x53,
  T: 0x54,
  U: 0x55,
  V: 0x56,
  W: 0x57,
  X: 0x58,
  Y: 0x59,
  Z: 0x5a,
  // Digits
  0: 0x30,
  1: 0x31,
  2: 0x32,
  3: 0x33,
  4: 0x34,
  5: 0x35,
  6: 0x36,
  7: 0x37,
  8: 0x38,
  9: 0x39,
  // Arrow keys
  Up: 0x26,
  Down: 0x28,
  Left: 0x25,
  Right: 0x27,
  // Special keys
  Return: 0x0d,
  Enter: 0x0d,
  Backspace: 0x08,
  Space: 0x20,
  Tab: 0x09,
  Escape: 0x1b,
  // F-keys
  F1: 0x70,
  F2: 0x71,
  F3: 0x72,
  F4: 0x73,
  F5: 0x74,
  F6: 0x75,
  F7: 0x76,
  F8: 0x77,
  F9: 0x78,
  F10: 0x79,
  F11: 0x7a,
  F12: 0x7b,
  // Numpad
  Keypad0: 0x60,
  Keypad1: 0x61,
  Keypad2: 0x62,
  Keypad3: 0x63,
  Keypad4: 0x64,
  Keypad5: 0x65,
  Keypad6: 0x66,
  Keypad7: 0x67,
  Keypad8: 0x68,
  Keypad9: 0x69,
};

// ── DuckStation INI → PS1 button name mapping ───────────────────

const INI_KEY_TO_PS1: Record<string, Ps1Button> = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
  Cross: "cross",
  Circle: "circle",
  Square: "square",
  Triangle: "triangle",
  L1: "l1",
  R1: "r1",
  L2: "l2",
  R2: "r2",
  Start: "start",
  Select: "select",
};

// ── Read pad bindings from DuckStation settings.ini ─────────────

/**
 * Parse the [Pad1] section of DuckStation's settings.ini and return a
 * PS1 button → Windows VK code mapping.
 *
 * Example INI line: `Cross = Keyboard/X`
 * Parsed as: cross → 0x58 (VK_X)
 */
export function readPadBindings(settingsContent: string): Partial<Record<Ps1Button, number>> {
  const lines = settingsContent.split(/\r?\n/);
  let inPad1 = false;
  const bindings: Partial<Record<Ps1Button, number>> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "[Pad1]") {
      inPad1 = true;
      continue;
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      inPad1 = false;
      continue;
    }
    if (!inPad1) continue;

    const match = trimmed.match(/^(\w+)\s*=\s*Keyboard\/(.+)$/);
    if (!match) continue;

    const iniKey = match[1];
    const keyName = match[2]?.split("&", 1)[0]?.trim();
    if (!iniKey || !keyName) continue;

    const ps1Button = INI_KEY_TO_PS1[iniKey];
    if (!ps1Button) continue;

    const vk = KEY_NAME_TO_VK[keyName];
    if (vk !== undefined) {
      bindings[ps1Button] = vk;
    } else {
      console.warn(`input: unknown key name "${keyName}" for ${iniKey}`);
    }
  }

  return bindings;
}

// ── Fallback defaults (DuckStation factory settings) ────────────

const DEFAULT_BUTTON_VK: Record<Ps1Button, number> = {
  up: 0x57,
  down: 0x53,
  left: 0x41,
  right: 0x44,
  cross: 0x62,
  circle: 0x66,
  square: 0x64,
  triangle: 0x68,
  l1: 0x51,
  r1: 0x45,
  l2: 0x31,
  r2: 0x33,
  start: 0x0d,
  select: 0x08,
};

// ── Runtime state ───────────────────────────────────────────────

let buttonVk: Record<Ps1Button, number> = { ...DEFAULT_BUTTON_VK };
let bindingsLoaded = false;

/**
 * Load pad bindings from DuckStation's settings.ini.
 * Falls back to defaults if the file can't be read.
 */
export function loadBindings(pid?: number): void {
  const dataDir = findDuckStationDataDir(pid);
  if (!dataDir) {
    console.warn("input: DuckStation data dir not found, using default bindings");
    bindingsLoaded = true;
    return;
  }

  try {
    const content = readFileSync(`${dataDir}\\settings.ini`, "utf-8");
    const parsed = readPadBindings(content);
    const count = Object.keys(parsed).length;
    if (count > 0) {
      buttonVk = { ...DEFAULT_BUTTON_VK, ...parsed };
      console.log(`input: loaded ${count} pad bindings from settings.ini`);
    } else {
      console.warn("input: no [Pad1] keyboard bindings found, using defaults");
    }
  } catch {
    console.warn("input: could not read settings.ini, using default bindings");
  }
  bindingsLoaded = true;
}

// ── HWND lookup ─────────────────────────────────────────────────

export function findMainWindowHandle(pid: number): Hwnd | null {
  const hwnd = findMainWindowHandleByEnumWindows(pid);
  if (hwnd) return hwnd;

  try {
    const output = execSync(
      `powershell -NoProfile -Command "(Get-Process -Id ${pid}).MainWindowHandle"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"], timeout: 5000 },
    ).trim();
    const hwnd = Number(output);
    return hwnd > 0 ? (hwnd as Hwnd) : null;
  } catch {
    return null;
  }
}

function findMainWindowHandleByEnumWindows(pid: number): Hwnd | null {
  try {
    const u32 = getUser32();
    const { JSCallback } = loadBunFfi();
    let found: Hwnd | null = null;
    const cb = new JSCallback(
      (hwnd: Hwnd) => {
        const pidBuf = Buffer.alloc(4);
        u32.GetWindowThreadProcessId(hwnd, pidBuf);
        if (pidBuf.readUInt32LE(0) !== pid) return 1;
        if (!u32.IsWindowVisible(hwnd)) return 1;
        if (u32.GetWindow(hwnd, GW_OWNER)) return 1;
        found = hwnd;
        return 0;
      },
      { args: ["ptr", "i64"], returns: "i32" },
    );
    try {
      u32.EnumWindows(cb.ptr, 0n);
    } finally {
      cb.close();
    }
    return found;
  } catch {
    return null;
  }
}

// ── Core input (keybd_event + stealth focus) ────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stealth focus: briefly bring DuckStation to foreground using the Alt
 * key trick (bypasses Windows' SetForegroundWindow restriction for
 * background processes), then restore focus to the previous window.
 */
function stealFocus(hwnd: Hwnd): Hwnd | null {
  const u32 = getUser32();
  const prev = u32.GetForegroundWindow() as Hwnd;
  u32.keybd_event(VK_MENU, 0, 0, 0);
  u32.SetForegroundWindow(hwnd);
  u32.keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, 0);
  return prev;
}

function restoreFocus(prev: Hwnd): void {
  const u32 = getUser32();
  u32.keybd_event(VK_MENU, 0, 0, 0);
  u32.SetForegroundWindow(prev);
  u32.keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, 0);
}

function resolveVk(button: Ps1Button): number | null {
  const vk = buttonVk[button];
  if (BLOCKED_VK.has(vk)) {
    console.error(`input: BLOCKED VK 0x${vk.toString(16)} (save operation)`);
    return null;
  }
  return vk;
}

const DEFAULT_TAP_MS = 80;

/**
 * Tap a PS1 button (stealth focus → press → hold → release → restore).
 */
export async function tapButton(
  hwnd: Hwnd,
  button: Ps1Button,
  holdMs = DEFAULT_TAP_MS,
): Promise<boolean> {
  const vk = resolveVk(button);
  if (vk === null) return false;

  const u32 = getUser32();
  const prev = stealFocus(hwnd);
  await sleep(30);

  u32.keybd_event(vk, 0, 0, 0);
  await sleep(holdMs);
  u32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);

  await sleep(30);
  if (prev) restoreFocus(prev);

  return true;
}

/**
 * Hold a PS1 button for a given duration.
 */
export async function holdButton(
  hwnd: Hwnd,
  button: Ps1Button,
  durationMs: number,
): Promise<boolean> {
  return tapButton(hwnd, button, durationMs);
}

/**
 * Trigger DuckStation's `System → Close Game Without Saving` via the menu's
 * Alt+S, W accelerator. Used by the ISO editor to release DuckStation's lock
 * on the ROM before writing a patch.
 *
 * Chose menu-accelerator over a settings.ini hotkey binding because it works
 * immediately with no DuckStation restart and no config changes. Sends:
 *   Alt+S → (menu opens with "Close Game" highlighted) → Down → Enter
 *
 * The older "W" accelerator was brittle with localized DuckStation menus.
 * The menu position is stable across English and French builds: "Close Game
 * Without Saving" is directly below "Close Game".
 */
export async function sendCloseGameWithoutSaving(hwnd: Hwnd): Promise<boolean> {
  if (await invokeCloseGameWithoutSavingAction(hwnd)) return true;
  return sendCloseGameWithoutSavingViaMenu(hwnd);
}

async function invokeCloseGameWithoutSavingAction(hwnd: Hwnd): Promise<boolean> {
  const hwndNumber = Number(hwnd);
  if (!Number.isFinite(hwndNumber) || hwndNumber <= 0) return false;

  const script = `
Add-Type -AssemblyName UIAutomationClient
$root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]${hwndNumber})
if ($null -eq $root) { throw "root_not_found" }
$menuItemCondition = [System.Windows.Automation.PropertyCondition]::new(
  [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
  [System.Windows.Automation.ControlType]::MenuItem
)
$systemMenu = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $menuItemCondition)
if ($null -eq $systemMenu) { throw "system_menu_not_found" }
$pattern = $null
if ($systemMenu.TryGetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern, [ref]$pattern)) {
  $pattern.Expand()
} elseif ($systemMenu.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pattern)) {
  $pattern.Invoke()
} else {
  throw "system_menu_not_expandable"
}
Start-Sleep -Milliseconds 150
$desktop = [System.Windows.Automation.AutomationElement]::RootElement
$exact = [System.Windows.Automation.PropertyCondition]::new(
  [System.Windows.Automation.AutomationElement]::AutomationIdProperty,
  "QApplication.MainWindow.menuBar.QAction.menuSystem.actionCloseGameWithoutSaving"
)
$target = $desktop.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $exact)
if ($null -eq $target) {
  $all = $desktop.FindAll([System.Windows.Automation.TreeScope]::Descendants, $menuItemCondition)
  for ($i = 0; $i -lt $all.Count; $i++) {
    if ($all.Item($i).Current.AutomationId -like "*actionCloseGameWithoutSaving") {
      $target = $all.Item($i)
      break
    }
  }
}
if ($null -eq $target) { throw "close_without_saving_action_not_found" }
$invoke = $null
if (-not $target.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$invoke)) {
  throw "close_without_saving_action_not_invokable"
}
$invoke.Invoke()
`;

  try {
    await execFileAsync("powershell.exe", ["-NoProfile", "-Command", script], {
      timeout: 3000,
      windowsHide: true,
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `input: UIA close-without-saving action failed, falling back to menu keys: ${message}`,
    );
    return false;
  }
}

async function sendCloseGameWithoutSavingViaMenu(hwnd: Hwnd): Promise<boolean> {
  const u32 = getUser32();
  const prev = stealFocus(hwnd);
  await sleep(30);

  // Alt+S to open the System menu
  u32.keybd_event(VK_MENU, 0, 0, 0);
  u32.keybd_event(VK_S, 0, 0, 0);
  await sleep(50);
  u32.keybd_event(VK_S, 0, KEYEVENTF_KEYUP, 0);
  u32.keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, 0);

  // Wait for the menu to render before sending the accelerator
  await sleep(250);

  // The close-game row is highlighted when the menu opens; move to the
  // no-save row immediately below it and confirm.
  u32.keybd_event(VK_DOWN, 0, 0, 0);
  await sleep(40);
  u32.keybd_event(VK_DOWN, 0, KEYEVENTF_KEYUP, 0);
  await sleep(40);
  u32.keybd_event(VK_RETURN, 0, 0, 0);
  await sleep(80);
  u32.keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, 0);

  // Leave DuckStation in the foreground: after close, its game list is
  // visible and the previously-played row is highlighted. Restoring focus
  // back to the browser would force the user to click back into DS to
  // relaunch. Caller should treat DS as foreground after this returns.
  await sleep(30);
  void prev;
  return true;
}

/**
 * Load a DuckStation save state by slot (1–8).
 * Uses hotkeys patched into settings.ini by patchLoadStateHotkeys().
 */
export async function loadState(hwnd: Hwnd, slot: number): Promise<boolean> {
  if (slot < 1 || slot > 8) {
    console.error(`input: invalid save state slot ${slot} (must be 1–8)`);
    return false;
  }
  const vk = LOAD_STATE_VK[slot];
  if (vk === undefined) return false;
  if (BLOCKED_VK.has(vk)) return false;

  const u32 = getUser32();
  const prev = stealFocus(hwnd);
  await sleep(30);

  u32.keybd_event(vk, 0, 0, 0);
  await sleep(100);
  u32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);

  await sleep(30);
  if (prev) restoreFocus(prev);

  return true;
}

// ── Validation helpers ──────────────────────────────────────────

export const ALL_BUTTONS: readonly Ps1Button[] = [
  "up",
  "down",
  "left",
  "right",
  "cross",
  "circle",
  "square",
  "triangle",
  "l1",
  "r1",
  "l2",
  "r2",
  "start",
  "select",
] as const;

export function isValidButton(s: string): s is Ps1Button {
  return (ALL_BUTTONS as readonly string[]).includes(s);
}

export function isValidSlot(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 8;
}

/** Whether bindings have been loaded from settings.ini. */
export function areBindingsLoaded(): boolean {
  return bindingsLoaded;
}

/**
 * Bring DuckStation to the foreground (for manual use).
 */
export function focusDuckStation(hwnd: Hwnd): boolean {
  const u32 = getUser32();
  return u32.SetForegroundWindow(hwnd) !== 0;
}

/**
 * Check if DuckStation is currently the foreground window.
 */
export function isDuckStationFocused(hwnd: Hwnd): boolean {
  const u32 = getUser32();
  return (u32.GetForegroundWindow() as Hwnd) === hwnd;
}
