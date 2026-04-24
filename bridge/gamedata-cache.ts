/**
 * Persistent disk cache for parsed disc content, keyed by gameDataHash.
 *
 * The hash is SHA-256 of the 2888-byte card-stats table read from RAM. It
 * deterministically identifies the EXE content — but NOT the drop tables in
 * WA_MRG.MRG. Two ISOs derived from the same base (e.g. an Alpha Mod and a
 * BEWD-test sibling with edited drops) have identical `gameDataHash` and
 * collide on this cache slot.
 *
 * To make the cache safe against that collision, we store `discPath` in the
 * cache file and `acquireGameData` invalidates (re-extracts) whenever the
 * current lock-probe winner's path doesn't match the cached one. Without
 * this, a cache hit would return whichever ISO happened to be extracted
 * last, silently serving the wrong drop tables — the root cause of the
 * "my edits disappeared" incident.
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
} from "./extract/types.ts";

const CACHE_VERSION = 4;
const CACHE_FILENAME = "gamedata.json";

export interface CachedGameData {
  gameSerial: string;
  /**
   * Absolute path of the disc image these tables were extracted from. Used
   * by `acquireGameData` to detect same-EXE-hash collisions: when two ISOs
   * share `gameDataHash` but differ in WA_MRG content, the cache slot can
   * be filled by either one, and only this path disambiguates.
   */
  discPath: string;
  cards: CardStats[];
  duelists: DuelistData[];
  fusionTable: Fusion[];
  equipTable: EquipEntry[];
  equipBonuses: EquipBonusConfig | null;
  perEquipBonuses: Record<number, number> | null;
  deckLimits: DeckLimits | null;
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
      discPath: parsed.discPath,
      cards: parsed.cards,
      duelists: parsed.duelists,
      fusionTable: parsed.fusionTable,
      equipTable: parsed.equipTable,
      equipBonuses: parsed.equipBonuses ?? null,
      perEquipBonuses: parsed.perEquipBonuses ?? null,
      deckLimits: parsed.deckLimits ?? null,
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
