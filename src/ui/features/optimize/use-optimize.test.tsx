// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isOptimizingAtom, liveBestDeckAtom, resultAtom } from "../../lib/atoms.ts";

vi.mock("../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: vi.fn(),
}));
vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(),
}));
vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
  useTerrain: vi.fn(() => 0),
}));
vi.mock("../../../engine/index-browser.ts", () => ({
  optimizeDeckParallel: vi.fn(),
}));
vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => "rp"),
}));
vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridge: vi.fn(() => ({ gameData: null })),
}));

import { optimizeDeckParallel } from "../../../engine/index-browser.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { useOptimize } from "./use-optimize.ts";

const mockOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;
const mockDeck = useDeck as ReturnType<typeof vi.fn>;
const mockDeckSize = useDeckSize as ReturnType<typeof vi.fn>;
const mockOptimize = optimizeDeckParallel as ReturnType<typeof vi.fn>;

afterEach(cleanup);

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useOptimize", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    mockOwnedCardTotals.mockReturnValue(undefined);
    mockDeck.mockReturnValue(undefined);
    mockDeckSize.mockReturnValue(40);
    mockOptimize.mockResolvedValue({
      deck: [1, 2, 3],
      expectedAtk: 2000,
      currentDeckScore: null,
      improvement: null,
      elapsedMs: 100,
    });
  });

  describe("canOptimize", () => {
    it("is false when collection is undefined", () => {
      mockOwnedCardTotals.mockReturnValue(undefined);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      expect(result.current.canOptimize).toBe(false);
    });

    it("is false when total cards < deckSize", () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 10, 2: 10 }); // 20 cards
      mockDeckSize.mockReturnValue(40);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      expect(result.current.canOptimize).toBe(false);
    });

    it("is true when total cards >= deckSize and not optimizing", () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 20, 2: 20 }); // 40 cards
      mockDeckSize.mockReturnValue(40);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      expect(result.current.canOptimize).toBe(true);
    });

    it("is true when total cards > deckSize", () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 30, 2: 30 }); // 60 cards
      mockDeckSize.mockReturnValue(40);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      expect(result.current.canOptimize).toBe(true);
    });

    it("is false when isOptimizing is true", () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 20, 2: 20 });
      store.set(isOptimizingAtom, true);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      expect(result.current.canOptimize).toBe(false);
    });
  });

  describe("optimize", () => {
    it("does nothing when collection is undefined", async () => {
      mockOwnedCardTotals.mockReturnValue(undefined);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });
      await act(() => result.current.optimize());
      expect(mockOptimize).not.toHaveBeenCalled();
    });

    it("calls optimizeDeckParallel with correct args", async () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 20, 2: 20 });
      mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
      mockDeckSize.mockReturnValue(40);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      expect(mockOptimize).toHaveBeenCalledWith(
        new Map([
          [1, 20],
          [2, 20],
        ]),
        expect.objectContaining({ currentDeck: [1, 2], deckSize: 40, fusionDepth: 3 }),
      );
    });

    it("sets isOptimizing to true while running", async () => {
      let resolvePromise!: (v: unknown) => void;
      mockOptimize.mockReturnValue(
        new Promise((r) => {
          resolvePromise = r;
        }),
      );
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      expect(result.current.isOptimizing).toBe(false);

      // Start optimization without awaiting
      let optimizePromise: Promise<void>;
      act(() => {
        optimizePromise = Promise.resolve(result.current.optimize());
      });

      expect(store.get(isOptimizingAtom)).toBe(true);

      // Resolve and let it finish
      await act(async () => {
        resolvePromise({
          deck: [],
          expectedAtk: 0,
          currentDeckScore: null,
          improvement: null,
          elapsedMs: 0,
        });
        await optimizePromise;
      });

      expect(result.current.isOptimizing).toBe(false);
    });

    it("clears result before starting", async () => {
      store.set(resultAtom, {
        deck: [1],
        expectedAtk: 100,
        currentDeckScore: null,
        improvement: null,
        elapsedMs: 0,
      });
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      // result should be set to the new value from the resolved promise
      expect(store.get(resultAtom)).toEqual({
        deck: [1, 2, 3],
        expectedAtk: 2000,
        currentDeckScore: null,
        improvement: null,
        elapsedMs: 100,
      });
    });

    it("sets isOptimizing to false on error", async () => {
      mockOptimize.mockRejectedValue(new Error("fail"));
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      expect(result.current.isOptimizing).toBe(false);
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("passes undefined currentDeck when deck is undefined", async () => {
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      mockDeck.mockReturnValue(undefined);
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      expect(mockOptimize).toHaveBeenCalledWith(
        new Map([[1, 40]]),
        expect.objectContaining({
          currentDeck: undefined,
          deckSize: 40,
          fusionDepth: 3,
        }),
      );
    });

    it("sets liveBestDeck from onProgress callback", async () => {
      const fakeDeck = [10, 20, 30];
      mockOptimize.mockImplementation(
        async (
          _col: unknown,
          opts: { onProgress?: (p: number, s: number, d: number[]) => void },
        ) => {
          opts?.onProgress?.(0.5, 2000, fakeDeck);
          return {
            deck: fakeDeck,
            expectedAtk: 2000,
            currentDeckScore: null,
            improvement: null,
            elapsedMs: 100,
          };
        },
      );
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      // liveBestDeck is cleared in .finally() after optimization completes
      expect(store.get(liveBestDeckAtom)).toEqual([]);
    });

    it("clears liveBestDeck on optimization start", async () => {
      store.set(liveBestDeckAtom, [1, 2, 3]);
      mockOwnedCardTotals.mockReturnValue({ 1: 40 });
      const { result } = renderHook(() => useOptimize(), {
        wrapper: makeWrapper(store),
      });

      await act(() => result.current.optimize());

      expect(store.get(liveBestDeckAtom)).toEqual([]);
    });
  });
});
