// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { resultAtom } from "../../lib/atoms.ts";

vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(),
}));

import { useDeck } from "../../db/use-deck.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useResultEntries } from "./use-result-entries.ts";

const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;
const mockDeck = useDeck as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([
    [1, { id: 1, name: "Blue-Eyes", kinds: [], isMonster: true, attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Dark Magician", kinds: [], isMonster: true, attack: 2500, defense: 2100 }],
    [3, { id: 3, name: "Red-Eyes", kinds: [], isMonster: true, attack: 2400, defense: 2000 }],
  ]),
  cardsByName: new Map(),
} as CardDb;

afterEach(cleanup);

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useResultEntries", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    mockCardDb.mockReturnValue(fakeCardDb);
    mockDeck.mockReturnValue(undefined);
  });

  it("returns null when result is null", () => {
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toBeNull();
  });

  it("returns entries and result when result is present", () => {
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    store.set(resultAtom, {
      deck: [1, 1, 2],
      expectedAtk: 2500,
      currentDeckScore: null,
      improvement: null,
      elapsedMs: 100,
    });
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).not.toBeNull();
    expect(result.current?.entries).toHaveLength(2);
    expect(result.current?.result.expectedAtk).toBe(2500);
  });

  it("tags entries with diffStatus: added, removed, kept", () => {
    // Current deck: [1, 2], Suggested: [1, 3] → 1=kept, 2=removed, 3=added
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    store.set(resultAtom, {
      deck: [1, 3],
      expectedAtk: 2700,
      currentDeckScore: null,
      improvement: null,
      elapsedMs: 50,
    });
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).not.toBeNull();
    const entries = result.current?.entries ?? [];
    expect(entries).toHaveLength(3);

    const byId = (id: number) => entries.find((e) => e.id === id);
    expect(byId(2)?.diffStatus).toBe("removed");
    expect(byId(3)?.diffStatus).toBe("added");
    expect(byId(1)?.diffStatus).toBe("kept");
  });

  it("sorts entries: removed first, then added, then kept", () => {
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    store.set(resultAtom, {
      deck: [1, 3],
      expectedAtk: 2700,
      currentDeckScore: null,
      improvement: null,
      elapsedMs: 50,
    });
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).not.toBeNull();
    const statuses = (result.current?.entries ?? []).map((e) => e.diffStatus);
    expect(statuses).toEqual(["removed", "added", "kept"]);
  });
});
