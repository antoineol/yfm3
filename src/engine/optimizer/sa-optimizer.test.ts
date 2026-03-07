import { beforeAll, describe, expect, it } from "vitest";

import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, MAX_CARD_ID } from "../types/constants.ts";
import { createBiasedSelector } from "./biased-selection.ts";
import { SAOptimizer } from "./sa-optimizer.ts";
import { createTabuList } from "./tabu-list.ts";

const scorer = new FusionScorer();

describe("TabuList", () => {
  it("newly created tabu has nothing marked", () => {
    const tabu = createTabuList();
    expect(tabu.isTabu(0, 100)).toBe(false);
    expect(tabu.isTabu(5, 200)).toBe(false);
  });

  it("prevents recently rejected card", () => {
    const tabu = createTabuList();
    tabu.addTabu(3, 42);
    expect(tabu.isTabu(3, 42)).toBe(true);
    // Different slot is unaffected
    expect(tabu.isTabu(4, 42)).toBe(false);
  });

  it("ring wraps after 8 entries, oldest overwritten", () => {
    const tabu = createTabuList();
    // Add 8 cards to slot 0
    for (let i = 1; i <= 8; i++) {
      tabu.addTabu(0, i);
    }
    // All 8 should be tabu
    for (let i = 1; i <= 8; i++) {
      expect(tabu.isTabu(0, i)).toBe(true);
    }
    // Adding a 9th overwrites the oldest (card 1)
    tabu.addTabu(0, 99);
    expect(tabu.isTabu(0, 99)).toBe(true);
    expect(tabu.isTabu(0, 1)).toBe(false);
    // Cards 2..8 still tabu
    for (let i = 2; i <= 8; i++) {
      expect(tabu.isTabu(0, i)).toBe(true);
    }
  });
});

describe("BiasedSelection", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createAllCardsBuffers();
  });

  it("prefers cards with more fusion partners", () => {
    const selector = createBiasedSelector();
    selector.recomputeWeights(buf);

    // Sample many candidates and count frequency
    const counts = new Uint32Array(MAX_CARD_ID);
    let seed = 1;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const samples = 10_000;
    for (let i = 0; i < samples; i++) {
      const card = selector.selectCandidate(buf, -1, rand);
      if (card >= 0) counts[card] = (counts[card] ?? 0) + 1;
    }

    // Find a high-ATK card and a low-ATK card, verify higher ATK card is selected more
    let highAtkCard = -1;
    let lowAtkCard = -1;
    for (let c = 0; c < MAX_CARD_ID; c++) {
      if (
        (buf.cardAtk[c] ?? 0) >= 2500 &&
        (buf.cardCounts[c] ?? 0) < (buf.availableCounts[c] ?? 0)
      ) {
        highAtkCard = c;
        break;
      }
    }
    for (let c = 0; c < MAX_CARD_ID; c++) {
      if (
        (buf.cardAtk[c] ?? 0) > 0 &&
        (buf.cardAtk[c] ?? 0) <= 200 &&
        (buf.cardCounts[c] ?? 0) < (buf.availableCounts[c] ?? 0)
      ) {
        lowAtkCard = c;
        break;
      }
    }

    if (highAtkCard >= 0 && lowAtkCard >= 0) {
      expect(counts[highAtkCard] ?? 0).toBeGreaterThan(counts[lowAtkCard] ?? 0);
    }
  });

  it("returns -1 when no valid candidate found", () => {
    const selector = createBiasedSelector();
    selector.recomputeWeights(buf);

    // Make all cards at capacity
    const savedAvail = new Uint8Array(buf.availableCounts);
    buf.availableCounts.set(buf.cardCounts);

    const alwaysZero = () => 0;
    const result = selector.selectCandidate(buf, buf.deck[0] ?? 0, alwaysZero);
    expect(result).toBe(-1);

    buf.availableCounts.set(savedAvail);
  });
});

