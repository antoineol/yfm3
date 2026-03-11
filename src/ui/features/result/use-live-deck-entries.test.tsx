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
    [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Dark Magician", kinds: [], attack: 2500, defense: 2100 }],
    [3, { id: 3, name: "Kuriboh", kinds: [], attack: 300, defense: 200 }],
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

  it("returns sorted entries when liveBestDeck has card IDs", () => {
    store.set(liveBestDeckAtom, [3, 1, 2, 1]);
    const { result } = renderHook(() => useLiveDeckEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toHaveLength(3);
    // Sorted by ATK descending
    expect(result.current[0]?.name).toBe("Blue-Eyes");
    expect(result.current[0]?.qty).toBe(2);
    expect(result.current[1]?.name).toBe("Dark Magician");
    expect(result.current[2]?.name).toBe("Kuriboh");
  });
});
