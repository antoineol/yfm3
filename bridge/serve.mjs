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

import { WebSocketServer } from "ws";
import {
  closeSharedMemory,
  findDuckStationPids,
  openSharedMemory,
  readGameState,
} from "./memory.mjs";

const PORT = Number(process.env.BRIDGE_PORT || 3333);
const POLL_MS = Number(process.env.BRIDGE_POLL_MS || 200);

// ── State ──────────────────────────────────────────────────────────
let mapping = null; // { handle, view, pid }
let lastJson = ""; // deduplicate broadcasts

// ── WebSocket server ───────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log(`Bridge WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log(`Client connected (${wss.clients.size} total)`);

  // Send current state immediately on connect
  if (lastJson) {
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
