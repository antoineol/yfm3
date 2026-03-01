import fs from "node:fs";
import path from "node:path";
import { loadGameData } from "@engine/data/load-game-data.ts";
import { createBuffers, type OptBuffers } from "@engine/types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_COPIES, NUM_HANDS } from "@engine/types/constants.ts";

// TODO continue here

/**
 * Simple seeded PRNG (mulberry32) for deterministic test data.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createTestBuffers(): OptBuffers {
  const buf = createBuffers();

  // Load real game data from CSVs
  const dataDir = path.resolve(import.meta.dirname, "../data");
  const cardsCsv = fs.readFileSync(path.join(dataDir, "rp-cards.csv"), "utf-8");
  const fusionsCsv = fs.readFileSync(path.join(dataDir, "rp-fusions1.csv"), "utf-8");
  const cards = loadGameData(cardsCsv, fusionsCsv, buf);

  // availableCounts: MAX_COPIES for all real cards
  for (const card of cards) {
    buf.availableCounts[card.id] = MAX_COPIES;
  }

  // Deck: top 40 cards by attack (deterministic)
  const sorted = [...cards].sort((a, b) => b.attack - a.attack);
  buf.cardCounts.fill(0);
  let deckIdx = 0;
  for (const card of sorted) {
    if (deckIdx >= DECK_SIZE) break;
    const count = buf.cardCounts[card.id] ?? 0;
    if (count < MAX_COPIES) {
      buf.deck[deckIdx] = card.id;
      buf.cardCounts[card.id] = count + 1;
      deckIdx++;
    }
  }

  // handIndices: seeded PRNG for determinism
  const rand = mulberry32(42);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      buf.handIndices[base + j] = (rand() * DECK_SIZE) | 0;
    }
  }

  // Build reverse lookup: for each deck slot, which hands reference it
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

  return buf;
}
