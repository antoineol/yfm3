// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAcceptDeck = vi.fn().mockResolvedValue(undefined);
vi.mock("convex/react", () => ({
  useMutation: () => mockAcceptDeck,
}));

vi.mock("../deck/DeckFusionList.tsx", () => ({
  DeckFusionList: () => <div data-testid="deck-fusion-list" />,
}));

vi.mock("../deck/ScoreExplanation.tsx", () => ({
  ScoreExplanation: () => <div data-testid="score-explanation" />,
}));

import { resultAtom } from "../../lib/atoms.ts";
import { SuggestedDeckComparison } from "./SuggestedDeckComparison.tsx";

let store: ReturnType<typeof createStore>;

function Wrapper({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

const baseResult = {
  deck: [1, 2, 3],
  expectedAtk: 2500,
  currentDeckScore: 2000,
  improvement: 500,
  elapsedMs: 1500,
};

const baseEntries = [
  { id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 },
  { id: 2, name: "Dark Magician", atk: 2500, def: 2100, qty: 1 },
  { id: 3, name: "Red-Eyes", atk: 2400, def: 2000, qty: 1 },
];

beforeEach(() => {
  store = createStore();
  store.set(resultAtom, baseResult);
  mockAcceptDeck.mockClear();
});

afterEach(cleanup);

describe("SuggestedDeckComparison", () => {
  it("displays stats with improvement percentage", () => {
    render(
      <SuggestedDeckComparison
        data={{ entries: baseEntries, result: baseResult }}
        onOptimize={vi.fn()}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText("2500.0")).toBeDefined();
    expect(screen.getByText("2000.0")).toBeDefined();
    expect(screen.getByText(/500\.0.*25\.0%/)).toBeDefined();
  });

  it("accept calls mutation with correct card IDs and clears result", async () => {
    render(
      <SuggestedDeckComparison
        data={{ entries: baseEntries, result: baseResult }}
        onOptimize={vi.fn()}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByText("Accept Deck"));
    expect(mockAcceptDeck).toHaveBeenCalledWith({ cardIds: [1, 2, 3] });

    // Wait for promise to resolve
    await vi.waitFor(() => {
      expect(store.get(resultAtom)).toBeNull();
    });
  });

  it("reject clears result atom", () => {
    render(
      <SuggestedDeckComparison
        data={{ entries: baseEntries, result: baseResult }}
        onOptimize={vi.fn()}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByText("Reject"));
    expect(store.get(resultAtom)).toBeNull();
  });

  it("re-run triggers new optimization", () => {
    const onOptimize = vi.fn();
    render(
      <SuggestedDeckComparison
        data={{ entries: baseEntries, result: baseResult }}
        onOptimize={onOptimize}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByText("Re-run"));
    expect(onOptimize).toHaveBeenCalledOnce();
  });
});
