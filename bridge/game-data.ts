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
import {
  detectAttributeMapping,
  detectEquipBonuses,
  detectExeLayout,
} from "./extract/detect-exe.ts";
import { detectWaMrgLayout } from "./extract/detect-wamrg.ts";
import { findAllWaMrgTextBlocks } from "./extract/detect-wamrg-text.ts";
import { extractCards } from "./extract/extract-cards.ts";
import { extractDuelists } from "./extract/extract-duelists.ts";
import { extractEquips } from "./extract/extract-equips.ts";
import { extractFusions } from "./extract/extract-fusions.ts";
import { extractAllArtworkAsPng } from "./extract/extract-images.ts";
import { langIdxForSerial, loadDiscData } from "./extract/index.ts";
import { buildPerEquipBonuses } from "./extract/parse-equip-bonus.ts";
import type {
  CardStats,
  DuelistData,
  EquipBonusConfig,
  EquipEntry,
  Fusion,
} from "./extract/types.ts";
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
  const gameDataHash = computeGameDataHash(cardStats);
  const hashPrefix = gameDataHash.slice(0, 12);
  const artworkDir = join(cacheDir, "artwork", hashPrefix);

  // Single source of truth: every call re-scans DuckStation's game dirs, picks
  // the ISO the emulator currently has locked, and extracts content from THAT
  // file. There is no content cache — caching a stale snapshot would let
  // `GameData.duelists` (what the UI displays) drift from `GameData.discPath`
  // (what edit writes patch), which caused real bugs when two byte-identical
  // ISOs sat in the same folder. Artwork PNGs are the only thing we still
  // cache on disk (keyed by content hash) since re-extracting 722 PNGs is
  // genuinely expensive; content parsing is cheap (< 200 ms on a cold read).
  const { cuePaths, isoPaths } = findDiscImages(pid);
  const discPaths = [...cuesToBins(cuePaths), ...isoPaths];

  if (discPaths.length === 0) {
    console.warn("No disc images found in DuckStation game directories");
    return null;
  }

  const data = await extractFromDiscs(discPaths, gameDataHash, cardStats, serial, artworkDir);

  if (data) {
    console.log(
      `Game data acquired from ${data.discPath}: ${data.cards.length} cards, ${data.duelists.length} duelists, ${data.fusionTable.length} fusions, ${data.equipTable.length} equips`,
    );
    return data;
  }

  console.warn("No matching disc image found in DuckStation gamelist");
  return null;
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
  type Match = {
    binPath: string;
    slus: Buffer;
    waMrg: Buffer;
    discSerial: string;
    exeLayout: import("./extract/types.ts").ExeLayout;
  };
  const matches: Match[] = [];
  for (const binPath of discPaths) {
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

  // Prefer, in order: (1) the match DuckStation currently has open (the
  // definitive signal when two ISOs share content), (2) the match whose EXE
  // serial matches RAM, (3) first match.
  const lockedPaths = await probeLockedIsos(matches.map((m) => m.binPath));
  const lockedMatch = matches.find((m) => lockedPaths.has(m.binPath));
  const normalRam = ramSerial ? normalizeSerial(ramSerial) : null;
  const serialMatch = normalRam
    ? (matches.find((m) => {
        const exeSerial = findSerialInExe(m.slus);
        return exeSerial != null && normalizeSerial(exeSerial) === normalRam;
      }) ?? matches.find((m) => normalizeSerial(m.discSerial) === normalRam))
    : undefined;
  const best = lockedMatch ?? serialMatch ?? matches[0];
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
    const equipBonuses = detectEquipBonuses(slus);
    const perEquipBonuses = buildPerEquipBonuses(cards, equips);

    if (artworkDir && !existsSync(join(artworkDir, "001.png"))) {
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
      equipBonuses,
      perEquipBonuses,
      fieldBonusTable: null, // populated from RAM by serve.ts
      discPath: best.binPath,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to extract from ${best.binPath}: ${msg}`);
    return null;
  }
}
