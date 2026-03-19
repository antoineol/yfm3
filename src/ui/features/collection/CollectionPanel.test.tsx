// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  // auto-animate calls el.animate() which happy-dom doesn't support
  Element.prototype.animate = vi.fn().mockReturnValue({
    onfinish: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    cancel: vi.fn(),
  }) as never;
});

import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";

const mockAddCard = vi.fn();
const mockRemoveCard = vi.fn();
const mockAddToDeck = vi.fn();

const mockCardAutocomplete = vi.fn(({ placeholder }: { placeholder?: string }) => (
  <input data-testid="card-autocomplete" placeholder={placeholder} />
));

vi.mock("../../components/CardAutocomplete.tsx", () => ({
  CardAutocomplete: (props: {
    placeholder?: string;
    cards?: Array<{ id: number; disabled?: boolean }>;
  }) => {
    mockCardAutocomplete(props);
    return <input data-testid="card-autocomplete" placeholder={props.placeholder} />;
  },
}));

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
    ownedCards: { addCard: "addCard", removeCard: "removeCard" },
    deck: { addToDeck: "addToDeck" },
  },
}));

vi.mock("./use-collection-view-model.ts", () => ({
  useCollectionViewModel: vi.fn(),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
}));

vi.mock("./LastAddedCardHint.tsx", () => ({
  LastAddedCardHint: () => <div data-testid="last-added-hint" />,
}));

import type { ReactNode } from "react";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { CardDetailProvider } from "../../lib/card-detail-context.tsx";
import { CollectionPanel } from "./CollectionPanel.tsx";
import {
  type CollectionCardViewModel,
  useCollectionViewModel,
} from "./use-collection-view-model.ts";

const mockUseCollectionViewModel = useCollectionViewModel as ReturnType<typeof vi.fn>;
const mockDeckSize = useDeckSize as ReturnType<typeof vi.fn>;
const emptyCardDb = createCardDb();

addCard(emptyCardDb, {
  id: 1,
  name: "Blue-Eyes",
  kinds: ["Dragon"],
  color: "blue",
  attack: 3000,
  defense: 2500,
});

addCard(emptyCardDb, {
  id: 2,
  name: "Dark Magician",
  kinds: ["Spellcaster"],
  color: "blue",
  attack: 2500,
  defense: 2100,
});

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <CardDbProvider cardDb={emptyCardDb}>
      <CardDetailProvider>{children}</CardDetailProvider>
    </CardDbProvider>
  );
}

function buildCollectionEntry({
  id,
  name = "Card",
  atk = 100,
  def = 100,
  totalOwned = 1,
  inDeck = 0,
  availableInCollection = totalOwned - inDeck,
}: {
  id: number;
  name?: string;
  atk?: number;
  def?: number;
  totalOwned?: number;
  inDeck?: number;
  availableInCollection?: number;
}): CollectionCardViewModel {
  return {
    id,
    name,
    atk,
    def,
    qty: availableInCollection,
    totalOwned,
    inDeck,
    availableInCollection,
  };
}

function buildCollectionViewModel({
  entries = [],
  deckLength = 0,
  totalOwnedCards = entries.reduce((sum, entry) => sum + entry.totalOwned, 0),
}: {
  entries?: CollectionCardViewModel[];
  deckLength?: number;
  totalOwnedCards?: number;
}) {
  return {
    entries,
    entriesByCardId: new Map(entries.map((entry) => [entry.id, entry])),
    totalOwnedCards,
    uniqueOwnedCards: entries.length,
    deckLength,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockDeckSize.mockReturnValue(40);
});

function getRowTexts() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.textContent);
}

