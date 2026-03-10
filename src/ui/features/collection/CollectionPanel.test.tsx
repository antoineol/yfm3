// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("./use-collection-entries.ts", () => ({
  useCollectionEntries: vi.fn(),
}));

import { CollectionPanel } from "./CollectionPanel.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

const mockHook = useCollectionEntries as ReturnType<typeof vi.fn>;

afterEach(cleanup);

describe("CollectionPanel", () => {
  it("renders loading state when data is undefined", () => {
    mockHook.mockReturnValue(undefined);
    const { container } = render(<CollectionPanel />);
    expect(container.querySelector(".animate-spin-gold")).not.toBeNull();
  });

  it("renders empty state when totalCards is 0", () => {
    mockHook.mockReturnValue({ entries: [], totalCards: 0, uniqueCards: 0 });
    render(<CollectionPanel />);
    expect(screen.getByText("Your collection is empty")).toBeDefined();
  });

  it("renders card table with badge when collection has cards", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 2 }],
      totalCards: 2,
      uniqueCards: 1,
    });
    render(<CollectionPanel />);
    expect(screen.getByText("2 cards (1 unique)")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });
});
