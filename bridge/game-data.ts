/**
 * Game data acquisition from disc image (.bin).
 *
 * Resolves the .bin path for the running game via DuckStation's gamelist
 * cache, extracts all game data (cards, duelists, fusions, equips) from
 * the disc image, and manages a single-entry disk cache keyed by
 * gameDataHash (SHA-256 of card stats).
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { detectAttributeMapping, detectExeLayout } from "../scripts/extract/detect-exe.ts";
import { detectWaMrgLayout } from "../scripts/extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "../scripts/extract/detect-wamrg-text.ts";
import { extractCards } from "../scripts/extract/extract-cards.ts";
import { extractDuelists } from "../scripts/extract/extract-duelists.ts";
import { extractEquips } from "../scripts/extract/extract-equips.ts";
import { extractFusions } from "../scripts/extract/extract-fusions.ts";
import { extractAllArtworkAsPng } from "../scripts/extract/extract-images.ts";
import { langIdxForSerial, loadDiscData } from "../scripts/extract/index.ts";
import type { CardStats, DuelistData, EquipEntry, Fusion } from "../scripts/extract/types.ts";
import { findSettingsPath } from "./settings.ts";

// ── Types ────────────────────────────────────────────────────────

export interface GameData {
  gameDataHash: string;
  gameSerial: string;
  cardStats: Uint8Array;
  cards: CardStats[];
  duelists: DuelistData[];
  fusionTable: Fusion[];
  equipTable: EquipEntry[];
  /**
   * Field bonus table: 120 actual bonus values (e.g., 500, -500, 0).
   * 20 monster types × 6 non-Normal terrains, indexed as type * 6 + (terrain - 1).
   * Terrains 1–6 = Forest, Wasteland, Mountain, Sogen, Umi, Yami.
   * null when not available (table not found in RAM or disc).
   */
  fieldBonusTable: number[] | null;
}

interface GameDataCache {
  gameDataHash: string;
  gameSerial: string;
  capturedAt: string;
  cardStats: string; // base64
  cards: CardStats[];
  duelists: DuelistData[];
  fusions: Array<{ m1: number; m2: number; r: number }>;
  equips: Array<{ e: number; m: number[] }>;
  fieldBonus?: number[] | null;
}

// ── Constants ─────────────────────────────────────────────────────

const CARD_STATS_SIZE = 722 * 4; // 2888 bytes — must match memory.ts
const CACHE_FILENAME = "game-data-cache.json";

// ── Main entry point ──────────────────────────────────────────────

/**
 * Acquire all game data for the running game.
 *
 * @param cardStats  Snapshot of 2888-byte card stats from RAM
 * @param serial     Game serial from RAM (e.g. "SLES_039.48"), or null
 * @param cacheDir   Directory for the cache file
 * @param pid        Optional running DuckStation PID, used for portable mode settings detection
 */
export function acquireGameData(
  cardStats: Uint8Array,
  serial: string | null,
  cacheDir: string,
  pid?: number,
): GameData | null {
  const gameDataHash = computeGameDataHash(cardStats);
  const cachePath = join(cacheDir, CACHE_FILENAME);

  // Check disk cache (require artwork dir to exist — otherwise re-extract)
  const hashPrefix = gameDataHash.slice(0, 12);
  const artworkDir = join(cacheDir, "artwork", hashPrefix);
  const cached = loadCache(cachePath);
  if (cached && cached.gameDataHash === gameDataHash && existsSync(join(artworkDir, "001.png"))) {
    console.log(`Game data cache hit (hash=${gameDataHash.slice(0, 12)}...)`);
    return restoreFromCache(cached);
  }
  console.log(`Game data cache miss (hash=${gameDataHash.slice(0, 12)}...)`);

  // Resolve .bin path(s) by scanning DuckStation's game directories
  const cuePaths = findCueFiles(pid);
  if (cuePaths.length === 0) {
    console.warn("No .cue files found in DuckStation game directories");
    return null;
  }

  const allBins = cuesToBins(cuePaths);
  const data =
    allBins.length > 0
      ? extractFromBins(allBins, gameDataHash, cardStats, serial, artworkDir)
      : null;

  if (data) {
    saveCache(cachePath, data);
    console.log(
      `Game data acquired: ${data.cards.length} cards, ${data.duelists.length} duelists, ${data.fusionTable.length} fusions, ${data.equipTable.length} equips`,
    );
    return data;
  }

  console.warn("No matching .bin found in DuckStation gamelist");
  return null;
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
    const cache = JSON.parse(readFileSync(cachePath, "utf-8"));
    // Reject stale cache entries missing required fields (written by older bridge versions)
    if (!Array.isArray(cache.cards) || cache.cards.length === 0) return null;
    if (!Array.isArray(cache.duelists) || cache.duelists.length === 0) return null;
    return cache;
  } catch {
    return null;
  }
}