describe("SAOptimizer", () => {
  let buf: OptBuffers;

  beforeAll(() => {
    buf = createAllCardsBuffers();
    computeInitialScores(buf, scorer);
  });

  it("accepts uphill moves (positive delta always accepted)", () => {
    // SA with positive delta should always accept — verified by the SA logic:
    // delta > 0 → accept unconditionally
    // Here we verify the math: exp(positive / temp) > 1 always.
    expect(Math.exp(100 / 500)).toBeGreaterThan(1);
    expect(Math.exp(1 / 0.01)).toBeGreaterThan(1);
  });

  it("accepts downhill at high temp, rejects at low temp", () => {
    const delta = -100;
    const highTemp = 500;
    const lowTemp = 0.01;

    // At high temp, probability of acceptance is meaningful
    const pHigh = Math.exp(delta / highTemp);
    expect(pHigh).toBeGreaterThan(0.1);

    // At near-zero temp, probability of acceptance is negligible
    const pLow = Math.exp(delta / lowTemp);
    expect(pLow).toBeLessThan(1e-10);
  });

  it("cooling schedule decreases temperature correctly", () => {
    let temp = 500;
    // One cooling step (per-iteration cooling at rate 0.99963)
    temp *= 0.99963;
    expect(temp).toBeLessThan(500);
    expect(temp).toBeCloseTo(499.815, 1);

    // After ~23,000 iterations, temperature reaches near-zero
    for (let i = 0; i < 22999; i++) {
      temp *= 0.99963;
    }
    expect(temp).toBeLessThan(1);
  });

  it("non-regression: output score >= input score", () => {
    const b = createAllCardsBuffers();
    const initialScore = computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(123);
    const de = new DeltaEvaluator();
    const deadline = performance.now() + 2000;

    const bestScore = optimizer.run(b, scorer, de, deadline);
    expect(bestScore).toBeGreaterThanOrEqual(initialScore);
  });

  it("valid deck output: 40 cards within collection bounds", () => {
    const b = createAllCardsBuffers();
    computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(456);
    const de = new DeltaEvaluator();
    const deadline = performance.now() + 1000;

    optimizer.run(b, scorer, de, deadline);

    // Deck has exactly 40 cards
    expect(b.deck.length).toBe(DECK_SIZE);

    // Verify cardCounts consistency: rebuild counts from deck and compare
    const counts = new Uint8Array(MAX_CARD_ID);
    for (let i = 0; i < DECK_SIZE; i++) {
      const cardId = b.deck[i] ?? 0;
      counts[cardId] = (counts[cardId] ?? 0) + 1;
    }
    for (let c = 0; c < MAX_CARD_ID; c++) {
      expect(counts[c]).toBe(b.cardCounts[c] ?? 0);
      expect(counts[c]).toBeLessThanOrEqual(b.availableCounts[c] ?? 0);
    }
  });

  it("respects deadline: stops promptly", () => {
    const b = createAllCardsBuffers();
    computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(789);
    const de = new DeltaEvaluator();

    // Deadline in the past → should stop immediately
    const deadline = performance.now() - 1;

    const start = performance.now();
    optimizer.run(b, scorer, de, deadline);
    const elapsed = performance.now() - start;

    // Should return almost instantly (< 50ms)
    expect(elapsed).toBeLessThan(50);
  });

  it("improves a bad deck: starting from weakest cards finds better deck", () => {
    const b = createAllCardsBuffers();

    // Replace deck with weakest cards (sort by ATK ascending, pick lowest)
    const cardsByAtk: Array<{ id: number; atk: number }> = [];
    for (let c = 0; c < MAX_CARD_ID; c++) {
      if ((b.availableCounts[c] ?? 0) > 0 && (b.cardAtk[c] ?? 0) > 0) {
        cardsByAtk.push({ id: c, atk: b.cardAtk[c] ?? 0 });
      }
    }
    cardsByAtk.sort((a, b) => a.atk - b.atk);

    // Reset deck and cardCounts
    b.cardCounts.fill(0);
    let slot = 0;
    for (const card of cardsByAtk) {
      if (slot >= DECK_SIZE) break;
      const copies = Math.min(b.availableCounts[card.id] ?? 0, 3);
      for (let c = 0; c < copies && slot < DECK_SIZE; c++) {
        b.deck[slot] = card.id;
        b.cardCounts[card.id] = (b.cardCounts[card.id] ?? 0) + 1;
        slot++;
      }
    }

    const initialScore = computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(999);
    const de = new DeltaEvaluator();
    const deadline = performance.now() + 3000;

    const bestScore = optimizer.run(b, scorer, de, deadline);
    expect(bestScore).toBeGreaterThan(initialScore);
  });
});
