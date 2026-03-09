// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isOptimizingAtom } from "../../lib/atoms.ts";

vi.mock("./use-result-entries.ts", () => ({
  useResultEntries: vi.fn(),
}));

import { ResultPanel } from "./ResultPanel.tsx";
import { useResultEntries } from "./use-result-entries.ts";

const mockHook = useResultEntries as ReturnType<typeof vi.fn>;

function renderWithStore(optimizing = false) {
  const store = createStore();
  store.set(isOptimizingAtom, optimizing);
  return render(
    <Provider store={store}>
      <ResultPanel />
    </Provider>,
  );
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
    mockHook.mockReturnValue(null);
    renderWithStore(false);
    expect(screen.getByText("Awaiting optimization")).toBeDefined();
  });

  it("renders loading state when optimizing", () => {
    mockHook.mockReturnValue(null);
    renderWithStore(true);
    expect(screen.getByText("Optimizing…")).toBeDefined();
  });

  it("renders stats and card table when result is present", () => {
    mockHook.mockReturnValue({
      entries: [{ id: 1, name: "Blue-Eyes", atk: 3000, def: 2500, qty: 1 }],
      result: baseResult,
    });
    renderWithStore();
    expect(screen.getByText("2500.0")).toBeDefined();
    expect(screen.getByText("Blue-Eyes")).toBeDefined();
  });

  it("shows current deck score when available", () => {
    mockHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, currentDeckScore: 2000 },
    });
    renderWithStore();
    expect(screen.getByText("2000.0")).toBeDefined();
    expect(screen.getByText("Current Deck")).toBeDefined();
  });

  it("shows improvement when available", () => {
    mockHook.mockReturnValue({
      entries: [],
      result: { ...baseResult, improvement: 500 },
    });
    renderWithStore();
    expect(screen.getByText("\u25b2 500.0")).toBeDefined();
    expect(screen.getByText("Improvement")).toBeDefined();
  });
});
