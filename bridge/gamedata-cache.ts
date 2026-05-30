/**
 * Persistent disk cache for parsed disc content.
 *
 * The cache dir is keyed by `artworkCacheKey(gameDataHash, discPath)`, and
 * each cache file records the source disc's size + mtime. The key prevents
 * sibling discs from sharing data; the signature prevents a changed BIN at
 * the same path from serving stale WA_MRG-derived data.
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cardTypes, guardianStars, nonMonsterCardTypes } from "../src/engine/data/rp-types.ts";
import type { DeckLimits } from "./extract/extract-deck-limits.ts";
import type {
  CardStats,
  DuelistData,
  EquipBonusConfig,
  EquipEntry,
  Fusion,
  RankScoringData,
} from "./extract/types.ts";
import { NUM_CARDS } from "./extract/types.ts";

const CACHE_VERSION = 16;
const CACHE_FILENAME = "gamedata.json";
const CARD_TYPE_NAMES = new Set<string>(cardTypes);
const GUARDIAN_STAR_NAMES = new Set<string>(guardianStars);
const NON_MONSTER_TYPE_NAMES = new Set<string>(nonMonsterCardTypes);

interface DiscCacheSignature {
  size: number;
  mtimeMs: number;
}

export interface CachedGameData {
  gameSerial: string;
  cards: CardStats[];
  duelists: DuelistData[];
  fusionTable: Fusion[];
  equipTable: EquipEntry[];
  equipBonuses: EquipBonusConfig | null;
  perEquipBonuses: Record<number, number> | null;
  deckLimits: DeckLimits | null;
  rankScoring: RankScoringData | null;
}

interface CacheFile extends CachedGameData {
  version: number;
  disc: DiscCacheSignature;
}

export function readGameDataCache(artworkDir: string, discPath: string): CachedGameData | null {
  const cachePath = join(artworkDir, CACHE_FILENAME);
  if (!existsSync(cachePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(cachePath, "utf-8")) as CacheFile;
    if (parsed.version !== CACHE_VERSION) return null;
    if (!sameDiscSignature(parsed.disc, discSignature(discPath))) return null;
    if (!hasUsableCardMetadata(parsed.cards)) return null;
    return {
      gameSerial: parsed.gameSerial,
      cards: parsed.cards,
      duelists: parsed.duelists,
      fusionTable: parsed.fusionTable,
      equipTable: parsed.equipTable,
      equipBonuses: parsed.equipBonuses ?? null,
      perEquipBonuses: parsed.perEquipBonuses ?? null,
      deckLimits: parsed.deckLimits ?? null,
      rankScoring: parsed.rankScoring ?? null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Ignoring malformed gamedata cache at ${cachePath}: ${msg}`);
    return null;
  }
}

function hasUsableCardMetadata(cards: CardStats[]): boolean {
  if (cards.length !== NUM_CARDS) return false;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card || card.id !== i + 1) return false;
    if (!CARD_TYPE_NAMES.has(card.type)) return false;
    if (hasStats(card) && NON_MONSTER_TYPE_NAMES.has(card.type)) return false;
    if (CARD_TYPE_NAMES.has(card.gs1) || CARD_TYPE_NAMES.has(card.gs2)) return false;
    if (!GUARDIAN_STAR_NAMES.has(card.gs1) || !GUARDIAN_STAR_NAMES.has(card.gs2)) return false;
  }
  return true;
}

function hasStats(card: CardStats): boolean {
  return card.atk > 0 || card.def > 0;
}

export function writeGameDataCache(
  artworkDir: string,
  discPath: string,
  data: CachedGameData,
): void {
  try {
    mkdirSync(artworkDir, { recursive: true });
    const content: CacheFile = { version: CACHE_VERSION, disc: discSignature(discPath), ...data };
    writeFileSync(join(artworkDir, CACHE_FILENAME), JSON.stringify(content));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to write gamedata cache in ${artworkDir}: ${msg}`);
  }
}

function discSignature(discPath: string): DiscCacheSignature {
  const stat = statSync(discPath);
  return { size: stat.size, mtimeMs: stat.mtimeMs };
}

function sameDiscSignature(
  cached: DiscCacheSignature | undefined,
  current: DiscCacheSignature,
): boolean {
  return cached?.size === current.size && cached.mtimeMs === current.mtimeMs;
}
