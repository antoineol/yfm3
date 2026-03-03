import fs from "node:fs";
import path from "node:path";
import type { CardSpec } from "./data/card-model.ts";
import { loadGameData } from "./data/load-game-data.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_COPIES, NUM_HANDS } from "./types/constants.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../data");

/**
 * Seeded PRNG (mulberry32). Returns a closure producing numbers in [0, 1).
 * Deterministic: same seed always produces the same sequence.
 * Used to make Monte Carlo hand sampling reproducible across runs.
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Full production pipeline — orchestrates the 5-step initialization:
 *   1. Load game data (cards CSV + fusions CSV) into fusionTable and cardAtk
 *   2. Set the player's collection via callback (populates availableCounts)
 *   3. Build a greedy initial deck (highest-ATK cards first)
 *   4. Sample NUM_HANDS random 5-card hands (Monte Carlo pool)
 *   5. Build the reverse lookup (slot -> affected hands) for delta scoring
 *
 * @param rand          - seeded PRNG for reproducible hand sampling
 * @param setCollection - callback to populate buf.availableCounts from user's collection
 */
export function initializeOptimizer(
  rand: () => number,
  setCollection: (buf: OptBuffers, cards: readonly CardSpec[]) => void,
): OptBuffers {
  const cardsCsv = fs.readFileSync(path.join(DATA_DIR, "rp-cards.csv"), "utf-8");
  const fusionsCsv = fs.readFileSync(path.join(DATA_DIR, "rp-fusions1.csv"), "utf-8");
  const buf = createBuffers();
  const cards = loadGameData(cardsCsv, fusionsCsv, buf);
  setCollection(buf, cards);
  buildInitialDeck(buf, cards);
  generateHandIndices(buf, rand);
  buildReverseLookup(buf);
  return buf;
}

/**
 * Greedy initial deck: sort all cards by attack descending, then greedily pick
 * the strongest cards the player owns (up to MAX_COPIES each) until 40 slots are filled.
 * This gives the optimizer a strong starting point before swaps begin.
 */
function buildInitialDeck(buf: OptBuffers, cards: readonly CardSpec[]): void {
  const sorted = [...cards].sort((a, b) => b.attack - a.attack);
  buf.cardCounts.fill(0);
  let deckIdx = 0;
  for (const card of sorted) {
    if (deckIdx >= DECK_SIZE) break;
    const count = buf.cardCounts[card.id] ?? 0;
    if (count < MAX_COPIES && count < (buf.availableCounts[card.id] ?? 0)) {
      buf.deck[deckIdx] = card.id;
      buf.cardCounts[card.id] = count + 1;
      deckIdx++;
    }
  }
}

/**
 * Sample NUM_HANDS (15,000) random 5-card hands as deck-slot indices (0..39).
 * These indices are fixed for the entire optimization — when a deck slot's card changes,
 * all hands referencing that slot automatically reflect the new card (CRN technique).
 * Note: sampling is with replacement (not true hypergeometric), which is an approximation.
 */
function generateHandIndices(buf: OptBuffers, rand: () => number): void {
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      buf.handSlots[base + j] = (rand() * DECK_SIZE) | 0;
    }
  }
}

/**
 * Build the reverse lookup: for each deck slot (0..39), record which hand IDs
 * contain that slot. This enables O(affected) delta scoring instead of O(all hands).
 *
 * Produces a CSR-like (Compressed Sparse Row) structure:
 *   - affectedHandCounts[slot] = how many hands reference this slot (~1875 avg)
 *   - affectedHandOffsets[slot] = start index in affectedHandIds
 *   - affectedHandIds[offset..offset+count] = the hand IDs that reference slot
 *
 * Built in 3 passes:
 *   Pass 1: count references per slot
 *   Pass 2: compute prefix-sum offsets
 *   Pass 3: scatter hand IDs into their slot's segment
 */
function buildReverseLookup(buf: OptBuffers): void {
  // Pass 1: count how many times each slot appears across all hands
  const tempCounts = new Uint16Array(DECK_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      const s = buf.handSlots[base + j] ?? 0;
      tempCounts[s] = (tempCounts[s] ?? 0) + 1;
    }
  }

  // Pass 2: prefix sum to get each slot's starting offset in affectedHandIds
  let offset = 0;
  for (let s = 0; s < DECK_SIZE; s++) {
    buf.affectedHandOffsets[s] = offset;
    const c = tempCounts[s] ?? 0;
    buf.affectedHandCounts[s] = c;
    offset += c;
  }

  // Pass 3: scatter hand IDs into affectedHandIds at the correct positions
  const writePos = new Uint32Array(DECK_SIZE);
  for (let s = 0; s < DECK_SIZE; s++) {
    writePos[s] = buf.affectedHandOffsets[s] ?? 0;
  }
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      const slot = buf.handSlots[base + j] ?? 0;
      const pos = writePos[slot] ?? 0;
      buf.affectedHandIds[pos] = h;
      writePos[slot] = pos + 1;
    }
  }
}
