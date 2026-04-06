import { getConfig } from "./config.ts";
import type { CardSpec, Collection } from "./data/card-model.ts";
import { applyFieldBonus } from "./data/field-bonus.ts";
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

/** Fetch CSV game data for a mod. Safe to call multiple times — only fetches once per mod.
 *  When bridge gameData is available, CSVs are unnecessary — skip the fetch. */
export async function ensureCsvLoaded(
  modId: ModId = DEFAULT_MOD,
  hasGameData = false,
): Promise<void> {
  if (hasGameData) return;
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
 * When `gameData` is provided, all data comes from the bridge (no CSV).
 * Otherwise caller must `await ensureCsvLoaded(modId)` before calling this.
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
  const buf = createBuffers();
  let cards: CardSpec[];
  if (gameData) {
    cards = loadGameDataWithBridgeTables(
      buf,
      gameData.cards,
      gameData.fusionTable,
      gameData.equipTable,
    );
  } else {
    const csv = getCsvCache(modId);
    cards = loadGameDataFromStrings(buf, csv.cards, csv.fusions, csv.equips);
  }
  const { terrain } = getConfig();
  if (terrain > 0) {
    for (const card of cards) {
      buf.cardAtk[card.id] = applyFieldBonus(card.attack, terrain, card.cardType);
    }
  }
  generateHandSlots(buf, rand);
  buildReverseLookup(buf);
  return { buf, cards };
}
