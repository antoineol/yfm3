import { beforeAll, describe, expect, it } from "vitest";

import { createTestBuffers } from "./create-test-buffers.ts";
import { RandomSwapOptimizer } from "./optimizer/random-swap-optimizer.ts";
import { MaxAtkDeltaScorer } from "./scoring/max-atk-delta-scorer.ts";
import { MaxAtkScorer } from "./scoring/max-atk-scorer.ts";
import { createBuffers, type OptBuffers } from "./types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./types/constants.ts";

const scorer = new MaxAtkScorer();

/** Pre-compute handScores for a test buffer set. */
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

describe("Phase 0", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createTestBuffers();
    scoreAllHands(buf);
  });

  it("IScorer: returns a number", () => {
    const b = createBuffers();
    b.cardAtk[1] = 500;
    b.cardAtk[2] = 600;
    b.cardAtk[3] = 700;
    b.cardAtk[4] = 800;
    b.cardAtk[5] = 900;
    const hand = new Uint16Array([1, 2, 3, 4, 5]);
    const result = scorer.evaluateHand(hand, b);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("IScorer: max of hand", () => {
    const b = createBuffers();
    b.cardAtk[10] = 100;
    b.cardAtk[20] = 250;
    b.cardAtk[30] = 3000;
    b.cardAtk[40] = 150;
    b.cardAtk[50] = 2000;
    const hand = new Uint16Array([10, 20, 30, 40, 50]);
    const result = scorer.evaluateHand(hand, b);
    expect(result).toBe(3000);
  });

  it("IDeltaScorer: zero delta on identity swap", () => {
    const ds = new MaxAtkDeltaScorer();
    const delta = ds.computeDelta(0, buf, scorer);
    expect(delta).toBe(0);
  });

  it("IDeltaScorer: commit updates handScores", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new MaxAtkDeltaScorer();

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

  it("IDeltaScorer: no mutation on reject", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new MaxAtkDeltaScorer();
    const snapshot = new Int16Array(b.handScores);

    const oldCard = b.deck[0] ?? 0;
    b.deck[0] = (oldCard + 1) % MAX_CARD_ID;

    ds.computeDelta(0, b, scorer);
    // No commitDelta call
    expect(b.handScores).toEqual(snapshot);
  });

  it("IOptimizer: returns valid deck", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    new RandomSwapOptimizer().run(b, scorer, new MaxAtkDeltaScorer(), 500);

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

  it("IOptimizer: non-regression", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    let initialScore = 0;
    for (let i = 0; i < NUM_HANDS; i++) {
      initialScore += b.handScores[i] ?? 0;
    }

    const finalScore = new RandomSwapOptimizer().run(b, scorer, new MaxAtkDeltaScorer(), 1000);
    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  it("IOptimizer: respects maxIterations", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    const start = performance.now();
    new RandomSwapOptimizer().run(b, scorer, new MaxAtkDeltaScorer(), 0);
    expect(performance.now() - start).toBeLessThan(50);
  });

  it("Buffer allocation: exact sizes", () => {
    const b = createBuffers();
    expect(b.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
    expect(b.cardAtk.length).toBe(MAX_CARD_ID);
    expect(b.deck.length).toBe(DECK_SIZE);
    expect(b.cardCounts.length).toBe(MAX_CARD_ID);
    expect(b.availableCounts.length).toBe(MAX_CARD_ID);
    expect(b.handSlots.length).toBe(NUM_HANDS * HAND_SIZE);
    expect(b.handScores.length).toBe(NUM_HANDS);
    expect(b.affectedHandIds.length).toBe(NUM_HANDS * HAND_SIZE);
    expect(b.affectedHandOffsets.length).toBe(DECK_SIZE);
    expect(b.affectedHandCounts.length).toBe(DECK_SIZE);
  });

  it("Reverse lookup correctness", () => {
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
