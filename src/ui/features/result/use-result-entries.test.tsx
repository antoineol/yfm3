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
    // Current: card1×1, card2×1. Suggested: card1×2, card2×1.
    // → card1: 1 kept + 1 added = 2 rows. card2: 1 kept = 1 row. Total = 3.
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
    expect(result.current?.entries).toHaveLength(3);
    expect(result.current?.result.expectedAtk).toBe(2500);

    const entries = result.current?.entries ?? [];
    const card1Added = entries.filter((e) => e.id === 1 && e.diffStatus === "added");
    const card1Kept = entries.filter((e) => e.id === 1 && e.diffStatus === "kept");
    const card2Kept = entries.filter((e) => e.id === 2 && e.diffStatus === "kept");
    expect(card1Added).toHaveLength(1);
    expect(card1Kept).toHaveLength(1);
    expect(card2Kept).toHaveLength(1);
  });

  it("exposes grouped arrays and swapCount", () => {
    // Current: [1, 2], Suggested: [1, 3] → 1=kept, 2=removed, 3=added
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
    const removed = result.current?.removed ?? [];
    const added = result.current?.added ?? [];
    const kept = result.current?.kept ?? [];
    expect(removed).toHaveLength(1);
    expect(removed[0]?.id).toBe(2);
    expect(added).toHaveLength(1);
    expect(added[0]?.id).toBe(3);
    expect(kept).toHaveLength(1);
    expect(kept[0]?.id).toBe(1);
    expect(result.current?.swapCount).toBe(1);
  });

  it("returns swapCount 0 when decks are identical", () => {
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    store.set(resultAtom, {
      deck: [1, 2],
      expectedAtk: 2500,
      currentDeckScore: 2500,
      improvement: 0,
      elapsedMs: 50,
    });
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).not.toBeNull();
    expect(result.current?.swapCount).toBe(0);
    expect(result.current?.removed).toHaveLength(0);
    expect(result.current?.added).toHaveLength(0);
    expect(result.current?.kept).toHaveLength(2);
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

  it("splits qty changes into per-copy rows with correct diff statuses", () => {
    // Current: card1×2, card2×3. Suggested: card1×3, card2×1.
    // card1: min(3,2)=2 kept, 1 added. card2: min(1,3)=1 kept, 2 removed.
    // Total: 2 removed + 1 added + 3 kept = 6 rows.
    mockDeck.mockReturnValue([
      { cardId: 1 },
      { cardId: 1 },
      { cardId: 2 },
      { cardId: 2 },
      { cardId: 2 },
    ]);
    store.set(resultAtom, {
      deck: [1, 1, 1, 2],
      expectedAtk: 3000,
      currentDeckScore: null,
      improvement: null,
      elapsedMs: 50,
    });
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    const entries = result.current?.entries ?? [];
    expect(entries).toHaveLength(6);
    expect(entries.every((e) => e.qty === 1)).toBe(true);

    const removed = entries.filter((e) => e.diffStatus === "removed");
    const added = entries.filter((e) => e.diffStatus === "added");
    const kept = entries.filter((e) => e.diffStatus === "kept");
    expect(removed).toHaveLength(2);
    expect(removed.every((e) => e.id === 2)).toBe(true);
    expect(added).toHaveLength(1);
    expect(added[0]?.id).toBe(1);
    expect(kept).toHaveLength(3);

    // All rowKeys are unique
    const keys = entries.map((e) => e.rowKey);
    expect(new Set(keys).size).toBe(keys.length);
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
