/**
 * Bridge server: reads DuckStation shared memory and broadcasts game state
 * over WebSocket.
 *
 * Usage (from Windows):
 *   cd bridge && bun serve.ts
 *
 * Or as compiled standalone:
 *   bridge.exe
 *
 * Connects to ws://localhost:3333
 */

import { execSync, spawn } from "node:child_process";
import { createWriteStream, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { awaitArtworkExtraction } from "./artwork-extraction.ts";
import { createHandSlotProbe, type HandSlotProbe } from "./debug/hand-slot-probe.ts";
import { createOpponentProbe, type OpponentProbe } from "./debug/opponent-probe.ts";
import { createPalProbe, type PalProbe } from "./debug/pal-address-probe.ts";
import { acquireGameData, artworkCacheKey, type GameData } from "./game-data.ts";
import { writeGameDataCache } from "./gamedata-cache.ts";
import type { Hwnd } from "./input.ts";
import {
  areBindingsLoaded,
  findMainWindowHandle,
  holdButton,
  isValidButton,
  isValidSlot,
  loadBindings,
  loadState,
  sendCloseGameWithoutSaving,
  tapButton,
} from "./input.ts";
import {
  getDropX15PatchStatus,
  isIsoLockedError,
  isPoolType,
  listIsoBackups,
  patchDropX15,
  patchDuelistPool,
  reReadDuelists,
  restoreIsoBackup,
} from "./iso-edit.ts";
import { probeLockedIsos } from "./iso-lock-probe.ts";
import {
  type ActiveSave,
  buildActiveSave,
  findActiveSave,
  listBackups,
  readSave,
  restoreBackup,
  writeSaveWithBackup,
} from "./memcards.ts";
import type { GameState, OffsetProfile, SharedMemoryMapping } from "./memory.ts";
import {
  closeSharedMemory,
  DEFAULT_PROFILE,
  findDuckStationPids,
  isGameLoaded,
  openSharedMemory,
  PAL_PROFILE,
  readCardStats,
  readCollection,
  readDeckDefinition,
  readFieldBonusTable,
  readGameSerial,
  readGameState,
  readModFingerprint,
  readRawHex,
  readShuffledDeck,
  refreshView,
  scanFieldBonusTable,
  validateProfile,
} from "./memory.ts";
import { ensureLoadStateHotkeys, ensureSharedMemoryEnabled, getExePathForPid } from "./settings.ts";

// ── File logging (so Claude can read bridge/bridge.log) ─────────
// In compiled Bun standalone, import.meta.dir is a virtual path (e.g. B:\~BUN\root\).
// Fall back to the actual exe directory so we can find package.json, logs, etc.
const __dirname = (() => {
  const devDir = import.meta.dir;
  if (existsSync(join(devDir, "package.json"))) return devDir;
  return dirname(process.execPath);
})();
const VERSION: string = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8")).version;
const LOG_PATH = join(__dirname, "bridge.log");
const logStream = createWriteStream(LOG_PATH, { flags: "w" });

function timestamp(): string {
  return new Date().toISOString();
}

for (const level of ["log", "info", "warn", "error", "debug"] as const) {
  const orig = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    orig(...args);
    logStream.write(`${timestamp()} [${level}] ${args.join(" ")}\n`);
  };
}

const PORT = Number(process.env.BRIDGE_PORT || 3333); // temp: ghost on 3333
const POLL_MS = Number(process.env.BRIDGE_POLL_MS || 50);

// ── Collection/deck log file ──────────────────────────────────────
const COLL_LOG_PATH = join(__dirname, "collection.log");
const collStream = createWriteStream(COLL_LOG_PATH, { flags: "w" });

function collLog(msg: string): void {
  const line = `${timestamp()} ${msg}\n`;
  collStream.write(line);
  logStream.write(`${timestamp()} [collection] ${msg}\n`);
}

// ── Background update staging ─────────────────────────────────────
let updateStaged = false;
let stagingInProgress = false;

function stageUpdateInBackground(): void {
  if (stagingInProgress || updateStaged) return;

  const scriptPath = join(__dirname, "update.ps1");
  if (!existsSync(scriptPath)) {
    broadcast(JSON.stringify({ type: "stage_noop" }));
    return;
  }

  stagingInProgress = true;
  console.log("Checking for updates in background…");
  const proc = spawn(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, __dirname, "-DownloadOnly"],
    { stdio: ["ignore", "pipe", "ignore"] },
  );

  let stdout = "";
  let settled = false;
  proc.stdout?.on("data", (chunk: Buffer) => {
    stdout += chunk.toString();
  });

  function settle(result: "update_staged" | "stage_noop", version?: string): void {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    stagingInProgress = false;
    if (result === "update_staged") {
      updateStaged = true;
      console.log(`Update staged: v${version} ready to install`);
    }
    broadcast(JSON.stringify({ type: result }));
  }

  // Kill the process if it takes longer than 30s (network hang, etc.)
  const timeout = setTimeout(() => {
    if (settled) return;
    console.warn("[update] staging timed out after 30s — aborting");
    proc.kill();
    settle("stage_noop");
  }, 30_000);

  proc.on("error", () => settle("stage_noop"));

  proc.on("exit", (code) => {
    if (stdout.trim()) console.log(`[update] ${stdout.trim()}`);
    const pendingPkgPath = join(__dirname, "runtime.pending", "package.json");
    if (code === 0 && existsSync(pendingPkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pendingPkgPath, "utf-8"));
        settle("update_staged", pkg.version);
      } catch {
        settle("stage_noop");
      }
    } else {
      settle("stage_noop");
    }
  });
}

// ── State ──────────────────────────────────────────────────────────
let mapping: SharedMemoryMapping | null = null;
let lastJson = ""; // deduplicate broadcasts
let lastLogState: GameState | null = null; // previous state for change-based logging
let lastSceneId: number | null = null;
let lastCollectionKey = ""; // stringified collection for change detection
let lastDeckKey = ""; // stringified deck for change detection
let consecutiveZeroReads = 0;
const STALE_ZERO_THRESHOLD = 60; // 60 × 50ms = 3 seconds of all-zero reads
const VIEW_REFRESH_INTERVAL = 100; // refresh DataView every 100 polls (5s) when game never detected
let hadNonZeroData = false; // true once we've seen real game data
let reopenedAfterStale = false; // prevents repeated reopen attempts
let lastConnectStatus = ""; // deduplicates tryConnect console logs
let pidCheckCounter = 0;
const PID_CHECK_INTERVAL = 40; // check PID every 40 polls (40 × 50ms = 2 seconds)

