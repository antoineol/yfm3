// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { DeckSwapSuggestion } from "../../../engine/suggest-deck-swap.ts";

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

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useAtomValue: vi.fn(() => null),
  };
});

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    ownedCards: { addCard: "addCard", removeCard: "removeCard" },
    userPreferences: { clearLastAddedCard: "clearLastAddedCard" },
    deck: { applySuggestedSwap: "applySuggestedSwap" },
  },
}));

vi.mock("../../db/use-last-added-card.ts", () => ({ useLastAddedCard: vi.fn() }));
vi.mock("../../db/use-deck.ts", () => ({ useDeck: vi.fn() }));
vi.mock("../../db/use-owned-card-totals.ts", () => ({ useOwnedCardTotals: vi.fn() }));
vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 5),
  useFusionDepth: vi.fn(() => 3),
}));
vi.mock("../../lib/card-db-context.tsx", () => ({ useCardDb: vi.fn() }));
vi.mock("./use-collection-view-model.ts", () => ({ useCollectionViewModel: vi.fn() }));

import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import type { CollectionCardViewModel } from "./use-collection-view-model.ts";
import { useCollectionViewModel } from "./use-collection-view-model.ts";

const mockDeck = useDeck as ReturnType<typeof vi.fn>;
const mockLastAdded = useLastAddedCard as ReturnType<typeof vi.fn>;
const mockOwnedCardTotals = useOwnedCardTotals as ReturnType<typeof vi.fn>;
const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;
const mockCollection = useCollectionViewModel as ReturnType<typeof vi.fn>;

const originalWorker = globalThis.Worker;

class MockWorker {
  static instances: MockWorker[] = [];

  onmessage:
    | ((event: MessageEvent<{ requestId: number; suggestion: DeckSwapSuggestion | null }>) => void)
    | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  lastRequestId = 0;
  postMessage = vi.fn((message: { requestId: number }) => {
    this.lastRequestId = message.requestId;
  });
  terminate = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  respond(suggestion: DeckSwapSuggestion | null) {
    this.onmessage?.({
      data: { requestId: this.lastRequestId, suggestion },
    } as MessageEvent<{ requestId: number; suggestion: DeckSwapSuggestion | null }>);
  }
}

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([
    [1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }],
    [2, { id: 2, name: "Kuriboh", kinds: [], attack: 300, defense: 200 }],
  ]),
  cardsByName: new Map(),
} as CardDb;

beforeEach(() => {
  globalThis.Worker = MockWorker as unknown as typeof Worker;
  MockWorker.instances = [];
  mockCardDb.mockReturnValue(fakeCardDb);
  mockCollection.mockReturnValue(
    makeCollectionViewModel({ totalOwned: 1, availableInCollection: 1 }),
  );
  mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
  mockDeck.mockReturnValue([
    { cardId: 2 },
    { cardId: 2 },
    { cardId: 3 },
    { cardId: 4 },
    { cardId: 5 },
  ]);
  mockOwnedCardTotals.mockReturnValue({ 1: 1, 2: 2, 3: 1, 4: 1, 5: 1 });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  globalThis.Worker = originalWorker;
});

