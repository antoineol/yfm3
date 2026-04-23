/**
 * Persistent disk cache for parsed disc content, keyed by gameDataHash.
 *
 * The hash is SHA-256 of the 2888-byte card-stats table read from RAM, which
 * deterministically identifies the game content. If the hash matches, the
 * cached cards/duelists/fusions/equips are byte-identical to what a fresh
 * extract would produce — so we can skip the full 500+ MB disc read on
 * repeat boots of the same mod.
 *
 * `discPath` is intentionally not cached: we resolve it fresh each call via
 * lock probing + EXE-only hash verification, because the file may have moved
 * or been replaced since the previous cache write.
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

const CACHE_VERSION = 2;
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
