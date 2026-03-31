/**
 * ViGEmBus virtual Xbox 360 controller — direct driver communication.
 *
 * Talks to the ViGEmBus kernel driver via DeviceIoControl (kernel32.dll),
 * bypassing the ViGEmClient DLL entirely. Zero external dependencies
 * beyond the ViGEmBus driver itself.
 *
 * Creates a virtual Xbox 360 controller that DuckStation reads via XInput,
 * enabling fully focus-free input injection.
 */

import { dlopen, ptr, type Pointer } from "bun:ffi";

// ── Types ────────────────────────────────────────────────────────

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

// ── Xbox 360 button flags (XUSB_GAMEPAD) ────────────────────────

const XUSB = {
  DPAD_UP: 0x0001,
  DPAD_DOWN: 0x0002,
  DPAD_LEFT: 0x0004,
  DPAD_RIGHT: 0x0008,
  START: 0x0010,
  BACK: 0x0020,
  LEFT_SHOULDER: 0x0100,
  RIGHT_SHOULDER: 0x0200,
  A: 0x1000,
  B: 0x2000,
  X: 0x4000,
  Y: 0x8000,
} as const;

// ── PS1 → Xbox button mapping ───────────────────────────────────

const PS1_TO_XBOX_BUTTON: Partial<Record<Ps1Button, number>> = {
  up: XUSB.DPAD_UP,
  down: XUSB.DPAD_DOWN,
  left: XUSB.DPAD_LEFT,
  right: XUSB.DPAD_RIGHT,
  cross: XUSB.A,
  circle: XUSB.B,
  square: XUSB.X,
  triangle: XUSB.Y,
  l1: XUSB.LEFT_SHOULDER,
  r1: XUSB.RIGHT_SHOULDER,
  start: XUSB.START,
  select: XUSB.BACK,
};

// L2/R2 are analog triggers on Xbox, handled separately
const PS1_TO_XBOX_TRIGGER: Partial<Record<Ps1Button, "left" | "right">> = {
  l2: "left",
  r2: "right",
};

// ── Windows constants ───────────────────────────────────────────

const GENERIC_READ = 0x80000000;
const GENERIC_WRITE = 0x40000000;
const FILE_SHARE_READ = 0x00000001;
const FILE_SHARE_WRITE = 0x00000002;
const OPEN_EXISTING = 3;
const FILE_ATTRIBUTE_NORMAL = 0x80;
const FILE_FLAG_NO_BUFFERING = 0x20000000;
const FILE_FLAG_WRITE_THROUGH = 0x80000000;
const INVALID_HANDLE_VALUE = -1;

// ── ViGEmBus IOCTL codes ────────────────────────────────────────
// CTL_CODE(FILE_DEVICE_BUS_EXTENDER=0x2A, Function, METHOD_BUFFERED=0, FILE_READ|FILE_WRITE=3)

function ctlCode(func: number): number {
  return (0x2a << 16) | (0x03 << 14) | (func << 2);
}

const IOCTL_VIGEM_CHECK_VERSION = ctlCode(0x803);
const IOCTL_VIGEM_PLUGIN_TARGET = ctlCode(0x801);
const IOCTL_VIGEM_WAIT_DEVICE_READY = ctlCode(0x804);
const IOCTL_XUSB_SUBMIT_REPORT = ctlCode(0x805);
const IOCTL_VIGEM_UNPLUG_TARGET = ctlCode(0x802);

// ── ViGEmBus protocol constants ─────────────────────────────────

const VIGEM_COMMON_VERSION = 1;
const VIGEM_TARGET_TYPE_XBOX360 = 0;

// ── kernel32.dll FFI ────────────────────────────────────────────

const { symbols: k32 } = dlopen("kernel32.dll", {
  CreateFileW: {
    args: ["ptr", "u32", "u32", "ptr", "u32", "u32", "ptr"],
    returns: "ptr",
  },
  DeviceIoControl: {
    args: ["ptr", "u32", "ptr", "u32", "ptr", "u32", "ptr", "ptr"],
    returns: "i32",
  },
  CloseHandle: {
    args: ["ptr"],
    returns: "i32",
  },
  GetLastError: {
    args: [],
    returns: "u32",
  },
});

// ── Helpers ─────────────────────────────────────────────────────

