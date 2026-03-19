// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../deck/DeckFusionList.tsx", () => ({
  DeckFusionList: () => <div data-testid="deck-fusion-list" />,
}));

vi.mock("../deck/ScoreExplanation.tsx", () => ({
  ScoreExplanation: () => <div data-testid="score-explanation" />,
}));

import { SuggestedDeckComparison } from "./SuggestedDeckComparison.tsx";

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

afterEach(cleanup);

describe("SuggestedDeckComparison", () => {
  it("displays card table with entries", () => {
    render(<SuggestedDeckComparison data={{ entries: baseEntries, result: baseResult }} />);
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByText("Dark Magician")).toBeDefined();
    expect(screen.getByText("Red-Eyes")).toBeDefined();
  });

  it("renders deck intelligence sections", () => {
    render(<SuggestedDeckComparison data={{ entries: baseEntries, result: baseResult }} />);
    expect(screen.getByTestId("deck-fusion-list")).toBeDefined();
    expect(screen.getByTestId("score-explanation")).toBeDefined();
  });
});