function restoreFromCache(cache: GameDataCache): GameData {
  return {
    gameDataHash: cache.gameDataHash,
    gameSerial: cache.gameSerial,
    cardStats: new Uint8Array(Buffer.from(cache.cardStats, "base64")),
    cards: cache.cards,
    duelists: cache.duelists,
    fusionTable: cache.fusions.map((f) => ({ material1: f.m1, material2: f.m2, result: f.r })),
    equipTable: cache.equips.map((e) => ({ equipId: e.e, monsterIds: e.m })),
    fieldBonusTable: cache.fieldBonus ?? null,
  };
}

function saveCache(cachePath: string, data: GameData): void {
  const cache: GameDataCache = {
    gameDataHash: data.gameDataHash,
    gameSerial: data.gameSerial,
    capturedAt: new Date().toISOString(),
    cardStats: Buffer.from(data.cardStats).toString("base64"),
    cards: data.cards,
    duelists: data.duelists,
    fusions: data.fusionTable.map((f) => ({ m1: f.material1, m2: f.material2, r: f.result })),
    equips: data.equipTable.map((e) => ({ e: e.equipId, m: e.monsterIds })),
    fieldBonus: data.fieldBonusTable,
  };
  writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf-8");
}

// ── .cue file discovery ──────────────────────────────────────────

/**
 * Find all .cue files by scanning DuckStation's configured game directories.
 * Reads `[GameList] RecursivePaths` from settings.ini — the same dirs
 * DuckStation scans, so results always match what the UI shows.
 */
function findCueFiles(pid?: number): string[] {
  const settingsPath = findSettingsPath(pid);
  if (!settingsPath) {
    console.warn("DuckStation settings.ini not found");
    return [];
  }
  const content = readFileSync(settingsPath, "utf-8");
  const gameDirs = parseGameDirs(content);
  if (gameDirs.length === 0) {
    console.warn("No game directories in DuckStation settings.ini");
    return [];
  }
  const cues: string[] = [];
  for (const dir of gameDirs) scanForCueFiles(dir, cues, 0);
  return cues;
}

/**
 * Extract game directories from settings.ini content.
 * Parses `[GameList] RecursivePaths` (newline-separated list of dirs).
 */
export function parseGameDirs(iniContent: string): string[] {
  const lines = iniContent.split(/\r?\n/);
  let inSection = false;
  const dirs: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "[GameList]") {
      inSection = true;
      continue;
    }
    if (inSection && trimmed.startsWith("[")) break;
    if (inSection) {
      const match = trimmed.match(/^RecursivePaths\s*=\s*(.+)/);
      if (match?.[1]) dirs.push(match[1].trim());
    }
  }
  return dirs;
}

const MAX_SCAN_DEPTH = 5;
function scanForCueFiles(dir: string, out: string[], depth: number): void {
  if (depth > MAX_SCAN_DEPTH || !existsSync(dir)) return;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (name.toLowerCase().endsWith(".cue")) {
      out.push(full);
    } else {
      try {
        const stat = readdirSync(full); // throws if not a directory
        if (stat) scanForCueFiles(full, out, depth + 1);
      } catch {
        // not a directory, skip
      }
    }
  }
}

function cuesToBins(cuePaths: string[]): string[] {
  const binPaths: string[] = [];
  for (const cue of cuePaths) {
    const bin = resolveBinPath(cue);
    if (bin) {
      binPaths.push(bin);
    } else {
      console.warn(`Could not resolve .bin from .cue: ${cue}`);
    }
  }
  return binPaths;
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
 * Falls back to scanning the directory for .bin files when the .cue references
 * a filename that doesn't exist (e.g. extra spaces in the name).
 */
export function resolveBinPath(cuePath: string): string | null {
  try {
    const cueContent = readFileSync(cuePath, "utf-8");
    const match = cueContent.match(/FILE\s+"([^"]+)"\s+BINARY/i);
    if (!match?.[1]) return null;
    const dir = dirname(cuePath);
    const binPath = join(dir, match[1]);
    if (existsSync(binPath)) return binPath;

    // .cue filename doesn't match disk — scan directory for .bin files
    const bins = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".bin"));
    if (bins.length === 1 && bins[0]) return join(dir, bins[0]);
    return null;
  } catch {
    return null;
  }
}

