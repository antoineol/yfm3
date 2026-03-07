import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, NUM_HANDS } from "../types/constants.ts";

/**
 * Sample NUM_HANDS unique 5-card hands as deck-slot indices (0..39).
 *
 * Each hand is a unique combination of 5 distinct slots, drawn without replacement
 * via Fisher-Yates partial shuffle. Hands are stored sorted for canonical form.
 * Rejection sampling ensures no duplicate combinations (C(40,5) = 658,008 >> 15,000).
 *
 * Slot-based storage means hands never need regeneration when the deck mutates (CRN technique).
 */
export function generateHandSlots(buf: OptBuffers, rand: () => number): void {
  const pool = new Uint8Array(DECK_SIZE);
  const sorted = new Uint8Array(HAND_SIZE);
  const seen = new Set<number>();

  let h = 0;
  while (h < NUM_HANDS) {
    // Reset pool [0..39]
    for (let i = 0; i < DECK_SIZE; i++) pool[i] = i;

    // Fisher-Yates partial shuffle: pick 5 distinct slots
    for (let j = 0; j < HAND_SIZE; j++) {
      const remaining = DECK_SIZE - j;
      const pick = j + ((rand() * remaining) | 0);
      const tmp = pool[pick] ?? 0;
      pool[pick] = pool[j] ?? 0;
      pool[j] = tmp;
    }

    // Sort for canonical form
    for (let j = 0; j < HAND_SIZE; j++) sorted[j] = pool[j] ?? 0;
    sorted.sort();

    // Encode as a single number for fast dedup (5 slots * 6 bits each = 30 bits, fits in int32)
    const key =
      (sorted[0] ?? 0) |
      ((sorted[1] ?? 0) << 6) |
      ((sorted[2] ?? 0) << 12) |
      ((sorted[3] ?? 0) << 18) |
      ((sorted[4] ?? 0) << 24);

    if (seen.has(key)) continue;
    seen.add(key);

    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      buf.handSlots[base + j] = sorted[j] ?? 0;
    }
    h++;
  }
}

/**
 * Build the reverse lookup: for each deck slot (0..39), record which hand IDs
 * contain that slot. Enables O(affected) delta scoring instead of O(all hands).
 *
 * CSR-like layout:
 *   affectedHandCounts[slot] = how many hands reference this slot (~1875 avg)
 *   affectedHandOffsets[slot] = start index in affectedHandIds
 *   affectedHandIds[offset..offset+count] = the hand IDs referencing the slot
 *
 * Built in 3 passes: count, prefix-sum offsets, scatter hand IDs.
 */
export function buildReverseLookup(buf: OptBuffers): void {
  // Pass 1: count how many times each slot appears
  const tempCounts = new Uint16Array(DECK_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      const s = buf.handSlots[base + j] ?? 0;
      tempCounts[s] = (tempCounts[s] ?? 0) + 1;
    }
  }

  // Pass 2: prefix sum to get each slot's starting offset
  let offset = 0;
  for (let s = 0; s < DECK_SIZE; s++) {
    buf.affectedHandOffsets[s] = offset;
    const c = tempCounts[s] ?? 0;
    buf.affectedHandCounts[s] = c;
    offset += c;
  }

  // Pass 3: scatter hand IDs into affectedHandIds
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
