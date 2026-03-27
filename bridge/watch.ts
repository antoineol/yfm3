/**
 * Watch & restart wrapper for the bridge server.
 *
 * Runs under Linux `bun` (WSL2 side). Watches .ts files with fs.watch
 * (inotify-backed, works on WSL2 fs) and manages bun.exe via spawn/kill.
 *
 * Usage:  bun bridge/watch.ts          (or: bun bridge)
 */

import { type ChildProcess, execSync, spawn } from "node:child_process";
import { watch } from "node:fs";

const __dirname = import.meta.dir;
const PORT = Number(process.env.BRIDGE_PORT || 3333);
const DEBOUNCE_MS = 300;

// ── Ghost cleanup ─────────────────────────────────────────────────
// Kill stale processes on our port from a previous crashed session.

function killGhost(): void {
  let pid: string | undefined;
  try {
    pid = execSync(`netstat.exe -ano | findstr.exe "LISTENING" | findstr.exe ":${PORT} "`, {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 3000,
    })
      .trim()
      .split(/\s+/)
      .pop()
      ?.replace(/\r/g, "");
  } catch {
    return; // no match → port free
  }
  if (!pid || pid === "0") return;
  console.log(`[watch] port ${PORT} held by ghost (PID ${pid}) — killing...`);
  try {
    execSync(`taskkill.exe /F /T /PID ${pid}`, {
      stdio: "pipe",
      timeout: 5000,
    });
  } catch {
    /* best effort */
  }
}

// ── Bridge process management ─────────────────────────────────────

let child: ChildProcess | null = null;
let stopping = false;

function start(): void {
  console.log("[watch] starting bridge...");
  child = spawn("bun.exe", ["run", "serve.ts"], {
    cwd: __dirname,
    stdio: ["ignore", "inherit", "inherit"],
  });
  child.on("exit", (code, signal) => {
    child = null;
    if (!stopping) {
      console.log(`[watch] bridge exited unexpectedly (code=${code}, signal=${signal})`);
    }
  });
}

function stop(): Promise<void> {
  return new Promise((resolve) => {
    if (!child) return resolve();
    child.once("exit", () => resolve());
    child.kill();
  });
}

function portFree(): boolean {
  try {
    execSync(`netstat.exe -ano | findstr.exe "LISTENING" | findstr.exe ":${PORT} "`, {
      stdio: "pipe",
      timeout: 3000,
    });
    return false;
  } catch {
    return true;
  }
}

async function waitPortFree(): Promise<void> {
  for (let i = 0; i < 20; i++) {
    if (portFree()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.warn(`[watch] port ${PORT} still in use after 5s`);
}

async function restart(filename: string): Promise<void> {
  stopping = true;
  console.log(`[watch] ${filename} changed — restarting...`);
  await stop();
  await waitPortFree();
  stopping = false;
  start();
}

// ── File watcher ──────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const watcher = watch(__dirname, (_event, filename) => {
  if (stopping) return;
  if (!filename?.endsWith(".ts")) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void restart(filename);
  }, DEBOUNCE_MS);
});

// ── Shutdown ──────────────────────────────────────────────────────

function shutdown(): void {
  if (stopping) return;
  stopping = true;
  console.log("[watch] shutting down...");
  if (debounceTimer) clearTimeout(debounceTimer);
  watcher.close();
  void stop().then(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ── Start ─────────────────────────────────────────────────────────

killGhost();
start();
