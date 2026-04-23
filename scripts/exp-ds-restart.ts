// Experiment: kill DuckStation gracefully, wait for lock release, relaunch
// with ROM arg, wait for lock reacquired. Reports timings at each step.
//
// Intended for WSL/Node — uses powershell.exe for process ops.

import { execSync, spawn } from "node:child_process";

const DS_EXE = "C:\\jeux\\ps1\\duckstation\\duckstation-qt-x64-ReleaseLTCG.exe";
const ROM = "C:\\jeux\\ps1\\Yu-gi-oh! Forbidden Memories\\Yu-Gi-Oh! Alpha Mod (Drop x15).iso";
const ROM_WSL = "/mnt/c/jeux/ps1/Yu-gi-oh! Forbidden Memories/Yu-Gi-Oh! Alpha Mod (Drop x15).iso";

function t(): number {
  return Date.now();
}

function findDsPids(): number[] {
  try {
    const out = execSync(
      'powershell.exe -NoProfile -Command "(Get-Process -Name duckstation-qt-x64-ReleaseLTCG -ErrorAction SilentlyContinue).Id"',
      { encoding: "utf-8" },
    ).trim();
    if (!out) return [];
    return out
      .split(/\r?\n/)
      .map((x) => Number(x))
      .filter(Number.isFinite);
  } catch {
    return [];
  }
}

function isLocked(path: string): boolean {
  const script = `try { $fs = [System.IO.File]::Open('${path.replace(/'/g, "''")}', 'Open', 'Read', 'None'); $fs.Close(); 'FREE' } catch { 'LOCKED' }`;
  try {
    const out = execSync(`powershell.exe -NoProfile -Command "${script}"`, {
      encoding: "utf-8",
    }).trim();
    return out === "LOCKED";
  } catch {
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("=== Baseline ===");
  const pidsBefore = findDsPids();
  console.log(`DS PIDs: ${pidsBefore.join(", ") || "(none)"}`);
  console.log(`ISO locked: ${isLocked(ROM)}`);
  const pid = pidsBefore[0];
  if (pid === undefined) {
    console.log("No DuckStation running — skipping kill step.");
  } else {
    console.log(`\n=== Step 1: kill PID ${pid} (graceful WM_CLOSE) ===`);
    const t0 = t();
    try {
      execSync(`powershell.exe -NoProfile -Command "taskkill /PID ${pid}"`, {
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      console.warn(`taskkill error: ${(e as Error).message}`);
    }

    let pidGoneAt = -1;
    let lockFreeAt = -1;
    for (let i = 0; i < 80 /* 20s */; i++) {
      await sleep(250);
      if (pidGoneAt === -1 && !findDsPids().includes(pid)) pidGoneAt = t() - t0;
      if (lockFreeAt === -1 && !isLocked(ROM)) lockFreeAt = t() - t0;
      if (pidGoneAt !== -1 && lockFreeAt !== -1) break;
    }
    console.log(`PID gone after:  ${pidGoneAt === -1 ? "TIMEOUT" : `${pidGoneAt}ms`}`);
    console.log(`Lock free after: ${lockFreeAt === -1 ? "TIMEOUT" : `${lockFreeAt}ms`}`);
  }

  console.log("\n=== Step 2: launch DS with ROM arg ===");
  const t1 = t();
  const child = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Start-Process -FilePath '${DS_EXE.replace(/'/g, "''")}' -ArgumentList '"${ROM.replace(/"/g, '\\"')}"'`,
    ],
    { detached: true, stdio: "ignore" },
  );
  child.unref();

  let pidAppearAt = -1;
  let lockReacquiredAt = -1;
  for (let i = 0; i < 120 /* 30s */; i++) {
    await sleep(250);
    if (pidAppearAt === -1 && findDsPids().length > 0) pidAppearAt = t() - t1;
    if (lockReacquiredAt === -1 && isLocked(ROM)) lockReacquiredAt = t() - t1;
    if (pidAppearAt !== -1 && lockReacquiredAt !== -1) break;
  }
  console.log(`PID appeared:        ${pidAppearAt === -1 ? "TIMEOUT" : `${pidAppearAt}ms`}`);
  console.log(
    `Lock reacquired at:  ${lockReacquiredAt === -1 ? "TIMEOUT" : `${lockReacquiredAt}ms`}`,
  );

  console.log("\n=== Final state ===");
  console.log(`DS PIDs: ${findDsPids().join(", ") || "(none)"}`);
  console.log(`ISO locked: ${isLocked(ROM)}`);
  console.log(`ROM path exists (WSL side): ${require("node:fs").existsSync(ROM_WSL)}`);
}

void main();
