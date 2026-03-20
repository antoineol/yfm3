// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { liveBestDeckAtom } from "../../lib/atoms.ts";

vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

import { useCardDb } from "../../lib/card-db-context.tsx";
import { useLiveDeckEntries } from "./use-live-deck-entries.ts";

const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([
    [1, { id: 1, name: "Blue-Eyes", kinds: [], isMonster: true, attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Dark Magician", kinds: [], isMonster: true, attack: 2500, defense: 2100 }],
    [3, { id: 3, name: "Kuriboh", kinds: [], isMonster: true, attack: 300, defense: 200 }],
  ]),
  cardsByName: new Map(),
} as CardDb;

afterEach(cleanup);

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useLiveDeckEntries", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    mockCardDb.mockReturnValue(fakeCardDb);
  });

  it("returns empty array when liveBestDeck is empty", () => {
    const { result } = renderHook(() => useLiveDeckEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toEqual([]);
  });

  it("returns one row per copy, sorted by ATK descending", () => {
    store.set(liveBestDeckAtom, [3, 1, 2, 1]);
    const { result } = renderHook(() => useLiveDeckEntries(), {
      wrapper: makeWrapper(store),
    });
    // 4 IDs → 4 rows (card 1 appears twice)
    expect(result.current).toHaveLength(4);
    expect(result.current.every((e) => e.qty === 1)).toBe(true);
    // Sorted by ATK descending: Blue-Eyes(3000), Blue-Eyes(3000), Dark Magician(2500), Kuriboh(300)
    expect(result.current[0]?.name).toBe("Blue-Eyes");
    expect(result.current[1]?.name).toBe("Blue-Eyes");
    expect(result.current[2]?.name).toBe("Dark Magician");
    expect(result.current[3]?.name).toBe("Kuriboh");
    // All rowKeys are unique
    const keys = result.current.map((e) => e.rowKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
