/**
 * Game data acquisition from disc image (.bin).
 *
 * Resolves the .bin path for the running game via DuckStation's gamelist
 * cache, extracts all game data (cards, duelists, fusions, equips) from
 * the disc image, and manages an on-disk cache keyed per-disc (see
 * `artworkCacheKey`).
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
import { extractRankScoring } from "./extract/extract-rank-scoring.ts";
import { langIdxForSerial, loadDiscData, readDiscExe } from "./extract/index.ts";
import { buildPerEquipBonuses } from "./extract/parse-equip-bonus.ts";
import type {
  CardStats,
  DuelistData,
  EquipBonusConfig,
  EquipEntry,
  Fusion,
  RankScoringData,
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
  /** Rank threshold table extracted from the active disc image, or null if not found. */
  rankScoring: RankScoringData | null;
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
/**
 * Result of `acquireGameData`. `ambiguous` is the case the caller MUST handle
 * specially — surface the candidate paths to the user and refuse any ISO
 * write — instead of silently falling back to "no data" or guessing.
 */
export type AcquireGameDataResult =
  | { kind: "ok"; data: GameData }
  | { kind: "ambiguous"; candidates: string[] }
  | { kind: "none" };

export async function acquireGameData(
  cardStats: Uint8Array,
  serial: string | null,
  cacheDir: string,
  pid?: number,
): Promise<AcquireGameDataResult> {
  const t0 = performance.now();
  const gameDataHash = computeGameDataHash(cardStats);

  const { cuePaths, isoPaths } = findDiscImages(pid);
  const discPaths = [...cuesToBins(cuePaths), ...isoPaths];

  if (discPaths.length === 0) {
    console.warn("No disc images found in DuckStation game directories");
    return { kind: "none" };
  }

  // Resolve the active disc up front. Both the gamedata JSON cache and the
  // artwork PNG dir live under a key that includes `discPath`, so sibling
  // ISOs that share the EXE hash but differ in WA_MRG can't bleed into each
  // other's cache (see `artworkCacheKey` for the rationale).
  const match = await pickWinningDisc(discPaths, gameDataHash, serial);
  if (match.kind === "ambiguous") {
    console.warn(
      `Disc resolution ambiguous — ${match.candidates.length} candidates: ${match.candidates.join(" | ")}`,
    );
    return { kind: "ambiguous", candidates: match.candidates };
  }
  if (match.kind === "none") {
    console.warn("No matching disc image found in DuckStation gamelist");
    return { kind: "none" };
  }

  const dirKey = artworkCacheKey(gameDataHash, match.binPath);
  const artworkDir = join(cacheDir, "artwork", dirKey);

  const cached = readGameDataCache(artworkDir);
  if (cached) {
    console.log(
      `Game data loaded from cache (${dirKey}) — disc: ${match.binPath} — total ${ms(performance.now() - t0)}`,
    );
    return {
      kind: "ok",
      data: buildGameDataFromCache(gameDataHash, cardStats, cached, match.binPath),
    };
  }

  const result = extractFromWinner(match, gameDataHash, cardStats, artworkDir, dirKey);
  if (result.kind === "none") return { kind: "none" };

  const { data } = result;
  writeGameDataCache(artworkDir, {
    gameSerial: data.gameSerial,
    cards: data.cards,
    duelists: data.duelists,
    fusionTable: data.fusionTable,
    equipTable: data.equipTable,
    equipBonuses: data.equipBonuses,
    perEquipBonuses: data.perEquipBonuses,
    deckLimits: data.deckLimits,
    rankScoring: data.rankScoring,
  });
  console.log(
    `Game data acquired from ${data.discPath}: ${data.cards.length} cards, ${data.duelists.length} duelists, ${data.fusionTable.length} fusions, ${data.equipTable.length} equips — total ${ms(performance.now() - t0)}`,
  );
  return result;
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
    rankScoring: cached.rankScoring,
    fieldBonusTable: null, // populated from RAM by serve.ts
    discPath,
  };
}

// ── Hash ──────────────────────────────────────────────────────────

