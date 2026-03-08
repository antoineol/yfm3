// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(),
}));
vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

import { useDeck } from "../../db/use-deck.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";

const mockDeck = useDeck as ReturnType<typeof vi.fn>;
const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([
    [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Dark Magician", kinds: [], attack: 2500, defense: 2100 }],
  ]),
  cardsByName: new Map(),
} as CardDb;

afterEach(cleanup);

describe("useDeckEntries", () => {
  beforeEach(() => {
    mockCardDb.mockReturnValue(fakeCardDb);
  });

  it("returns undefined when deck is undefined", () => {
    mockDeck.mockReturnValue(undefined);
    const { result } = renderHook(() => useDeckEntries());
    expect(result.current).toBeUndefined();
  });

  it("returns empty entries for empty deck", () => {
    mockDeck.mockReturnValue([]);
    const { result } = renderHook(() => useDeckEntries());
    expect(result.current).toEqual({ entries: [], deckLength: 0 });
  });

  it("returns correct entries and deckLength", () => {
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 1 }, { cardId: 2 }]);
    const { result } = renderHook(() => useDeckEntries());
    expect(result.current?.deckLength).toBe(3);
    expect(result.current?.entries).toHaveLength(2);
  });
});
