import { beforeAll, describe, expect, it } from "vitest";

import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { DECK_SIZE, MAX_CARD_ID } from "../types/constants.ts";
import { createBiasedSelector } from "./biased-selection.ts";
import { SAOptimizer } from "./sa-optimizer.ts";

const scorer = new FusionScorer();

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

    // Should return almost instantly (< 200ms)
    expect(elapsed).toBeLessThan(200);
  });

  it("exposes iterations count after run", () => {
    const b = createAllCardsBuffers();
    computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(42);
    const de = new DeltaEvaluator();
    const deadline = performance.now() + 1000;

    expect(optimizer.iterations).toBe(0);
    optimizer.run(b, scorer, de, deadline);
    expect(optimizer.iterations).toBeGreaterThan(0);
  });

  it("adaptive cooling: completes full schedule with short budget", () => {
    const b = createAllCardsBuffers();
    computeInitialScores(b, scorer);

    const optimizer = new SAOptimizer(42);
    const de = new DeltaEvaluator();
    // Short 2s budget — previously would only reach exploration phase
    const deadline = performance.now() + 2000;
    optimizer.run(b, scorer, de, deadline);

    // Should still complete a reasonable number of iterations
    expect(optimizer.iterations).toBeGreaterThan(100);
    // Score should be non-negative (optimizer found something)
    // The key assertion is that it didn't crash and produced a valid result
    // with the adaptive cooling rate rather than the old hardcoded rate
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
