// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  postDuelLiveBestScoreAtom,
  postDuelProgressAtom,
  postDuelResultAtom,
  postDuelStateAtom,
} from "../../lib/atoms.ts";

const mockSavePreferences = vi.fn();
vi.mock("convex/react", () => ({
  useMutation: vi.fn(() => mockSavePreferences),
}));
vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
  useUserModSettings: vi.fn(() => null),
}));
vi.mock("../../../engine/index-browser.ts", () => ({
  optimizeDeckParallel: vi.fn(),
}));
vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => "rp"),
}));

import { optimizeDeckParallel } from "../../../engine/index-browser.ts";
import { postDuelCurrentDeckAtom } from "../../lib/atoms.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { decksMatch, findNewCards, usePostDuelSuggestion } from "./use-post-duel-suggestion.ts";

const mockOptimize = optimizeDeckParallel as ReturnType<typeof vi.fn>;

afterEach(cleanup);

function makeWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Provider, { store }, children);
  };
}

function makeBridge(overrides: Partial<EmulatorBridge> = {}): EmulatorBridge {
  return {
    status: "connected",
    detail: "ready",
    detailMessage: null,
    settingsPatched: false,
    version: null,
    hand: [],
    field: [],
    handReliable: false,
    phase: "other",
    inDuel: false,
    lp: null,
    stats: null,
    collection: null,
    deckDefinition: null,
    shuffledDeck: null,
    modFingerprint: null,
    gameData: null,
    gameDataError: null,
    restartFailed: false,
    updating: false,
    updateStaged: false,
    stageFailed: false,
    opponentHand: [],
    opponentField: [],
    cpuSwaps: [],
    unlockedDuelists: null,
    opponentPhase: "other" as const,
    scan: vi.fn(),
    restartEmulator: vi.fn(),
    updateAndRestart: vi.fn(),
    stageUpdate: vi.fn(),
    ...overrides,
  };
}

const SAMPLE_COLLECTION: Record<number, number> = {};
for (let i = 1; i <= 50; i++) SAMPLE_COLLECTION[i] = 1;

const SAMPLE_DECK = Array.from({ length: 40 }, (_, i) => i + 1);

describe("findNewCards", () => {
  it("returns card IDs that increased in quantity", () => {
    const before = { 1: 1, 2: 2, 3: 1 };
    const after = { 1: 1, 2: 3, 3: 1, 4: 1 };
    expect(findNewCards(before, after)).toEqual([2, 4]);
  });

  it("returns empty array when nothing changed", () => {
    const before = { 1: 1, 2: 2 };
    const after = { 1: 1, 2: 2 };
    expect(findNewCards(before, after)).toEqual([]);
  });

  it("ignores decreased quantities", () => {
    const before = { 1: 3, 2: 1 };
    const after = { 1: 1, 2: 1 };
    expect(findNewCards(before, after)).toEqual([]);
  });

  it("handles empty before snapshot", () => {
    const before = {};
    const after = { 1: 1, 2: 1 };
    expect(findNewCards(before, after)).toEqual([1, 2]);
  });
});

