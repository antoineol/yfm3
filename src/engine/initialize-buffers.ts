import type { CardSpec } from "./data/card-model.ts";
import { buildReverseLookup, generateHandSlots } from "./data/hand-pool.ts";
import { buildInitialDeck } from "./data/initial-deck.ts";
import { loadGameData } from "./data/load-game-data.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";

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
 * Full initialization pipeline:
 *   1. Parse CSVs → build fusionTable and cardAtk
 *   2. Set the player's collection (populates availableCounts)
 *   3. Build greedy initial deck (highest-ATK cards first)
 *   4. Sample unique 5-card hands (Monte Carlo pool)
 *   5. Build reverse lookup (slot → affected hands) for delta scoring
 */
export function initializeBuffers(
  setCollection: (buf: OptBuffers, cards: readonly CardSpec[]) => void,
  rand: () => number,
): OptBuffers {
  const buf = createBuffers();
  const cards = loadGameData(buf);
  setCollection(buf, cards);
  buildInitialDeck(buf, cards);
  generateHandSlots(buf, rand);
  buildReverseLookup(buf);
  return buf;
}
