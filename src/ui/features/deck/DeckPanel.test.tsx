// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockRemoveOne = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: (ref: string) => {
    if (ref === "removeOneByCardId") return mockRemoveOne;
    return vi.fn();
  },
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    deck: { removeOneByCardId: "removeOneByCardId" },
  },
}));

vi.mock("./use-deck-entries.ts", () => ({
  useDeckEntries: vi.fn(),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useDeckSize: vi.fn(() => 40),
}));

vi.mock("./DeckFusionList.tsx", () => ({
  DeckFusionList: () => <div data-testid="deck-fusion-list" />,
}));

vi.mock("./ScoreExplanation.tsx", () => ({
  ScoreExplanation: () => <div data-testid="score-explanation" />,
}));

vi.mock("./use-deck-score.ts", () => ({
  useDeckScore: vi.fn(() => null),
}));

import { useDeckSize } from "../../db/use-user-preferences.ts";

import { DeckPanel } from "./DeckPanel.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";
import { useDeckScore } from "./use-deck-score.ts";

const mockHook = useDeckEntries as ReturnType<typeof vi.fn>;
const mockDeckSize = useDeckSize as ReturnType<typeof vi.fn>;
const mockDeckScore = useDeckScore as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DeckPanel", () => {
  it("renders loading state when data is undefined", () => {
    mockHook.mockReturnValue(undefined);
    const { container } = render(<DeckPanel />);
    expect(container.querySelector(".animate-spin-gold")).not.toBeNull();
  });

  it("renders empty state when deck is empty", () => {
    mockHook.mockReturnValue({ entries: [], deckLength: 0, deckCardIds: [] });
    render(<DeckPanel />);
    expect(screen.getByText("No deck saved yet")).toBeDefined();
  });

  it("renders deck size indicator", () => {
    mockDeckSize.mockReturnValue(40);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 2 }],
      deckLength: 38,
      deckCardIds: [1, 1],
    });
    render(<DeckPanel />);
    expect(screen.getByText("38/40")).toBeDefined();
  });

  it("shows warning color when deck size mismatches target", () => {
    mockDeckSize.mockReturnValue(40);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 2 }],
      deckLength: 38,
      deckCardIds: [1, 1],
    });
    render(<DeckPanel />);
    const badge = screen.getByText("38/40");
    expect(badge.className).toContain("text-orange-400");
  });

  it("does not show warning color when deck size matches target", () => {
    mockDeckSize.mockReturnValue(40);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 40 }],
      deckLength: 40,
      deckCardIds: Array(40).fill(1),
    });
    render(<DeckPanel />);
    const badge = screen.getByText("40/40");
    expect(badge.className).not.toContain("text-orange-400");
  });

  it("renders remove button per card row", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      deckLength: 1,
      deckCardIds: [1],
    });
    render(<DeckPanel />);
    expect(screen.getByTitle("Remove from deck")).toBeDefined();
  });

  it("calls removeOneByCardId on remove click", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 42, name: "Card", atk: 100, def: 100, qty: 1 }],
      deckLength: 1,
      deckCardIds: [42],
    });
    render(<DeckPanel />);
    fireEvent.click(screen.getByTitle("Remove from deck"));
    expect(mockRemoveOne).toHaveBeenCalledWith({ cardId: 42 });
  });

  it("renders deck intelligence sections when deck has cards", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      deckLength: 1,
      deckCardIds: [1],
    });
    const { container } = render(<DeckPanel />);
    expect(container.querySelector("[data-testid='deck-fusion-list']")).not.toBeNull();
    expect(container.querySelector("[data-testid='score-explanation']")).not.toBeNull();
  });

  it("shows score badge when useDeckScore returns a value", () => {
    mockDeckScore.mockReturnValue(1234.5);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 40 }],
      deckLength: 40,
      deckCardIds: Array(40).fill(1),
    });
    render(<DeckPanel />);
    expect(screen.getByText("1234.5")).toBeDefined();
  });

  it("hides score badge when useDeckScore returns null", () => {
    mockDeckScore.mockReturnValue(null);
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 40 }],
      deckLength: 40,
      deckCardIds: Array(40).fill(1),
    });
    render(<DeckPanel />);
    expect(screen.queryByText("1234.5")).toBeNull();
  });
});
