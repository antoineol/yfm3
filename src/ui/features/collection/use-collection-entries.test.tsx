// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";

vi.mock("../../db/use-collection.ts", () => ({
  useCollection: vi.fn(),
}));
vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

import { useCollection } from "../../db/use-collection.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

const mockCollection = useCollection as ReturnType<typeof vi.fn>;
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

describe("useCollectionEntries", () => {
  beforeEach(() => {
    mockCardDb.mockReturnValue(fakeCardDb);
  });

  it("returns undefined when collection is undefined", () => {
    mockCollection.mockReturnValue(undefined);
    const { result } = renderHook(() => useCollectionEntries());
    expect(result.current).toBeUndefined();
  });

  it("returns zero totalCards for empty collection", () => {
    mockCollection.mockReturnValue({});
    const { result } = renderHook(() => useCollectionEntries());
    expect(result.current).toEqual({ entries: [], totalCards: 0, uniqueCards: 0 });
  });

  it("returns correct entries, totalCards, uniqueCards", () => {
    mockCollection.mockReturnValue({ 1: 2, 2: 1 });
    const { result } = renderHook(() => useCollectionEntries());
    expect(result.current?.totalCards).toBe(3);
    expect(result.current?.uniqueCards).toBe(2);
    expect(result.current?.entries).toHaveLength(2);
  });
});