describe("CollectionPanel", () => {
  it("renders loading state when data is undefined", () => {
    mockUseCollectionViewModel.mockReturnValue(undefined);
    const { container } = render(<CollectionPanel />, { wrapper: Wrapper });
    expect(container.querySelector(".animate-spin-gold")).not.toBeNull();
  });

  it("renders empty state when total owned cards is 0", () => {
    mockUseCollectionViewModel.mockReturnValue(buildCollectionViewModel({}));
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("Your collection is empty")).toBeDefined();
  });

  it("renders card table when collection has cards", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [buildCollectionEntry({ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500 })],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });

  it("renders action buttons per card row", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({ entries: [buildCollectionEntry({ id: 1, name: "Blue-Eyes" })] }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Add copy")).toBeDefined();
    expect(screen.getByTitle("Remove copy")).toBeDefined();
    expect(screen.getByTitle("Add to deck")).toBeDefined();
  });

  it("disables + button when total owned reached 3 even if one copy is in deck", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({
            id: 1,
            name: "Blue-Eyes",
            atk: 3000,
            def: 2500,
            totalOwned: 3,
            inDeck: 1,
            availableInCollection: 2,
          }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Add copy").hasAttribute("disabled")).toBe(true);
  });

  it("calls addCard on + click", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({ entries: [buildCollectionEntry({ id: 42 })] }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Add copy"));
    expect(mockAddCard).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("calls removeCard on − click", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [buildCollectionEntry({ id: 42, totalOwned: 2, availableInCollection: 2 })],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Remove copy"));
    expect(mockRemoveCard).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("calls addToDeck on ▶ click", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({ entries: [buildCollectionEntry({ id: 42 })] }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("Add to deck"));
    expect(mockAddToDeck).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("disables add-to-deck when no copies are available in collection", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 42, totalOwned: 2, inDeck: 2, availableInCollection: 0 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Add to deck").hasAttribute("disabled")).toBe(true);
  });

  it("disables add-to-deck when deck is full", () => {
    mockDeckSize.mockReturnValue(40);
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [buildCollectionEntry({ id: 999, totalOwned: 3, availableInCollection: 3 })],
        deckLength: 40,
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Add to deck").hasAttribute("disabled")).toBe(true);
  });

  it("renders search autocomplete in header", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({ entries: [buildCollectionEntry({ id: 1, name: "Blue-Eyes" })] }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("Add card...")).toBeDefined();
  });

  it("keeps autocomplete enabled when total owned is below 3", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({
            id: 1,
            name: "Blue-Eyes",
            atk: 3000,
            def: 2500,
            totalOwned: 2,
            inDeck: 1,
            availableInCollection: 1,
          }),
        ],
      }),
    );

    render(<CollectionPanel />, { wrapper: Wrapper });

    const props = mockCardAutocomplete.mock.calls.at(-1)?.[0] as
      | { cards?: Array<{ id: number; disabled?: boolean }> }
      | undefined;
    expect(props?.cards?.find((card) => card.id === 1)?.disabled).toBe(false);
  });

  it("disables autocomplete entries when total owned copies reached 3", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({
            id: 1,
            name: "Blue-Eyes",
            atk: 3000,
            def: 2500,
            totalOwned: 3,
            inDeck: 1,
            availableInCollection: 2,
          }),
        ],
      }),
    );

    render(<CollectionPanel />, { wrapper: Wrapper });

    const props = mockCardAutocomplete.mock.calls.at(-1)?.[0] as
      | { cards?: Array<{ id: number; disabled?: boolean }> }
      | undefined;
    expect(props?.cards?.find((card) => card.id === 1)?.disabled).toBe(true);
    expect(props?.cards?.find((card) => card.id === 2)?.disabled).toBe(false);
  });

  it("disables remove button when no available copies", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 42, totalOwned: 1, inDeck: 1, availableInCollection: 0 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTitle("Remove copy").hasAttribute("disabled")).toBe(true);
  });

  it("shows available copies in collection", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({
            id: 1,
            name: "Blue-Eyes",
            atk: 3000,
            def: 2500,
            totalOwned: 3,
            inDeck: 1,
            availableInCollection: 2,
          }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByText("×2")).toBeDefined();
  });

  it("renders the LastAddedCardHint", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({ entries: [buildCollectionEntry({ id: 1, name: "Blue-Eyes" })] }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    expect(screen.getByTestId("last-added-hint")).toBeDefined();
  });

  it("sorts by ID ascending by default", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 2, name: "Dark Magician", atk: 2500 }),
          buildCollectionEntry({ id: 1, name: "Blue-Eyes", atk: 3000 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });
    const rowTexts = getRowTexts();
    expect(rowTexts).toEqual([
      expect.stringContaining("Blue-Eyes"),
      expect.stringContaining("Dark Magician"),
    ]);
  });

  it("cycles # sort: default asc, click → desc, click → off, click → asc", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 5, name: "Mystical Elf", atk: 800 }),
          buildCollectionEntry({ id: 2, name: "Dark Magician", atk: 2500 }),
          buildCollectionEntry({ id: 1, name: "Blue-Eyes", atk: 3000 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });

    // 1st click: desc
    fireEvent.click(screen.getByText("#"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Mystical Elf"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Blue-Eyes"),
    ]);

    // 2nd click: off (original entry order)
    fireEvent.click(screen.getByText("#"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Mystical Elf"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Blue-Eyes"),
    ]);

    // 3rd click: asc again
    fireEvent.click(screen.getByText("#"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Blue-Eyes"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Mystical Elf"),
    ]);
  });

  it("sorts by ATK descending on first click, ascending on second, off on third", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 1, name: "Blue-Eyes", atk: 3000 }),
          buildCollectionEntry({ id: 5, name: "Mystical Elf", atk: 800 }),
          buildCollectionEntry({ id: 2, name: "Dark Magician", atk: 2500 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });

    // 1st click: desc
    fireEvent.click(screen.getByText("ATK"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Blue-Eyes"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Mystical Elf"),
    ]);

    // 2nd click: asc
    fireEvent.click(screen.getByText("ATK"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Mystical Elf"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Blue-Eyes"),
    ]);

    // 3rd click: off (back to original order)
    fireEvent.click(screen.getByText("ATK"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Blue-Eyes"),
      expect.stringContaining("Mystical Elf"),
      expect.stringContaining("Dark Magician"),
    ]);
  });

  it("switches columns: clicking ATK while sorted by # resets to ATK desc", () => {
    mockUseCollectionViewModel.mockReturnValue(
      buildCollectionViewModel({
        entries: [
          buildCollectionEntry({ id: 1, name: "Blue-Eyes", atk: 3000 }),
          buildCollectionEntry({ id: 5, name: "Mystical Elf", atk: 800 }),
          buildCollectionEntry({ id: 2, name: "Dark Magician", atk: 2500 }),
        ],
      }),
    );
    render(<CollectionPanel />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("#"));
    fireEvent.click(screen.getByText("ATK"));
    expect(getRowTexts()).toEqual([
      expect.stringContaining("Blue-Eyes"),
      expect.stringContaining("Dark Magician"),
      expect.stringContaining("Mystical Elf"),
    ]);
  });
});
