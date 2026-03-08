import { describe, expect, it } from "vitest";
import { mulberry32 } from "../mulberry32.ts";
import { DECK_SIZE, MAX_COPIES } from "../types/constants.ts";
import { generateInitialDecks } from "./seed-strategies.ts";

function makeCollectionRecord(numCards = 60): Record<number, number> {
  const record: Record<number, number> = {};
  for (let id = 1; id <= numCards; id++) {
    record[id] = 3;
  }
  return record;
}

describe("generateInitialDecks", () => {
  it("returns undefined for worker 0 (greedy default)", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 4, rand);
    expect(decks[0]).toBeUndefined();
  });

  it("returns a perturbed deck for worker 1", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 4, rand);
    const deck = decks[1];
    expect(deck).toBeDefined();
    expect(deck).toHaveLength(DECK_SIZE);
  });

  it("returns random decks for workers 2+", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 5, rand);
    for (let i = 2; i < 5; i++) {
      const deck = decks[i];
      expect(deck).toBeDefined();
      expect(deck).toHaveLength(DECK_SIZE);
    }
  });

  it("all decks respect MAX_COPIES constraint", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 5, rand);
    for (let i = 1; i < 5; i++) {
      const deck = decks[i];
      if (!deck) continue;
      const counts = new Map<number, number>();
      for (const id of deck) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      for (const [, count] of counts) {
        expect(count).toBeLessThanOrEqual(MAX_COPIES);
      }
    }
  });

  it("all decks only contain cards from the collection", () => {
    const collection = makeCollectionRecord(20);
    const validIds = new Set(Object.keys(collection).map(Number));
    const rand = mulberry32(0);
    const decks = generateInitialDecks(collection, 4, rand);
    for (let i = 1; i < 4; i++) {
      const deck = decks[i];
      if (!deck) continue;
      for (const id of deck) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });

  it("random decks differ from each other (with high probability)", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 5, rand);
    const deck2 = [...(decks[2] ?? [])].sort((a, b) => a - b).join(",");
    const deck3 = [...(decks[3] ?? [])].sort((a, b) => a - b).join(",");
    expect(deck2).not.toBe(deck3);
  });

  it("works with single worker (only greedy)", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 1, rand);
    expect(decks).toHaveLength(1);
    expect(decks[0]).toBeUndefined();
  });

  it("works with two workers (greedy + perturbed)", () => {
    const rand = mulberry32(0);
    const decks = generateInitialDecks(makeCollectionRecord(), 2, rand);
    expect(decks).toHaveLength(2);
    expect(decks[0]).toBeUndefined();
    expect(decks[1]).toHaveLength(DECK_SIZE);
  });

  it("is deterministic with the same seed", () => {
    const collection = makeCollectionRecord();
    const decks1 = generateInitialDecks(collection, 4, mulberry32(42));
    const decks2 = generateInitialDecks(collection, 4, mulberry32(42));
    for (let i = 0; i < 4; i++) {
      expect(decks1[i]).toEqual(decks2[i]);
    }
  });
});
