/**
 * Game data acquisition from disc image (.bin).
 *
 * Resolves the .bin path for the running game via DuckStation's gamelist
 * cache, extracts fusion and equip tables from the disc image, and manages
 * a single-entry disk cache keyed by gameDataHash (SHA-256 of card stats).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { detectExeLayout } from "../scripts/extract/detect-exe.ts";
import { detectWaMrgLayout } from "../scripts/extract/detect-wamrg.ts";
import { extractEquips } from "../scripts/extract/extract-equips.ts";
import { extractFusions } from "../scripts/extract/extract-fusions.ts";
import { loadDiscData } from "../scripts/extract/index.ts";
import type { EquipEntry, Fusion } from "../scripts/extract/types.ts";
import { findDuckStationDataDir } from "./settings.ts";

// ── Types ────────────────────────────────────────────────────────

export interface GameData {
  gameDataHash: string;
  gameSerial: string;
  cardStats: Uint8Array;
  fusionTable: Fusion[];
  equipTable: EquipEntry[];
}

interface GameDataCache {
  gameDataHash: string;
  gameSerial: string;
  capturedAt: string;
  cardStats: string; // base64
  fusions: Array<{ m1: number; m2: number; r: number }>;
  equips: Array<{ e: number; m: number[] }>;
}

// ── Constants ─────────────────────────────────────────────────────

const CARD_STATS_SIZE = 722 * 4; // 2888 bytes — must match memory.ts
const GAMELIST_MAGIC = "HLCE";
const CACHE_FILENAME = "game-data-cache.json";

// ── Main entry point ──────────────────────────────────────────────

/**
 * Acquire game data (fusions, equips) for the running game.
 *
 * 1. Compute gameDataHash from cardStats
 * 2. Check disk cache — if hash matches, return cached data
 * 3. Otherwise resolve the .bin path and extract tables from disc
 *
 * @param cardStats  Snapshot of 2888-byte card stats from RAM
 * @param serial     Game serial from RAM (e.g. "SLES_039.48"), or null
 * @param cacheDir   Directory for the cache file
 */
export function acquireGameData(
  cardStats: Uint8Array,
  serial: string | null,
  cacheDir: string,
): GameData | null {
  const gameDataHash = computeGameDataHash(cardStats);
  const cachePath = join(cacheDir, CACHE_FILENAME);

  // Check disk cache
  const cached = loadCache(cachePath);
  if (cached && cached.gameDataHash === gameDataHash) {
    console.log(`Game data cache hit (hash=${gameDataHash.slice(0, 12)}...)`);
    return restoreFromCache(cached);
  }
  console.log(`Game data cache miss (hash=${gameDataHash.slice(0, 12)}...)`);

  if (!serial) {
    console.warn("No game serial — cannot resolve .bin path");
    return null;
  }

  // Resolve .bin path(s) from DuckStation's gamelist cache
  const binPaths = findBinPaths(serial);
  if (binPaths.length === 0) {
    console.warn(`No .bin found for serial ${serial}`);
    return null;
  }

  // Extract from the matching .bin (disambiguates if multiple candidates)
  const data = extractFromBins(binPaths, serial, gameDataHash, cardStats);
  if (data) {
    saveCache(cachePath, data);
    console.log(
      `Game data acquired: ${data.fusionTable.length} fusions, ${data.equipTable.length} equips`,
    );
  }
  return data;
}

// ── Hash ──────────────────────────────────────────────────────────

/** SHA-256 hex digest of the card stats table. */
export function computeGameDataHash(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

// ── Disk cache ────────────────────────────────────────────────────

function loadCache(cachePath: string): GameDataCache | null {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, "utf-8"));
  } catch {
    return null;
  }
}

function restoreFromCache(cache: GameDataCache): GameData {
  return {
    gameDataHash: cache.gameDataHash,
    gameSerial: cache.gameSerial,
    cardStats: new Uint8Array(Buffer.from(cache.cardStats, "base64")),
    fusionTable: cache.fusions.map((f) => ({ material1: f.m1, material2: f.m2, result: f.r })),
    equipTable: cache.equips.map((e) => ({ equipId: e.e, monsterIds: e.m })),
  };
}

function saveCache(cachePath: string, data: GameData): void {
  const cache: GameDataCache = {
    gameDataHash: data.gameDataHash,
    gameSerial: data.gameSerial,
    capturedAt: new Date().toISOString(),
    cardStats: Buffer.from(data.cardStats).toString("base64"),
    fusions: data.fusionTable.map((f) => ({ m1: f.material1, m2: f.material2, r: f.result })),
    equips: data.equipTable.map((e) => ({ e: e.equipId, m: e.monsterIds })),
  };
  writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
}

// ── .bin path resolution ──────────────────────────────────────────

/**
 * Find .bin file path(s) for a game serial via DuckStation's gamelist cache.
 */
