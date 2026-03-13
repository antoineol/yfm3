// @vitest-environment happy-dom
import { renderHook, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: vi.fn(),
}));

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(),
}));

vi.mock("../../db/use-last-added-card.ts", () => ({
  useLastAddedCard: vi.fn(),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 5),
  useFusionDepth: vi.fn(() => 3),
}));

vi.mock("../../../engine/suggest-deck-swap.ts", () => ({
  findBestDeckSwapSuggestionInWorker: vi.fn(),
}));

import {
  type DeckSwapSuggestion,
  findBestDeckSwapSuggestionInWorker,
} from "../../../engine/suggest-deck-swap.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

const mockFindSuggestion = findBestDeckSwapSuggestionInWorker as ReturnType<typeof vi.fn>;
const mockOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;
const mockDeck = useDeck as ReturnType<typeof vi.fn>;
const mockLastAdded = useLastAddedCard as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockOwnedCardTotals.mockReturnValue({ 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 });
  mockDeck.mockReturnValue([
    { cardId: 1 },
    { cardId: 1 },
    { cardId: 2 },
    { cardId: 3 },
    { cardId: 4 },
  ]);
  mockLastAdded.mockReturnValue({ cardId: 5, quantity: 1 });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useDeckSwapSuggestion", () => {
  it("shows nothing when the deck is underfilled", () => {
    mockDeck.mockReturnValue([{ cardId: 1 }, { cardId: 2 }]);
    const store = createStore();

    const { result } = renderHook(() => useDeckSwapSuggestion(), {
      wrapper: makeWrapper(store),
    });

    expect(result.current).toMatchObject({ status: "idle", suggestion: null });
    expect(mockFindSuggestion).not.toHaveBeenCalled();
  });

  it("shows loading while analysis runs and then returns the suggestion", async () => {
    let resolveSuggestion!: (value: DeckSwapSuggestion | null) => void;
    mockFindSuggestion.mockImplementation(
      () =>
        new Promise<DeckSwapSuggestion | null>((resolve) => {
          resolveSuggestion = resolve;
        }),
    );

    const { result } = renderHook(() => useDeckSwapSuggestion(), {
      wrapper: makeWrapper(createStore()),
    });

    expect(result.current).toMatchObject({ status: "loading", suggestion: null });
    expect(mockFindSuggestion).toHaveBeenCalledOnce();

    resolveSuggestion({
      removedCardId: 4,
      improvement: 10,
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        status: "ready",
        suggestion: {
          removedCardId: 4,
          improvement: 10,
        },
      }),
    );
  });

  it("returns to idle when the worker fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFindSuggestion.mockRejectedValue(new Error("boom"));

    const store = createStore();

    const { result } = renderHook(() => useDeckSwapSuggestion(), {
      wrapper: makeWrapper(store),
    });

    expect(result.current).toMatchObject({ status: "loading", suggestion: null });

    await waitFor(() => expect(result.current).toMatchObject({ status: "idle", suggestion: null }));
    expect(consoleError).toHaveBeenCalledWith("Suggestion lookup failed:", expect.any(Error));
    consoleError.mockRestore();
  });

  it("does not restart when owned card totals keep the same data", async () => {
    mockFindSuggestion.mockResolvedValue(null);

    const store = createStore();
    const { rerender } = renderHook(() => useDeckSwapSuggestion(), {
      wrapper: makeWrapper(store),
    });

    await waitFor(() => expect(mockFindSuggestion).toHaveBeenCalledOnce());

    mockOwnedCardTotals.mockReturnValue({ 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 });
    rerender();

    expect(mockFindSuggestion).toHaveBeenCalledOnce();
  });
});

function makeWrapper(store: ReturnType<typeof createStore>) {
  return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
}