describe("LastAddedCardHint", () => {
  it("renders nothing when there is no last added card", () => {
    mockLastAdded.mockReturnValue(null);

    const { container } = render(<LastAddedCardHint />);

    expect(container.innerHTML).toBe("");
    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).not.toHaveBeenCalled();
  });

  it("keeps the base quick actions working", () => {
    render(<LastAddedCardHint />);

    fireEvent.click(screen.getByTitle("Add another copy"));
    fireEvent.click(screen.getByTitle("Remove one copy"));
    fireEvent.click(screen.getByTitle("Dismiss"));

    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 1 });
    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 1 });
    expect(mockClearHint).toHaveBeenCalledWith({});
  });

  it("does not run suggestion lookup when the deck is not full", () => {
    mockDeck.mockReturnValue([{ cardId: 2 }]);

    render(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).not.toHaveBeenCalled();
    expect(screen.queryByText("Checking deck upgrade...")).toBeNull();
  });

  it("does not run suggestion lookup when no extra copy of the added card is available", () => {
    mockDeck.mockReturnValue([
      { cardId: 1 },
      { cardId: 2 },
      { cardId: 3 },
      { cardId: 4 },
      { cardId: 5 },
    ]);
    mockOwnedCardTotals.mockReturnValue({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    mockCollection.mockReturnValue(
      makeCollectionViewModel({ totalOwned: 1, availableInCollection: 0 }),
    );

    render(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).not.toHaveBeenCalled();
    expect(screen.queryByText("Checking deck upgrade...")).toBeNull();
  });

  it("does not restart the worker when unrelated owned totals change", () => {
    const { rerender } = render(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(1);

    mockOwnedCardTotals.mockReturnValue({ 1: 1, 2: 2, 3: 1, 4: 1, 5: 1, 9: 2 });

    rerender(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(1);
  });

  it("recalculates when the added card availability changes", () => {
    const { rerender } = render(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(1);

    mockOwnedCardTotals.mockReturnValue({ 1: 2, 2: 2, 3: 1, 4: 1, 5: 1 });
    mockCollection.mockReturnValue(
      makeCollectionViewModel({ totalOwned: 2, availableInCollection: 2 }),
    );

    rerender(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(2);
  });

  it("recalculates when the deck contents change", () => {
    const { rerender } = render(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(1);

    mockDeck.mockReturnValue([
      { cardId: 2 },
      { cardId: 3 },
      { cardId: 3 },
      { cardId: 4 },
      { cardId: 5 },
    ]);
    mockOwnedCardTotals.mockReturnValue({ 1: 1, 2: 1, 3: 2, 4: 1, 5: 1 });

    rerender(<LastAddedCardHint />);

    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]?.postMessage).toHaveBeenCalledTimes(2);
  });

  it("shows loading, then renders the suggestion and applies it", async () => {
    mockApplySuggestedSwap.mockResolvedValue({ success: true });

    render(<LastAddedCardHint />);

    expect(screen.getByText("Checking deck upgrade...")).toBeDefined();
    expect(MockWorker.instances).toHaveLength(1);

    MockWorker.instances[0]?.respond({ removedCardId: 2, improvement: 200 });

    await waitFor(() => expect(screen.getByText("Apply swap")).toBeDefined());

    fireEvent.click(screen.getByText("Apply swap"));

    await waitFor(() =>
      expect(mockApplySuggestedSwap).toHaveBeenCalledWith({ addCardId: 1, removeCardId: 2 }),
    );
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith("Deck swap applied"));
    expect(screen.queryByText("Apply swap")).toBeNull();
  });

  it("lets the user reject the suggestion", async () => {
    render(<LastAddedCardHint />);

    MockWorker.instances[0]?.respond({ removedCardId: 2, improvement: 200 });

    await waitFor(() => expect(screen.getByText("Reject")).toBeDefined());
    fireEvent.click(screen.getByText("Reject"));

    expect(screen.queryByText("Apply swap")).toBeNull();
    expect(mockApplySuggestedSwap).not.toHaveBeenCalled();
  });

  it("shows an error toast when apply fails", async () => {
    mockApplySuggestedSwap.mockRejectedValue(new Error("boom"));

    render(<LastAddedCardHint />);

    MockWorker.instances[0]?.respond({ removedCardId: 2, improvement: 200 });

    await waitFor(() => expect(screen.getByText("Apply swap")).toBeDefined());
    fireEvent.click(screen.getByText("Apply swap"));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Could not apply deck swap"));
  });
});

function makeCollectionViewModel(params: { totalOwned: number; availableInCollection: number }) {
  const entry: CollectionCardViewModel = {
    id: 1,
    name: "Blue-Eyes",
    atk: 3000,
    def: 2500,
    qty: params.availableInCollection,
    totalOwned: params.totalOwned,
    inDeck: params.totalOwned - params.availableInCollection,
    availableInCollection: params.availableInCollection,
  };

  return {
    entries: [entry],
    entriesByCardId: new Map([[entry.id, entry]]),
    totalOwnedCards: entry.totalOwned,
    uniqueOwnedCards: 1,
    deckLength: 5,
  };
}