/**
 * Scan an EXE buffer for an embedded serial string (e.g. "SLUS_014.11").
 * This matches what DuckStation loads into RAM, which may differ from the
 * ISO filesystem filename (common with mods).
 */
const EXE_SERIAL_RE = /^S[CL][A-Z]{2}_\d{3}\.\d{2}$/;
function findSerialInExe(slus: Buffer): string | null {
  const limit = Math.min(slus.length, 0x80000);
  for (let i = 0; i < limit - 11; i++) {
    if (slus[i] !== 0x53) continue; // 'S'
    const b1 = slus[i + 1];
    if (b1 !== 0x4c && b1 !== 0x43) continue; // 'L' or 'C'
    let candidate = "";
    for (let j = 0; j < 11; j++) candidate += String.fromCharCode(slus[i + j] ?? 0);
    if (EXE_SERIAL_RE.test(candidate)) return candidate;
  }
  return null;
}

// ── Extraction ────────────────────────────────────────────────────

/**
 * Try each .bin candidate, disambiguate by card stats hash, and extract
 * all game data from the best match. Prefers the disc whose EXE serial
 * matches the RAM serial (handles mods with custom gamelist serials).
 */
function extractFromBins(
  binPaths: string[],
  gameDataHash: string,
  cardStats: Uint8Array,
  ramSerial?: string | null,
  artworkDir?: string,
): GameData | null {
  type Match = {
    binPath: string;
    slus: Buffer;
    waMrg: Buffer;
    discSerial: string;
    exeLayout: import("../scripts/extract/types.ts").ExeLayout;
  };
  const matches: Match[] = [];
  for (const binPath of binPaths) {
    try {
      const { slus, waMrg, serial: discSerial } = loadDiscData(binPath);
      const exeLayout = detectExeLayout(slus);
      const binStats = slus.subarray(exeLayout.cardStats, exeLayout.cardStats + CARD_STATS_SIZE);
      const binHash = computeGameDataHash(binStats);
      if (binHash === gameDataHash) {
        matches.push({ binPath, slus, waMrg, discSerial, exeLayout });
      } else {
        console.log(
          `Hash mismatch for ${binPath} (disc=${discSerial}): ` +
            `bin=${binHash.slice(0, 12)}… vs ram=${gameDataHash.slice(0, 12)}…`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Skipping unreadable .bin ${binPath}: ${msg}`);
    }
  }

  if (matches.length === 0) return null;

  // Prefer the disc whose EXE contains the RAM serial (handles mods where
  // the ISO filename differs from the serial embedded in the EXE code).
  const normalRam = ramSerial ? normalizeSerial(ramSerial) : null;
  const preferred = normalRam
    ? (matches.find((m) => {
        const exeSerial = findSerialInExe(m.slus);
        return exeSerial != null && normalizeSerial(exeSerial) === normalRam;
      }) ?? matches.find((m) => normalizeSerial(m.discSerial) === normalRam))
    : undefined;
  const best = preferred ?? matches[0];
  if (!best) return null;
  console.log(
    `Matched .bin: ${best.binPath} (disc serial: ${best.discSerial}` +
      `${matches.length > 1 ? `, ${matches.length} candidates` : ""})`,
  );

  try {
    const { slus, waMrg, discSerial, exeLayout } = best;
    const waMrgLayout = detectWaMrgLayout(waMrg);
    const langIdx = langIdxForSerial(discSerial);
    const cardAttributes = detectAttributeMapping(slus, exeLayout, langIdx);
    const waMrgTextBlocks = exeLayout.nameOffsetTable === -1 ? findAllWaMrgTextBlocks(waMrg) : [];
    const cards = extractCards(
      slus,
      waMrg,
      exeLayout,
      waMrgLayout,
      cardAttributes,
      waMrgTextBlocks,
      langIdx,
    );
    const duelists = extractDuelists(slus, waMrg, exeLayout, waMrgLayout, waMrgTextBlocks, langIdx);
    const fusions = extractFusions(waMrg, waMrgLayout);
    const equips = extractEquips(waMrg, waMrgLayout);

    if (artworkDir) {
      extractAllArtworkAsPng(waMrg, waMrgLayout.artworkBlockSize, artworkDir);
      console.log(`Extracted ${cards.length} artwork PNGs to ${artworkDir}`);
    }

    return {
      gameDataHash,
      gameSerial: discSerial,
      cardStats,
      cards,
      duelists,
      fusionTable: fusions,
      equipTable: equips,
      fieldBonusTable: null, // populated from RAM by serve.ts
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to extract from ${best.binPath}: ${msg}`);
    return null;
  }
}
