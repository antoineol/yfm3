// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./use-result-entries.ts", () => ({
  useResultEntries: vi.fn(),
}));

vi.mock("../optimize/use-optimize.ts", () => ({
  useOptimize: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("../deck/DeckFusionList.tsx", () => ({
  DeckFusionList: () => <div data-testid="deck-fusion-list" />,
}));

vi.mock("../deck/ScoreExplanation.tsx", () => ({
  ScoreExplanation: () => <div data-testid="score-explanation" />,
}));

import { liveBestScoreAtom } from "../../lib/atoms.ts";
import { useOptimize } from "../optimize/use-optimize.ts";
import { ResultPanel } from "./ResultPanel.tsx";
import { useResultEntries } from "./use-result-entries.ts";

const mockResultHook = useResultEntries as ReturnType<typeof vi.fn>;
const mockOptimizeHook = useOptimize as ReturnType<typeof vi.fn>;

let store: ReturnType<typeof createStore>;

function Wrapper({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

function renderPanel(optimizing = false) {
  mockOptimizeHook.mockReturnValue({
    optimize: vi.fn(),
    cancel: vi.fn(),
    isOptimizing: optimizing,
    canOptimize: true,
  });
  return render(<ResultPanel />, { wrapper: Wrapper });
}

afterEach(cleanup);

beforeEach(() => {
  store = createStore();
});

const baseResult = {
  deck: [1, 2],
  expectedAtk: 2500,
  currentDeckScore: null,
  improvement: null,
  elapsedMs: 1500,
};

describe("ResultPanel", () => {
  it("renders empty state when no result and not optimizing", () => {
    mockResultHook.mockReturnValue(null);
    renderPanel(false);
    expect(screen.getByText("Awaiting optimization")).toBeDefined();
  });

  it("renders progress bar with cancel when optimizing", () => {
    mockResultHook.mockReturnValue(null);
    renderPanel(true);
    expect(screen.getByText(/Optimizing Deck/)).toBeDefined();
    // Timer starts at 0, so progress shows 0%
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("renders live best score in progress view", () => {
    mockResultHook.mockReturnValue(null);
    store.set(liveBestScoreAtom, 2100);
    renderPanel(true);
    expect(screen.getByText("~2100.0")).toBeDefined();
    expect(screen.getByText("Best so far")).toBeDefined();
  });

  it("renders suggested deck comparison when result is present", () => {
    mockResultHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      result: baseResult,
    });
    renderPanel();
    expect(screen.getByText("2500.0")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByText("Accept Deck")).toBeDefined();
    expect(screen.getByText("Reject")).toBeDefined();
    expect(screen.getByText("Re-run")).toBeDefined();
  });

  it("shows current deck score and improvement when available", () => {
    mockResultHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, currentDeckScore: 2000, improvement: 500 },
    });
    renderPanel();
    expect(screen.getByText("2000.0")).toBeDefined();
    expect(screen.getByText("Current Deck")).toBeDefined();
    expect(screen.getByText(/▲ 500\.0/)).toBeDefined();
  });
});
