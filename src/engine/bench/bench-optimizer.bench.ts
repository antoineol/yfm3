import { bench, describe } from "vitest";
import { RandomSwapOptimizer } from "../optimizer/random-swap-optimizer.ts";
import { DummyDeltaScorer } from "../scoring/dummy-delta-scorer.ts";
import { DummyScorer } from "../scoring/dummy-scorer.ts";
import { HAND_SIZE, NUM_HANDS } from "../types/constants.ts";
import { createTestBuffers } from "./create-test-buffers.ts";

describe("RandomSwapOptimizer", () => {
  const buf = createTestBuffers();
  const scorer = new DummyScorer();

  const handBuf = new Uint16Array(HAND_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      handBuf[j] = buf.deck[buf.handIndices[base + j] ?? 0] ?? 0;
    }
    buf.handScores[h] = scorer.evaluateHand(handBuf, buf.fusionTable, buf.cardAtk);
  }

  bench("30K iterations", () => {
    new RandomSwapOptimizer().run(
      buf.deck,
      buf.cardCounts,
      buf.availableCounts,
      buf.handIndices,
      buf.handScores,
      buf.affectedHandIds,
      buf.affectedHandOffsets,
      buf.affectedHandCounts,
      buf.fusionTable,
      buf.cardAtk,
      scorer,
      new DummyDeltaScorer(),
      30_000,
    );
  });
});
