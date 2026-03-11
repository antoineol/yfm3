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

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(() => []),
}));

vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: vi.fn(),
}));

import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";

const mockLastAdded = useLastAddedCard as ReturnType<typeof vi.fn>;
const mockCardDb = useCardDb as ReturnType<typeof vi.fn>;
const mockUseDeck = useDeck as ReturnType<typeof vi.fn>;

const fakeCardDb: CardDb = {
  cards: [],
  cardsById: new Map([[1, { id: 1, name: "Blue-Eyes", kinds: [], attack: 3000, defense: 2500 }]]),
  cardsByName: new Map(),
} as CardDb;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockUseDeck.mockReturnValue([]);
});

describe("LastAddedCardHint", () => {
  it("renders nothing when no last added card", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue(null);
    const { container } = render(<LastAddedCardHint />);
    expect(container.innerHTML).toBe("");
  });

  it("renders card name and quantity", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByText("(2/3)")).toBeDefined();
  });

  it("disables + button at max quantity", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 3 });
    render(<LastAddedCardHint />);
    const addBtn = screen.getByTitle("Add another copy");
    expect(addBtn.hasAttribute("disabled")).toBe(true);
  });

  it("calls addCard on + click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Add another copy"));
    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls removeCard on − click", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Remove one copy"));
    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 1 });
  });

  it("calls clearLastAddedCard on dismiss", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 1 });
    render(<LastAddedCardHint />);
    fireEvent.click(screen.getByTitle("Dismiss"));
    expect(mockClearHint).toHaveBeenCalledWith({});
  });

  it("disables − button when all copies are in deck", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    mockUseDeck.mockReturnValue([{ cardId: 1 }, { cardId: 1 }]);
    render(<LastAddedCardHint />);
    const removeBtn = screen.getByTitle("Remove one copy");
    expect(removeBtn.hasAttribute("disabled")).toBe(true);
  });

  it("enables − button when copies are available", () => {
    mockCardDb.mockReturnValue(fakeCardDb);
    mockLastAdded.mockReturnValue({ cardId: 1, quantity: 2 });
    mockUseDeck.mockReturnValue([{ cardId: 1 }]);
    render(<LastAddedCardHint />);
    const removeBtn = screen.getByTitle("Remove one copy");
    expect(removeBtn.hasAttribute("disabled")).toBe(false);
  });
});
