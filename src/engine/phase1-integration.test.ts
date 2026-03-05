import { beforeAll, describe, expect, it } from "vitest";

import { createTestBuffers } from "./create-test-buffers.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { DECK_SIZE, FUSION_NONE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./types/constants.ts";

/**
 * Phase 1 integration tests (§1.8 of the plan).
 * These run against real game data loaded via createTestBuffers().
 */

let buf: OptBuffers;

beforeAll(() => {
  buf = createTestBuffers();
});

describe("fusionTable", () => {
  it("symmetry: fusionTable[A*722+B] === fusionTable[B*722+A]", () => {
    for (let a = 0; a < MAX_CARD_ID; a++) {
      for (let b = a + 1; b < MAX_CARD_ID; b++) {
        const ab = buf.fusionTable[a * MAX_CARD_ID + b];
        const ba = buf.fusionTable[b * MAX_CARD_ID + a];
        if (ab !== ba) {
          throw new Error(`Asymmetry at (${a},${b}): ${ab} vs ${ba}`);
        }
      }
    }
  });

  it("strict improvement: no entry where result ATK <= either material ATK", () => {
    for (let a = 0; a < MAX_CARD_ID; a++) {
      const atkA = buf.cardAtk[a] ?? 0;
      for (let b = 0; b < MAX_CARD_ID; b++) {
        const val = buf.fusionTable[a * MAX_CARD_ID + b] ?? 0;
        if (val === FUSION_NONE) continue;
        const atkB = buf.cardAtk[b] ?? 0;
        // val is stored as result ATK in current implementation
        expect(val).toBeGreaterThan(atkA);
        expect(val).toBeGreaterThan(atkB);
      }
    }
  });
});

describe("cardAtk", () => {
  it("populated: at least some cards have non-zero ATK", () => {
    let nonZero = 0;
    for (let i = 0; i < MAX_CARD_ID; i++) {
      if ((buf.cardAtk[i] ?? 0) > 0) nonZero++;
    }
    // The game has hundreds of monsters
    expect(nonZero).toBeGreaterThan(100);
  });
});

describe("hand pool", () => {
  it("range: all slot indices in [0, 39]", () => {
    for (let i = 0; i < NUM_HANDS * HAND_SIZE; i++) {
      const slot = buf.handSlots[i] ?? 0;
      expect(slot).toBeGreaterThanOrEqual(0);
      expect(slot).toBeLessThan(DECK_SIZE);
    }
  });
});

describe("reverse lookup", () => {
  it("completeness: sum of counts = NUM_HANDS * HAND_SIZE", () => {
    let total = 0;
    for (let s = 0; s < DECK_SIZE; s++) {
      total += buf.affectedHandCounts[s] ?? 0;
    }
    expect(total).toBe(NUM_HANDS * HAND_SIZE);
  });

  it("correctness: every listed hand contains the slot", () => {
    for (let slot = 0; slot < DECK_SIZE; slot++) {
      const count = buf.affectedHandCounts[slot] ?? 0;
      const offset = buf.affectedHandOffsets[slot] ?? 0;
      for (let i = 0; i < count; i++) {
        const handId = buf.affectedHandIds[offset + i] ?? 0;
        const base = handId * HAND_SIZE;
        let found = false;
        for (let j = 0; j < HAND_SIZE; j++) {
          if (buf.handSlots[base + j] === slot) {
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      }
    }
  });
});

describe("initial deck", () => {
  it("validity: 40 cards, all valid IDs, within collection", () => {
    // Exactly 40 cards
    expect(buf.deck.length).toBe(DECK_SIZE);

    // All valid IDs (non-zero, within range)
    for (let i = 0; i < DECK_SIZE; i++) {
      const id = buf.deck[i] ?? 0;
      expect(id).toBeGreaterThan(0);
      expect(id).toBeLessThan(MAX_CARD_ID);
    }

    // Card counts don't exceed available counts
    for (let id = 0; id < MAX_CARD_ID; id++) {
      expect(buf.cardCounts[id] ?? 0).toBeLessThanOrEqual(buf.availableCounts[id] ?? 0);
    }

    // Card counts sum to DECK_SIZE
    let total = 0;
    for (let id = 0; id < MAX_CARD_ID; id++) {
      total += buf.cardCounts[id] ?? 0;
    }
    expect(total).toBe(DECK_SIZE);
  });
});
