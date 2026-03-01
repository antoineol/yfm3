import { bench, describe } from "vitest";
import { DummyScorer } from "../scoring/dummy-scorer.ts";
import { HAND_SIZE, NUM_HANDS } from "../types/constants.ts";
import { createTestBuffers } from "./create-test-buffers.ts";

describe("DummyScorer", () => {
  const buf = createTestBuffers();
  const scorer = new DummyScorer();
  const hand = new Uint16Array(HAND_SIZE);

  bench("evaluateHand", () => {
    // Pick a random hand and evaluate
    const h = (Math.random() * NUM_HANDS) | 0;
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      hand[j] = buf.deck[buf.handIndices[base + j] ?? 0] ?? 0;
    }
    scorer.evaluateHand(hand, buf.fusionTable, buf.cardAtk);
  });
});
