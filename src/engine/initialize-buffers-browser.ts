import type { Collection } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import {
  loadGameDataFromStrings,
  loadGameDataWithBridgeTables,
} from "./data/load-game-data-core.ts";
import { DEFAULT_MOD, type ModId } from "./mods.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";
import { MAX_COPIES } from "./types/constants.ts";
import type { BridgeGameData } from "./worker/messages.ts";

type CsvCache = { cards: string; fusions: string; equips: string };
const csvCache = new Map<ModId, CsvCache>();

/** Fetch CSV game data for a mod. Safe to call multiple times — only fetches once per mod. */
export async function ensureCsvLoaded(modId: ModId = DEFAULT_MOD): Promise<void> {
  if (csvCache.has(modId)) return;
  const [cards, fusions, equips] = await Promise.all([
    fetch(`/data/${modId}/cards.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/fusions.csv`).then((r) => r.text()),
    fetch(`/data/${modId}/equips.csv`).then((r) => r.text()),
  ]);
  csvCache.set(modId, { cards, fusions, equips });
}

function getCsvCache(modId: ModId = DEFAULT_MOD): CsvCache {
  const cached = csvCache.get(modId);
  if (!cached)
    throw new Error(`CSV data not loaded for mod "${modId}". Call ensureCsvLoaded() first.`);
  return cached;
}

/**
 * Browser-compatible initialization pipeline.
 * Caller must `await ensureCsvLoaded(modId)` before calling this.
 * When `gameData` is provided, fusion/equip tables come from the bridge
 * instead of CSV files. Cards CSV is always used for ATK values.
 */
export function initializeBuffersBrowser(
  collection: Collection,
  rand: () => number,
  modId: ModId = DEFAULT_MOD,
  gameData?: BridgeGameData,
): OptBuffers {
  const { buf, cards } = initializeBrowserGameBuffers(rand, modId, gameData);
  for (const card of cards) {
    buf.availableCounts[card.id] = Math.min(collection.get(card.id) ?? 0, MAX_COPIES);
  }
  buildInitialDeck(buf, cards);
  return buf;
}

export function initializeSuggestionBuffersBrowser(
  rand: () => number,
  modId: ModId = DEFAULT_MOD,
  gameData?: BridgeGameData,
): OptBuffers {
  return initializeBrowserGameBuffers(rand, modId, gameData).buf;
}

function initializeBrowserGameBuffers(rand: () => number, modId: ModId, gameData?: BridgeGameData) {
  const csv = getCsvCache(modId);
  const buf = createBuffers();
  const cards = gameData
    ? loadGameDataWithBridgeTables(buf, csv.cards, gameData.fusionTable, gameData.equipTable)
    : loadGameDataFromStrings(buf, csv.cards, csv.fusions, csv.equips);
  generateHandSlots(buf, rand);
  buildReverseLookup(buf);
  return { buf, cards };
}
