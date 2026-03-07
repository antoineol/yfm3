import { beforeAll, describe, expect, it } from "vitest";
import { referenceEvaluateHand } from "../../test/reference-scorer.ts";
import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { HAND_SIZE, NUM_HANDS } from "../types/constants.ts";
import { computeInitialScores } from "./compute-initial-scores.ts";
import { FusionScorer } from "./fusion-scorer.ts";

let buf: OptBuffers;
const scorer = new FusionScorer();

beforeAll(() => {
  buf = createAllCardsBuffers();
});

describe("computeInitialScores", () => {
  it("populates all handScores and returns correct totalScore", () => {
    const totalScore = computeInitialScores(buf, scorer);

    let expectedTotal = 0;
    for (let h = 0; h < NUM_HANDS; h++) {
      expectedTotal += buf.handScores[h] ?? 0;
    }
    expect(totalScore).toBe(expectedTotal);
  });

  it("every handScore is non-negative", () => {
    computeInitialScores(buf, scorer);
    for (let h = 0; h < NUM_HANDS; h++) {
      expect(buf.handScores[h] ?? 0).toBeGreaterThanOrEqual(0);
    }
  });

  it("initial scores match hand-by-hand verification", () => {
    computeInitialScores(buf, scorer);

    const sampleIndices = [0, 1, 100, 1000, 5000, 10000, NUM_HANDS - 1];
    const handBuf = new Uint16Array(HAND_SIZE);

    for (const h of sampleIndices) {
      const base = h * HAND_SIZE;
      for (let j = 0; j < HAND_SIZE; j++) {
        handBuf[j] = buf.deck[buf.handSlots[base + j] ?? 0] ?? 0;
      }
      const expected = scorer.evaluateHand(handBuf, buf);
      expect(buf.handScores[h] ?? 0, `hand ${h}`).toBe(expected);
    }
  });

  it("scores match reference scorer on sampled hands", () => {
    computeInitialScores(buf, scorer);

    const sampleIndices = [0, 42, 500, 7777, NUM_HANDS - 1];

    for (const h of sampleIndices) {
      const base = h * HAND_SIZE;
      const cardIds: number[] = [];
      for (let j = 0; j < HAND_SIZE; j++) {
        cardIds.push(buf.deck[buf.handSlots[base + j] ?? 0] ?? 0);
      }
      const refResult = referenceEvaluateHand(cardIds, buf.fusionTable, buf.cardAtk);
      expect(buf.handScores[h] ?? 0, `hand ${h}`).toBe(refResult);
    }
  });

  it("idempotent: running twice gives same results", () => {
    const total1 = computeInitialScores(buf, scorer);
    const scores1 = Int16Array.from(buf.handScores);
    const total2 = computeInitialScores(buf, scorer);
    expect(total2).toBe(total1);
    for (let h = 0; h < NUM_HANDS; h++) {
      expect(buf.handScores[h] ?? 0).toBe(scores1[h] ?? 0);
    }
  });
});
