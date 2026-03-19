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

vi.mock("../../lib/card-db-context.tsx", () => ({
  useCardDb: () => ({ cards: [], cardsById: new Map(), cardsByName: new Map() }),
}));

import { liveBestScoreAtom } from "../../lib/atoms.ts";
import { CardDetailProvider } from "../../lib/card-detail-context.tsx";
import { useOptimize } from "../optimize/use-optimize.ts";
import { ResultPanel } from "./ResultPanel.tsx";
import { useResultEntries } from "./use-result-entries.ts";

const mockResultHook = useResultEntries as ReturnType<typeof vi.fn>;
const mockOptimizeHook = useOptimize as ReturnType<typeof vi.fn>;

let store: ReturnType<typeof createStore>;

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <CardDetailProvider>{children}</CardDetailProvider>
    </Provider>
  );
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

  it("renders cancel button when optimizing", () => {
    mockResultHook.mockReturnValue(null);
    renderPanel(true);
    expect(screen.getByLabelText("Cancel")).toBeDefined();
  });

  it("renders live best score in header during optimization", () => {
    mockResultHook.mockReturnValue(null);
    store.set(liveBestScoreAtom, 2100);
    renderPanel(true);
    expect(screen.getByText(/2100\.0/)).toBeDefined();
    expect(screen.getByText("ATK")).toBeDefined();
  });

  it("renders suggested deck comparison when result is present", () => {
    mockResultHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      result: baseResult,
    });
    renderPanel();
    expect(screen.getByText("2500.0")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
    expect(screen.getByLabelText("Accept deck")).toBeDefined();
    expect(screen.getByLabelText("Reject")).toBeDefined();
    expect(screen.getByLabelText("Re-run")).toBeDefined();
  });

  it("shows improvement percentage in header when available", () => {
    mockResultHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, currentDeckScore: 2000, improvement: 500 },
    });
    renderPanel();
    expect(screen.getByText("+25.0%")).toBeDefined();
  });
});
