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

import { execSync, spawn } from "node:child_process";
import { createWriteStream, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import {
  closeSharedMemory,
  findDuckStationPids,
  openSharedMemory,
  readCollection,
  readDeckDefinition,
  readGameState,
  readRawHex,
  readShuffledDeck,
} from "./memory.mjs";
import { ensureSharedMemoryEnabled } from "./settings.mjs";

// ── File logging (so Claude can read bridge/bridge.log) ─────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8")).version;
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
const POLL_MS = Number(process.env.BRIDGE_POLL_MS || 50);

// ── Collection/deck log file ──────────────────────────────────────
const COLL_LOG_PATH = join(__dirname, "collection.log");
const collStream = createWriteStream(COLL_LOG_PATH, { flags: "w" });

function collLog(msg) {
  const line = `${timestamp()} ${msg}\n`;
  collStream.write(line);
  logStream.write(`${timestamp()} [collection] ${msg}\n`);
}

// ── State ──────────────────────────────────────────────────────────
let mapping = null; // { handle, view, pid }
let lastJson = ""; // deduplicate broadcasts
let lastLogState = null; // previous state for change-based logging
let lastSceneId = null;
let lastCollectionKey = ""; // stringified collection for change detection
let lastDeckKey = ""; // stringified deck for change detection
let consecutiveZeroReads = 0;
const STALE_ZERO_THRESHOLD = 60; // 60 × 50ms = 3 seconds of all-zero reads
let hadNonZeroData = false; // true once we've seen real game data
let reopenedAfterStale = false; // prevents repeated reopen attempts

// ── WebSocket server ───────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log(`Bridge WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log(`Client connected (${wss.clients.size} total)`);

  // Always send fresh state on connect — never rely solely on cache.
  // Handles: bridge restart, app reconnect, app started late.
  if (mapping) {
    try {
      const state = readGameState(mapping.view);
      const isAllZero = state.sceneId === 0 && state.lp[0] === 0 && state.lp[1] === 0;
      const json = isAllZero
        ? JSON.stringify({
            connected: true,
            status: "waiting_for_game",
            version: VERSION,
            pid: mapping.pid,
          })
        : JSON.stringify({
            connected: true,
            status: "ready",
            version: VERSION,
            pid: mapping.pid,
            ...state,
          });
      ws.send(json);
      if (json !== lastJson) {
        if (!isAllZero) logStateChange(state);
        lastJson = json;
      }
    } catch {
      ws.send(
        JSON.stringify({
          connected: false,
          status: "error",
          version: VERSION,
          reason: "Failed to read game state",
        }),
      );
    }
  } else if (lastJson) {
    ws.send(lastJson);
  }

  // Handle "scan" command from client to force reconnect
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "scan") {
        console.log("Received scan/reconnect request from client");
        void forceReconnect();
      } else if (msg.type === "restart_duckstation") {
        console.log("Received restart DuckStation request from client");
        void restartDuckStation();
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
    broadcast(
      JSON.stringify({
        connected: false,
        status: "no_emulator",
        version: VERSION,
        reason: "DuckStation not found",
      }),
    );
    return false;
  }

  for (const pid of pids) {
    const m = openSharedMemory(pid);
    if (m) {
      mapping = m;
      // Don't broadcast "ready" yet — the poll loop will read the actual
      // game state and broadcast either "ready" or "waiting_for_game".
      return true;
    }
  }

  broadcast(
    JSON.stringify({
      connected: false,
      status: "no_shared_memory",
      version: VERSION,
      settingsPatched: settingsPatchResult.enabled,
      reason: settingsPatchResult.enabled
        ? "Shared memory export is enabled in DuckStation settings but not active — restart DuckStation to apply."
        : `DuckStation found (PIDs: ${pids.join(", ")}) but shared memory not available. Enable Settings > Advanced > Export Shared Memory in DuckStation.`,
    }),
  );
  return false;
}

/** Force-close current mapping and reconnect (used by manual reconnect button). */
async function forceReconnect() {
  if (mapping) {
    try {
      closeSharedMemory(mapping);
    } catch {
      /* ignore */
    }
    mapping = null;
  }
  lastJson = "";
  consecutiveZeroReads = 0;
  hadNonZeroData = false;
  reopenedAfterStale = false;
  await tryConnect();
}

