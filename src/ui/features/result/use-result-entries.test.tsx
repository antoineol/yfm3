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

import { useCardDb } from "../../lib/card-db-context.tsx";
import { useResultEntries } from "./use-result-entries.ts";

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
  });

  it("returns null when result is null", () => {
    const { result } = renderHook(() => useResultEntries(), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toBeNull();
  });

  it("returns entries and result when result is present", () => {
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
});
