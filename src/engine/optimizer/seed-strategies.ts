import { getConfig } from "../config.ts";
import { FUSION_NONE, MAX_CARD_ID, MAX_COPIES } from "../types/constants.ts";

/** Sparse cardId → cap map; missing cards fall back to `MAX_COPIES`. */
export type DeckLimitsMap = Readonly<Record<number, number>>;

export interface SeedGameData {
  readonly cardAtk: Int16Array;
  readonly fusionTable: Int16Array;
  readonly equipCompat: Uint8Array;
}

/**
 * Generate initial decks for multi-start SA.
 *
 * - Worker 0: no initialDeck (uses the greedy seed built by initializeBuffersBrowser)
 * - Worker 1: current deck, when it exactly matches the optimized scoring slots
 * - Next worker: deterministic fusion/equip/ATK-weighted seed when game data is available
 * - Remaining workers: biased-random valid decks
 *
 * @param collectionRecord  cardId → quantity owned
 * @param numWorkers        total number of workers
 * @param rand              seeded PRNG returning values in [0, 1)
 * @param deckLimits        optional per-card cap overrides (absent → cap of 3)
 * @returns array of length numWorkers; element 0 is undefined (greedy default)
 */
export function generateInitialDecks(
  collectionRecord: Record<number, number>,
  numWorkers: number,
  rand: () => number,
  deckLimits?: DeckLimitsMap,
  gameData?: SeedGameData,
  currentDeck?: number[],
): Array<number[] | undefined> {
  const pool = buildPool(collectionRecord, deckLimits, gameData);
  const decks: Array<number[] | undefined> = new Array(numWorkers);
  const seen = new Set<string>();

  // Worker 0: greedy (no override)
  decks[0] = undefined;

  let nextWorker = 1;
  if (currentDeck && nextWorker < numWorkers) {
    decks[nextWorker] = currentDeck;
    rememberDeck(currentDeck, seen);
    nextWorker++;
  }

  if (nextWorker < numWorkers) {
    decks[nextWorker] = gameData
      ? buildWeightedDeck(pool)
      : buildUniqueRandomDeck(pool, rand, seen);
    rememberDeck(decks[nextWorker], seen);
    nextWorker++;
  }

  for (let i = nextWorker; i < numWorkers; i++) {
    decks[i] = buildUniqueRandomDeck(pool, rand, seen);
  }

  return decks;
}

/** Card entry in the pool with id and max usable copies. */
interface PoolEntry {
  id: number;
  maxCopies: number;
  weight: number;
}

/** Build pool entries from the collection record, capped at the per-card limit (or MAX_COPIES). */
function buildPool(
  collectionRecord: Record<number, number>,
  deckLimits: DeckLimitsMap | undefined,
  gameData: SeedGameData | undefined,
): PoolEntry[] {
  const basePool: PoolEntry[] = [];
  for (const key in collectionRecord) {
    const id = Number(key);
    const qty = collectionRecord[key] ?? 0;
    const cap = deckLimits?.[id] ?? MAX_COPIES;
    const maxCopies = Math.min(qty, cap);
    if (maxCopies > 0) {
      basePool.push({ id, maxCopies, weight: 1 });
    }
  }

  if (!gameData) return basePool;

  for (const entry of basePool) {
    entry.weight = computeSeedWeight(entry.id, basePool, gameData);
  }
  return basePool;
}

function computeSeedWeight(id: number, pool: PoolEntry[], gameData: SeedGameData): number {
  let partners = 0;
  for (const other of pool) {
    const otherId = other.id;
    if (
      gameData.fusionTable[id * MAX_CARD_ID + otherId] !== FUSION_NONE ||
      gameData.equipCompat[id * MAX_CARD_ID + otherId] ||
      gameData.equipCompat[otherId * MAX_CARD_ID + id]
    ) {
      partners++;
    }
  }

  const atk = Math.max(gameData.cardAtk[id] ?? 0, 0);
  return Math.max(1, atk + partners * 200);
}

function buildWeightedDeck(pool: PoolEntry[]): number[] {
  const { deckSize } = getConfig();
  const sorted = [...pool].sort((a, b) => b.weight - a.weight || b.maxCopies - a.maxCopies);
  const deck: number[] = [];
  const counts = new Map<number, number>();

  for (const entry of sorted) {
    if (deck.length >= deckSize) break;
    const used = counts.get(entry.id) ?? 0;
    const canAdd = Math.min(entry.maxCopies - used, deckSize - deck.length);
    for (let c = 0; c < canAdd; c++) {
      deck.push(entry.id);
    }
    counts.set(entry.id, used + canAdd);
  }

  return deck;
}

function buildUniqueRandomDeck(pool: PoolEntry[], rand: () => number, seen: Set<string>): number[] {
  let deck = buildBiasedRandomDeck(pool, rand);
  for (let attempt = 0; attempt < 10 && seen.has(deckKey(deck)); attempt++) {
    deck = buildBiasedRandomDeck(pool, rand);
  }
  rememberDeck(deck, seen);
  return deck;
}

function buildBiasedRandomDeck(pool: PoolEntry[], rand: () => number): number[] {
  const { deckSize } = getConfig();
  const deck: number[] = [];
  const counts = new Map<number, number>();

  while (deck.length < deckSize) {
    const entry = selectAvailableEntry(pool, counts, rand);
    if (!entry) break;
    deck.push(entry.id);
    counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
  }

  return deck;
}

function selectAvailableEntry(
  pool: PoolEntry[],
  counts: Map<number, number>,
  rand: () => number,
): PoolEntry | null {
  let totalWeight = 0;
  for (const entry of pool) {
    const remaining = entry.maxCopies - (counts.get(entry.id) ?? 0);
    if (remaining > 0) totalWeight += entry.weight * remaining;
  }
  if (totalWeight <= 0) return null;

  let target = rand() * totalWeight;
  for (const entry of pool) {
    const remaining = entry.maxCopies - (counts.get(entry.id) ?? 0);
    if (remaining <= 0) continue;
    target -= entry.weight * remaining;
    if (target <= 0) return entry;
  }
  return null;
}

function rememberDeck(deck: number[] | undefined, seen: Set<string>): void {
  if (deck) seen.add(deckKey(deck));
}

function deckKey(deck: number[]): string {
  return [...deck].sort((a, b) => a - b).join(",");
}
