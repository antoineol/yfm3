import fs from "node:fs";
import path from "node:path";
import type { CardSpec } from "./data/card-model.ts";
import { loadGameData } from "./data/load-game-data.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { createBuffers } from "./types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_COPIES, NUM_HANDS } from "./types/constants.ts";

const DATA_DIR = path.resolve(import.meta.dirname, "../../data");

/**
 * Seeded PRNG (mulberry32). Returns a function producing numbers in [0, 1).
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
 * Full production pipeline: load game data from files, set collection,
 * build initial deck, sample hands, and build reverse lookup.
 *
 * setCollection receives the buffers and parsed cards so it can populate
 * buf.availableCounts for the correct card IDs.
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

function generateHandIndices(buf: OptBuffers, rand: () => number): void {
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      buf.handIndices[base + j] = (rand() * DECK_SIZE) | 0;
    }
  }
}

function buildReverseLookup(buf: OptBuffers): void {
  const tempCounts = new Uint16Array(DECK_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      const s = buf.handIndices[base + j] ?? 0;
      tempCounts[s] = (tempCounts[s] ?? 0) + 1;
    }
  }

  let offset = 0;
  for (let s = 0; s < DECK_SIZE; s++) {
    buf.affectedHandOffsets[s] = offset;
    const c = tempCounts[s] ?? 0;
    buf.affectedHandCounts[s] = c;
    offset += c;
  }

  const writePos = new Uint32Array(DECK_SIZE);
  for (let s = 0; s < DECK_SIZE; s++) {
    writePos[s] = buf.affectedHandOffsets[s] ?? 0;
  }
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      const slot = buf.handIndices[base + j] ?? 0;
      const pos = writePos[slot] ?? 0;
      buf.affectedHandIds[pos] = h;
      writePos[slot] = pos + 1;
    }
  }
}