// ── Input control state ─────────────────────────────────────────────
let dsHwnd: Hwnd | null = null; // DuckStation main window handle
let loadStateHotkeysReady = false; // set once settings.ini is patched

// ── Game data (fusion/equip tables from disc image) ───────────────
let currentGameData: GameData | null = null;
let gameDataFingerprint: string | null = null; // mod fingerprint we last attempted acquisition for
let gameDataRetryAt: number | null = null; // timestamp for next retry (null = no retry scheduled)
let gameDataRetries = 0;
let waitingForSerialLogged = false; // avoid spamming the defer log on every poll
/**
 * Set when `acquireGameData` returns `ambiguous` — multiple disc images in
 * DuckStation's games dir share the running game's EXE hash and we can't
 * tell which one DuckStation actually has open. Persists until the next
 * successful acquisition or game-loaded transition. ISO-edit endpoints must
 * refuse while this is non-null: writing to a guessed disc would silently
 * corrupt the wrong file.
 */
let ambiguousDiscCandidates: string[] | null = null;
const GAME_DATA_MAX_RETRIES = 3;
const GAME_DATA_RETRY_DELAY_MS = 5000;

function resetGameData(): void {
  currentGameData = null;
  gameDataFingerprint = null;
  gameDataRetryAt = null;
  gameDataRetries = 0;
  waitingForSerialLogged = false;
  ambiguousDiscCandidates = null;
}

function describeDiscAmbiguity(candidates: readonly string[]): string {
  return (
    "Two or more disc images in DuckStation's games folder match this game's EXE — " +
    "the bridge can't tell which one is the active ISO and refuses to guess. " +
    "Move or rename all but one out of DuckStation's scan paths, then reload.\n" +
    candidates.map((p) => `  • ${p}`).join("\n")
  );
}

// Keep the on-disk gamedata cache in sync after an ISO edit. Our patches
// (e.g. WA_MRG.MRG drop pools) don't touch the EXE card-stats the RAM hash
// is computed from, so the next boot would otherwise serve pre-patch tables
// from cache.
function persistGameDataCache(data: GameData): void {
  const artworkDir = join(__dirname, "artwork", artworkCacheKey(data.gameDataHash, data.discPath));
  writeGameDataCache(artworkDir, {
    gameSerial: data.gameSerial,
    cards: data.cards,
    duelists: data.duelists,
    fusionTable: data.fusionTable,
    equipTable: data.equipTable,
    equipBonuses: data.equipBonuses,
    perEquipBonuses: data.perEquipBonuses,
    deckLimits: data.deckLimits,
  });
}

/**
 * Wire-shape of the `gameData` WebSocket message. Kept in sync by hand with
 * `BridgeGameData` in the UI (separate TS project, can't share types). The
 * `satisfies` check below forces every field enumerated here to be provided —
 * if `GameData` gains a field and this shape is updated, the object literal
 * below fails to compile until it's forwarded.
 */
type GameDataWireMessage = {
  type: "gameData";
  cards: GameData["cards"];
  duelists: GameData["duelists"];
  fusionTable: GameData["fusionTable"];
  equipTable: GameData["equipTable"];
  equipBonuses: GameData["equipBonuses"];
  perEquipBonuses: GameData["perEquipBonuses"];
  deckLimits: GameData["deckLimits"];
  fieldBonusTable: GameData["fieldBonusTable"];
  artworkKey: string;
};

function buildGameDataMessage(data: GameData): string {
  const msg: GameDataWireMessage = {
    type: "gameData",
    cards: data.cards,
    duelists: data.duelists,
    fusionTable: data.fusionTable,
    equipTable: data.equipTable,
    equipBonuses: data.equipBonuses,
    perEquipBonuses: data.perEquipBonuses,
    deckLimits: data.deckLimits,
    fieldBonusTable: data.fieldBonusTable,
    artworkKey: artworkCacheKey(data.gameDataHash, data.discPath),
  };
  return JSON.stringify(msg);
}

// ── Offset profile resolution ─────────────────────────────────────
// undefined = not yet attempted, object = resolved, null = unknown version
let resolvedProfile: OffsetProfile | null | undefined;
let lastSerial: string | null = null;

/**
 * Resolve the offset profile for the current game binary.
 * Re-resolves automatically if the game serial changes.
 */
function resolveOffsetProfile(view: DataView): OffsetProfile | null {
  const serial = readGameSerial(view);

  // Re-resolve if the game serial changed (user loaded a different disc/mod)
  if (serial !== lastSerial && lastSerial !== null) {
    console.log(`Game serial changed: ${lastSerial} → ${serial} — re-resolving profile`);
    resolvedProfile = undefined;
  }
  lastSerial = serial;

  if (resolvedProfile !== undefined) return resolvedProfile;

  // NTSC-U disc (SLUS) — known to use default offsets
  if (serial?.startsWith("SLUS")) {
    resolvedProfile = DEFAULT_PROFILE;
    console.log(`Game serial: ${serial} → offset profile: ${DEFAULT_PROFILE.label}`);
    return resolvedProfile;
  }

  // PAL disc (SLES/SCES) — use PAL profile, validate with LP
  if (serial?.startsWith("SLES") || serial?.startsWith("SCES")) {
    if (validateProfile(view, PAL_PROFILE)) {
      resolvedProfile = PAL_PROFILE;
      console.log(`Game serial: ${serial} → offset profile: ${PAL_PROFILE.label} (LP validated)`);
      return resolvedProfile;
    }
    // LP not valid yet (game might still be loading) — use PAL profile anyway
    resolvedProfile = PAL_PROFILE;
    console.log(`Game serial: ${serial} → offset profile: ${PAL_PROFILE.label}`);
    return resolvedProfile;
  }

  // Other disc — try default offsets with LP validation
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
function resetProfile(): void {
  resolvedProfile = undefined;
  lastSerial = null;
}

// ── Port guard: detect if another bridge (or other process) holds the port ──
await checkPortAvailable(PORT);

async function checkPortAvailable(port: number): Promise<void> {
  const result = await probePort(port);
  if (result === "free") return; // port available, carry on

  if (result === "bridge") {
    console.log("Another bridge is running — sending shutdown request…");
    try {
      await shutdownExistingBridge(port);
    } catch {
      console.error("Previous bridge did not shut down. Kill it manually and try again.");
      process.exit(1);
    }
    return;
  }

  // port occupied by a non-bridge process
  console.error("");
  console.error("  ╔══════════════════════════════════════════════╗");
  console.error(`  ║  Port ${port} is already in use!              ║`);
  console.error("  ╚══════════════════════════════════════════════╝");
  console.error("");
  console.error(`  Another program is using port ${port}.`);
  console.error("  Close it or set BRIDGE_PORT to a different port.");
  console.error("");
  process.exit(1);
}

/** Ask an existing bridge to shut down and wait until the port is free. */
function shutdownExistingBridge(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Timed out waiting for previous bridge to shut down"));
    }, 5000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "shutdown" }));
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      // Give the OS a moment to release the port
      setTimeout(resolve, 500);
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      // Connection refused means it already closed — port is free
      resolve();
    };
  });
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
 *   (non-WS server) → "free" (Bun.serve will catch this with a clear error).
 */