function findBinPaths(serial: string): string[] {
  const dsDataDir = findDuckStationDataDir();
  if (!dsDataDir) {
    console.warn("DuckStation data directory not found");
    return [];
  }

  const gamelistPath = join(dsDataDir, "cache", "gamelist.cache");
  if (!existsSync(gamelistPath)) {
    console.warn(`gamelist.cache not found at ${gamelistPath}`);
    return [];
  }

  const cuePaths = parseGamelistCache(readFileSync(gamelistPath), serial);
  if (cuePaths.length === 0) {
    console.warn(`No entries for serial ${serial} in gamelist.cache`);
    return [];
  }

  const binPaths: string[] = [];
  for (const cue of cuePaths) {
    const bin = resolveBinPath(cue);
    if (bin) binPaths.push(bin);
  }
  return binPaths;
}

/**
 * Parse DuckStation's gamelist.cache binary file and return .cue paths
 * matching the given serial.
 *
 * Entry format (discovered empirically):
 *   [pathLen:u32][path:pathLen bytes][serialLen:u32][serial:ceil4(serialLen) bytes][48 bytes metadata]
 */
export function parseGamelistCache(buf: Buffer, targetSerial: string): string[] {
  if (buf.length < 4 || buf.subarray(0, 4).toString("ascii") !== GAMELIST_MAGIC) {
    return [];
  }

  const normalTarget = normalizeSerial(targetSerial);
  const cuePaths: string[] = [];
  let pos = 4; // skip magic

  while (pos + 8 < buf.length) {
    // Path length (uint32 LE)
    const pathLen = buf.readUInt32LE(pos);
    if (pathLen === 0 || pathLen > 4096) break;
    pos += 4;

    if (pos + pathLen > buf.length) break;

    // Path (null-terminated, pathLen bytes)
    let pathEnd = pos + pathLen;
    // Find null terminator within the allocated space
    for (let i = pos; i < pathEnd; i++) {
      if (buf[i] === 0) {
        pathEnd = i;
        break;
      }
    }
    const path = buf.subarray(pos, pathEnd).toString("utf-8");
    pos += pathLen;

    // Serial length (uint32 LE)
    if (pos + 4 > buf.length) break;
    const serialLen = buf.readUInt32LE(pos);
    if (serialLen > 64) break;
    pos += 4;

    // Serial (padded to 4-byte alignment)
    const serialAligned = Math.ceil(serialLen / 4) * 4;
    if (pos + serialAligned > buf.length) break;

    let serialEnd = pos + serialLen;
    for (let i = pos; i < serialEnd; i++) {
      if (buf[i] === 0) {
        serialEnd = i;
        break;
      }
    }
    const serial = buf.subarray(pos, serialEnd).toString("ascii");
    pos += serialAligned;

    // Skip trailing metadata (8+8+8+8+16 = 48 bytes)
    if (pos + 48 > buf.length) break;
    pos += 48;

    if (normalizeSerial(serial) === normalTarget) {
      cuePaths.push(path);
    }
  }

  return cuePaths;
}

/**
 * Normalize a game serial for comparison.
 * RAM format: "SLES_039.48", gamelist format: "SLES-03948" → both become "SLES03948".
 */
export function normalizeSerial(serial: string): string {
  return serial.replace(/[-_.]/g, "").toUpperCase();
}

/**
 * Parse a .cue file and return the absolute path to the referenced .bin file.
 */
export function resolveBinPath(cuePath: string): string | null {
  try {
    const cueContent = readFileSync(cuePath, "utf-8");
    const match = cueContent.match(/FILE\s+"([^"]+)"\s+BINARY/i);
    if (!match?.[1]) return null;
    const binPath = join(dirname(cuePath), match[1]);
    return existsSync(binPath) ? binPath : null;
  } catch {
    return null;
  }
}

// ── Extraction ────────────────────────────────────────────────────

/**
 * Try each .bin candidate: if multiple, disambiguate by hashing card stats
 * from the EXE and comparing to the running game's hash.
 * Extracts from the first match to avoid loading .bins twice.
 */
function extractFromBins(
  binPaths: string[],
  serial: string,
  gameDataHash: string,
  cardStats: Uint8Array,
): GameData | null {
  if (binPaths.length > 1) {
    console.log(`Multiple .bin candidates for ${serial}: ${binPaths.join(", ")}`);
  }

  for (const binPath of binPaths) {
    try {
      const { slus, waMrg } = loadDiscData(binPath);

      // Disambiguate: check card stats hash if multiple candidates
      if (binPaths.length > 1) {
        const exeLayout = detectExeLayout(slus);
        const binStats = slus.subarray(exeLayout.cardStats, exeLayout.cardStats + CARD_STATS_SIZE);
        if (computeGameDataHash(binStats) !== gameDataHash) {
          console.log(`  ${binPath}: hash mismatch, skipping`);
          continue;
        }
        console.log(`  ${binPath}: hash match`);
      }

      const waMrgLayout = detectWaMrgLayout(waMrg);
      const fusions = extractFusions(waMrg, waMrgLayout);
      const equips = extractEquips(waMrg, waMrgLayout);

      return {
        gameDataHash,
        gameSerial: serial,
        cardStats,
        fusionTable: fusions,
        equipTable: equips,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Failed to process ${binPath}: ${msg}`);
    }
  }

  return null;
}
