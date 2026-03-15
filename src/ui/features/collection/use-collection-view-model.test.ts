// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { buildCollectionViewModel, useCollectionViewModel } from "./use-collection-view-model.ts";

vi.mock("../../db/use-owned-card-totals.ts", () => ({ useOwnedCardTotals: vi.fn() }));
vi.mock("../../db/use-deck.ts", () => ({ useDeck: vi.fn() }));
vi.mock("../../lib/card-db-context.tsx", () => ({ useCardDb: vi.fn() }));

import { useDeck } from "../../db/use-deck.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

const mockUseDeck = useDeck as ReturnType<typeof vi.fn>;
const mockUseOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;
const mockUseCardDb = useCardDb as ReturnType<typeof vi.fn>;

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

describe("useCollectionViewModel", () => {
  it("returns the same view model object when deck and owned totals content is unchanged", () => {
    mockUseCardDb.mockReturnValue(fakeCardDb);
    mockUseDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    mockUseOwnedCardTotals.mockReturnValue({ 1: 2, 2: 1 });

    const { result, rerender } = renderHook(() => useCollectionViewModel());
    const firstResult = result.current;

    mockUseDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    mockUseOwnedCardTotals.mockReturnValue({ 2: 1, 1: 2 });

    rerender();

    expect(result.current).toBe(firstResult);
  });

  it("returns a new object when deck or owned totals content changes", () => {
    mockUseCardDb.mockReturnValue(fakeCardDb);
    mockUseDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    mockUseOwnedCardTotals.mockReturnValue({ 1: 2, 2: 1 });

    const { result, rerender } = renderHook(() => useCollectionViewModel());
    const firstResult = result.current;

    mockUseDeck.mockReturnValue([{ cardId: 1 }, { cardId: 1 }]);
    rerender();
    const secondResult = result.current;

    expect(secondResult).not.toBe(firstResult);

    mockUseOwnedCardTotals.mockReturnValue({ 1: 2, 2: 2 });
    rerender();

    expect(result.current).not.toBe(secondResult);
  });
});
