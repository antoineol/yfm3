/**
 * Bridge server: reads DuckStation shared memory and broadcasts game state
 * over WebSocket.
 *
 * Usage (from Windows):
 *   cd bridge && npm install && npm start
 *
 * Or from WSL2:
 *   cd bridge && node.exe serve.mjs
 *
 * Connects to ws://localhost:3333
 */

import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import {
  closeSharedMemory,
  findDuckStationPids,
  openSharedMemory,
  readGameState,
} from "./memory.mjs";

// ── File logging (so Claude can read bridge/bridge.log) ─────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(__dirname, "bridge.log");
const logStream = createWriteStream(LOG_PATH, { flags: "w" });

function timestamp() {
  return new Date().toISOString();
}

for (const level of ["log", "info", "warn", "error", "debug"]) {
  const orig = console[level].bind(console);
  console[level] = (...args) => {
    orig(...args);
    logStream.write(`${timestamp()} [${level}] ${args.join(" ")}\n`);
  };
}

const PORT = Number(process.env.BRIDGE_PORT || 3333);
const POLL_MS = Number(process.env.BRIDGE_POLL_MS || 200);

// ── State ──────────────────────────────────────────────────────────
let mapping = null; // { handle, view, pid }
let lastJson = ""; // deduplicate broadcasts
let lastLogState = null; // previous state for change-based logging

// ── WebSocket server ───────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log(`Bridge WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log(`Client connected 27 (${wss.clients.size} total)`);

  // Always send fresh state on connect — never rely solely on cache.
  // Handles: bridge restart, app reconnect, app started late.
  if (mapping) {
    try {
      const state = readGameState(mapping.view);
      const json = JSON.stringify({ connected: true, pid: mapping.pid, ...state });
      ws.send(json);
      if (json !== lastJson) {
        logStateChange(state);
        lastJson = json;
      }
    } catch {
      ws.send(JSON.stringify({ connected: false, reason: "Failed to read game state" }));
    }
  } else if (lastJson) {
    ws.send(lastJson);
  }

  // Handle "scan" command from client to trigger re-scan
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "scan") {
        console.log("Received scan request from client");
        void tryConnect();
      }
    } catch {
      // ignore invalid messages
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected (${wss.clients.size} total)`);
  });
});

function broadcast(json) {
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(json);
    }
  }
}

// ── Connection to DuckStation ──────────────────────────────────────
async function tryConnect() {
  if (mapping) return true;

  const pids = await findDuckStationPids();
  if (pids.length === 0) {
    broadcast(JSON.stringify({ connected: false, reason: "DuckStation not found" }));
    return false;
  }

  for (const pid of pids) {
    const m = openSharedMemory(pid);
    if (m) {
      mapping = m;
      broadcast(JSON.stringify({ connected: true, pid }));
      return true;
    }
  }

  broadcast(
    JSON.stringify({
      connected: false,
      reason: `DuckStation found (PIDs: ${pids.join(", ")}) but shared memory not available. Enable Settings > Advanced > Export Shared Memory in DuckStation.`,
    }),
  );
  return false;
}

// ── Diagnostic logging ────────────────────────────────────────────

function slotSummary(slot) {
  if (slot.cardId === 0 && slot.status === 0) return null;
  return `${String(slot.cardId)}:0x${slot.status.toString(16).padStart(2, "0")}`;
}

function slotsSummary(slots) {
  const parts = slots.map(slotSummary).filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "(empty)";
}

function logStateChange(state) {
  const prev = lastLogState;
  lastLogState = state;

  const parts = [];

  if (!prev || prev.duelPhase !== state.duelPhase) {
    parts.push(`phase=0x${state.duelPhase.toString(16).padStart(2, "0")}`);
  }
  if (!prev || prev.turnIndicator !== state.turnIndicator) {
    parts.push(`turn=${state.turnIndicator === 0 ? "player" : "opponent"}`);
  }

  const prevHand = prev ? slotsSummary(prev.hand) : null;
  const currHand = slotsSummary(state.hand);
  if (prevHand !== currHand) {
    parts.push(`hand=[${currHand}]`);
  }

  const prevField = prev ? slotsSummary(prev.field) : null;
  const currField = slotsSummary(state.field);
  if (prevField !== currField) {
    parts.push(`field=[${currField}]`);
  }

  if (!prev || prev.lp[0] !== state.lp[0] || prev.lp[1] !== state.lp[1]) {
    parts.push(`lp=${state.lp[0]}/${state.lp[1]}`);
  }
  if (!prev || prev.fusions !== state.fusions) {
    parts.push(`fusions=${state.fusions}`);
  }

  if (parts.length > 0) {
    console.log(`[state2] ${parts.join("  ")}`);
  }
}

// ── Poll loop ──────────────────────────────────────────────────────
async function poll() {
  // Try to connect if not connected
  if (!mapping) {
    await tryConnect();
  }

  if (mapping) {
    try {
      const state = readGameState(mapping.view);
      const json = JSON.stringify({ connected: true, pid: mapping.pid, ...state });

      // Only broadcast on change
      if (json !== lastJson) {
        logStateChange(state);
        lastJson = json;
        broadcast(json);
      }
    } catch (err) {
      console.error("Error reading game state:", err.message);
      // DuckStation may have closed — clean up and retry next poll
      try {
        closeSharedMemory(mapping);
      } catch {
        /* ignore */
      }
      mapping = null;
      lastJson = "";
      broadcast(JSON.stringify({ connected: false, reason: "DuckStation disconnected" }));
    }
  }

  setTimeout(poll, POLL_MS);
}

// ── Start ──────────────────────────────────────────────────────────
console.log("YFM3 Emulator Bridge");
console.log(`Poll interval: ${POLL_MS}ms`);
console.log("Searching for DuckStation...");
void poll();
