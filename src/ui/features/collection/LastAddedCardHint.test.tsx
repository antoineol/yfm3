// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import type { CollectionCardViewModel } from "./use-collection-view-model.ts";
import { useCollectionViewModel } from "./use-collection-view-model.ts";
import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

const mockAddCard = vi.fn();
const mockRemoveCard = vi.fn();
const mockClearHint = vi.fn();
const mockApplySuggestedSwap = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (ref: string) => {
    if (ref === "addCard") return mockAddCard;
    if (ref === "removeCard") return mockRemoveCard;
    if (ref === "clearLastAddedCard") return mockClearHint;
    if (ref === "applySuggestedSwap") return mockApplySuggestedSwap;
    return vi.fn();
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => mockToastSuccess(message),
    error: (message: string) => mockToastError(message),
  },
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    ownedCards: {
      addCard: "addCard",
      removeCard: "removeCard",
    },
    userPreferences: {
      clearLastAddedCard: "clearLastAddedCard",
    },
    deck: {
      applySuggestedSwap: "applySuggestedSwap",
    },
  },
}));

vi.mock("../../db/use-last-added-card.ts", () => ({
  useLastAddedCard: vi.fn(),
}));

vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

vi.mock("./use-collection-view-model.ts", () => ({
  useCollectionViewModel: vi.fn(),
}));

vi.mock("./use-deck-swap-suggestion.ts", () => ({
  useDeckSwapSuggestion: vi.fn(() => ({ status: "idle", suggestion: null })),
}));

const mockLastAdded = useLastAddedCard as ReturnType<typeof vi.fn>;
const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;
const mockUseCollectionViewModel = useCollectionViewModel as ReturnType<typeof vi.fn>;
const mockSuggestion = useDeckSwapSuggestion as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([[1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }]]),
  cardsByName: new Map(),
} as CardDb;

beforeEach(() => {
  mockSuggestion.mockReturnValue({ status: "idle", suggestion: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LastAddedCardHint", () => {
  it("renders nothing when no last added card", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue(null);

    const { container } = render(<LastAddedCardHint />);

    expect(container.innerHTML).toBe("");
  });

  it("renders card name and total owned quantity", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 2,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });

    render(<LastAddedCardHint />);

    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByText("(2/3)")).toBeDefined();
  });

  it("disables + button when total owned is at the cap", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 3,
        availableInCollection: 2,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 3 });

    render(<LastAddedCardHint />);

    expect(screen.getByTitle("Add another copy").hasAttribute("disabled")).toBe(true);
  });

  it("calls addCard on + click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });

    render(<LastAddedCardHint />);

    fireEvent.click(screen.getByTitle("Add another copy"));

    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls removeCard on − click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 2,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });

    render(<LastAddedCardHint />);

    fireEvent.click(screen.getByTitle("Remove one copy"));

    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls clearLastAddedCard on dismiss", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });

    render(<LastAddedCardHint />);

    fireEvent.click(screen.getByTitle("Dismiss"));

    expect(mockClearHint).toHaveBeenCalledWith({});
  });

  it("disables − button when no copies are available in collection", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 2,
        availableInCollection: 0,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });

    render(<LastAddedCardHint />);

    expect(screen.getByTitle("Remove one copy").hasAttribute("disabled")).toBe(true);
  });

  it("enables − button when a copy remains available in collection", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 2,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });

    render(<LastAddedCardHint />);

    expect(screen.getByTitle("Remove one copy").hasAttribute("disabled")).toBe(false);
  });

  it("shows loading text while suggestion is being computed", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    mockSuggestion.mockReturnValue({ status: "loading", suggestion: null });

    render(<LastAddedCardHint />);

    expect(screen.getByText("Checking deck upgrade...")).toBeDefined();
  });

  it("renders suggestion text and applies the suggested swap", async () => {
    mockCardDb.mockReturnValue({
      ...fakeCardDb,
      cardsById: new Map([
        [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
        [2, { id: 2, name: "Kuriboh", kinds: [], attack: 300, defense: 200 }],
      ]),
    });
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    mockSuggestion.mockReturnValue({
      status: "ready",
      suggestion: {
        addedCardId: 1,
        removedCardId: 2,
        currentDeckScore: 1000,
        suggestedScore: 1200,
        improvement: 200,
      },
    });
    mockApplySuggestedSwap.mockResolvedValue({ success: true });

    render(<LastAddedCardHint />);

    expect(screen.getByText(/swap out/i)).toBeDefined();
    fireEvent.click(screen.getByText("Apply swap"));

    expect(mockApplySuggestedSwap).toHaveBeenCalledWith({ addCardId: 1, removeCardId: 2 });
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith("Deck swap applied"));
  });

  it("shows an error toast when applying the suggested swap fails", async () => {
    mockCardDb.mockReturnValue({
      ...fakeCardDb,
      cardsById: new Map([
        [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
        [2, { id: 2, name: "Kuriboh", kinds: [], attack: 300, defense: 200 }],
      ]),
    });
    mockUseCollectionViewModel.mockReturnValue(
      makeCollectionViewModel({
        totalOwned: 1,
        availableInCollection: 1,
      }),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    mockSuggestion.mockReturnValue({
      status: "ready",
      suggestion: {
        addedCardId: 1,
        removedCardId: 2,
        currentDeckScore: 1000,
        suggestedScore: 1200,
        improvement: 200,
      },
    });
    mockApplySuggestedSwap.mockRejectedValue(new Error("boom"));

    render(<LastAddedCardHint />);

    fireEvent.click(screen.getByText("Apply swap"));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Could not apply deck swap"));
  });
});

function makeCollectionViewModel(params: { totalOwned: number; availableInCollection: number }) {
  const { totalOwned, availableInCollection } = params;
  const entry: CollectionCardViewModel = {
    id: 1,
    name: "Blue-Eyes",
    atk: 3000,
    def: 2500,
    qty: availableInCollection,
    totalOwned,
    inDeck: totalOwned - availableInCollection,
    availableInCollection,
  };

  return {
    entries: [entry],
    entriesByCardId: new Map([[entry.id, entry]]),
    totalOwnedCards: entry.totalOwned,
    uniqueOwnedCards: 1,
    deckLength: entry.inDeck,
  };
}