describe("usePostDuelSuggestion", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    mockOptimize.mockClear();
    mockOptimize.mockResolvedValue({
      deck: [5, 6, 7],
      expectedAtk: 2500,
      currentDeckScore: 2000,
      improvement: 500,
      elapsedMs: 100,
    });
  });

  it("starts in idle state", () => {
    const bridge = makeBridge();
    const { result } = renderHook(() => usePostDuelSuggestion(bridge, undefined), {
      wrapper: makeWrapper(store),
    });
    expect(result.current.state).toBe("idle");
    expect(result.current.result).toBeNull();
  });

  it("transitions to duel_active when inDuel becomes true", () => {
    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    expect(store.get(postDuelStateAtom)).toBe("idle");

    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    expect(store.get(postDuelStateAtom)).toBe("duel_active");
  });

  it("triggers optimization immediately when collection changes during duel", async () => {
    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    // Enter duel with initial collection
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    expect(store.get(postDuelStateAtom)).toBe("duel_active");

    // Collection changes (won cards) — should go straight to optimizing
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });
    expect(store.get(postDuelStateAtom)).toBe("optimizing");

    // Flush optimization promise
    await act(() => Promise.resolve());

    expect(store.get(postDuelStateAtom)).toBe("result");
    expect(store.get(postDuelResultAtom)).toEqual(
      expect.objectContaining({ expectedAtk: 2500, improvement: 500 }),
    );
  });

  it("goes to no_change when improvement is zero", async () => {
    mockOptimize.mockResolvedValue({
      deck: SAMPLE_DECK,
      expectedAtk: 2000,
      currentDeckScore: 2000,
      improvement: 0,
      elapsedMs: 100,
    });

    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    await act(() => Promise.resolve());

    expect(store.get(postDuelStateAtom)).toBe("no_change");
  });

  it("fires only once per duel (hasFiredRef)", async () => {
    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    // Enter duel
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });

    // Collection changes → triggers
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    await act(() => Promise.resolve());
    expect(store.get(postDuelStateAtom)).toBe("result");
    expect(mockOptimize).toHaveBeenCalledTimes(1);

    // Another collection change should NOT trigger again
    mockOptimize.mockClear();
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: { ...SAMPLE_COLLECTION, 51: 1 },
        deckDefinition: SAMPLE_DECK,
      }),
    });

    expect(mockOptimize).not.toHaveBeenCalled();
  });

  it("dismiss resets to idle", async () => {
    const bridge = makeBridge({ inDuel: false });
    const { result, rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      { wrapper: makeWrapper(store), initialProps: { b: bridge } },
    );

    // Reach result state
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });
    await act(() => Promise.resolve());
    expect(store.get(postDuelStateAtom)).toBe("result");

    act(() => result.current.dismiss());

    expect(store.get(postDuelStateAtom)).toBe("idle");
    expect(store.get(postDuelResultAtom)).toBeNull();
  });

  it("aborts optimization when new duel starts", async () => {
    let resolveOpt!: (v: unknown) => void;
    mockOptimize.mockReturnValue(
      new Promise((r) => {
        resolveOpt = r;
      }),
    );

    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    // Enter duel → collection changes → optimizing
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });
    expect(store.get(postDuelStateAtom)).toBe("optimizing");

    // inDuel goes false then true again (new duel — stale RAM clears briefly)
    rerender({ b: makeBridge({ inDuel: false, collection: SAMPLE_COLLECTION }) });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    expect(store.get(postDuelStateAtom)).toBe("duel_active");
    expect(store.get(postDuelResultAtom)).toBeNull();

    // Clean up pending promise
    await act(() => {
      resolveOpt({
        deck: [],
        expectedAtk: 0,
        currentDeckScore: null,
        improvement: null,
        elapsedMs: 0,
      });
    });
  });

  it("does not trigger when collection does not change during duel", () => {
    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    const collection = { ...SAMPLE_COLLECTION };

    // Enter duel with same collection, re-render with same collection
    rerender({
      b: makeBridge({ inDuel: true, collection, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({ inDuel: true, collection, deckDefinition: SAMPLE_DECK }),
    });

    expect(store.get(postDuelStateAtom)).toBe("duel_active");
    expect(mockOptimize).not.toHaveBeenCalled();
  });

  it("calls optimizeDeckParallel with bridge deck as currentDeck", async () => {
    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    await act(() => Promise.resolve());

    expect(mockOptimize).toHaveBeenCalledWith(
      expect.any(Map),
      expect.objectContaining({
        currentDeck: SAMPLE_DECK,
        deckSize: 40,
        fusionDepth: 3,
        timeLimit: 10_000,
      }),
    );
  });

  it("reports progress via atoms during optimization", async () => {
    mockOptimize.mockImplementation(
      async (_col: unknown, opts: { onProgress?: (p: number, s: number, d: number[]) => void }) => {
        opts?.onProgress?.(0.5, 1500, [1, 2, 3]);
        return {
          deck: [1, 2, 3],
          expectedAtk: 2500,
          currentDeckScore: 2000,
          improvement: 500,
          elapsedMs: 100,
        };
      },
    );

    const bridge = makeBridge({ inDuel: false });
    const { rerender } = renderHook(
      ({ b }: { b: EmulatorBridge }) => usePostDuelSuggestion(b, undefined),
      {
        wrapper: makeWrapper(store),
        initialProps: { b: bridge },
      },
    );

    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
    });

    await act(() => Promise.resolve());

    // After completion, progress is reset to 0
    expect(store.get(postDuelProgressAtom)).toBe(0);
    expect(store.get(postDuelLiveBestScoreAtom)).toBe(0);
  });

  it("auto-dismisses when Convex deck matches suggested deck", async () => {
    const suggestedDeck = [5, 6, 7, ...Array.from({ length: 37 }, (_, i) => i + 8)];
    mockOptimize.mockResolvedValue({
      deck: suggestedDeck,
      expectedAtk: 2500,
      currentDeckScore: 2000,
      improvement: 500,
      elapsedMs: 100,
    });

    const bridge = makeBridge({ inDuel: false });
    const initialProps: { b: EmulatorBridge; d: number[] | undefined } = {
      b: bridge,
      d: undefined,
    };
    const { rerender } = renderHook(
      ({ b, d }: { b: EmulatorBridge; d: number[] | undefined }) => usePostDuelSuggestion(b, d),
      { wrapper: makeWrapper(store), initialProps },
    );

    // Reach result state
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
      d: undefined,
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: undefined,
    });
    await act(() => Promise.resolve());
    expect(store.get(postDuelStateAtom)).toBe("result");

    // Convex deck now matches suggested deck → auto-dismiss
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: suggestedDeck,
    });

    expect(store.get(postDuelStateAtom)).toBe("idle");
    expect(store.get(postDuelResultAtom)).toBeNull();
  });

  it("updates currentDeck when Convex deck partially matches suggestion", async () => {
    const suggestedDeck = [5, 6, 7, ...Array.from({ length: 37 }, (_, i) => i + 8)];
    mockOptimize.mockResolvedValue({
      deck: suggestedDeck,
      expectedAtk: 2500,
      currentDeckScore: 2000,
      improvement: 500,
      elapsedMs: 100,
    });

    const bridge = makeBridge({ inDuel: false });
    const initialProps: { b: EmulatorBridge; d: number[] | undefined } = {
      b: bridge,
      d: undefined,
    };
    const { rerender } = renderHook(
      ({ b, d }: { b: EmulatorBridge; d: number[] | undefined }) => usePostDuelSuggestion(b, d),
      { wrapper: makeWrapper(store), initialProps },
    );

    // Reach result state
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
      d: undefined,
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: undefined,
    });
    await act(() => Promise.resolve());
    expect(store.get(postDuelStateAtom)).toBe("result");

    // Partially applied: swapped card 1→5 but not 2→6 or 3→7
    const partialDeck = [5, 2, 3, ...Array.from({ length: 37 }, (_, i) => i + 8)];
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: partialDeck,
    });

    // Should still show result, but with updated currentDeck
    expect(store.get(postDuelStateAtom)).toBe("result");
    expect(store.get(postDuelCurrentDeckAtom)).toEqual(partialDeck);
  });

  it("does not update when deckCardIds is undefined", async () => {
    const bridge = makeBridge({ inDuel: false });
    const initialProps: { b: EmulatorBridge; d: number[] | undefined } = {
      b: bridge,
      d: undefined,
    };
    const { rerender } = renderHook(
      ({ b, d }: { b: EmulatorBridge; d: number[] | undefined }) => usePostDuelSuggestion(b, d),
      { wrapper: makeWrapper(store), initialProps },
    );

    // Reach result state
    rerender({
      b: makeBridge({ inDuel: true, collection: { 1: 1 }, deckDefinition: SAMPLE_DECK }),
      d: undefined,
    });
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: undefined,
    });
    await act(() => Promise.resolve());
    expect(store.get(postDuelStateAtom)).toBe("result");

    // deckCardIds stays undefined — should not dismiss or update
    rerender({
      b: makeBridge({
        inDuel: true,
        collection: SAMPLE_COLLECTION,
        deckDefinition: SAMPLE_DECK,
      }),
      d: undefined,
    });

    expect(store.get(postDuelStateAtom)).toBe("result");
  });
});

describe("decksMatch", () => {
  it("returns true for identical decks", () => {
    expect(decksMatch([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns true for same cards in different order", () => {
    expect(decksMatch([3, 1, 2], [1, 2, 3])).toBe(true);
  });

  it("returns false for different cards", () => {
    expect(decksMatch([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(decksMatch([1, 2], [1, 2, 3])).toBe(false);
  });

  it("handles duplicate cards correctly", () => {
    expect(decksMatch([1, 1, 2], [1, 2, 1])).toBe(true);
    expect(decksMatch([1, 1, 2], [1, 2, 2])).toBe(false);
  });

  it("returns true for empty decks", () => {
    expect(decksMatch([], [])).toBe(true);
  });
});
