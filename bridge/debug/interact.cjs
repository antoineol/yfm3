/**
 * Interactive feedback loop using persistent ViGEm server.
 * Connects to bridge for state, sends inputs via vigem-server (port 7777),
 * takes screenshots via take-screenshot.ps1.
 *
 * Usage:
 *   node bridge/debug/interact.cjs <button> [button] ...
 *   node bridge/debug/interact.cjs cross cross circle
 *   node bridge/debug/interact.cjs --screenshot cross   (takes screenshot after)
 */

const { execSync } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const WS = require("ws");

const BRIDGE_URL = "ws://172.28.48.1:3333";
const VIGEM_PORT = 7777;
const SS_SCRIPT = path.join(__dirname, "take-screenshot.ps1");

function tap(btn) {
  return new Promise((resolve, reject) => {
    const c = net.connect(VIGEM_PORT, "127.0.0.1");
    c.on("connect", () => c.write(`tap ${btn}\n`));
    c.on("data", (d) => {
      const r = d.toString().trim();
      c.end();
      if (r === "ok") resolve();
      else reject(new Error(r));
    });
    c.on("error", reject);
    setTimeout(() => reject(new Error("timeout")), 5000);
  });
}

function screenshot() {
  try {
    execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${SS_SCRIPT}"`, {
      timeout: 10000,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const wantScreenshot = args.includes("--screenshot");
  const buttons = args.filter((a) => a !== "--screenshot");

  if (buttons.length === 0) {
    console.log("Usage: node interact.cjs [--screenshot] <button> [button] ...");
    console.log("Buttons: cross circle square triangle up down left right start select l1 r1");
    process.exit(0);
  }

  // Connect to bridge
  const ws = new WS(BRIDGE_URL);
  let state = null;

  ws.on("message", (d) => {
    const msg = JSON.parse(d.toString());
    if ("duelPhase" in msg) state = msg;
  });

  await new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
    setTimeout(() => reject(new Error("bridge timeout")), 5000);
  });

  await new Promise((r) => setTimeout(r, 200));

  function stateStr() {
    if (!state) return "no state";
    const h = (state.hand || []).filter((c) => c.status === 128).length;
    const f = (state.field || []).filter((c) => c.status === 128).length;
    return `phase=${state.duelPhase} turn=${state.turnIndicator} h=${h} f=${f} lp=${JSON.stringify(state.lp)}`;
  }

  console.log(`[start] ${stateStr()}`);

  for (const btn of buttons) {
    await tap(btn);
    await new Promise((r) => setTimeout(r, 400));
    console.log(`  ${btn} => ${stateStr()}`);
  }

  if (wantScreenshot) screenshot();

  ws.close();
  process.exit();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
