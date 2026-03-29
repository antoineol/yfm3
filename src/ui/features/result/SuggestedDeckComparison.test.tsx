// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../deck/DeckFusionList.tsx", () => ({
  DeckFusionList: () => <div data-testid="deck-fusion-list" />,
}));

vi.mock("../deck/ScoreExplanation.tsx", () => ({
  ScoreExplanation: () => <div data-testid="score-explanation" />,
}));

vi.mock("convex/react", () => ({
  useQuery: () => undefined,
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: false }),
}));

import { SuggestedDeckComparison } from "./SuggestedDeckComparison.tsx";
import type { ResultData } from "./use-result-entries.ts";

const baseResult = {
  deck: [1, 2, 3],
  expectedAtk: 2500,
  currentDeckScore: 2000,
  improvement: 500,
  elapsedMs: 1500,
};

function makeEntry(
  id: number,
  name: string,
  atk: number,
  diffStatus: "removed" | "added" | "kept",
) {
  return {
    id,
    name,
    isMonster: true,
    atk,
    def: 0,
    qty: 1,
    diffStatus,
    rowKey: `${id}-${diffStatus}`,
  };
}

afterEach(cleanup);

describe("SuggestedDeckComparison", () => {
  it("renders section headers with counts", () => {
    const removed = [makeEntry(2, "Dark Magician", 2500, "removed")];
    const added = [makeEntry(3, "Red-Eyes", 2400, "added")];
    const kept = [makeEntry(1, "Blue-Eyes", 3000, "kept")];
    const data: ResultData = {
      entries: [...removed, ...added, ...kept],
      removed,
      added,
      kept,
      swapCount: 1,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    expect(screen.getByText("Remove")).toBeDefined();
    expect(screen.getByText("Add")).toBeDefined();
    expect(screen.getByText("Stays")).toBeDefined();
    expect(screen.getAllByText("(1)")).toHaveLength(3);
  });

  it("renders deck intelligence sections", () => {
    const data: ResultData = {
      entries: [makeEntry(1, "Blue-Eyes", 3000, "kept")],
      removed: [],
      added: [],
      kept: [makeEntry(1, "Blue-Eyes", 3000, "kept")],
      swapCount: 0,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    expect(screen.getByTestId("deck-fusion-list")).toBeDefined();
    expect(screen.getByTestId("score-explanation")).toBeDefined();
  });

  it("shows 'no changes needed' state when swapCount is 0", () => {
    const data: ResultData = {
      entries: [makeEntry(1, "Blue-Eyes", 3000, "kept")],
      removed: [],
      added: [],
      kept: [makeEntry(1, "Blue-Eyes", 3000, "kept")],
      swapCount: 0,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    expect(screen.getByText("Your deck is already optimal")).toBeDefined();
    expect(screen.queryByText("Remove")).toBeNull();
    expect(screen.queryByText("Add")).toBeNull();
    expect(screen.queryByText("Stays")).toBeNull();
  });

  it("collapses Stays section by default", () => {
    const removed = [makeEntry(2, "Dark Magician", 2500, "removed")];
    const added = [makeEntry(3, "Red-Eyes", 2400, "added")];
    const kept = [makeEntry(1, "Blue-Eyes", 3000, "kept")];
    const data: ResultData = {
      entries: [...removed, ...added, ...kept],
      removed,
      added,
      kept,
      swapCount: 1,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    // Remove and Add cards are visible
    expect(screen.getByText("Dark Magician")).toBeDefined();
    expect(screen.getByText("Red-Eyes")).toBeDefined();
    // Kept card is hidden
    expect(screen.queryByText("Blue-Eyes")).toBeNull();
  });

  it("expands Stays section on click", () => {
    const kept = [makeEntry(1, "Blue-Eyes", 3000, "kept")];
    const data: ResultData = {
      entries: [makeEntry(2, "X", 100, "removed"), ...kept],
      removed: [makeEntry(2, "X", 100, "removed")],
      added: [],
      kept,
      swapCount: 1,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    expect(screen.queryByText("Blue-Eyes")).toBeNull();
    fireEvent.click(screen.getByText("Stays"));
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });

  it("renders +/- icons on remove/add rows", () => {
    const removed = [makeEntry(2, "Dark Magician", 2500, "removed")];
    const added = [makeEntry(3, "Red-Eyes", 2400, "added")];
    const data: ResultData = {
      entries: [...removed, ...added],
      removed,
      added,
      kept: [],
      swapCount: 1,
      result: baseResult,
    };
    render(<SuggestedDeckComparison data={data} />);
    // Minus sign (Unicode −)
    expect(screen.getByText("\u2212")).toBeDefined();
    // Plus sign
    expect(screen.getByText("+")).toBeDefined();
  });
});
