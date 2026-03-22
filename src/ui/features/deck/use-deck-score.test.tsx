// @vitest-environment happy-dom
import { cleanup, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScorerResult } from "../../../engine/worker/messages.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";

vi.mock("../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: vi.fn(),
}));
vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 5),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
}));

import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { _resetDeckScoreCache, useDeckScore } from "./use-deck-score.ts";

const mockOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;

/** Captures posted messages and allows triggering onmessage. */
class MockWorker {
  onmessage: ((e: MessageEvent<ScorerResult>) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;
  postedMessage: unknown = null;

  postMessage(msg: unknown) {
    this.postedMessage = msg;
  }

  terminate() {
    this.terminated = true;
  }

  /** Simulate the worker responding with an expectedAtk value. */
  respond(expectedAtk: number) {
    const result: ScorerResult = { type: "SCORE_RESULT", expectedAtk };
    this.onmessage?.({ data: result } as MessageEvent<ScorerResult>);
  }
}

let createdWorkers: MockWorker[] = [];

beforeEach(() => {
  createdWorkers = [];
  _resetDeckScoreCache();
  vi.stubGlobal(
    "Worker",
    class extends MockWorker {
      constructor() {
        super();
        createdWorkers.push(this);
      }
    },
  );
  mockOwnedCardTotals.mockReturnValue({ 1: 3, 2: 3 });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

function makeWrapper(store: ReturnType<typeof createStore>) {
  return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
}

describe("useDeckScore", () => {
  it("returns null when deck is not full-size", () => {
    const store = createStore();
    const { result } = renderHook(() => useDeckScore([1, 2]), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toBeNull();
    expect(createdWorkers).toHaveLength(0);
  });

  it("returns null when collection is not loaded", () => {
    mockOwnedCardTotals.mockReturnValue(undefined);
    const store = createStore();
    const { result } = renderHook(() => useDeckScore([1, 2, 3, 4, 5]), {
      wrapper: makeWrapper(store),
    });
    expect(result.current).toBeNull();
    expect(createdWorkers).toHaveLength(0);
  });

  it("spawns a worker and returns score when deck is full-size", async () => {
    const store = createStore();
    const { result } = renderHook(() => useDeckScore([1, 2, 3, 4, 5]), {
      wrapper: makeWrapper(store),
    });

    // Should have spawned a worker
    expect(createdWorkers).toHaveLength(1);
    expect(result.current).toBeNull(); // not yet computed

    // Simulate worker response
    createdWorkers[0]?.respond(1500.5);

    // Atom should be updated
    expect(store.get(currentDeckScoreAtom)).toBe(1500.5);
  });

  it("terminates previous worker when deck changes", () => {
    const store = createStore();
    const { rerender } = renderHook(({ ids }) => useDeckScore(ids), {
      initialProps: { ids: [1, 2, 3, 4, 5] },
      wrapper: makeWrapper(store),
    });

    expect(createdWorkers).toHaveLength(1);
    // Let the first worker complete so the key is cached
    createdWorkers[0]?.respond(1000);

    // Rerender with same cards in different order
    rerender({ ids: [5, 4, 3, 2, 1] });

    // Same sorted key — should not spawn a new worker
    expect(createdWorkers).toHaveLength(1);

    // Actually different deck
    rerender({ ids: [1, 1, 1, 1, 2] });

    // New worker spawned, old one terminated
    expect(createdWorkers).toHaveLength(2);
    expect(createdWorkers[0]?.terminated).toBe(true);
  });

  it("preserves score across unmount/remount (tab switch)", () => {
    const store = createStore();
    const deck = [1, 2, 3, 4, 5];

    // Mount and compute score
    const { unmount } = renderHook(() => useDeckScore(deck), {
      wrapper: makeWrapper(store),
    });
    expect(createdWorkers).toHaveLength(1);
    createdWorkers[0]?.respond(1500.5);
    expect(store.get(currentDeckScoreAtom)).toBe(1500.5);

    // Unmount (tab switch away)
    unmount();

    // Remount with same deck (tab switch back)
    renderHook(() => useDeckScore(deck), {
      wrapper: makeWrapper(store),
    });

    // Should NOT have spawned a new worker — score is still cached
    expect(createdWorkers).toHaveLength(1);
    expect(store.get(currentDeckScoreAtom)).toBe(1500.5);
  });

  it("does not update atom after cleanup (cancelled)", () => {
    const store = createStore();
    const { unmount } = renderHook(() => useDeckScore([1, 2, 3, 4, 5]), {
      wrapper: makeWrapper(store),
    });

    expect(createdWorkers).toHaveLength(1);
    unmount();

    // Worker terminated on cleanup
    expect(createdWorkers[0]?.terminated).toBe(true);

    // Responding after unmount should not update atom
    createdWorkers[0]?.respond(9999);
    expect(store.get(currentDeckScoreAtom)).toBeNull();
  });
});
