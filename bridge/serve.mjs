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
import { WebSocket, WebSocketServer } from "ws";
import {
  closeSharedMemory,
  DEFAULT_PROFILE,
  findDuckStationPids,
  isGameLoaded,
  openSharedMemory,
  peekU8,
  peekU16,
  readCollection,
  readDeckDefinition,
  readGameSerial,
  readGameState,
  readModFingerprint,
  readRawHex,
  readShuffledDeck,
  recordByteAddresses,
  validateProfile,
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
let lastConnectStatus = ""; // deduplicates tryConnect console logs

// ── Offset profile resolution ─────────────────────────────────────
// undefined = not yet attempted, object = resolved, null = unknown version
let resolvedProfile;

/**
 * Resolve the offset profile for the current game binary.
 *
 * Strategy:
 * 1. Read disc serial from RAM (e.g. "SLUS_014.11", "SLES_039.48")
 * 2. NTSC-U serials (SLUS) → use DEFAULT_PROFILE
 * 3. Unknown serials → validate DEFAULT_PROFILE via LP sanity check
 * 4. If validation fails → null profile (graceful degradation)
 */
function resolveOffsetProfile(view) {
  if (resolvedProfile !== undefined) return resolvedProfile;

  const serial = readGameSerial(view);

  // NTSC-U disc (SLUS) — known to use default offsets
  if (serial && serial.startsWith("SLUS")) {
    resolvedProfile = DEFAULT_PROFILE;
    console.log(`Game serial: ${serial} → offset profile: ${DEFAULT_PROFILE.label}`);
    return resolvedProfile;
  }

  // Other disc (PAL, NTSC-J, modded) — try default offsets with LP validation
  if (validateProfile(view, DEFAULT_PROFILE)) {
    resolvedProfile = DEFAULT_PROFILE;
    console.log(
      `Game serial: ${serial ?? "unknown"} → offset profile: ${DEFAULT_PROFILE.label} (LP validated)`,
    );
    return resolvedProfile;
  }

  // Default offsets read garbage — unsupported binary
  resolvedProfile = null;
  console.warn(
    `Game serial: ${serial ?? "unknown"} — no offset profile available. ` +
      "Duel phase, LP, terrain, and fusions will be unavailable.",
  );
  return null;
}

/** Reset profile resolution (e.g. after DuckStation restart or game change). */
function resetProfile() {
  resolvedProfile = undefined;
  hadHandCardsLastPoll = false;
  tryScanOnDuelStart._candidates = null;
}

// ── Duel-start scanning for unknown versions ─────────────────────
let hadHandCardsLastPoll = false;

/**
 * When the profile is null (unknown version) and a duel starts,
 * scan RAM for LP/phase patterns to discover the correct offsets.
 * The scan is triggered at duel start (hand cards appear after being
 * absent) because LP is guaranteed to be at its starting value.
 */
function tryScanOnDuelStart(view, state) {
  if (resolvedProfile !== null) return;

  // Count active hand cards (status !== 0, valid card ID)
  const activeCards = state.hand.filter(
    (s) => s.cardId > 0 && s.cardId < 723 && s.status !== 0,
  ).length;
  const handFull = activeCards === 5;

  // Phase 1: record candidate addresses when hand first reaches 5 cards.
  if (handFull && !hadHandCardsLastPoll && !tryScanOnDuelStart._candidates) {
    console.log("Duel detected (5 cards) — starting survival scan...");
    tryScanOnDuelStart._candidates = recordByteAddresses(view, 0x04);
    tryScanOnDuelStart._pollCount = 0;
    console.log(`  Recorded ${tryScanOnDuelStart._candidates.length} initial candidates`);
  }
  hadHandCardsLastPoll = handFull;

  // Phase 2: survival filter — on every poll:
  // 1. Discard candidates whose value left valid range (0x01–0x0D)
  // 2. Track whether each candidate has changed (constants are not variables)
  if (!tryScanOnDuelStart._candidates) return;
  if (!tryScanOnDuelStart._changed) tryScanOnDuelStart._changed = new Set();

  tryScanOnDuelStart._pollCount++;
  tryScanOnDuelStart._candidates = tryScanOnDuelStart._candidates.filter((off) => {
    const v = peekU8(view, off);
    if (v < 0x01 || v > 0x0d) return false; // out of valid range → discard
    if (v !== 0x04) tryScanOnDuelStart._changed.add(off); // value changed from initial
    return true;
  });

  // Log progress every 50 polls (~2.5s)
  if (tryScanOnDuelStart._pollCount % 50 === 0) {
    console.log(
      `  Scan poll ${tryScanOnDuelStart._pollCount}: ${tryScanOnDuelStart._candidates.length} candidates surviving`,
    );
  }

  // Wait 200 polls (~10s) for reliable filtering
  if (tryScanOnDuelStart._pollCount < 200) return;

  // Only keep candidates that actually changed value (discard constants)
  const changedSet = tryScanOnDuelStart._changed;
  const allInRange = tryScanOnDuelStart._candidates.length;
  const survivors = tryScanOnDuelStart._candidates.filter((off) => changedSet.has(off));
  tryScanOnDuelStart._candidates = null;
  tryScanOnDuelStart._changed = null;
  console.log(
    `Phase scan complete: ${survivors.length} variable survivors (${allInRange} stayed in range, ${tryScanOnDuelStart._pollCount} polls)`,
  );
  for (const off of survivors) {
    console.log(`  0x${off.toString(16)} = 0x${peekU8(view, off).toString(16).padStart(2, "0")}`);
  }

  if (survivors.length === 0 || survivors.length > 10) {
    console.warn(`Scan inconclusive (${survivors.length} survivors). Will retry next duel.`);
    return;
  }

  // Pick the best: check for turn indicator correlation
  const turnDist = 0x09b23a - 0x09b1d5; // 0x65
  const withTurn = survivors.filter((off) => {
    const turn = peekU8(view, off - turnDist);
    return turn === 0x00 || turn === 0x01;
  });
  const phaseAddr = withTurn.length > 0 ? withTurn[0] : survivors[0];
  console.log(`Phase byte: 0x${phaseAddr.toString(16)}`);

  // Find LP: two equal uint16 ≤ 9999 spaced 0x20 apart
  let lpP1 = null;
  for (let off = 0x080000; off <= 0x120000 - 0x20; off += 2) {
    const v1 = peekU16(view, off);
    const v2 = peekU16(view, off + 0x20);
    if (v1 === v2 && v1 > 0 && v1 <= 9999) {
      lpP1 = off;
      break;
    }
  }

  const profile = {
    label: "PAL-discovered",
    duelPhase: phaseAddr,
    turnIndicator: phaseAddr - turnDist,
    sceneId: phaseAddr + (0x09b26c - 0x09b23a),
    terrain: phaseAddr + (0x09b364 - 0x09b23a),
    duelistId: phaseAddr + (0x09b361 - 0x09b23a),
    lpP1: lpP1 ?? 0,
    lpP2: lpP1 ? lpP1 + 0x20 : 0,
    fusionCounter: lpP1 ? lpP1 - (0x0ea004 - 0x0e9ff8) : 0,
  };

  resolvedProfile = profile;
  console.log("Offset profile discovered!");
  console.log(`  duelPhase: 0x${profile.duelPhase.toString(16)}`);
  console.log(`  turnIndicator: 0x${profile.turnIndicator.toString(16)}`);
  console.log(`  sceneId: 0x${profile.sceneId.toString(16)}`);
  console.log(`  lpP1: 0x${profile.lpP1.toString(16)}`);
  console.log(`  lpP2: 0x${profile.lpP2.toString(16)}`);
  console.log(`  fusionCounter: 0x${profile.fusionCounter.toString(16)}`);
  console.log(`  terrain: 0x${profile.terrain.toString(16)}`);
  console.log(`  duelistId: 0x${profile.duelistId.toString(16)}`);
}

// ── Port guard: detect if another bridge (or other process) holds the port ──
await checkPortAvailable(PORT);

async function checkPortAvailable(port) {
  const result = await probePort(port);
  if (result === "free") return; // port available, carry on

  if (result === "bridge") {
    console.error("");
    console.error("  ╔══════════════════════════════════════════════╗");
    console.error("  ║  Another YFM bridge is already running!     ║");
    console.error("  ╚══════════════════════════════════════════════╝");
    console.error("");
    console.error(`  Port ${port} is in use by another bridge instance.`);
    console.error("  Close the other bridge window first, then try again.");
    console.error("");
  } else {
    // port occupied by a non-bridge process
    console.error("");
    console.error("  ╔══════════════════════════════════════════════╗");
    console.error(`  ║  Port ${port} is already in use!              ║`);
    console.error("  ╚══════════════════════════════════════════════╝");
    console.error("");
    console.error(`  Another program is using port ${port}.`);
    console.error("  Close it or set BRIDGE_PORT to a different port.");
    console.error("");
  }
  process.exit(1);
}

/**
 * Probe the target port to determine its state.
 * Returns "free" | "bridge" | "other".
 *
 * - Tries a WebSocket connection to localhost:port.
 * - If the connection fails (ECONNREFUSED) → "free".
 * - If it connects and receives JSON with a `version` field → "bridge".
 * - If it connects via WebSocket but no bridge message → "bridge"
 *   (a WebSocket handshake on the bridge port is strong enough evidence).
 * - If the TCP connect succeeds but the WebSocket upgrade is rejected
 *   (non-WS server) → "other".
 */
function probePort(port) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      ws.terminate();
      resolve(value);
    };

    const timer = setTimeout(() => {
      // Connected via WebSocket but got no message — still likely a bridge
      // that hasn't connected to DuckStation yet.
      done("bridge");
    }, 1500);

    ws.on("message", (data) => {
      clearTimeout(timer);
      try {
        const msg = JSON.parse(data.toString());
        done(msg.version ? "bridge" : "other");
      } catch {
        done("other");
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timer);
      // WebSocket upgrade rejected (HTTP server, etc.) → port taken by other
      if (err?.message?.includes("Unexpected server response")) {
        done("other");
      } else {
        done("free"); // ECONNREFUSED → port is available
      }
    });
  });
}

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
      if (!isGameLoaded(mapping.view)) {
        ws.send(
          JSON.stringify({
            connected: true,
            status: "waiting_for_game",
            version: VERSION,
            pid: mapping.pid,
          }),
        );
      } else {
        const profile = resolveOffsetProfile(mapping.view);
        const state = readGameState(mapping.view, profile);
        const json = JSON.stringify({
          connected: true,
          status: "ready",
          version: VERSION,
          pid: mapping.pid,
          modFingerprint: readModFingerprint(mapping.view),
          gameSerial: readGameSerial(mapping.view),
          ...state,
        });
        ws.send(json);
        if (json !== lastJson) {
          logStateChange(state);
          lastJson = json;
        }
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
    if (lastConnectStatus !== "no_emulator") {
      lastConnectStatus = "no_emulator";
      console.log("DuckStation not found. Waiting...");
    }
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
    const m = openSharedMemory(pid, { quiet: true });
    if (m) {
      mapping = m;
      lastConnectStatus = "";
      // Don't broadcast "ready" yet — the poll loop will read the actual
      // game state and broadcast either "ready" or "waiting_for_game".
      return true;
    }
  }

  if (lastConnectStatus !== "no_shared_memory") {
    lastConnectStatus = "no_shared_memory";
    console.log(
      `DuckStation found (PIDs: ${pids.join(", ")}) but shared memory not available. Waiting...`,
    );
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
  lastConnectStatus = "";
  resetProfile();
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
    resetProfile();
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

  if (state.duelPhase != null && (!prev || prev.duelPhase !== state.duelPhase)) {
    parts.push(`phase=0x${state.duelPhase.toString(16).padStart(2, "0")}`);
  }
  if (state.turnIndicator != null && (!prev || prev.turnIndicator !== state.turnIndicator)) {
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

  if (
    state.lp != null &&
    (!prev || !prev.lp || prev.lp[0] !== state.lp[0] || prev.lp[1] !== state.lp[1])
  ) {
    parts.push(`lp=${state.lp[0]}/${state.lp[1]}`);
  }
  if (state.fusions != null && (!prev || prev.fusions !== state.fusions)) {
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
  // Scene ID change (only when available)
  if (sceneId != null && sceneId !== lastSceneId) {
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
      const gameLoaded = isGameLoaded(mapping.view);

      if (!gameLoaded) {
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
            resetProfile();
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
          resetProfile();
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

        let profile = resolveOffsetProfile(mapping.view);
        let state = readGameState(mapping.view, profile);

        // On unknown versions, try to discover offsets at duel start
        if (profile === null) {
          tryScanOnDuelStart(mapping.view, state);
          if (resolvedProfile !== null) {
            profile = resolvedProfile;
            state = readGameState(mapping.view, profile);
          }
        }

        const json = JSON.stringify({
          connected: true,
          status: "ready",
          version: VERSION,
          pid: mapping.pid,
          modFingerprint: readModFingerprint(mapping.view),
          gameSerial: readGameSerial(mapping.view),
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
      resetProfile();
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
