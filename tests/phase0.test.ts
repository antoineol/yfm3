import { RandomSwapOptimizer } from "@engine/optimizer/random-swap-optimizer.ts";
import { DummyDeltaScorer } from "@engine/scoring/dummy-delta-scorer.ts";
import { DummyScorer } from "@engine/scoring/dummy-scorer.ts";
import { createBuffers, type OptBuffers } from "@engine/types/buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "@engine/types/constants.ts";
import { beforeAll, describe, expect, it } from "vitest";

import { createTestBuffers } from "./create-test-buffers.ts";

const scorer = new DummyScorer();

/** Pre-compute handScores for a test buffer set. */
function scoreAllHands(buf: OptBuffers): void {
  const h5 = new Uint16Array(HAND_SIZE);
  for (let h = 0; h < NUM_HANDS; h++) {
    const base = h * HAND_SIZE;
    for (let j = 0; j < HAND_SIZE; j++) {
      h5[j] = buf.deck[buf.handIndices[base + j] ?? 0] ?? 0;
    }
    buf.handScores[h] = scorer.evaluateHand(h5, buf.fusionTable, buf.cardAtk);
  }
}

describe("Phase 0", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createTestBuffers();
    scoreAllHands(buf);
  });

  it("IScorer: returns a number", () => {
    const hand = new Uint16Array([1, 2, 3, 4, 5]);
    const cardAtk = new Int16Array(MAX_CARD_ID);
    cardAtk[1] = 500;
    cardAtk[2] = 600;
    cardAtk[3] = 700;
    cardAtk[4] = 800;
    cardAtk[5] = 900;
    const result = scorer.evaluateHand(hand, new Int16Array(MAX_CARD_ID * MAX_CARD_ID), cardAtk);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("IScorer: max of hand", () => {
    const hand = new Uint16Array([10, 20, 30, 40, 50]);
    const cardAtk = new Int16Array(MAX_CARD_ID);
    cardAtk[10] = 100;
    cardAtk[20] = 250;
    cardAtk[30] = 3000;
    cardAtk[40] = 150;
    cardAtk[50] = 2000;
    const result = scorer.evaluateHand(hand, new Int16Array(MAX_CARD_ID * MAX_CARD_ID), cardAtk);
    expect(result).toBe(3000);
  });

  it("IDeltaScorer: zero delta on identity swap", () => {
    const ds = new DummyDeltaScorer();
    const delta = ds.computeDelta(
      buf.deck,
      0,
      buf.handIndices,
      buf.handScores,
      buf.affectedHandIds,
      buf.affectedHandOffsets,
      buf.affectedHandCounts,
      buf.fusionTable,
      buf.cardAtk,
      scorer,
    );
    expect(delta).toBe(0);
  });

  it("IDeltaScorer: commit updates handScores", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new DummyDeltaScorer();

    const oldCard = b.deck[0] ?? 0;
    const newCard = (oldCard + 1) % MAX_CARD_ID;
    b.deck[0] = newCard;

    ds.computeDelta(
      b.deck,
      0,
      b.handIndices,
      b.handScores,
      b.affectedHandIds,
      b.affectedHandOffsets,
      b.affectedHandCounts,
      b.fusionTable,
      b.cardAtk,
      scorer,
    );
    ds.commitDelta(b.handScores);

    // Verify affected hands now match fresh evaluation
    const h5 = new Uint16Array(HAND_SIZE);
    const count = b.affectedHandCounts[0] ?? 0;
    const offset = b.affectedHandOffsets[0] ?? 0;
    for (let i = 0; i < count; i++) {
      const hid = b.affectedHandIds[offset + i] ?? 0;
      const base = hid * HAND_SIZE;
      for (let j = 0; j < HAND_SIZE; j++) {
        h5[j] = b.deck[b.handIndices[base + j] ?? 0] ?? 0;
      }
      expect(b.handScores[hid]).toBe(scorer.evaluateHand(h5, b.fusionTable, b.cardAtk));
    }
  });

  it("IDeltaScorer: no mutation on reject", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const ds = new DummyDeltaScorer();
    const snapshot = new Int16Array(b.handScores);

    const oldCard = b.deck[0] ?? 0;
    b.deck[0] = (oldCard + 1) % MAX_CARD_ID;

    ds.computeDelta(
      b.deck,
      0,
      b.handIndices,
      b.handScores,
      b.affectedHandIds,
      b.affectedHandOffsets,
      b.affectedHandCounts,
      b.fusionTable,
      b.cardAtk,
      scorer,
    );
    // No commitDelta call
    expect(b.handScores).toEqual(snapshot);
  });

  it("IOptimizer: returns valid deck", () => {
    const b = createTestBuffers();
    scoreAllHands(b);
    const opt = new RandomSwapOptimizer();

    opt.run(
      b.deck,
      b.cardCounts,
      b.availableCounts,
      b.handIndices,
      b.handScores,
      b.affectedHandIds,
      b.affectedHandOffsets,
      b.affectedHandCounts,
      b.fusionTable,
      b.cardAtk,
      scorer,
      new DummyDeltaScorer(),
      500,
    );

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

    const finalScore = new RandomSwapOptimizer().run(
      b.deck,
      b.cardCounts,
      b.availableCounts,
      b.handIndices,
      b.handScores,
      b.affectedHandIds,
      b.affectedHandOffsets,
      b.affectedHandCounts,
      b.fusionTable,
      b.cardAtk,
      scorer,
      new DummyDeltaScorer(),
      1000,
    );

    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  it("IOptimizer: respects maxIterations", () => {
    const b = createTestBuffers();
    scoreAllHands(b);

    const start = performance.now();
    new RandomSwapOptimizer().run(
      b.deck,
      b.cardCounts,
      b.availableCounts,
      b.handIndices,
      b.handScores,
      b.affectedHandIds,
      b.affectedHandOffsets,
      b.affectedHandCounts,
      b.fusionTable,
      b.cardAtk,
      scorer,
      new DummyDeltaScorer(),
      0,
    );
    expect(performance.now() - start).toBeLessThan(50);
  });

  it("Buffer allocation: exact sizes", () => {
    const b = createBuffers();
    expect(b.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
    expect(b.cardAtk.length).toBe(MAX_CARD_ID);
    expect(b.deck.length).toBe(DECK_SIZE);
    expect(b.cardCounts.length).toBe(MAX_CARD_ID);
    expect(b.availableCounts.length).toBe(MAX_CARD_ID);
    expect(b.handIndices.length).toBe(NUM_HANDS * HAND_SIZE);
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
          if (buf.handIndices[base + j] === slot) {
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      }
    }
  });
});
