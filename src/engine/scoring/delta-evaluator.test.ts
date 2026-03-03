import { beforeAll, describe, expect, it } from "vitest";

import { createTestBuffers } from "../create-test-buffers.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "../types/constants.ts";
import { DeltaEvaluator } from "./delta-evaluator.ts";
import { MaxAtkScorer } from "./max-atk-scorer.ts";

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

describe("DeltaEvaluator", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createTestBuffers();
    scoreAllHands(buf);
  });

  it("zero delta on identity swap", () => {
    const ds = new DeltaEvaluator();
    const delta = ds.computeDelta(0, buf, scorer);
    expect(delta).toBe(0);
  });

  it("commit updates handScores", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new DeltaEvaluator();

    const oldCard = b.deck[0] ?? 0;
    const newCard = (oldCard + 1) % MAX_CARD_ID;
    b.deck[0] = newCard;

    ds.computeDelta(0, b, scorer);
    ds.commitDelta(b.handScores);

    // Verify affected hands now match fresh evaluation
    const h5 = new Uint16Array(HAND_SIZE);
    const count = b.affectedHandCounts[0] ?? 0;
    const offset = b.affectedHandOffsets[0] ?? 0;
    for (let i = 0; i < count; i++) {
      const hid = b.affectedHandIds[offset + i] ?? 0;
      const base = hid * HAND_SIZE;
      for (let j = 0; j < HAND_SIZE; j++) {
        h5[j] = b.deck[b.handSlots[base + j] ?? 0] ?? 0;
      }
      expect(b.handScores[hid]).toBe(scorer.evaluateHand(h5, b));
    }
  });

  it("no mutation on reject", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new DeltaEvaluator();
    const snapshot = new Int16Array(b.handScores);

    const oldCard = b.deck[0] ?? 0;
    b.deck[0] = (oldCard + 1) % MAX_CARD_ID;

    ds.computeDelta(0, b, scorer);
    // No commitDelta call
    expect(b.handScores).toEqual(snapshot);
  });
});