function probePort(port: number): Promise<"free" | "bridge" | "other"> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    let settled = false;
    const done = (value: "free" | "bridge" | "other") => {
      if (settled) return;
      settled = true;
      try {
        ws.close();
      } catch {
        /* already closed */
      }
      resolve(value);
    };

    const timer = setTimeout(() => {
      // Connected via WebSocket but got no message — still likely a bridge
      // that hasn't connected to DuckStation yet.
      done("bridge");
    }, 1500);

    ws.onmessage = (event) => {
      clearTimeout(timer);
      try {
        const msg = JSON.parse(String(event.data));
        done(msg.version ? "bridge" : "other");
      } catch {
        done("other");
      }
    };

    ws.onerror = () => {
      clearTimeout(timer);
      done("free"); // ECONNREFUSED or upgrade failed → port available
    };
  });
}

// ── WebSocket server (Bun built-in) ─────────────────────────────

type BridgeWebSocket = Bun.ServerWebSocket;
const clients = new Set<BridgeWebSocket>();

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function serveArtwork(pathname: string): Promise<Response> {
  // URL shape: /artwork/{artworkKey}/{nnn}.png. The artworkKey scopes the
  // browser HTTP cache per-mod — without it, swapping ROMs returns the
  // previous mod's PNG from cache because the URL would be identical.
  const match = /^\/artwork\/([^/]+)\/(\d{3}\.png)$/.exec(pathname);
  if (!match || !currentGameData) {
    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  }
  const requestedKey = match[1] as string;
  const filename = match[2] as string;
  const dirKey = artworkCacheKey(currentGameData.gameDataHash, currentGameData.discPath);
  if (requestedKey !== dirKey) {
    // Stale URL from a previous mod — refuse rather than serve the wrong art.
    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  }
  const filePath = join(__dirname, "artwork", dirKey, filename);
  // Extraction runs in the background after gameData broadcasts (see
  // artwork-extraction.ts). If the caller races ahead of the writer, wait
  // for that batch to finish rather than flashing a 404.
  if (!existsSync(filePath)) {
    const pending = awaitArtworkExtraction(dirKey);
    if (pending) {
      try {
        await pending;
      } catch {
        // extraction failed — fall through to the read attempt and return 404
      }
    }
  }
  try {
    const data = readFileSync(filePath);
    return new Response(data, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  }
}

// ── Save editor HTTP API (/api/active-save/*) ──────────────────
//
// Scoped to the running game: the bridge already knows the active serial
// from RAM, and the active game's card table is already being broadcast over
// the WebSocket. These routes only deal with the on-disk `.mcd` file.

function jsonResponse(body: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function notFound(message = "Not found"): Response {
  return new Response(message, { status: 404, headers: CORS_HEADERS });
}

function methodNotAllowed(): Response {
  return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
}

function readActiveSerial(): string | null {
  if (!mapping || !isGameLoaded(mapping.view)) return null;
  return readGameSerial(mapping.view);
}

// Sticky fallback for memcard resolution. Our own PUT /bytes closes the game
// before writing (so DuckStation doesn't clobber the write on shutdown); any
// follow-up read (backups, bytes) then hits a DuckStation window with no game
// title and `findActiveSave` can no longer derive the filename. Caching the
// last good (pid, serial) → path lets those reads still succeed for the rest
// of this DuckStation session. Live resolution always wins when available.
let lastResolvedMemcard: {
  pid: number | undefined;
  serial: string;
  memcardPath: string;
} | null = null;

async function serveActiveSaveApi(req: Request, url: URL): Promise<Response> {
  const serial = readActiveSerial();
  if (!serial) {
    return jsonResponse({ error: "no_active_game" }, { status: 409 });
  }
  const pid = mapping?.pid;
  const result = await findActiveSave(pid);
  let entry: ActiveSave;
  if (result.ok) {
    entry = result.save;
    lastResolvedMemcard = { pid, serial, memcardPath: entry.memcardPath };
  } else if (
    lastResolvedMemcard &&
    lastResolvedMemcard.pid === pid &&
    lastResolvedMemcard.serial === serial &&
    existsSync(lastResolvedMemcard.memcardPath)
  ) {
    entry = buildActiveSave(lastResolvedMemcard.memcardPath);
  } else {
    return jsonResponse(
      {
        error: "no_save_for_active_game",
        gameSerial: serial,
        reason: result.reason,
        diagnostics: result.diag,
      },
      { status: 404 },
    );
  }

  const { pathname } = url;

  if (pathname === "/api/active-save") {
    if (req.method !== "GET") return methodNotAllowed();
    return jsonResponse({ gameSerial: serial, ...entry });
  }

  if (pathname === "/api/active-save/bytes") {
    if (req.method === "GET") {
      const bytes = readSave(entry.memcardPath);
      return new Response(bytes, {
        headers: { ...CORS_HEADERS, "Content-Type": "application/octet-stream" },
      });
    }
    if (req.method === "PUT") {
      try {
        const bytes = new Uint8Array(await req.arrayBuffer());
        // DuckStation keeps the memcard mirrored in memory and will write its
        // own copy back on the next in-game save — silently clobbering our
        // bytes. Close the game first so our write wins and the user can
        // reload to pick up the edits. Mirrors `/api/active-iso` PUT.
        let closedGame = false;
        const hwnd = ensureHwnd();
        if (hwnd) {
          console.log("[save] PUT: closing DuckStation game before memcard write");
          await sendCloseGameWithoutSaving(hwnd);
          // DuckStation's close sequence takes ~600-800ms; wait past that so
          // our write is strictly after any flush it does on shutdown.
          await new Promise((r) => setTimeout(r, 900));
          closedGame = true;
        }
        const backup = writeSaveWithBackup(entry.memcardPath, bytes);
        console.log(
          `[save] PUT ${entry.memcardFilename} (${bytes.byteLength} bytes)${backup ? ` · backup ${backup.filename}` : ""}${closedGame ? " · closed game" : ""}`,
        );
        return jsonResponse({ ok: true, backup, closedGame });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[save] PUT failed: ${message}`);
        return jsonResponse({ ok: false, error: message }, { status: 500 });
      }
    }
    return methodNotAllowed();
  }

  if (pathname === "/api/active-save/backups") {
    if (req.method !== "GET") return methodNotAllowed();
    return jsonResponse(listBackups(entry.memcardPath));
  }

  const restoreMatch = pathname.match(/^\/api\/active-save\/backups\/([^/]+)\/restore$/);
  if (restoreMatch) {
    if (req.method !== "POST") return methodNotAllowed();
    const backupFilename = decodeURIComponent(restoreMatch[1] ?? "");
    try {
      const preRestore = restoreBackup(entry.memcardPath, backupFilename);
      return jsonResponse({
        ok: true,
        preRestore,
        backups: listBackups(entry.memcardPath),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(message, { status: 400, headers: CORS_HEADERS });
    }
  }

  return notFound();
}

// ── ISO editor HTTP API (/api/active-iso/*) ────────────────────
//
// Scoped to the currently-loaded game's disc image — the bridge has already
// resolved and parsed it into `currentGameData`, so the UI never needs to
// know the path. These routes expose:
//   GET  /api/active-iso              — metadata (serial, filename, backup count)
//   PUT  /api/active-iso/duelist-pool — patch one {duelistId, poolType, weights}
//   GET  /api/active-iso/drop-x15     — 15-card drop patch status
//   PUT  /api/active-iso/drop-x15     — enable 15-card drops when supported
//   GET  /api/active-iso/backups      — list rotating backups
//   POST /api/active-iso/backups/:filename/restore

async function serveActiveIsoApi(req: Request, url: URL): Promise<Response> {
  if (ambiguousDiscCandidates) {
    return jsonResponse(
      {
        error: "ambiguous_disc",
        message: describeDiscAmbiguity(ambiguousDiscCandidates),
        candidates: ambiguousDiscCandidates,
      },
      { status: 409 },
    );
  }
  if (!currentGameData) {
    return jsonResponse({ error: "no_game_data" }, { status: 409 });
  }
  const { discPath, gameSerial } = currentGameData;
  const { pathname } = url;

  if (pathname === "/api/active-iso") {
    if (req.method !== "GET") return methodNotAllowed();
    const backupCount = listIsoBackups(discPath).length;
    return jsonResponse({
      gameSerial,
      discFilename: discPath.split(/[\\/]/).pop() ?? discPath,
      backupCount,
    });
  }

  if (pathname === "/api/active-iso/duelist-pool") {
    if (req.method !== "PUT") return methodNotAllowed();
    try {
      const body = (await req.json()) as {
        duelistId?: number;
        poolType?: string;
        weights?: number[];
      };
      if (
        typeof body.duelistId !== "number" ||
        !isPoolType(body.poolType) ||
        !Array.isArray(body.weights)
      ) {
        return jsonResponse({ ok: false, error: "invalid_body" }, { status: 400 });
      }

      const duelistId = body.duelistId;
      const poolType = body.poolType;
      const weights = body.weights;
      const applyPatch = () => patchDuelistPool(discPath, duelistId, poolType, weights);

      let backup: ReturnType<typeof patchDuelistPool> = null;
      let closedGame = false;
      try {
        backup = applyPatch();
      } catch (err: unknown) {
        if (!isIsoLockedError(err, discPath)) throw err;
        // File is open by DuckStation. Close the game via Alt+S, W so it
        // releases the lock, then retry the write once. See MVP flow in
        // docs — confirmation / toast are handled client-side.
        console.log("[iso] PUT duelist-pool: ISO locked; closing game in DuckStation");
        const closeResult = await closeDuckStationGameAndWaitForUnlock(discPath);
        if (!closeResult.ok) {
          console.warn(`[iso] close-game fallback failed: ${closeResult.reason}`);
          return jsonResponse(
            { ok: false, error: "iso_locked", reason: closeResult.reason },
            { status: 409 },
          );
        }
        backup = applyPatch();
        closedGame = true;
      }

      // Refresh in-memory state so other clients see the new pool, then
      // re-broadcast so anything reading `gameData.duelists` updates live.
      const duelists = reReadDuelists(discPath);
      currentGameData = { ...currentGameData, duelists };
      persistGameDataCache(currentGameData);
      broadcast(buildGameDataMessage(currentGameData));
      console.log(
        `[iso] PUT duelist-pool duelist=${body.duelistId} pool=${body.poolType}${backup ? ` · backup ${backup.filename}` : ""}${closedGame ? " · closed game" : ""}`,
      );
      const duelist = duelists[body.duelistId - 1];
      const pool = duelist && isPoolType(body.poolType) ? duelist[body.poolType] : null;
      return jsonResponse({ ok: true, backup, pool, closedGame });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[iso] PUT duelist-pool failed: ${message}`);
      return jsonResponse({ ok: false, error: message }, { status: 500 });
    }
  }

  if (pathname === "/api/active-iso/drop-x15") {
    if (req.method === "GET") {
      const status = getDropX15PatchStatus(discPath);
      return jsonResponse({
        ...status,
        discFilename: discPath.split(/[\\/]/).pop() ?? discPath,
        gameSerial,
      });
    }
    if (req.method === "PUT") {
      try {
        const currentStatus = getDropX15PatchStatus(discPath);
        if (!currentStatus.supported) {
          return jsonResponse(
            { ok: false, error: "unsupported_disc", reason: currentStatus.reason },
            { status: 400 },
          );
        }
        const applyPatch = () => patchDropX15(discPath);

        let result: ReturnType<typeof patchDropX15>;
        let closedGame = false;
        try {
          result = applyPatch();
        } catch (err: unknown) {
          if (!isIsoLockedError(err, discPath)) throw err;
          console.log("[iso] PUT drop-x15: ISO locked; closing game in DuckStation");
          const closeResult = await closeDuckStationGameAndWaitForUnlock(discPath);
          if (!closeResult.ok) {
            console.warn(`[iso] close-game fallback failed: ${closeResult.reason}`);
            return jsonResponse(
              { ok: false, error: "iso_locked", reason: closeResult.reason },
              { status: 409 },
            );
          }
          result = applyPatch();
          closedGame = true;
        }

        console.log(
          `[iso] PUT drop-x15${result.backup ? ` · backup ${result.backup.filename}` : ""}${result.changed ? "" : " · already enabled"}${closedGame ? " · closed game" : ""}`,
        );
        return jsonResponse({ ok: true, ...result, closedGame });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[iso] PUT drop-x15 failed: ${message}`);
        return jsonResponse(
          { ok: false, error: "drop_x15_failed", reason: message },
          { status: 500 },
        );
      }
    }
    return methodNotAllowed();
  }

  if (pathname === "/api/active-iso/backups") {
    if (req.method !== "GET") return methodNotAllowed();
    return jsonResponse(listIsoBackups(discPath));
  }

  const restoreMatch = pathname.match(/^\/api\/active-iso\/backups\/([^/]+)\/restore$/);
  if (restoreMatch) {
    if (req.method !== "POST") return methodNotAllowed();
    const backupFilename = decodeURIComponent(restoreMatch[1] ?? "");
    try {
      const preRestore = restoreIsoBackup(discPath, backupFilename);
      const duelists = reReadDuelists(discPath);
      currentGameData = { ...currentGameData, duelists };
      persistGameDataCache(currentGameData);
      broadcast(buildGameDataMessage(currentGameData));
      return jsonResponse({
        ok: true,
        preRestore,
        backups: listIsoBackups(discPath),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(message, { status: 400, headers: CORS_HEADERS });
    }
  }

  return notFound();
}

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (req.method === "GET" && url.pathname.startsWith("/artwork/")) {
      return serveArtwork(url.pathname);
    }
    if (url.pathname.startsWith("/api/active-save")) {
      return serveActiveSaveApi(req, url);
    }
    if (url.pathname.startsWith("/api/active-iso")) {
      return serveActiveIsoApi(req, url);
    }
    if (server.upgrade(req)) return undefined;
    return new Response("WebSocket upgrade required", { status: 426 });
  },
  websocket: {
    open(ws) {
      clients.add(ws as unknown as BridgeWebSocket);
      console.log(`Client connected (${clients.size} total)`);

      // Always send fresh state on connect — never rely solely on cache.
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
            // Send game data if already acquired
            if (currentGameData) {
              ws.send(buildGameDataMessage(currentGameData));
            }
            // Notify about pre-staged update
            if (updateStaged) {
              ws.send(JSON.stringify({ type: "update_staged" }));
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
    },

    message(ws, message) {
      try {
        const msg = JSON.parse(String(message));
        if (msg.type === "scan") {
          console.log("Received scan/reconnect request from client");
          void forceReconnect();
        } else if (msg.type === "shutdown") {
          console.log("Received shutdown request from newer bridge — exiting");

          if (mapping) closeSharedMemory(mapping);
          server.stop();
          process.exit(0);
        } else if (msg.type === "restart_duckstation") {
          console.log("Received restart DuckStation request from client");
          void restartDuckStation().then((ok) => {
            if (!ok) {
              try {
                ws.send(JSON.stringify({ type: "restart_result", success: false }));
              } catch {
                /* client may have disconnected */
              }
            }
          });
        } else if (msg.type === "stage_update") {
          if (updateStaged) {
            broadcast(JSON.stringify({ type: "update_staged" }));
          } else {
            stageUpdateInBackground();
          }
        } else if (msg.type === "readMem") {
          handleReadMem(ws, msg);
        } else if (msg.type === "input") {
          void handleInputMessage(ws, msg);
        } else if (msg.type === "loadState") {
          void handleLoadStateMessage(ws, msg);
        } else if (msg.type === "update_and_restart") {
          console.log("Received update-and-restart request from client");
          broadcast(JSON.stringify({ type: "update_restart_ack" }));
          // Give time for the ack to be sent, then exit with code 75.
          // The batch script detects exit code 75 and loops back to run
          // update.ps1 before restarting bridge.exe.
          setTimeout(() => {
            if (mapping) {
              try {
                closeSharedMemory(mapping);
              } catch {
                /* ignore */
              }
            }
            server.stop();
            process.exit(75);
          }, 200);
        }
      } catch {
        // ignore invalid messages
      }
    },

    close(ws) {
      clients.delete(ws as unknown as BridgeWebSocket);
      console.log(`Client disconnected (${clients.size} total)`);
    },
  },
});

console.log(`Bridge WebSocket server listening on ws://localhost:${PORT}`);

function broadcast(json: string): void {
  for (const client of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(json);
    }
  }
}

// ── RAM read handler ────────────────────────────────────────────

type BridgeWs = { send(data: string): void };

function handleReadMem(ws: BridgeWs, msg: Record<string, unknown>): void {
  if (!mapping) {
    ws.send(JSON.stringify({ type: "readMem_result", error: "not connected" }));
    return;
  }
  const offset = Number(msg.offset);
  const length = Math.min(Number(msg.length) || 64, 4096);
  if (!Number.isFinite(offset) || offset < 0) {
    ws.send(JSON.stringify({ type: "readMem_result", error: "invalid offset" }));
    return;
  }
  try {
    const hex = readRawHex(mapping.view, offset, length);
    ws.send(JSON.stringify({ type: "readMem_result", offset, length, hex }));
  } catch (err) {
    const reason = err instanceof Error ? err.message : "read failed";
    ws.send(JSON.stringify({ type: "readMem_result", error: reason }));
  }
}

// ── Input command handlers ───────────────────────────────────────

function sendResult(ws: BridgeWs, type: string, ok: boolean, error?: string): void {
  try {
    ws.send(JSON.stringify({ type, success: ok, ...(error ? { error } : {}) }));
  } catch {
    /* client may have disconnected */
  }
}

/**
 * Ensure the HWND is resolved for the current DuckStation process.
 * Caches the result until the mapping changes.
 */
function ensureHwnd(): Hwnd | null {
  if (dsHwnd) return dsHwnd;
  if (!mapping) return null;
  dsHwnd = findMainWindowHandle(mapping.pid);
  if (dsHwnd) {
    console.log(`Resolved DuckStation HWND: ${dsHwnd} (PID ${mapping.pid})`);
    if (!areBindingsLoaded()) {
      loadBindings(mapping.pid);
    }
  }
  return dsHwnd;
}

/**
 * Trigger DuckStation's "Close Game Without Saving" and block until it
 * releases the ISO file handle. Used by the edit endpoint to turn an EBUSY
 * write into a successful close-write cycle.
 */
async function closeDuckStationGameAndWaitForUnlock(
  discPath: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const hwnd = ensureHwnd();
  if (!hwnd) return { ok: false, reason: "duckstation_window_not_found" };

  await sendCloseGameWithoutSaving(hwnd);

  // Lock typically releases in ~600ms — poll every 100ms, cap at 5s.
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const locked = await probeLockedIsos([discPath]);
    if (!locked.has(discPath)) return { ok: true };
    await new Promise((r) => setTimeout(r, 100));
  }
  return { ok: false, reason: "iso_still_locked_after_5s" };
}

async function handleInputMessage(ws: BridgeWs, msg: Record<string, unknown>): Promise<void> {
  const hwnd = ensureHwnd();
  if (!hwnd) {
    sendResult(ws, "input_result", false, "DuckStation window not found");
    return;
  }

  const button = String(msg.button ?? "");
  if (!isValidButton(button)) {
    sendResult(ws, "input_result", false, `Invalid button: ${button}`);
    return;
  }

  const holdMs = typeof msg.hold === "number" ? msg.hold : undefined;
  const ok =
    holdMs != null ? await holdButton(hwnd, button, holdMs) : await tapButton(hwnd, button);
  sendResult(ws, "input_result", ok, ok ? undefined : "Input failed");
}

async function handleLoadStateMessage(ws: BridgeWs, msg: Record<string, unknown>): Promise<void> {
  const hwnd = ensureHwnd();
  if (!hwnd) {
    sendResult(ws, "loadState_result", false, "DuckStation window not found");
    return;
  }

  const slot = Number(msg.slot);
  if (!isValidSlot(slot)) {
    sendResult(ws, "loadState_result", false, `Invalid slot: ${msg.slot} (must be 1–8)`);
    return;
  }

  if (!loadStateHotkeysReady) {
    const result = ensureLoadStateHotkeys(mapping?.pid);
    if (result.error) {
      sendResult(ws, "loadState_result", false, `Hotkey setup failed: ${result.error}`);
      return;
    }
    loadStateHotkeysReady = true;
    if (result.patched) {
      console.log("Patched DuckStation settings.ini with LoadGameState hotkeys");
    }
  }

  const ok = await loadState(hwnd, slot);
  sendResult(ws, "loadState_result", ok, ok ? undefined : "PostMessage failed");
}

// ── Connection to DuckStation ──────────────────────────────────────
async function tryConnect(): Promise<boolean> {
  if (mapping) return true;

  const pids = await findDuckStationPids();
  if (pids.length === 0) {
    if (lastConnectStatus !== "no_emulator") {
      lastConnectStatus = "no_emulator";
      patchSettingsIfNeeded();
      console.log("Emulator not found. Waiting...");
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
      return true;
    }
  }

  if (lastConnectStatus !== "no_shared_memory") {
    lastConnectStatus = "no_shared_memory";
    patchSettingsIfNeeded(pids[0]);
    console.log(
      `DuckStation found (PIDs: ${pids.join(", ")}) but shared memory not available. Waiting...`,
    );
  }
  broadcast(
    JSON.stringify({
      connected: false,
      status: "no_shared_memory",
      version: VERSION,
      settingsPatched: lastPatchResult.enabled,
      reason: lastPatchResult.enabled
        ? "Shared memory export is enabled in DuckStation settings but not active — restart DuckStation to apply."
        : `DuckStation found (PIDs: ${pids.join(", ")}) but shared memory not available. Enable Settings > Advanced > Export Shared Memory in DuckStation.`,
    }),
  );
  return false;
}

/** Force-close current mapping and reconnect (used by manual reconnect button). */
async function forceReconnect(): Promise<void> {
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
  pidCheckCounter = 0;
  lastConnectStatus = "";
  dsHwnd = null;
  resetProfile();
  resetGameData();
  resetPalProbe();
  await tryConnect();
}

/** Extract the ROM path argument from a running DuckStation process's command line. */
function getProcessRomArg(pid: number): string | null {
  try {
    const cmdLine = execSync(
      `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').CommandLine"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"], timeout: 5000 },
    ).trim();
    if (!cmdLine) return null;
    // Command line format: "C:\...\duckstation.exe" "C:\...\game.bin"
    const match = cmdLine.match(/\.exe"?\s+"?([^"]+\.(bin|cue|img|iso|chd))"?\s*$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Restart DuckStation: kill gracefully, wait for exit, relaunch.
 *  Returns true on success, false on failure. */
async function restartDuckStation(): Promise<boolean> {
  const pids = await findDuckStationPids();
  if (pids.length === 0) return false;
  const pid = mapping?.pid ?? pids[0];
  if (pid === undefined) return false;

  // Get executable path and ROM arg before killing
  const exePath = getExePathForPid(pid);
  if (!exePath) {
    console.error("restartDuckStation: could not determine executable path");
    return false;
  }
  const romArg = getProcessRomArg(pid);

  console.log(
    `Restarting DuckStation (PID ${pid}): ${exePath}${romArg ? ` with ROM: ${romArg}` : ""}`,
  );

  // Close shared memory mapping
  if (mapping) {
    try {
      closeSharedMemory(mapping);
    } catch {
      /* ignore */
    }
    mapping = null;
    dsHwnd = null;
    lastJson = "";
    hadNonZeroData = false;
    reopenedAfterStale = false;
    consecutiveZeroReads = 0;
    resetProfile();
    resetGameData();
    resetPalProbe();
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

  // Re-patch settings after exit — DuckStation may have written ExportSharedMemory=false on close
  patchSettingsIfNeeded(pid);

  try {
    const args = romArg ? [romArg] : [];
    spawn(exePath, args, { detached: true, stdio: "ignore" }).unref();
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`restartDuckStation: failed to launch: ${msg}`);
    return false;
  }
}

// ── Diagnostic logging ────────────────────────────────────────────

function slotSummary(slot: {
  cardId: number;
  atk: number;
  def: number;
  status: number;
}): string | null {
  if (slot.cardId === 0 && slot.status === 0) return null;
  return `${String(slot.cardId)}(${slot.atk}/${slot.def}):0x${slot.status.toString(16).padStart(2, "0")}`;
}

function slotsSummary(
  slots: Array<{ cardId: number; atk: number; def: number; status: number }>,
): string {
  const parts = slots.map(slotSummary).filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "(empty)";
}

function logStateChange(state: GameState): void {
  const prev = lastLogState;
  lastLogState = state;

  const parts: string[] = [];

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

  const prevOppHand = prev ? slotsSummary(prev.opponentHand) : null;
  const currOppHand = slotsSummary(state.opponentHand);
  if (prevOppHand !== currOppHand) {
    parts.push(`opp-hand=[${currOppHand}]`);
  }

  const prevOppField = prev ? slotsSummary(prev.opponentField) : null;
  const currOppField = slotsSummary(state.opponentField);
  if (prevOppField !== currOppField) {
    parts.push(`opp-field=[${currOppField}]`);
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

function collectionSummary(coll: number[]): { unique: number; total: number } {
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

let lastShuffledKey = "";
let dumpedContext = false;

function logCollectionDeckState(view: DataView, sceneId: number | null): void {
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
      const diffs: string[] = [];
      for (let i = 0; i < coll.length; i++) {
        if (coll[i] !== prevColl[i]) {
          diffs.push(`card${i + 1}: ${prevColl[i]}→${coll[i]}`);
        }
      }
      collLog(`COLLECTION CHANGED (${unique} unique, ${total} total): ${diffs.join(", ")}`);
    } else {
      collLog(`COLLECTION SNAPSHOT (${unique} unique, ${total} total)`);
      const owned: string[] = [];
      for (let i = 0; i < coll.length; i++) {
        const cnt = coll[i];
        if (cnt && cnt > 0) owned.push(`${i + 1}×${cnt}`);
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
    const shuffledKey = shuffled.join(",");
    if (shuffledKey !== lastShuffledKey) {
      lastShuffledKey = shuffledKey;
      collLog(`SHUFFLED DECK [${shuffledNonZero.length} cards]: ${shuffledNonZero.join(" ")}`);
    }
  }

  // Dump a small region around collection for exploration (first time only)
  if (!dumpedContext) {
    dumpedContext = true;
    collLog(`RAW before deck (0x1D01F0): ${readRawHex(view, 0x1d01f0, 16)}`);
    collLog(`RAW after collection (0x1D0522): ${readRawHex(view, 0x1d0522, 32)}`);
  }
}

// ── Diagnostic probes (optional) ────────────────────────────────────
const DIAG_PAL = false; // investigation complete — see docs/memory/pal-remaining-addresses.md
const DIAG_HAND_SLOTS = false; // verified on both NTSC-U and PAL — see docs/memory/steps/bridge-extended-state.md
const DIAG_OPPONENT = false; // investigation complete
let palProbe: PalProbe | null = DIAG_PAL ? createPalProbe() : null;
let handProbe: HandSlotProbe | null = DIAG_HAND_SLOTS ? createHandSlotProbe() : null;
let oppProbe: OpponentProbe | null = DIAG_OPPONENT ? createOpponentProbe() : null;

function resetPalProbe(): void {
  if (DIAG_PAL) palProbe = createPalProbe();
  if (DIAG_HAND_SLOTS) handProbe = createHandSlotProbe();
  if (DIAG_OPPONENT) oppProbe = createOpponentProbe();
}

// ── Poll loop ──────────────────────────────────────────────────────
async function poll(): Promise<void> {
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

        // Invalidate the fingerprint while no game is active, so the next
        // game-loaded transition forces `acquireGameData` to run — even when
        // the user switches between two byte-identical ISOs (same content
        // hash, same fingerprint). We deliberately do NOT null
        // `currentGameData`: the UI keeps its last-known data, only the
        // "have we already extracted this?" marker gets cleared. Idempotent.
        gameDataFingerprint = null;

        // Periodically refresh the DataView when the game was never detected.
        // toArrayBuffer may snapshot memory-mapped pages; refreshing picks up
        // writes made by DuckStation after the initial mapping.
        if (!hadNonZeroData && consecutiveZeroReads % VIEW_REFRESH_INTERVAL === 0) {
          refreshView(mapping);
        }

        if (consecutiveZeroReads >= STALE_ZERO_THRESHOLD && hadNonZeroData && !reopenedAfterStale) {
          const pids = await findDuckStationPids();

          if (!pids.includes(mapping.pid)) {
            console.warn("DuckStation PID gone. Reconnecting...");
            try {
              closeSharedMemory(mapping);
            } catch {
              /* ignore */
            }
            mapping = null;
            dsHwnd = null;
            consecutiveZeroReads = 0;
            hadNonZeroData = false;
            reopenedAfterStale = false;
            pidCheckCounter = 0;
            lastJson = "";
            resetProfile();
            resetGameData();
            resetPalProbe();
            setTimeout(poll, POLL_MS);
            return;
          }

          // PID alive → try reopening shared memory once
          console.log("Reopening shared memory (possible save-state load)...");
          const oldPid = mapping.pid;
          try {
            closeSharedMemory(mapping);
          } catch {
            /* ignore */
          }
          const m = openSharedMemory(oldPid);
          mapping = m;
          consecutiveZeroReads = 0;
          reopenedAfterStale = true;
          pidCheckCounter = 0;
          resetProfile();
          resetGameData();
          resetPalProbe();
        } else if (consecutiveZeroReads >= STALE_ZERO_THRESHOLD && !hadNonZeroData) {
          // Bridge mapped shared memory before the game was loaded (e.g. user
          // launched DuckStation, then loaded an ISO). DuckStation may
          // recreate its file mapping on disc-load, leaving us with a stale
          // handle. Reopen periodically until the game appears or the PID
          // dies. openSharedMemory returns null on a dead PID, in which case
          // tryConnect picks up the new DuckStation on the next poll.
          if (!reopenedAfterStale) {
            console.log("Game still not detected — reopening shared memory...");
            reopenedAfterStale = true; // log throttle only — reset on detection
          }
          const oldPid = mapping.pid;
          try {
            closeSharedMemory(mapping);
          } catch {
            /* ignore */
          }
          mapping = openSharedMemory(oldPid, { quiet: true });
          consecutiveZeroReads = 0;
          pidCheckCounter = 0;
          resetProfile();
          resetGameData();
          resetPalProbe();
        }

        // Broadcast "waiting_for_game"
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

        // Periodically verify the DuckStation PID is still alive.
        // When the emulator exits, the mapped shared memory stays
        // readable (frozen data) so zero-read stale detection never
        // fires.  This check catches that case and forces reconnect.
        pidCheckCounter++;
        if (pidCheckCounter >= PID_CHECK_INTERVAL) {
          pidCheckCounter = 0;
          const pids = await findDuckStationPids();
          if (!pids.includes(mapping.pid)) {
            console.warn("DuckStation PID gone (detected during live read). Reconnecting...");
            try {
              closeSharedMemory(mapping);
            } catch {
              /* ignore */
            }
            mapping = null;
            dsHwnd = null;
            consecutiveZeroReads = 0;
            hadNonZeroData = false;
            reopenedAfterStale = false;
            lastJson = "";
            resetProfile();
            resetGameData();
            resetPalProbe();
            setTimeout(poll, POLL_MS);
            return;
          }
        }

        const profile = resolveOffsetProfile(mapping.view);
        const state = readGameState(mapping.view, profile);
        const fingerprint = readModFingerprint(mapping.view);
        const serial = readGameSerial(mapping.view);

        const json = JSON.stringify({
          connected: true,
          status: "ready",
          version: VERSION,
          pid: mapping.pid,
          modFingerprint: fingerprint,
          gameSerial: serial,
          ...state,
        });

        if (json !== lastJson) {
          logStateChange(state);
          palProbe?.onStateChange(mapping.view, state, profile);
          handProbe?.onStateChange(mapping.view, state, profile);
          oppProbe?.onStateChange(mapping.view, state, profile);
          lastJson = json;
          broadcast(json);
        }

        // Game data acquisition (runs once per game/mod change, retries on failure)
        const shouldAcquire =
          fingerprint !== gameDataFingerprint ||
          (gameDataRetryAt !== null && Date.now() >= gameDataRetryAt);
        if (shouldAcquire && serial === null) {
          // EXE not fully loaded into RAM yet — cardStats hash is transient
          // garbage and would mismatch every disc. Defer until the serial
          // appears, which is a strong "game is ready" signal.
          if (!waitingForSerialLogged) {
            console.log("Game serial not yet in RAM — deferring data acquisition");
            waitingForSerialLogged = true;
          }
        } else if (shouldAcquire) {
          waitingForSerialLogged = false;
          gameDataFingerprint = fingerprint;
          gameDataRetryAt = null;
          try {
            const cardStats = readCardStats(mapping.view);
            const result = await acquireGameData(cardStats, serial, __dirname, mapping.pid);

            // Read field bonus table directly from RAM (always available)
            const fbOffset = scanFieldBonusTable(mapping.view);
            const fieldBonus =
              fbOffset !== null ? readFieldBonusTable(mapping.view, fbOffset) : null;
            if (fbOffset !== null) {
              console.log(`Field bonus table found at RAM 0x${fbOffset.toString(16)}`);
            }

            if (result.kind === "ok") {
              result.data.fieldBonusTable = fieldBonus;
              currentGameData = result.data;
              ambiguousDiscCandidates = null;
              gameDataRetries = 0;
              broadcast(buildGameDataMessage(result.data));
            } else if (result.kind === "ambiguous") {
              // Stop retrying — only user action (moving/renaming a disc image)
              // can resolve this. Keep `currentGameData` null so the active-iso
              // endpoints refuse writes.
              currentGameData = null;
              ambiguousDiscCandidates = result.candidates;
              gameDataRetries = 0;
              broadcast(
                JSON.stringify({
                  type: "gameData",
                  error: describeDiscAmbiguity(result.candidates),
                }),
              );
            } else {
              currentGameData = null;
              ambiguousDiscCandidates = null;
              gameDataRetries++;
              if (gameDataRetries <= GAME_DATA_MAX_RETRIES) {
                console.log(
                  `Game data unavailable — retry ${gameDataRetries}/${GAME_DATA_MAX_RETRIES} in ${GAME_DATA_RETRY_DELAY_MS / 1000}s`,
                );
                gameDataRetryAt = Date.now() + GAME_DATA_RETRY_DELAY_MS;
              }
              broadcast(
                JSON.stringify({
                  type: "gameData",
                  error: serial
                    ? "Could not find or read game disc image — check bridge.log"
                    : "No game serial detected",
                }),
              );
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Game data acquisition failed: ${msg}`);
            gameDataRetries++;
            if (gameDataRetries <= GAME_DATA_MAX_RETRIES) {
              gameDataRetryAt = Date.now() + GAME_DATA_RETRY_DELAY_MS;
            }
            broadcast(JSON.stringify({ type: "gameData", error: msg }));
          }
        }

        // Collection & deck tracking (separate from broadcast)
        logCollectionDeckState(mapping.view, state.sceneId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Error reading game state:", msg);
      try {
        if (mapping) closeSharedMemory(mapping);
      } catch {
        /* ignore */
      }
      mapping = null;
      dsHwnd = null;
      lastJson = "";
      hadNonZeroData = false;
      reopenedAfterStale = false;
      pidCheckCounter = 0;
      resetProfile();
      resetGameData();
      resetPalProbe();
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
let lastPatchResult: { patched: boolean; enabled: boolean; error?: string } = {
  patched: false,
  enabled: false,
};

function patchSettingsIfNeeded(pid?: number): void {
  const result = ensureSharedMemoryEnabled(pid ?? mapping?.pid);
  lastPatchResult = result;
  if (result.patched) {
    console.log(
      "Enabled shared memory export in DuckStation settings. Restart DuckStation for the change to take effect.",
    );
  } else if (result.error) {
    console.warn(`Could not check DuckStation settings: ${result.error}`);
  }
}

// ── Start ──────────────────────────────────────────────────────────
console.log("YFM3 Emulator Bridge");
console.log(`Poll interval: ${POLL_MS}ms`);
console.log("Searching for DuckStation...");
stageUpdateInBackground();
void poll();
