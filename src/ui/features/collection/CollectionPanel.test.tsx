// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCardDb } from "../../../engine/data/game-db.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";

const mockAddCard = vi.fn();
const mockRemoveCard = vi.fn();
const mockAddToDeck = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (ref: string) => {
    if (ref === "addCard") return mockAddCard;
    if (ref === "removeCard") return mockRemoveCard;
    if (ref === "addToDeck") return mockAddToDeck;
    return vi.fn();
  },
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    collection: { addCard: "addCard", removeCard: "removeCard" },
    deck: { addToDeck: "addToDeck" },
  },
}));

vi.mock("./use-collection-entries.ts", () => ({
  useCollectionEntries: vi.fn(),
}));

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(() => []),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
}));

vi.mock("./LastAddedCardHint.tsx", () => ({
  LastAddedCardHint: () => <div data-testid="last-added-hint" />,
}));

import type { ReactNode } from "react";
import { useDeck } from "../../db/use-deck.ts";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { CollectionPanel } from "./CollectionPanel.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

const mockHook = useCollectionEntries as ReturnType<typeof vi.fn>;
const mockUseDeck = useDeck as ReturnType<typeof vi.fn>;
const mockDeckSize = useDeckSize as ReturnType<typeof vi.fn>;
const emptyCardDb = createCardDb();
function Wrapper({ children }: { children: ReactNode }) {
  return <CardDbProvider cardDb={emptyCardDb}>{children}</CardDbProvider>;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockUseDeck.mockReturnValue([]);
  mockDeckSize.mockReturnValue(40);
});

describe("CollectionPanel", () => {
  it("renders loading state when data is undefined", () => {
    mockHook.mockReturnValue(undefined);
    const { container } = render(<CollectionPanel />, { wrapper: Wrapper });
    expect(container.querySelector(".animate-spin-gold")).not.toBeNull();
  });

  it("renders empty state when totalCards is 0", () => {
    mockHook.mockReturnValue({ entries: [], totalCards: 0, uniqueCards: 0 });
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("Your collection is empty")).toBeDefined();
  });

  it("renders card table with badge when collection has cards", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 2 }],
      totalCards: 2,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("2 cards (1 unique)")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });

  it("renders action buttons per card row", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      totalCards: 1,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Add copy")).toBeDefined();
    expect(screen.getByTitle("Remove copy")).toBeDefined();
    expect(screen.getByTitle("Add to deck")).toBeDefined();
  });

  it("disables + button at max quantity (3)", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 3 }],
      totalCards: 3,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    const addBtn = screen.getByTitle("Add copy");
    expect(addBtn.hasAttribute("disabled")).toBe(true);
  });

  it("calls addCard on + click", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 1 }],
      totalCards: 1,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Add copy"));
    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("calls removeCard on − click", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 2 }],
      totalCards: 2,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Remove copy"));
    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("calls addToDeck on ▶ click", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 1 }],
      totalCards: 1,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Add to deck"));
    expect(mockAddToDeck).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("disables add-to-deck when all copies are in deck", () => {
    mockUseDeck.mockReturnValue([{ cardId: 42 }, { cardId: 42 }]);
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 2 }],
      totalCards: 2,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    const deckBtn = screen.getByTitle("Add to deck");
    expect(deckBtn.hasAttribute("disabled")).toBe(true);
  });

  it("disables add-to-deck when deck is full", () => {
    const fullDeck = Array.from({ length: 40 }, (_, i) => ({ cardId: i }));
    mockUseDeck.mockReturnValue(fullDeck);
    mockDeckSize.mockReturnValue(40);
    mockHook.mockReturnValue({
      entries: [{ id: 999, name: "Card", atk: 100, def: 100, qty: 3 }],
      totalCards: 3,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    const deckBtn = screen.getByTitle("Add to deck");
    expect(deckBtn.hasAttribute("disabled")).toBe(true);
  });

  it("shows owned/available badge when deck has cards", () => {
    mockUseDeck.mockReturnValue([{ cardId: 1 }]);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 3 }],
      totalCards: 3,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("1 unique · 2 available")).toBeDefined();
  });

  it("disables remove button when no available copies", () => {
    mockUseDeck.mockReturnValue([{ cardId: 42 }]);
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 1 }],
      totalCards: 1,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    const removeBtn = screen.getByTitle("Remove copy");
    expect(removeBtn.hasAttribute("disabled")).toBe(true);
  });

  it("shows remaining copies (total minus in-deck)", () => {
    mockUseDeck.mockReturnValue([{ cardId: 1 }]);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 3 }],
      totalCards: 3,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    // qty displayed should be 3-1=2, shown as ×2
    expect(screen.getByText("×2")).toBeDefined();
  });

  it("renders the LastAddedCardHint", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      totalCards: 1,
      uniqueCards: 1,
    });
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTestId("last-added-hint")).toBeDefined();
  });
});
