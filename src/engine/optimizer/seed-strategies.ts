import { getConfig } from "../config.ts";
import { MAX_COPIES } from "../types/constants.ts";

/** Sparse cardId → cap map; missing cards fall back to `MAX_COPIES`. */
export type DeckLimitsMap = Readonly<Record<number, number>>;

/**
 * Generate initial decks for multi-start SA.
 *
 * - Worker 0: no initialDeck (uses the greedy seed built by initializeBuffersBrowser)
 * - Worker 1: greedy seed with 10 random perturbations
 * - Workers 2+: fully random valid decks
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
): Array<number[] | undefined> {
  const pool = buildPool(collectionRecord, deckLimits);
  const decks: Array<number[] | undefined> = new Array(numWorkers);

  // Worker 0: greedy (no override)
  decks[0] = undefined;

  if (numWorkers > 1) {
    // Worker 1: greedy + perturbation — build a greedy-like deck then perturb
    const greedy = buildGreedyDeckFromPool(pool);
    decks[1] = perturbDeck(greedy, pool, 10, rand);
  }

  for (let i = 2; i < numWorkers; i++) {
    decks[i] = buildRandomDeck(pool, rand);
  }

  return decks;
}

/** Card entry in the pool with id and max usable copies. */
interface PoolEntry {
  id: number;
  maxCopies: number;
}

/** Build pool entries from the collection record, capped at the per-card limit (or MAX_COPIES). */
function buildPool(
  collectionRecord: Record<number, number>,
  deckLimits: DeckLimitsMap | undefined,
): PoolEntry[] {
  const pool: PoolEntry[] = [];
  for (const key in collectionRecord) {
    const id = Number(key);
    const qty = collectionRecord[key] ?? 0;
    const cap = deckLimits?.[id] ?? MAX_COPIES;
    const maxCopies = Math.min(qty, cap);
    if (maxCopies > 0) {
      pool.push({ id, maxCopies });
    }
  }
  return pool;
}

/**
 * Build a greedy-like deck from pool entries (sorted by id descending as a proxy —
 * the orchestrator doesn't have ATK data). This gives a deterministic starting point
 * for perturbation. The exact card order doesn't matter much since we perturb it.
 */
function buildGreedyDeckFromPool(pool: PoolEntry[]): number[] {
  const { deckSize } = getConfig();
  const sorted = [...pool].sort((a, b) => b.id - a.id);
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

/**
 * Perturb a deck by swapping `numSwaps` random slots with random cards from the pool.
 * Returns a new deck array.
 */
function perturbDeck(
  baseDeck: number[],
  pool: PoolEntry[],
  numSwaps: number,
  rand: () => number,
): number[] {
  const deck = [...baseDeck];
  const counts = new Map<number, number>();
  for (const id of deck) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  for (let s = 0; s < numSwaps; s++) {
    const slot = (rand() * deck.length) | 0;
    // Try a few times to find a valid replacement
    for (let attempt = 0; attempt < 10; attempt++) {
      const entry = pool[(rand() * pool.length) | 0];
      if (!entry) continue;
      const currentCount = counts.get(entry.id) ?? 0;
      if (currentCount < entry.maxCopies && entry.id !== deck[slot]) {
        // Remove old card
        const oldId = deck[slot] ?? 0;
        counts.set(oldId, (counts.get(oldId) ?? 0) - 1);
        // Add new card
        deck[slot] = entry.id;
        counts.set(entry.id, currentCount + 1);
        break;
      }
    }
  }

  return deck;
}

/**
 * Build a fully random valid deck from the pool.
 * Expands each card to maxCopies entries, shuffles, takes first deckSize.
 * The expanded pool guarantees maxCopies is never exceeded.
 */
function buildRandomDeck(pool: PoolEntry[], rand: () => number): number[] {
  const { deckSize } = getConfig();
  // Expand pool into a flat list — each card appears maxCopies times
  const expanded: number[] = [];
  for (const entry of pool) {
    for (let c = 0; c < entry.maxCopies; c++) {
      expanded.push(entry.id);
    }
  }

  // Fisher-Yates shuffle
  for (let i = expanded.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    const tmp = expanded[i] ?? 0;
    expanded[i] = expanded[j] ?? 0;
    expanded[j] = tmp;
  }

  return expanded.slice(0, deckSize);
}
