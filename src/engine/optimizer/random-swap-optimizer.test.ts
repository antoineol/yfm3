import { beforeAll, describe, expect, it } from "vitest";

import { createTestBuffers } from "../create-test-buffers.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { MaxAtkScorer } from "../scoring/max-atk-scorer.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "../types/constants.ts";
import { RandomSwapOptimizer } from "./random-swap-optimizer.ts";

const scorer = new MaxAtkScorer();

function scoreAllHands(buf: OptBuffers): void {
  const h5 = new Uint16Array(HAND_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      h5[j] = buf.deck[buf.handSlots[base + j] ?? 0] ?? 0;
    }
    buf.handScores[h] = scorer.evaluateHand(h5, buf);
  }
}

describe("RandomSwapOptimizer", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createTestBuffers();
    scoreAllHands(buf);
  });

  it("returns valid deck", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    new RandomSwapOptimizer().run(b, scorer, new DeltaEvaluator(), 500);

    expect(b.deck.length).toBe(DECK_SIZE);
    const counts = new Uint8Array(MAX_CARD_ID);
    for (let i = 0; i < DECK_SIZE; i++) {
      const c = b.deck[i] ?? 0;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    for (let i = 0; i < MAX_CARD_ID; i++) {
      expect(counts[i]).toBeLessThanOrEqual(b.availableCounts[i] ?? 0);
    }
  });

  it("non-regression", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    let initialScore = 0;
    for (let i = 0; i < NUM_HANDS; i++) {
      initialScore += b.handScores[i] ?? 0;
    }

    const finalScore = new RandomSwapOptimizer().run(b, scorer, new DeltaEvaluator(), 1000);
    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  it("respects maxIterations", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    const start = performance.now();
    new RandomSwapOptimizer().run(b, scorer, new DeltaEvaluator(), 0);
    expect(performance.now() - start).toBeLessThan(50);
  });
});
