// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./use-deck-entries.ts", () => ({
  useDeckEntries: vi.fn(),
}));

import { DeckPanel } from "./DeckPanel.tsx";
import { useDeckEntries } from "./use-deck-entries.ts";

const mockHook = useDeckEntries as ReturnType<typeof vi.fn>;

afterEach(cleanup);

describe("DeckPanel", () => {
  it("renders loading state when data is undefined", () => {
    mockHook.mockReturnValue(undefined);
    const { container } = render(<DeckPanel />);
    expect(container.querySelector(".animate-spin-gold")).not.toBeNull();
  });

  it("renders empty state when deck is empty", () => {
    mockHook.mockReturnValue({ entries: [], deckLength: 0 });
    render(<DeckPanel />);
    expect(screen.getByText("No deck saved yet")).toBeDefined();
  });

  it("renders card table with badge when deck has cards", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 2 }],
      deckLength: 2,
    });
    render(<DeckPanel />);
    expect(screen.getByText("2 cards")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });
});
