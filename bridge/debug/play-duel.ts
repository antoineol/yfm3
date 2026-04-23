/**
 * Autonomous duel player — uses ViGEm (via vigem-helper.ps1 subprocess)
 * for focus-free input and the bridge WebSocket for game state.
 *
 * Run: bun.exe bridge/debug/play-duel.ts
 */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";

interface CardSlot {
  cardId: number;
  atk: number;
  def: number;
  status: number;
}

interface GameState {
  connected: boolean;
  duelPhase: number | null;
  turnIndicator: number | null;
  lp: [number, number] | null;
  hand: CardSlot[];
  field: CardSlot[];
  opponentField: CardSlot[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── ViGEm helper subprocess ─────────────────────────────────────

function startVigemHelper(): { tap: (btn: string) => Promise<void>; quit: () => void } {
  const scriptDir = dirname(import.meta.path);
  const scriptPath = join(scriptDir, "vigem-helper.ps1");

  const proc = spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
    {
      stdio: ["pipe", "pipe", "pipe"],
    },
  );

  proc.stderr.on("data", (d: Buffer) => process.stderr.write(`[vigem] ${d}`));

  let pendingResolve: (() => void) | null = null;
  let buffer = "";

  proc.stdout.on("data", (d: Buffer) => {
    buffer += d.toString();
    while (buffer.includes("\n")) {
      const idx = buffer.indexOf("\n");
      const line = buffer.substring(0, idx).trim();
      buffer = buffer.substring(idx + 1);
      if (line === "ok" && pendingResolve) {
        const r = pendingResolve;
        pendingResolve = null;
        r();
      }
    }
  });

  function send(cmd: string): Promise<void> {
    return new Promise((resolve) => {
      pendingResolve = resolve;
      proc.stdin.write(`${cmd}\n`);
    });
  }

  return {
    async tap(btn: string) {
      await send(`tap ${btn}`);
      await sleep(100);
    },
    quit() {
      proc.stdin.write("quit\n");
      proc.stdin.end();
    },
  };
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("Starting ViGEm helper...");
  const vigem = startVigemHelper();

  // Wait for controller to be detected by DuckStation
  console.log("Waiting for DuckStation to detect controller...");
  await sleep(4000);

  // Connect to bridge
  console.log("Connecting to bridge...");
  const ws = new WebSocket("ws://localhost:3333");
  let state: GameState | null = null;

  ws.onmessage = (e) => {
    const msg = JSON.parse(String(e.data));
    if ("connected" in msg && !("type" in msg && msg.type === "gameData")) {
      state = msg as GameState;
    }
  };

  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("Bridge connection failed"));
  });
  console.log("Bridge connected.\n");

  await sleep(500);

  let turnCount = 0;
  let stuckCount = 0;
  let lastPhase = -1;

  for (let tick = 0; tick < 3000; tick++) {
    await sleep(200);
    const s = state as GameState | null;
    if (!s || s.duelPhase === null) continue;

    const phase = s.duelPhase;
    const turn = s.turnIndicator ?? 0;
    const lp = s.lp;
    const lpStr = lp ? `[LP ${lp[0]} vs ${lp[1]}]` : "";

    if (phase === lastPhase) {
      stuckCount++;
    } else {
      stuckCount = 0;
      lastPhase = phase;
    }

    // Duel ended
    if (phase === 12 || phase === 13) {
      const result = lp && lp[0] > lp[1] ? "WON" : lp && lp[0] < lp[1] ? "LOST" : "DRAW";
      console.log(`\n=== DUEL ${result}! ${lpStr} ===\n`);
      for (let i = 0; i < 15; i++) {
        await vigem.tap("cross");
        await sleep(400);
      }
      break;
    }

    // Opponent's turn
    if (turn === 1) continue;

    // Player's turn
    switch (phase) {
      case 1:
      case 2:
      case 3:
        await vigem.tap("cross");
        break;
      case 4:
        turnCount++;
        console.log(`Turn ${turnCount}: Hand select ${lpStr}`);
        await vigem.tap("cross");
        break;
      case 5:
        console.log("  Field: placing card");
        await vigem.tap("cross");
        break;
      case 7:
      case 8:
        console.log("  Fusion phase");
        await vigem.tap("cross");
        break;
      case 9:
        console.log("  Battle: attacking!");
        await vigem.tap("cross");
        break;
      case 10:
        console.log("  Post-battle");
        await vigem.tap("cross");
        break;
      default:
        await vigem.tap("cross");
        break;
    }

    if (stuckCount > 20) {
      console.log(`  [stuck in phase ${phase}, trying circle]`);
      await vigem.tap("circle");
      stuckCount = 0;
    }
  }

  vigem.quit();
  ws.close();
  console.log("Done.");
  await sleep(1000);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