function encodeWide(str: string): Buffer {
  const buf = Buffer.alloc((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) buf.writeUInt16LE(str.charCodeAt(i), i * 2);
  return buf;
}

function ioctl(
  handle: Pointer,
  code: number,
  inBuf: Uint8Array,
): boolean {
  const bytesReturned = new Uint32Array(1);
  const result = k32.DeviceIoControl(
    handle,
    code,
    ptr(inBuf),
    inBuf.length,
    ptr(inBuf), // some IOCTLs write back to the same buffer
    inBuf.length,
    ptr(new Uint8Array(bytesReturned.buffer)),
    null, // synchronous
  );
  return result !== 0;
}

function writeU32(buf: Uint8Array, offset: number, value: number): void {
  const view = new DataView(buf.buffer, buf.byteOffset);
  view.setUint32(offset, value, true);
}

function writeU16(buf: Uint8Array, offset: number, value: number): void {
  const view = new DataView(buf.buffer, buf.byteOffset);
  view.setUint16(offset, value, true);
}

function writeI16(buf: Uint8Array, offset: number, value: number): void {
  const view = new DataView(buf.buffer, buf.byteOffset);
  view.setInt16(offset, value, true);
}

// ── Virtual controller lifecycle ────────────────────────────────

export interface VirtualController {
  /** Send a button state update. Fully focus-free. */
  update(wButtons: number, leftTrigger?: number, rightTrigger?: number): boolean;
  /** Tap a PS1 button (press → hold → release). */
  tap(button: Ps1Button, holdMs?: number): Promise<boolean>;
  /** Hold a PS1 button for a duration. */
  hold(button: Ps1Button, durationMs: number): Promise<boolean>;
  /** Release all buttons. */
  releaseAll(): boolean;
  /** Unplug the virtual controller and close the driver handle. */
  destroy(): void;
}

/**
 * Create and plug in a virtual Xbox 360 controller via ViGEmBus.
 * Returns null if the driver is not installed or connection fails.
 */
export function createVirtualController(): VirtualController | null {
  // Open ViGEmBus device
  const devicePath = encodeWide("\\\\.\\ViGEmBus");
  const handle = k32.CreateFileW(
    ptr(devicePath),
    GENERIC_READ | GENERIC_WRITE,
    FILE_SHARE_READ | FILE_SHARE_WRITE,
    null,
    OPEN_EXISTING,
    FILE_ATTRIBUTE_NORMAL | FILE_FLAG_NO_BUFFERING | FILE_FLAG_WRITE_THROUGH,
    null,
  );

  if (!handle || Number(handle) === INVALID_HANDLE_VALUE) {
    const err = k32.GetLastError();
    console.error(`vigem: cannot open ViGEmBus device (error ${err}). Is the driver installed?`);
    return null;
  }

  console.log("vigem: connected to ViGEmBus driver");

  // Check version
  const versionBuf = new Uint8Array(8);
  writeU32(versionBuf, 0, 8); // Size
  writeU32(versionBuf, 4, VIGEM_COMMON_VERSION);
  if (!ioctl(handle, IOCTL_VIGEM_CHECK_VERSION, versionBuf)) {
    console.error(`vigem: version check failed (error ${k32.GetLastError()})`);
    k32.CloseHandle(handle);
    return null;
  }
  console.log("vigem: version check passed");

  // Plugin Xbox 360 target (serial number 1)
  const serialNo = 1;
  const pluginBuf = new Uint8Array(16);
  writeU32(pluginBuf, 0, 16); // Size
  writeU32(pluginBuf, 4, serialNo);
  writeU32(pluginBuf, 8, VIGEM_TARGET_TYPE_XBOX360);
  writeU16(pluginBuf, 12, 0); // VendorId (default)
  writeU16(pluginBuf, 14, 0); // ProductId (default)

  if (!ioctl(handle, IOCTL_VIGEM_PLUGIN_TARGET, pluginBuf)) {
    console.error(`vigem: plugin target failed (error ${k32.GetLastError()})`);
    k32.CloseHandle(handle);
    return null;
  }
  console.log("vigem: Xbox 360 controller plugged in");

  // Wait for device ready
  const waitBuf = new Uint8Array(8);
  writeU32(waitBuf, 0, 8); // Size
  writeU32(waitBuf, 4, serialNo);
  if (!ioctl(handle, IOCTL_VIGEM_WAIT_DEVICE_READY, waitBuf)) {
    console.error(`vigem: wait device ready failed (error ${k32.GetLastError()})`);
    k32.CloseHandle(handle);
    return null;
  }
  console.log("vigem: virtual controller ready");

  // Report buffer (reused across updates)
  // Layout: Size(4) + SerialNo(4) + XUSB_REPORT(12) = 20 bytes
  const reportBuf = new Uint8Array(20);
  writeU32(reportBuf, 0, 20); // Size
  writeU32(reportBuf, 4, serialNo);

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const controller: VirtualController = {
    update(wButtons: number, leftTrigger = 0, rightTrigger = 0): boolean {
      // XUSB_REPORT at offset 8:
      //   wButtons (uint16) at +0
      //   bLeftTrigger (uint8) at +2
      //   bRightTrigger (uint8) at +3
      //   sThumbLX..RY (4×int16) at +4..+11 — all 0 (centered)
      writeU16(reportBuf, 8, wButtons);
      reportBuf[10] = leftTrigger;
      reportBuf[11] = rightTrigger;
      writeI16(reportBuf, 12, 0); // LX
      writeI16(reportBuf, 14, 0); // LY
      writeI16(reportBuf, 16, 0); // RX
      writeI16(reportBuf, 18, 0); // RY

      return ioctl(handle, IOCTL_XUSB_SUBMIT_REPORT, reportBuf);
    },

    async tap(button: Ps1Button, holdMs = 80): Promise<boolean> {
      const btnFlag = PS1_TO_XBOX_BUTTON[button];
      const trigger = PS1_TO_XBOX_TRIGGER[button];

      if (btnFlag !== undefined) {
        if (!controller.update(btnFlag)) return false;
        await sleep(holdMs);
        return controller.releaseAll();
      }

      if (trigger === "left") {
        if (!controller.update(0, 255, 0)) return false;
        await sleep(holdMs);
        return controller.releaseAll();
      }
      if (trigger === "right") {
        if (!controller.update(0, 0, 255)) return false;
        await sleep(holdMs);
        return controller.releaseAll();
      }

      console.error(`vigem: unknown PS1 button "${button}"`);
      return false;
    },

    async hold(button: Ps1Button, durationMs: number): Promise<boolean> {
      return controller.tap(button, durationMs);
    },

    releaseAll(): boolean {
      return controller.update(0, 0, 0);
    },

    destroy(): void {
      // Unplug target
      const unplugBuf = new Uint8Array(8);
      writeU32(unplugBuf, 0, 8);
      writeU32(unplugBuf, 4, serialNo);
      ioctl(handle, IOCTL_VIGEM_UNPLUG_TARGET, unplugBuf);
      k32.CloseHandle(handle);
      console.log("vigem: virtual controller unplugged");
    },
  };

  return controller;
}
