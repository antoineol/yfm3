/**
 * Watch & restart wrapper for the bridge server.
 *
 * Runs under Linux `bun` (WSL2 side). Watches .ts files with fs.watch
 * (inotify-backed, works on WSL2 fs) and manages bun.exe via spawn/kill.
 *
 * On first run, downloads a cached copy of bun.exe for Windows into
 * .cache/ (same pattern the old node.exe approach used).
 *
 * Usage:  bun bridge/watch.ts          (or: bun bridge)
 */

import { type ChildProcess, execSync, spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { join } from "node:path";

const __dirname = import.meta.dir;
const ROOT = join(__dirname, "..");
const PORT = Number(process.env.BRIDGE_PORT || 3333);
const DEBOUNCE_MS = 300;

// ── Auto-download bun.exe for Windows ─────────────────────────────
// Match the version of bun running this watcher (WSL2 side).

const BUN_VERSION = process.versions.bun ?? "1.3.4";
const BUN_EXE_PATH = join(ROOT, ".cache", `bun-${BUN_VERSION}-win-x64`, "bun.exe");

function ensureBunExe(): void {
  if (existsSync(BUN_EXE_PATH)) return;

  const cacheDir = join(ROOT, ".cache");
  const zipPath = join(cacheDir, `bun-${BUN_VERSION}-win-x64.zip`);
  const extractDir = join(cacheDir, `bun-${BUN_VERSION}-win-x64`);

  console.log(`[watch] downloading bun.exe v${BUN_VERSION} for Windows...`);
  execSync(`mkdir -p "${cacheDir}"`, { stdio: "pipe" });
  execSync(
    `curl -fSL "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-windows-x64.zip" -o "${zipPath}"`,
    { stdio: "inherit", timeout: 60_000 },
  );
  execSync(`mkdir -p "${extractDir}"`, { stdio: "pipe" });
  // Zip contains bun-windows-x64/bun.exe — extract and move to cache dir
  execSync(`unzip -o "${zipPath}" -d "${cacheDir}"`, { stdio: "pipe" });
  execSync(`mv "${join(cacheDir, "bun-windows-x64", "bun.exe")}" "${extractDir}/bun.exe"`, {
    stdio: "pipe",
  });
  // Cleanup
  execSync(`rm -rf "${zipPath}" "${join(cacheDir, "bun-windows-x64")}"`, { stdio: "pipe" });
  console.log(`[watch] cached bun.exe at ${BUN_EXE_PATH}`);
}

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
  child = spawn(BUN_EXE_PATH, ["run", "serve.ts"], {
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
    if (portFree()) {
      // Port reported free by netstat, but Windows TCP stack may still hold it
      // briefly. Wait a beat before allowing the new process to bind.
      await new Promise((r) => setTimeout(r, 500));
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  // Port still held — force-kill whatever has it
  console.warn(`[watch] port ${PORT} still in use after 5s — force-killing holder`);
  killGhost();
  await new Promise((r) => setTimeout(r, 1000));
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

const watcher = watch(__dirname, { recursive: true }, (_event, filename) => {
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

ensureBunExe();
killGhost();
start();
