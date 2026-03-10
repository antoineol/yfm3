// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./use-result-entries.ts", () => ({
  useResultEntries: vi.fn(),
}));

vi.mock("../optimize/use-optimize.ts", () => ({
  useOptimize: vi.fn(),
}));

import { useOptimize } from "../optimize/use-optimize.ts";
import { ResultPanel } from "./ResultPanel.tsx";
import { useResultEntries } from "./use-result-entries.ts";

const mockResultHook = useResultEntries as ReturnType<typeof vi.fn>;
const mockOptimizeHook = useOptimize as ReturnType<typeof vi.fn>;

function renderPanel(optimizing = false) {
  mockOptimizeHook.mockReturnValue({
    optimize: vi.fn(),
    isOptimizing: optimizing,
    canOptimize: true,
  });
  return render(<ResultPanel />);
}

afterEach(cleanup);

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

  it("renders loading state when optimizing", () => {
    mockResultHook.mockReturnValue(null);
    renderPanel(true);
    expect(screen.getByText("Optimizing\u2026")).toBeDefined();
  });

  it("renders stats and card table when result is present", () => {
    mockResultHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      result: baseResult,
    });
    renderPanel();
    expect(screen.getByText("2500.0")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });

  it("shows current deck score when available", () => {
    mockResultHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, currentDeckScore: 2000 },
    });
    renderPanel();
    expect(screen.getByText("2000.0")).toBeDefined();
    expect(screen.getByText("Current Deck")).toBeDefined();
  });

  it("shows improvement when available", () => {
    mockResultHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, improvement: 500 },
    });
    renderPanel();
    expect(screen.getByText("\u25b2 500.0")).toBeDefined();
    expect(screen.getByText("Improvement")).toBeDefined();
  });
});
