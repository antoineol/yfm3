// @vitest-environment happy-dom
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DeckSwapSuggestion } from "../../../engine/suggest-deck-swap.ts";

vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => "rp"),
}));

vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridge: vi.fn(() => ({ gameData: null })),
}));

import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

const originalWorker = globalThis.Worker;

class MockWorker {
  static instances: MockWorker[] = [];

  onmessage:
    | ((event: MessageEvent<{ requestId: number; suggestion: DeckSwapSuggestion | null }>) => void)
    | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  getLastRequestId() {
    const lastCall = this.postMessage.mock.calls.at(-1)?.[0] as { requestId?: number } | undefined;
    return lastCall?.requestId ?? -1;
  }

  respondWithLastRequest(suggestion: DeckSwapSuggestion | null) {
    this.onmessage?.({
      data: { requestId: this.getLastRequestId(), suggestion },
    } as MessageEvent<{ requestId: number; suggestion: DeckSwapSuggestion | null }>);
  }

  respondWithRequestId(requestId: number, suggestion: DeckSwapSuggestion | null) {
    this.onmessage?.({
      data: { requestId, suggestion },
    } as MessageEvent<{ requestId: number; suggestion: DeckSwapSuggestion | null }>);
  }
}

beforeEach(() => {
  globalThis.Worker = MockWorker as unknown as typeof Worker;
  MockWorker.instances = [];
});

afterEach(() => {
  vi.clearAllMocks();
  globalThis.Worker = originalWorker;
});

describe("useDeckSwapSuggestion", () => {
  it("does not create a worker when request is invalid on mount", () => {
    renderHook(() =>
      useDeckSwapSuggestion({
        addedCardId: null,
        addedCardAvailableCopies: null,
        currentDeckScore: null,
        deck: [{ cardId: 1 }, { cardId: 2 }],
        deckSize: 2,
        fusionDepth: 3,
        useEquipment: true,
      }),
    );

    expect(MockWorker.instances).toHaveLength(0);
  });

  it("creates a worker only when request becomes valid", () => {
    const initialProps: { addedCardId: number | null; addedCardAvailableCopies: number | null } = {
      addedCardId: null,
      addedCardAvailableCopies: null,
    };
    const { rerender } = renderHook(
      (props: { addedCardId: number | null; addedCardAvailableCopies: number | null }) =>
        useDeckSwapSuggestion({
          ...props,
          currentDeckScore: null,
          deck: [{ cardId: 1 }, { cardId: 2 }],
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps },
    );

    expect(MockWorker.instances).toHaveLength(0);

    rerender({ addedCardId: 9, addedCardAvailableCopies: 1 });

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(1);
  });

  it("reuses the same worker across rerenders with equivalent inputs", () => {
    const { rerender } = renderHook(
      (props: { deck: Array<{ cardId: number }> }) =>
        useDeckSwapSuggestion({
          addedCardId: 9,
          addedCardAvailableCopies: 1,
          currentDeckScore: 100,
          deck: props.deck,
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps: { deck: [{ cardId: 1 }, { cardId: 2 }] } },
    );

    const worker = MockWorker.instances[0];
    expect(worker).toBeDefined();
    expect(worker?.postMessage).toHaveBeenCalledTimes(1);

    rerender({ deck: [{ cardId: 1 }, { cardId: 2 }] });

    expect(MockWorker.instances).toHaveLength(1);
    expect(worker?.postMessage).toHaveBeenCalledTimes(1);
  });

  it("terminates the worker when request becomes invalid", () => {
    const { rerender } = renderHook(
      (props: { addedCardAvailableCopies: number | null }) =>
        useDeckSwapSuggestion({
          addedCardId: 9,
          addedCardAvailableCopies: props.addedCardAvailableCopies,
          currentDeckScore: null,
          deck: [{ cardId: 1 }, { cardId: 2 }],
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps: { addedCardAvailableCopies: 1 } },
    );

    const worker = MockWorker.instances[0];
    expect(worker).toBeDefined();

    rerender({ addedCardAvailableCopies: 0 });

    expect(worker?.terminate).toHaveBeenCalledTimes(1);
  });

  it("ignores stale responses after invalidation", () => {
    const { rerender, result } = renderHook(
      (props: { addedCardAvailableCopies: number | null }) =>
        useDeckSwapSuggestion({
          addedCardId: 9,
          addedCardAvailableCopies: props.addedCardAvailableCopies,
          currentDeckScore: null,
          deck: [{ cardId: 1 }, { cardId: 2 }],
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps: { addedCardAvailableCopies: 1 } },
    );

    const worker = MockWorker.instances[0];
    expect(worker).toBeDefined();

    const requestId = worker?.getLastRequestId() ?? -1;
    rerender({ addedCardAvailableCopies: 0 });
    worker?.respondWithRequestId(requestId, { removedCardId: 1, improvement: 10 });

    expect(result.current.suggestion).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("reruns when deck content changes", () => {
    const { rerender } = renderHook(
      (props: { deck: Array<{ cardId: number }> }) =>
        useDeckSwapSuggestion({
          addedCardId: 9,
          addedCardAvailableCopies: 1,
          currentDeckScore: null,
          deck: props.deck,
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps: { deck: [{ cardId: 1 }, { cardId: 2 }] } },
    );

    const worker = MockWorker.instances[0];
    expect(worker?.postMessage).toHaveBeenCalledTimes(1);

    rerender({ deck: [{ cardId: 2 }, { cardId: 3 }] });

    expect(worker?.postMessage).toHaveBeenCalledTimes(2);
  });

  it("reruns when addedCardAvailableCopies changes", () => {
    const { rerender } = renderHook(
      (props: { addedCardAvailableCopies: number | null }) =>
        useDeckSwapSuggestion({
          addedCardId: 9,
          addedCardAvailableCopies: props.addedCardAvailableCopies,
          currentDeckScore: null,
          deck: [{ cardId: 1 }, { cardId: 2 }],
          deckSize: 2,
          fusionDepth: 3,
          useEquipment: true,
        }),
      { initialProps: { addedCardAvailableCopies: 1 } },
    );

    const worker = MockWorker.instances[0];
    expect(worker?.postMessage).toHaveBeenCalledTimes(1);

    rerender({ addedCardAvailableCopies: 2 });

    expect(worker?.postMessage).toHaveBeenCalledTimes(2);
  });

  it("clears loading and stores suggestion for current request", async () => {
    const { result } = renderHook(() =>
      useDeckSwapSuggestion({
        addedCardId: 9,
        addedCardAvailableCopies: 1,
        currentDeckScore: null,
        deck: [{ cardId: 1 }, { cardId: 2 }],
        deckSize: 2,
        fusionDepth: 3,
        useEquipment: true,
      }),
    );

    const worker = MockWorker.instances[0];
    expect(result.current.loading).toBe(true);

    worker?.respondWithLastRequest({ removedCardId: 1, improvement: 10 });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.suggestion).toEqual({ removedCardId: 1, improvement: 10 });
  });
});
