// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CardTable } from "./CardTable.tsx";
import type { CardEntry } from "./card-entries.ts";

beforeAll(() => {
  Element.prototype.animate = vi.fn().mockReturnValue({
    onfinish: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    cancel: vi.fn(),
  }) as never;
});

vi.mock("../lib/use-artwork-src.ts", () => ({
  useArtworkSrc: () => (cardId: number) => `/card-${String(cardId)}.webp`,
}));

const blueEyes: CardEntry = {
  id: 1,
  name: "Blue-Eyes",
  isMonster: true,
  atk: 3000,
  def: 2500,
  qty: 1,
};

afterEach(cleanup);

describe("CardTable", () => {
  it("renders card IDs inline with names for shared card rows", () => {
    render(<CardTable entries={[blueEyes]} />);

    expect(screen.getByText("#001").parentElement).toBe(
      screen.getByText("Blue-Eyes").parentElement,
    );
    expect(screen.getByText("#001").className).toContain("font-bold");
  });
});