/** SHA-256 hex digest of the card stats table. */
export function computeGameDataHash(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Per-disc cache directory key. Keyed on `gameDataHash` AND `discPath` — the
 * hash alone collides across sibling ISOs that share the EXE card-stats table
 * but differ in WA_MRG content (e.g. Alpha Mod vs a BEWD-test sibling). Using
 * only the hash caused both the gamedata JSON cache and the artwork PNG dir
 * to bleed across siblings: drop-pool edits written to one ISO could be
 * served out of the other's cache on the next boot. Including `discPath`
 * gives each disc image its own bucket, making the collision structurally
 * impossible.
 */
export function artworkCacheKey(gameDataHash: string, discPath: string): string {
  const pathHash = createHash("sha256").update(discPath).digest("hex").slice(0, 8);
  return `${gameDataHash.slice(0, 12)}-${pathHash}`;
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
 * Extract all game data from a disc whose identity has already been resolved
 * upstream (via `pickWinningDisc`). Keeping the disc-selection decision out
 * of this function means we only probe OS locks and re-read EXEs once per
 * `acquireGameData` call instead of twice.
 */
function extractFromWinner(
  match: Extract<DiscMatchResult, { kind: "winner" }>,
  gameDataHash: string,
  cardStats: Uint8Array,
  artworkDir: string,
  dirKey: string,
): { kind: "ok"; data: GameData } | { kind: "none" } {
  const suffix =
    (match.discSerial ? `disc serial: ${match.discSerial}` : "trusted single lock") +
    (match.candidateCount > 1 ? `, ${match.candidateCount} candidates` : "");
  console.log(`Matched .bin: ${match.binPath} (${suffix})`);

  try {
    const { slus, waMrg, serial: discSerial } = loadDiscData(match.binPath);
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
    const rankScoring = extractRankScoring(readFileSync(match.binPath));

    startArtworkExtraction(dirKey, artworkDir, waMrg, waMrgLayout.artworkBlockSize);

    return {
      kind: "ok",
      data: {
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
        rankScoring,
        fieldBonusTable: null, // populated from RAM by serve.ts
        discPath: match.binPath,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to extract from ${match.binPath}: ${msg}`);
    return { kind: "none" };
  }
}

export interface DiscCandidate {
  binPath: string;
  discSerial: string;
  exeSerial: string | null;
}

/**
 * Outcome of resolving which on-disk image corresponds to the game in RAM.
 *
 * `ambiguous` is the load-bearing case: when multiple discs match the
 * card-stats hash and no positive identifier (lock, unique RAM-serial match)
 * narrows them down, callers MUST refuse to operate on any of them. Picking
 * one arbitrarily would silently route ISO edits to the wrong file — see the
 * incident write-up at the top of `pickWinningDisc`.
 */
export type DiscMatchResult =
  | {
      kind: "winner";
      binPath: string;
      /** Serial from the disc EXE, or null when we trusted the lock without an EXE read. */
      discSerial: string | null;
      candidateCount: number;
    }
  | { kind: "ambiguous"; candidates: string[] }
  | { kind: "none" };

/**
 * Pure decision: given the list of disc paths, the locked subset, the
 * hash-matching candidates, and the RAM serial, return the winning disc — or
 * `ambiguous` when no positive identifier picks a unique one.
 *
 * Selection precedence (each rule must *uniquely* identify a disc; otherwise
 * fall through):
 *   1. Lock probe — exactly one file held by another process and present in
 *      `discPaths`. RAM came from that same emulator, so the lock IS the
 *      authoritative signal.
 *   2. Hash — exactly one `discPaths` entry matches `gameDataHash`.
 *   3. RAM serial — exactly one hash-matching candidate's EXE serial equals
 *      the RAM serial.
 *
 * Unlike the previous implementation, there is no "best guess" fallback:
 * when none of the rules narrow to one candidate, the result is `ambiguous`
 * and the bridge surfaces the candidate paths to the user. This is what
 * prevents the cross-ISO contamination bug where two byte-identical-EXE
 * mods sat in the same DuckStation games dir.
 */
export function decideDiscMatch(
  discPaths: readonly string[],
  lockedPaths: ReadonlySet<string>,
  hashCandidates: readonly DiscCandidate[],
  ramSerial: string | null | undefined,
): DiscMatchResult {
  // Rule 1: a single lock among our candidates is decisive.
  const lockedKnown = [...lockedPaths].filter((p) => discPaths.includes(p));
  if (lockedKnown.length === 1) {
    const [path] = lockedKnown;
    if (path !== undefined) {
      const matched = hashCandidates.find((c) => c.binPath === path);
      return {
        kind: "winner",
        binPath: path,
        discSerial: matched?.discSerial ?? null,
        candidateCount: Math.max(hashCandidates.length, 1),
      };
    }
  }

  if (hashCandidates.length === 0) return { kind: "none" };

  // Rule 2: a single hash match is decisive.
  if (hashCandidates.length === 1) {
    const [only] = hashCandidates;
    if (only !== undefined) {
      return {
        kind: "winner",
        binPath: only.binPath,
        discSerial: only.discSerial,
        candidateCount: 1,
      };
    }
  }

  // Rule 3: among multiple hash matches, the RAM serial uniquely picks one.
  // Common case where this helps: a single mod with both .iso and .bin/.cue
  // sitting in the games dir. Common case where it does NOT help (and we
  // must surface ambiguity): two byte-identical-EXE mods sharing the same
  // serial but differing in WA_MRG content.
  const normalRam = ramSerial ? normalizeSerial(ramSerial) : null;
  if (normalRam) {
    const matchByExe = hashCandidates.filter(
      (c) => c.exeSerial != null && normalizeSerial(c.exeSerial) === normalRam,
    );
    if (matchByExe.length === 1) {
      const [only] = matchByExe;
      if (only !== undefined) {
        return {
          kind: "winner",
          binPath: only.binPath,
          discSerial: only.discSerial,
          candidateCount: hashCandidates.length,
        };
      }
    }
    const matchByDisc = hashCandidates.filter((c) => normalizeSerial(c.discSerial) === normalRam);
    if (matchByDisc.length === 1) {
      const [only] = matchByDisc;
      if (only !== undefined) {
        return {
          kind: "winner",
          binPath: only.binPath,
          discSerial: only.discSerial,
          candidateCount: hashCandidates.length,
        };
      }
    }
  }

  return { kind: "ambiguous", candidates: hashCandidates.map((c) => c.binPath) };
}

/**
 * Resolve which candidate disc matches the running game, using EXE-only reads
 * for hash comparison instead of loading each full 500+ MB .bin. Probes OS
 * locks first: a single locked disc short-circuits the scan, turning the
 * common single-game case from N × full-read into 1 × EXE.
 *
 * Returns `ambiguous` rather than guessing when multiple discs match and no
 * lock or RAM-serial signal narrows them down. See `decideDiscMatch` for the
 * rationale — silently picking the first candidate previously caused saves
 * to be routed to the wrong ISO and stale data to appear in the UI.
 */
async function pickWinningDisc(
  discPaths: string[],
  gameDataHash: string,
  ramSerial: string | null | undefined,
): Promise<DiscMatchResult> {
  const lockedPaths = await probeLockedIsos(discPaths);

  // Trust-the-lock: a single locked candidate ends the search before we pay
  // the per-candidate EXE read (~2 s on Windows cold cache, mostly Defender).
  const lockedKnown = [...lockedPaths].filter((p) => discPaths.includes(p));
  if (lockedKnown.length === 1) {
    const [path] = lockedKnown;
    if (path !== undefined) {
      return { kind: "winner", binPath: path, discSerial: null, candidateCount: 1 };
    }
  }

  // No single lock: hash-disambiguate every candidate (locks first, in case
  // one of them turns out to be the only hash match — we prefer the one
  // DuckStation has open).
  const ordered = [...lockedKnown, ...discPaths.filter((p) => !lockedPaths.has(p))];
  const hashCandidates: DiscCandidate[] = [];
  for (const binPath of ordered) {
    const match = disambiguateDisc(binPath, gameDataHash);
    if (match) hashCandidates.push({ binPath, ...match });
  }

  return decideDiscMatch(discPaths, lockedPaths, hashCandidates, ramSerial);
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
