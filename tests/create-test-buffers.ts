import { createBuffers, type OptBuffers } from "@engine/types/buffers.ts";
import {
  DECK_SIZE,
  FUSION_NONE,
  HAND_SIZE,
  MAX_CARD_ID,
  MAX_COPIES,
  NUM_HANDS,
} from "@engine/types/constants.ts";

export function createTestBuffers(): OptBuffers {
  const buf = createBuffers();

  // cardAtk: random values 100–3000
  for (let i = 0; i < MAX_CARD_ID; i++) {
    buf.cardAtk[i] = 100 + ((Math.random() * 2901) | 0);
  }

  // fusionTable: scatter ~13K random fusions
  buf.fusionTable.fill(FUSION_NONE);
  for (let i = 0; i < 13_000; i++) {
    const a = (Math.random() * MAX_CARD_ID) | 0;
    const b = (Math.random() * MAX_CARD_ID) | 0;
    if (a === b) continue;
    const atkA = buf.cardAtk[a] ?? 0;
    const atkB = buf.cardAtk[b] ?? 0;
    const atk = Math.max(atkA, atkB) + 100 + ((Math.random() * 500) | 0);
    const clamped = atk > 32767 ? 32767 : atk;
    buf.fusionTable[a * MAX_CARD_ID + b] = clamped;
    buf.fusionTable[b * MAX_CARD_ID + a] = clamped;
  }

  // availableCounts: allow MAX_COPIES for every card
  buf.availableCounts.fill(MAX_COPIES);

  // deck: 40 random card IDs respecting max 3 copies
  buf.cardCounts.fill(0);
  for (let i = 0; i < DECK_SIZE; i++) {
    let card: number;
    do {
      card = (Math.random() * MAX_CARD_ID) | 0;
    } while ((buf.cardCounts[card] ?? 0) >= MAX_COPIES);
    buf.deck[i] = card;
    buf.cardCounts[card] = (buf.cardCounts[card] ?? 0) + 1;
  }

  // handIndices: 15,000 random 5-combinations of [0, 39]
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      buf.handIndices[base + j] = (Math.random() * DECK_SIZE) | 0;
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
