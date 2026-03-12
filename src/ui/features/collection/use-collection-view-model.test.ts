import { describe, expect, it } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { buildCollectionViewModel } from "./use-collection-view-model.ts";

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([
    [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Dark Magician", kinds: [], attack: 2500, defense: 2100 }],
  ]),
  cardsByName: new Map(),
} as CardDb;

describe("buildCollectionViewModel", () => {
  it("derives total owned, in-deck, and available quantities from collection and deck", () => {
    const result = buildCollectionViewModel({ 1: 2, 2: 1 }, [1, 1], fakeCardDb);

    expect(result.totalOwnedCards).toBe(3);
    expect(result.uniqueOwnedCards).toBe(2);
    expect(result.deckLength).toBe(2);

    expect(result.entriesByCardId.get(1)).toMatchObject({
      totalOwned: 2,
      inDeck: 2,
      availableInCollection: 0,
      qty: 0,
    });
    expect(result.entriesByCardId.get(2)).toMatchObject({
      totalOwned: 1,
      inDeck: 0,
      availableInCollection: 1,
      qty: 1,
    });
  });

  it("keeps rows when all owned copies are already in deck", () => {
    const result = buildCollectionViewModel({ 1: 3 }, [1, 1, 1], fakeCardDb);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      id: 1,
      totalOwned: 3,
      inDeck: 3,
      availableInCollection: 0,
      qty: 0,
    });
  });
});
