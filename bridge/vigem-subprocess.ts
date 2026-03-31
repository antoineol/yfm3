/**
 * Persistent ViGEm virtual controller via vigem-helper.ps1 subprocess.
 *
 * Spawns the PowerShell helper once on first input command, keeps it alive
 * to avoid the ~3s DuckStation XInput detection delay on each reconnect.
 * Commands are sent via stdin, synchronised by waiting for "ok" on stdout.
 *
 * Falls back gracefully: if the subprocess dies, the next command re-spawns it
 * (with a one-time 3s penalty while DuckStation detects the new controller).
 */

import { type ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import type { Ps1Button } from "./input.ts";

// ── Types ────────────────────────────────────────────────────────

export interface VigemSubprocess {
  /** Tap a PS1 button (press, hold 80ms, release). Focus-free. */
  tap(button: Ps1Button, holdMs?: number): Promise<void>;
  /** Press and hold a PS1 button until released. */
  press(button: Ps1Button): Promise<void>;
  /** Release a previously pressed button. */
  release(button: Ps1Button): Promise<void>;
  /** Release all buttons. */
  releaseAll(): Promise<void>;
  /** Whether the subprocess is currently running. */
  readonly alive: boolean;
  /** Gracefully shut down the subprocess. */
  destroy(): void;
}

// ── Resolve script path ─────────────────────────────────────────

function resolveHelperPath(): string {
  // In dev: import.meta.dir is the bridge/ directory
  // In vitest (node): import.meta.dir is undefined, but we only reach
  // this path in production (when spawnFn is not overridden).
  const dir = import.meta.dir ?? ".";
  return join(dir, "debug", "vigem-helper.ps1");
}

// ── Subprocess lifecycle ────────────────────────────────────────

/** How long to wait for "ok" from the helper before timing out (ms). */
const COMMAND_TIMEOUT_MS = 5_000;

/** How long to wait after spawning before sending first command (ms). */
const DETECTION_DELAY_MS = 4_000;

export interface VigemSubprocessOptions {
  /** Override detection delay (ms). Default: 4000. Set to 0 for tests. */
  detectionDelayMs?: number;
  /** @internal Override spawn for testing. */
  spawnFn?: typeof spawn;
}

/**
 * Create a persistent ViGEm subprocess manager.
 *
 * The subprocess is spawned lazily on the first command. If it dies, the
 * next command re-spawns it (with a detection delay).
 */
export function createVigemSubprocess(opts?: VigemSubprocessOptions): VigemSubprocess {
  const detectionDelay = opts?.detectionDelayMs ?? DETECTION_DELAY_MS;
  const spawnCmd = opts?.spawnFn ?? spawn;
  let proc: ChildProcess | null = null;
  let pendingResolve: (() => void) | null = null;
  let pendingReject: ((err: Error) => void) | null = null;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;
  let stdoutBuffer = "";
  let spawnedAt = 0;

  function ensureProcess(): ChildProcess {
    if (proc && proc.exitCode === null) return proc;

    const scriptPath = resolveHelperPath();
    console.log("vigem-sub: spawning vigem-helper.ps1");

    proc = spawnCmd(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    spawnedAt = Date.now();
    stdoutBuffer = "";

    proc.stderr?.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line) console.log(`vigem-sub: ${line}`);
    });

    proc.stdout?.on("data", (d: Buffer) => {
      stdoutBuffer += d.toString();
      drainBuffer();
    });

    proc.on("exit", (code) => {
      console.log(`vigem-sub: process exited (code ${code})`);
      rejectPending(new Error(`vigem-helper exited with code ${code}`));
      proc = null;
    });

    return proc;
  }

  function drainBuffer(): void {
    while (stdoutBuffer.includes("\n")) {
      const idx = stdoutBuffer.indexOf("\n");
      const line = stdoutBuffer.substring(0, idx).trim();
      stdoutBuffer = stdoutBuffer.substring(idx + 1);
      if (line === "ok") {
        resolvePending();
      }
    }
  }

  function resolvePending(): void {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    const r = pendingResolve;
    pendingResolve = null;
    pendingReject = null;
    r?.();
  }

  function rejectPending(err: Error): void {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    const r = pendingReject;
    pendingResolve = null;
    pendingReject = null;
    r?.(err);
  }

  async function send(cmd: string): Promise<void> {
    const p = ensureProcess();

    // If just spawned, wait for DuckStation to detect the controller
    const elapsed = Date.now() - spawnedAt;
    if (elapsed < detectionDelay) {
      const wait = detectionDelay - elapsed;
      console.log(`vigem-sub: waiting ${wait}ms for controller detection`);
      await new Promise<void>((r) => setTimeout(r, wait));
    }

    if (!p.stdin?.writable) {
      throw new Error("vigem-helper stdin not writable");
    }

    return new Promise<void>((resolve, reject) => {
      pendingResolve = resolve;
      pendingReject = reject;
      pendingTimer = setTimeout(() => {
        rejectPending(new Error(`vigem-helper command timed out: ${cmd}`));
      }, COMMAND_TIMEOUT_MS);

      p.stdin?.write(`${cmd}\n`);
    });
  }

  return {
    async tap(button: Ps1Button, holdMs?: number): Promise<void> {
      const cmd = holdMs != null ? `tap ${button} ${holdMs}` : `tap ${button}`;
      await send(cmd);
    },

    async press(button: Ps1Button): Promise<void> {
      await send(`press ${button}`);
    },

    async release(button: Ps1Button): Promise<void> {
      await send(`release ${button}`);
    },

    async releaseAll(): Promise<void> {
      await send("releaseall");
    },

    get alive(): boolean {
      return proc !== null && proc.exitCode === null;
    },

    destroy(): void {
      if (proc && proc.exitCode === null) {
        proc.stdin?.write("quit\n");
        proc.stdin?.end();
        // Force-kill after 2s if it doesn't exit gracefully
        const p = proc;
        setTimeout(() => {
          if (p.exitCode === null) p.kill();
        }, 2000);
      }
      proc = null;
    },
  };
}
