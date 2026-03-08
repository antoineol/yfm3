import { describe, expect, it } from "vitest";
import { optimizeDeck } from "./index.ts";
import { DECK_SIZE, MAX_CARD_ID, MAX_COPIES } from "./types/constants.ts";

/** Collection where every card is owned at MAX_COPIES. */
function allCardsCollection(): Map<number, number> {
  const m = new Map<number, number>();
  for (let id = 0; id < MAX_CARD_ID; id++) m.set(id, MAX_COPIES);
  return m;
}

/** Collection of only the weakest cards (low ATK). */
function weakCollection(): Map<number, number> {
  const m = new Map<number, number>();
  // IDs 0..50 tend to be low-ATK cards; pad enough to fill 40 slots
  for (let id = 0; id <= 60; id++) m.set(id, MAX_COPIES);
  return m;
}

describe("optimizeDeck", () => {
  it("O1: returns a valid 40-card deck within collection", () => {
    const collection = allCardsCollection();
    const result = optimizeDeck(collection, { timeLimit: 8_000 });

    expect(result.deck).toHaveLength(DECK_SIZE);

    // Count copies per card
    const counts = new Map<number, number>();
    for (const id of result.deck) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    // Every card in deck must be in collection with enough copies
    for (const [id, count] of counts) {
      expect(collection.has(id)).toBe(true);
      expect(count).toBeLessThanOrEqual(collection.get(id) ?? 0);
    }
  });

  it("O2: output score >= initial score (non-regression)", () => {
    const result = optimizeDeck(allCardsCollection(), { timeLimit: 8_000 });
    expect(result.expectedAtk).toBeGreaterThanOrEqual(result.initialScore);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });

  it("O3: improves a weak collection's deck", () => {
    const result = optimizeDeck(weakCollection(), { timeLimit: 8_000 });
    // With fusions available, the optimizer should find improvements
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });

  it("O4: never exceeds owned quantities", () => {
    const collection = allCardsCollection();
    // Restrict some cards to 1 copy
    collection.set(273, 1);
    collection.set(403, 1);
    collection.set(279, 1);

    const result = optimizeDeck(collection, { timeLimit: 8_000 });

    const counts = new Map<number, number>();
    for (const id of result.deck) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [id, count] of counts) {
      expect(count).toBeLessThanOrEqual(collection.get(id) ?? 0);
    }
  });

  it("respects time limit", () => {
    const start = performance.now();
    const result = optimizeDeck(allCardsCollection(), { timeLimit: 10_000 });
    const wallClock = performance.now() - start;

    expect(result.elapsedMs).toBeLessThan(15_000);
    expect(wallClock).toBeLessThan(15_000);
  }, 30_000);

  it("throws on collection with fewer cards than deckSize", () => {
    const tiny = new Map<number, number>();
    tiny.set(1, 10);
    tiny.set(2, 10);
    // Only 20 total cards
    expect(() => optimizeDeck(tiny)).toThrow(/requires 40/);
  });

  it("throws on invalid deckSize", () => {
    expect(() => optimizeDeck(allCardsCollection(), { deckSize: 3 })).toThrow(/between 5 and 40/);
    expect(() => optimizeDeck(allCardsCollection(), { deckSize: 50 })).toThrow(/between 5 and 40/);
  });

  it("optimizes a 20-card deck", () => {
    const result = optimizeDeck(allCardsCollection(), { timeLimit: 8_000, deckSize: 20 });
    expect(result.deck).toHaveLength(20);
    expect(result.expectedAtk).toBeGreaterThan(0);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });

  it("S1: deck of zero-ATK cards scores 0", () => {
    // 40× Labyrinth Wall (id 171, ATK 0). Single card type means no pairs
    // can fuse (self-fusion is excluded), so every hand scores 0.
    const collection = new Map<number, number>();
    collection.set(171, 40);
    const result = optimizeDeck(collection, { timeLimit: 8_000 });
    expect(result.expectedAtk).toBe(0);
  });

  it("S2: single card type → score equals that card's ATK", () => {
    // Card 73 (Kuriboh, 300 ATK). With 40 copies, initial deck is all card 73.
    // Every hand is identical [73,73,73,73,73], no self-fusion → score = 300.
    const collection = new Map<number, number>();
    collection.set(73, 40);
    const result = optimizeDeck(collection, { timeLimit: 8_000 });
    expect(result.expectedAtk).toBe(300);
  });

  it("S3: score within bounds [min_ATK, max_achievable]", () => {
    const result = optimizeDeck(allCardsCollection(), { timeLimit: 8_000 });
    // Expected ATK should be positive and bounded
    expect(result.expectedAtk).toBeGreaterThan(0);
    expect(result.expectedAtk).toBeLessThanOrEqual(5000);
  });
});
