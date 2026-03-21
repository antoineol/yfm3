/**
 * Watch & restart wrapper for the bridge server.
 *
 * Runs under Linux `node` (WSL2 side). Watches .mjs files with fs.watch
 * (inotify-backed, works on WSL2 fs) and manages node.exe via spawn/kill.
 *
 * Usage:  node bridge/watch.mjs          (or: bun bridge)
 */

import { execFileSync, execSync, spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.BRIDGE_PORT || 3333);
const DEBOUNCE_MS = 300;

// ── Ghost cleanup ─────────────────────────────────────────────────
// Kill stale node.exe on our port from a previous crashed session.

function killGhost() {
  let pid;
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

// ── npm install (Windows-side deps for node.exe) ─────────────────
// Uses \\wsl$\ share (not \\wsl.localhost\) because cmd.exe's pushd
// can map \\wsl$\ to a temp drive letter but fails on \\wsl.localhost\.

function npmInstall() {
  const distro = execSync("wsl.exe -l -q 2>/dev/null || echo Ubuntu", {
    encoding: "utf8",
  })
    .trim()
    .split("\n")[0]
    .replace(/[\0\r]/g, "");
  const wslPath = `\\\\wsl$\\${distro}${__dirname.replaceAll("/", "\\")}`;
  execFileSync(
    "cmd.exe",
    ["/c", `pushd ${wslPath} && npm install --prefer-offline 2>nul && popd`],
    { stdio: "inherit", timeout: 60_000, cwd: "/mnt/c" },
  );
}

// ── Bridge process management ─────────────────────────────────────

let child = null;
let stopping = false;

function start() {
  console.log("[watch] starting bridge...");
  child = spawn("node.exe", ["serve.mjs"], {
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

function stop() {
  return new Promise((resolve) => {
    if (!child) return resolve();
    child.once("exit", resolve);
    child.kill();
  });
}

function portFree() {
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

async function waitPortFree() {
  for (let i = 0; i < 20; i++) {
    if (portFree()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.warn(`[watch] port ${PORT} still in use after 5s`);
}

async function restart(filename) {
  stopping = true;
  console.log(`[watch] ${filename} changed — restarting...`);
  await stop();
  await waitPortFree();
  stopping = false;
  start();
}

// ── File watcher ──────────────────────────────────────────────────

let debounceTimer = null;

const watcher = watch(__dirname, (_event, filename) => {
  if (stopping) return;
  if (!filename?.endsWith(".mjs")) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void restart(filename);
  }, DEBOUNCE_MS);
});

// ── Shutdown ──────────────────────────────────────────────────────

function shutdown() {
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
npmInstall();
start();
