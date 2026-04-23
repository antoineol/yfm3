/**
 * Game data acquisition from disc image (.bin).
 *
 * Resolves the .bin path for the running game via DuckStation's gamelist
 * cache, extracts all game data (cards, duelists, fusions, equips) from
 * the disc image, and manages a single-entry disk cache keyed by
 * gameDataHash (SHA-256 of card stats).
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { startArtworkExtraction } from "./artwork-extraction.ts";
import {
  detectAttributeMapping,
  detectEquipBonuses,
  detectExeLayout,
} from "./extract/detect-exe.ts";
import { detectWaMrgLayout } from "./extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./extract/detect-wamrg-text.ts";
import { extractCards } from "./extract/extract-cards.ts";
import { type DeckLimits, extractDeckLimits } from "./extract/extract-deck-limits.ts";
import { extractDuelists } from "./extract/extract-duelists.ts";
import { extractEquips } from "./extract/extract-equips.ts";
import { extractFusions } from "./extract/extract-fusions.ts";
import { langIdxForSerial, loadDiscData, readDiscExe } from "./extract/index.ts";
import { buildPerEquipBonuses } from "./extract/parse-equip-bonus.ts";
import type {
  CardStats,
  DuelistData,
  EquipBonusConfig,
  EquipEntry,
  Fusion,
} from "./extract/types.ts";
import { type CachedGameData, readGameDataCache, writeGameDataCache } from "./gamedata-cache.ts";
import { probeLockedIsos } from "./iso-lock-probe.ts";
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
  /** Equip bonus values read from the EXE, or null if detection failed. */
  equipBonuses: EquipBonusConfig | null;
  /** Per-equip ATK bonuses parsed from card descriptions (equipId → bonus). */
  perEquipBonuses: Record<number, number> | null;
  /**
   * Per-card deck-copy limit (cardId → 1 or 2). Cards absent from this map
   * default to 3. `null` when the mod doesn't ship a limit dispatcher.
   */
  deckLimits: DeckLimits | null;
  /**
   * Field bonus table: 120 actual bonus values (e.g., 500, -500, 0).
   * 20 monster types × 6 non-Normal terrains, indexed as type * 6 + (terrain - 1).
   * Terrains 1–6 = Forest, Wasteland, Mountain, Sogen, Umi, Yami.
   * null when not available (table not found in RAM or disc).
   */
  fieldBonusTable: number[] | null;
  /**
   * Absolute path to the matched disc image. Bridge-only — never broadcast to
   * the UI. The Data > Edit flow uses this to write patches in place.
   */
  discPath: string;
}

// ── Constants ─────────────────────────────────────────────────────

const CARD_STATS_SIZE = 722 * 4; // 2888 bytes — must match memory.ts

// ── Main entry point ──────────────────────────────────────────────

/**
 * Acquire all game data for the running game.
 *
 * @param cardStats  Snapshot of 2888-byte card stats from RAM
 * @param serial     Game serial from RAM (e.g. "SLES_039.48"), or null
 * @param cacheDir   Directory for the cache file
 * @param pid        Optional running DuckStation PID, used for portable mode settings detection
 */
export async function acquireGameData(
  cardStats: Uint8Array,
  serial: string | null,
  cacheDir: string,
  pid?: number,
): Promise<GameData | null> {
  const t0 = performance.now();
  const gameDataHash = computeGameDataHash(cardStats);
  const hashPrefix = gameDataHash.slice(0, 12);
  const artworkDir = join(cacheDir, "artwork", hashPrefix);

  // Disc content is cached on disk keyed by gameDataHash (see
  // gamedata-cache.ts). `discPath` is never cached — we always re-resolve
  // it from DuckStation's game dirs so it matches the file the emulator
  // currently has locked. Past bug to avoid: caching `discPath` alongside
  // content let the two drift when two byte-identical ISOs sat in the same
  // folder. Hash-keyed content is safe (identical hash ⇒ identical bytes);
  // only the path needs fresh resolution.
  const { cuePaths, isoPaths } = findDiscImages(pid);
  const discPaths = [...cuesToBins(cuePaths), ...isoPaths];

  if (discPaths.length === 0) {
    console.warn("No disc images found in DuckStation game directories");
    return null;
  }

  const cached = readGameDataCache(artworkDir);
  if (cached) {
    const winner = await pickWinningDisc(discPaths, gameDataHash, serial);
    if (winner) {
      console.log(
        `Game data loaded from cache (${hashPrefix}) — disc: ${winner.binPath} — total ${ms(performance.now() - t0)}`,
      );
      return buildGameDataFromCache(gameDataHash, cardStats, cached, winner.binPath);
    }
    // Cache hit but no disc currently matches the hash — content may have
    // been modified since caching; fall through to a fresh extract below.
  }

  const data = await extractFromDiscs(discPaths, gameDataHash, cardStats, serial, artworkDir);

  if (data) {
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
    console.log(
      `Game data acquired from ${data.discPath}: ${data.cards.length} cards, ${data.duelists.length} duelists, ${data.fusionTable.length} fusions, ${data.equipTable.length} equips — total ${ms(performance.now() - t0)}`,
    );
    return data;
  }

  console.warn("No matching disc image found in DuckStation gamelist");
  return null;
}

