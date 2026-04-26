/**
 * Persistent disk cache for parsed disc content.
 *
 * The cache dir is keyed by `artworkCacheKey(gameDataHash, discPath)`, so
 * each disc image gets its own bucket. This structurally prevents the
 * same-EXE-hash collision that caused the "my edits disappeared" incident:
 * two ISOs derived from the same base (e.g. Alpha Mod + a BEWD-test
 * sibling) used to share a single cache slot keyed on the RAM card-stats
 * hash alone, letting whichever extracted last silently serve its drop
 * tables to the other.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DeckLimits } from "./extract/extract-deck-limits.ts";
import type {
  CardStats,
  DuelistData,
  EquipBonusConfig,
  EquipEntry,
  Fusion,
  RankScoringData,
} from "./extract/types.ts";

const CACHE_VERSION = 6;
const CACHE_FILENAME = "gamedata.json";

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
}

export function readGameDataCache(artworkDir: string): CachedGameData | null {
  const cachePath = join(artworkDir, CACHE_FILENAME);
  if (!existsSync(cachePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(cachePath, "utf-8")) as CacheFile;
    if (parsed.version !== CACHE_VERSION) return null;
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

export function writeGameDataCache(artworkDir: string, data: CachedGameData): void {
  try {
    mkdirSync(artworkDir, { recursive: true });
    const content: CacheFile = { version: CACHE_VERSION, ...data };
    writeFileSync(join(artworkDir, CACHE_FILENAME), JSON.stringify(content));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to write gamedata cache in ${artworkDir}: ${msg}`);
  }
}