/** Restart DuckStation: kill gracefully, wait for exit, relaunch. */
async function restartDuckStation() {
  const pids = await findDuckStationPids();
  if (pids.length === 0) return;
  const pid = mapping?.pid ?? pids[0];

  // Get executable path before killing
  let exePath;
  try {
    const out = execSync(`wmic process where "ProcessId=${pid}" get ExecutablePath /format:value`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    const eq = out.indexOf("=");
    if (eq >= 0) exePath = out.substring(eq + 1).trim();
  } catch {
    /* ignore */
  }
  if (!exePath) {
    console.error("restartDuckStation: could not determine executable path");
    return;
  }

  console.log(`Restarting DuckStation (PID ${pid}): ${exePath}`);

  // Close shared memory mapping
  if (mapping) {
    try {
      closeSharedMemory(mapping);
    } catch {
      /* ignore */
    }
    mapping = null;
    lastJson = "";
    hadNonZeroData = false;
    reopenedAfterStale = false;
    consecutiveZeroReads = 0;
  }

  // Graceful kill (sends WM_CLOSE), then wait up to 10s
  try {
    execSync(`taskkill /PID ${pid}`, { stdio: ["pipe", "pipe", "ignore"], timeout: 5000 });
  } catch {
    /* taskkill may return non-zero even on success */
  }
  for (let i = 0; i < 40; i++) {
    if (!(await findDuckStationPids()).includes(pid)) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  try {
    spawn(exePath, [], { detached: true, stdio: "ignore" }).unref();
  } catch (err) {
    console.error(`restartDuckStation: failed to launch: ${err.message}`);
  }
}

// ── Diagnostic logging ────────────────────────────────────────────

function slotSummary(slot) {
  if (slot.cardId === 0 && slot.status === 0) return null;
  return `${String(slot.cardId)}(${slot.atk}/${slot.def}):0x${slot.status.toString(16).padStart(2, "0")}`;
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
    console.log(`[state] ${parts.join("  ")}`);
  }
}

// ── Collection & deck polling ─────────────────────────────────────

function collectionSummary(coll) {
  let unique = 0;
  let total = 0;
  for (const count of coll) {
    if (count > 0) {
      unique++;
      total += count;
    }
  }
  return { unique, total };
}

function logCollectionDeckState(view, sceneId) {
  // Scene ID change
  if (sceneId !== lastSceneId) {
    const prev = lastSceneId;
    lastSceneId = sceneId;
    collLog(
      `SCENE 0x${sceneId.toString(16).padStart(4, "0")}${prev !== null ? ` (was 0x${prev.toString(16).padStart(4, "0")})` : ""}`,
    );
  }

  // Collection
  const coll = readCollection(view);
  const collKey = coll.join(",");
  if (collKey !== lastCollectionKey) {
    const prevColl = lastCollectionKey ? lastCollectionKey.split(",").map(Number) : null;
    lastCollectionKey = collKey;
    const { unique, total } = collectionSummary(coll);

    if (prevColl) {
      // Log diff: which cards changed
      const diffs = [];
      for (let i = 0; i < coll.length; i++) {
        if (coll[i] !== prevColl[i]) {
          diffs.push(`card${i + 1}: ${prevColl[i]}→${coll[i]}`);
        }
      }
      collLog(`COLLECTION CHANGED (${unique} unique, ${total} total): ${diffs.join(", ")}`);
    } else {
      collLog(`COLLECTION SNAPSHOT (${unique} unique, ${total} total)`);
      // Log full collection on first read (cards that have count > 0)
      const owned = [];
      for (let i = 0; i < coll.length; i++) {
        if (coll[i] > 0) owned.push(`${i + 1}×${coll[i]}`);
      }
      collLog(`  OWNED: ${owned.join(" ")}`);
    }
  }

  // Deck definition
  const deck = readDeckDefinition(view);
  const deckKey = deck.join(",");
  if (deckKey !== lastDeckKey) {
    lastDeckKey = deckKey;
    const nonZero = deck.filter((id) => id > 0);
    collLog(`DECK [${nonZero.length} cards]: ${nonZero.join(" ")}`);
  }

  // Shuffled deck (log when it appears/changes, useful during duels)
  const shuffled = readShuffledDeck(view);
  const shuffledNonZero = shuffled.filter((id) => id > 0);
  if (shuffledNonZero.length > 0) {
    // Only log once per change — use a static var
    const shuffledKey = shuffled.join(",");
    if (shuffledKey !== logCollectionDeckState._lastShuffledKey) {
      logCollectionDeckState._lastShuffledKey = shuffledKey;
      collLog(`SHUFFLED DECK [${shuffledNonZero.length} cards]: ${shuffledNonZero.join(" ")}`);
    }
  }

  // Dump a small region around collection for exploration (first time only)
  if (!logCollectionDeckState._dumpedContext) {
    logCollectionDeckState._dumpedContext = true;
    // 16 bytes before deck def and 16 bytes after collection end
    collLog(`RAW before deck (0x1D01F0): ${readRawHex(view, 0x1d01f0, 16)}`);
    collLog(`RAW after collection (0x1D0522): ${readRawHex(view, 0x1d0522, 32)}`);
  }
}
logCollectionDeckState._lastShuffledKey = "";
logCollectionDeckState._dumpedContext = false;

// ── Poll loop ──────────────────────────────────────────────────────
async function poll() {
  // Try to connect if not connected
  if (!mapping) {
    await tryConnect();
  }

  if (mapping) {
    try {
      const state = readGameState(mapping.view);
      const isAllZero = state.sceneId === 0 && state.lp[0] === 0 && state.lp[1] === 0;

      if (isAllZero) {
        // ── Game not loaded or shared memory stale ─────────────────
        consecutiveZeroReads++;

        if (consecutiveZeroReads >= STALE_ZERO_THRESHOLD && hadNonZeroData && !reopenedAfterStale) {
          // Had real data before → might be save-state load or emulator restart.
          // Check if the PID is still alive to decide.
          const pids = await findDuckStationPids();

          if (!pids.includes(mapping.pid)) {
            // PID dead → DuckStation was restarted. Close and reconnect.
            console.warn("DuckStation PID gone. Reconnecting...");
            try {
              closeSharedMemory(mapping);
            } catch {
              /* ignore */
            }
            mapping = null;
            consecutiveZeroReads = 0;
            hadNonZeroData = false;
            reopenedAfterStale = false;
            lastJson = "";
            // Will call tryConnect() next cycle
            setTimeout(poll, POLL_MS);
            return;
          }

          // PID alive → try reopening shared memory once (save-state case:
          // DuckStation may have recreated the memory region).
          console.log("Reopening shared memory (possible save-state load)...");
          const oldPid = mapping.pid;
          try {
            closeSharedMemory(mapping);
          } catch {
            /* ignore */
          }
          const m = openSharedMemory(oldPid);
          mapping = m; // may be null if reopen failed
          consecutiveZeroReads = 0;
          reopenedAfterStale = true; // don't reopen again until we see real data
        }

        // Broadcast "waiting_for_game" — no game data, just status.
        if (mapping) {
          const json = JSON.stringify({
            connected: true,
            status: "waiting_for_game",
            version: VERSION,
            pid: mapping.pid,
          });
          if (json !== lastJson) {
            console.log("Game not detected in shared memory. Waiting...");
            lastJson = json;
            broadcast(json);
          }
        }
      } else {
        // ── Real game data ─────────────────────────────────────────
        consecutiveZeroReads = 0;
        hadNonZeroData = true;
        reopenedAfterStale = false;

        const json = JSON.stringify({
          connected: true,
          status: "ready",
          version: VERSION,
          pid: mapping.pid,
          ...state,
        });

        if (json !== lastJson) {
          logStateChange(state);
          lastJson = json;
          broadcast(json);
        }

        // Collection & deck tracking (separate from broadcast)
        logCollectionDeckState(mapping.view, state.sceneId);
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
      hadNonZeroData = false;
      reopenedAfterStale = false;
      broadcast(
        JSON.stringify({
          connected: false,
          status: "error",
          version: VERSION,
          reason: "DuckStation disconnected",
        }),
      );
    }
  }

  setTimeout(poll, POLL_MS);
}

// ── DuckStation settings auto-patch ─────────────────────────────────
const settingsPatchResult = ensureSharedMemoryEnabled();
if (settingsPatchResult.patched) {
  console.log(
    "Enabled shared memory export in DuckStation settings. Restart DuckStation for the change to take effect.",
  );
} else if (settingsPatchResult.error) {
  console.warn(`Could not check DuckStation settings: ${settingsPatchResult.error}`);
}

// ── Start ──────────────────────────────────────────────────────────
console.log("YFM3 Emulator Bridge");
console.log(`Poll interval: ${POLL_MS}ms`);
console.log("Searching for DuckStation...");
void poll();