function ms(duration: number): string {
  return `${duration.toFixed(1)}ms`;
}

function buildGameDataFromCache(
  gameDataHash: string,
  cardStats: Uint8Array,
  cached: CachedGameData,
  discPath: string,
): GameData {
  return {
    gameDataHash,
    gameSerial: cached.gameSerial,
    cardStats,
    cards: cached.cards,
    duelists: cached.duelists,
    fusionTable: cached.fusionTable,
    equipTable: cached.equipTable,
    equipBonuses: cached.equipBonuses,
    perEquipBonuses: cached.perEquipBonuses,
    deckLimits: cached.deckLimits,
    fieldBonusTable: null, // populated from RAM by serve.ts
    discPath,
  };
}

// ── Hash ──────────────────────────────────────────────────────────

/** SHA-256 hex digest of the card stats table. */
export function computeGameDataHash(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

// ── .cue file discovery ──────────────────────────────────────────

/**
 * Find all disc images by scanning DuckStation's configured game directories.
 * Reads `[GameList] RecursivePaths` from settings.ini — the same dirs
 * DuckStation scans, so results always match what the UI shows.
 * Returns .cue paths (to be resolved to .bin) and .iso paths (used directly).
 */
function findDiscImages(pid?: number): { cuePaths: string[]; isoPaths: string[] } {
  const settingsPath = findSettingsPath(pid);
  if (!settingsPath) {
    console.warn("DuckStation settings.ini not found");
    return { cuePaths: [], isoPaths: [] };
  }
  const content = readFileSync(settingsPath, "utf-8");
  const gameDirs = parseGameDirs(content);
  if (gameDirs.length === 0) {
    console.warn("No game directories in DuckStation settings.ini");
    return { cuePaths: [], isoPaths: [] };
  }
  const cues: string[] = [];
  const isos: string[] = [];
  for (const dir of gameDirs) scanForDiscImages(dir, cues, isos, 0);
  return { cuePaths: cues, isoPaths: isos };
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
function scanForDiscImages(dir: string, cues: string[], isos: string[], depth: number): void {
  if (depth > MAX_SCAN_DEPTH || !existsSync(dir)) return;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const lower = name.toLowerCase();
    const full = join(dir, name);
    if (lower.endsWith(".cue")) {
      cues.push(full);
    } else if (lower.endsWith(".iso")) {
      isos.push(full);
    } else {
      try {
        const stat = readdirSync(full); // throws if not a directory
        if (stat) scanForDiscImages(full, cues, isos, depth + 1);
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
 * Try each disc image candidate (.bin or .iso), disambiguate by card stats
 * hash, and extract all game data from the best match. Prefers the disc whose
 * EXE serial matches the RAM serial (handles mods with custom gamelist serials).
 */
async function extractFromDiscs(
  discPaths: string[],
  gameDataHash: string,
  cardStats: Uint8Array,
  ramSerial?: string | null,
  artworkDir?: string,
): Promise<GameData | null> {
  const winner = await pickWinningDisc(discPaths, gameDataHash, ramSerial);
  if (!winner) return null;

  const suffix =
    (winner.discSerial ? `disc serial: ${winner.discSerial}` : "trusted single lock") +
    (winner.candidateCount > 1 ? `, ${winner.candidateCount} candidates` : "");
  console.log(`Matched .bin: ${winner.binPath} (${suffix})`);

  try {
    const { slus, waMrg, serial: discSerial } = loadDiscData(winner.binPath);
    const exeLayout = detectExeLayout(slus);
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
    const equipBonuses = detectEquipBonuses(slus);
    const perEquipBonuses = buildPerEquipBonuses(cards, equips);
    const deckLimits = extractDeckLimits(slus);

    if (artworkDir) {
      startArtworkExtraction(
        gameDataHash.slice(0, 12),
        artworkDir,
        waMrg,
        waMrgLayout.artworkBlockSize,
      );
    }

    return {
      gameDataHash,
      gameSerial: discSerial,
      cardStats,
      cards,
      duelists,
      fusionTable: fusions,
      equipTable: equips,
      equipBonuses,
      perEquipBonuses,
      deckLimits,
      fieldBonusTable: null, // populated from RAM by serve.ts
      discPath: winner.binPath,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to extract from ${winner.binPath}: ${msg}`);
    return null;
  }
}

interface DiscCandidate {
  binPath: string;
  discSerial: string;
  exeSerial: string | null;
}

interface WinningDisc {
  binPath: string;
  /** Serial from the disc EXE, or null when we trusted the lock without an EXE read. */
  discSerial: string | null;
  candidateCount: number;
}

/**
 * Resolve which candidate disc matches the running game, using EXE-only reads
 * for hash comparison instead of loading each full 500+ MB .bin. Probes OS
 * locks first: a single locked disc with a matching hash short-circuits the
 * scan, turning the common single-game case from N × full-read into 1 × EXE.
 */
async function pickWinningDisc(
  discPaths: string[],
  gameDataHash: string,
  ramSerial: string | null | undefined,
): Promise<WinningDisc | null> {
  const lockedPaths = await probeLockedIsos(discPaths);

  // Trust-the-lock: when DuckStation has exactly one disc file open, that
  // file IS the running game (the RAM we hashed came from that same emulator).
  // Verifying it via `disambiguateDisc` re-reads the EXE from disk, and that
  // first read costs ~2 s on Windows (Defender scan on cold access). Skipping
  // it here is the single biggest latency win on both the cache-hit warm path
  // and the cold path — worth the negligible correctness risk.
  if (lockedPaths.size === 1) {
    const [path] = [...lockedPaths];
    if (path) return { binPath: path, discSerial: null, candidateCount: 1 };
  }

  // Ambiguous lock state (multiple locked, or none): fall back to hash
  // verification via EXE-only reads.
  if (lockedPaths.size > 0) {
    for (const path of lockedPaths) {
      const match = disambiguateDisc(path, gameDataHash);
      if (match) return { binPath: path, discSerial: match.discSerial, candidateCount: 1 };
    }
  }

  // Scan remaining candidates with EXE-only reads.
  const skip = lockedPaths;
  const candidates: DiscCandidate[] = [];
  for (const binPath of discPaths) {
    if (skip.has(binPath)) continue;
    const match = disambiguateDisc(binPath, gameDataHash);
    if (match) candidates.push({ binPath, ...match });
  }

  if (candidates.length === 0) return null;

  const normalRam = ramSerial ? normalizeSerial(ramSerial) : null;
  const serialMatch = normalRam
    ? (candidates.find((c) => c.exeSerial != null && normalizeSerial(c.exeSerial) === normalRam) ??
      candidates.find((c) => normalizeSerial(c.discSerial) === normalRam))
    : undefined;
  const best = serialMatch ?? candidates[0];
  if (!best) return null;
  return {
    binPath: best.binPath,
    discSerial: best.discSerial,
    candidateCount: candidates.length,
  };
}

/**
 * Lightweight disambiguation: read only the EXE from a disc, compute the
 * card-stats hash, and return serial info when it matches RAM. Returns null
 * on mismatch or read failure (errors logged, not thrown, so a single bad
 * disc doesn't abort the scan).
 */
function disambiguateDisc(
  binPath: string,
  gameDataHash: string,
): { discSerial: string; exeSerial: string | null } | null {
  try {
    const { slus, serial: discSerial } = readDiscExe(binPath);
    const exeLayout = detectExeLayout(slus);
    const binStats = slus.subarray(exeLayout.cardStats, exeLayout.cardStats + CARD_STATS_SIZE);
    const binHash = computeGameDataHash(binStats);
    if (binHash !== gameDataHash) {
      console.log(
        `Hash mismatch for ${binPath} (disc=${discSerial}): ` +
          `bin=${binHash.slice(0, 12)}… vs ram=${gameDataHash.slice(0, 12)}…`,
      );
      return null;
    }
    return { discSerial, exeSerial: findSerialInExe(slus) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Skipping unreadable .bin ${binPath}: ${msg}`);
    return null;
  }
}
