// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardDb } from "../../../engine/data/game-db.ts";

const mockAddCard = vi.fn();
const mockRemoveCard = vi.fn();
const mockClearHint = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (ref: string) => {
    if (ref === "addCard") return mockAddCard;
    if (ref === "removeCard") return mockRemoveCard;
    if (ref === "clearLastAddedCard") return mockClearHint;
    return vi.fn();
  },
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    collection: {
      addCard: "addCard",
      removeCard: "removeCard",
      clearLastAddedCard: "clearLastAddedCard",
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

import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import {
  type CollectionCardViewModel,
  useCollectionViewModel,
} from "./use-collection-view-model.ts";

const mockLastAdded = useLastAddedCard as ReturnType<typeof vi.fn>;
const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;
const mockUseCollectionViewModel = useCollectionViewModel as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([[1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }]]),
  cardsByName: new Map(),
} as CardDb;

function buildCollectionEntry({
  totalOwned,
  availableInCollection,
}: {
  totalOwned: number;
  availableInCollection: number;
}): CollectionCardViewModel {
  return {
    id: 1,
    name: "Blue-Eyes",
    atk: 3000,
    def: 2500,
    qty: availableInCollection,
    totalOwned,
    inDeck: totalOwned - availableInCollection,
    availableInCollection,
  };
}

function buildCollectionViewModel(entry: CollectionCardViewModel) {
  return {
    entries: [entry],
    entriesByCardId: new Map([[entry.id, entry]]),
    totalOwnedCards: entry.totalOwned,
    uniqueOwnedCards: 1,
    deckLength: entry.inDeck,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LastAddedCardHint", () => {
  it("renders nothing when no last added card", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 1,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue(null);
    const { container } = render(<LastAddedCardHint />);
    expect(container.innerHTML).toBe("");
  });

  it("renders card name and total owned quantity", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 2,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByText("(2/3)")).toBeDefined();
  });

  it("disables + button when total owned is at the cap", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 3,
          availableInCollection: 2,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 3 });
    render(<LastAddedCardHint />);
    expect(screen.getByTitle("Add another copy").hasAttribute("disabled")).toBe(true);
  });

  it("calls addCard on + click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 1,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Add another copy"));
    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls removeCard on − click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 2,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Remove one copy"));
    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls clearLastAddedCard on dismiss", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 1,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(mockClearHint).toHaveBeenCalledWith({});
  });

  it("disables − button when no copies are available in collection", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 2,
          availableInCollection: 0,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    expect(screen.getByTitle("Remove one copy").hasAttribute("disabled")).toBe(true);
  });

  it("enables − button when a copy remains available in collection", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel(
        buildCollectionEntry({
          totalOwned: 2,
          availableInCollection: 1,
        }),
      ),
    );
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    expect(screen.getByTitle("Remove one copy").hasAttribute("disabled")).toBe(false);
  });
});
