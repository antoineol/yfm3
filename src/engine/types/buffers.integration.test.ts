import { beforeAll, describe, expect, it } from "vitest";
import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import { MaxAtkScorer } from "../scoring/max-atk-scorer.ts";
import type { OptBuffers } from "./buffers.ts";
import { DECK_SIZE, HAND_SIZE, NUM_HANDS } from "./constants.ts";

const scorer = new MaxAtkScorer();

describe("OptBuffers (integration)", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createAllCardsBuffers();
    const h5 = new Uint16Array(HAND_SIZE);
    for (let h = 0; h < NUM_HANDS; h++) {
      const base = h * HAND_SIZE;
      for (let j = 0; j < HAND_SIZE; j++) {
        h5[j] = buf.deck[buf.handSlots[base + j] ?? 0] ?? 0;
      }
      buf.handScores[h] = scorer.evaluateHand(h5, buf);
    }
  });

  it("reverse lookup correctness", () => {
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
