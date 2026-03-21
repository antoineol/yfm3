// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUpdatePreferences = vi.fn();

vi.mock("../../db/use-deck.ts", () => ({
  useDeck: vi.fn(() => [{ cardId: 1 }]),
}));

vi.mock("../../db/use-hand.ts", () => ({
  useHand: vi.fn(() => []),
  useHandMutations: vi.fn(() => ({
    addToHand: vi.fn(),
    removeFromHand: vi.fn(),
    removeMultipleFromHand: vi.fn(),
    clearHand: vi.fn(),
  })),
}));

vi.mock("../../db/use-update-preferences.ts", () => ({
  useUpdatePreferences: vi.fn(() => mockUpdatePreferences),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useFusionDepth: vi.fn(() => 3),
  useHandSourceMode: vi.fn(() => "deck"),
}));

vi.mock("./HandCardSelector.tsx", () => ({
  HandCardSelector: ({ sourceMode }: { sourceMode: string }) => (
    <div data-testid="hand-card-selector">{sourceMode}</div>
  ),
}));

vi.mock("./HandDisplay.tsx", () => ({
  HandDisplay: () => <div data-testid="hand-display" />,
}));

vi.mock("./FusionResultsList.tsx", () => ({
  FusionResultsList: () => <div data-testid="fusion-results" />,
}));

vi.mock("./FieldDisplay.tsx", () => ({
  FieldDisplay: () => <div data-testid="field-display" />,
}));

vi.mock("../../lib/use-emulator-bridge.ts", () => ({
  useEmulatorBridge: vi.fn(() => ({
    status: "disconnected",
    hand: [],
    field: [],
    handReliable: false,
    phase: "other",
    inDuel: false,
    lp: null,
    stats: null,
    scan: vi.fn(),
  })),
}));

vi.mock("./EmulatorBridgeBar.tsx", () => ({
  EmulatorBridgeBar: () => <div data-testid="emulator-bridge-bar" />,
}));

vi.mock("./use-auto-sync-hand.ts", () => ({
  useAutoSyncHand: vi.fn(),
}));

import { useEmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { HandFusionCalculator } from "./HandFusionCalculator.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HandFusionCalculator", () => {
  it("hydrates source mode from preferences and persists toggle changes", () => {
    render(<HandFusionCalculator />);

    expect(screen.getByTestId("hand-card-selector").textContent).toBe("deck");

    fireEvent.click(screen.getByText("All cards"));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ handSourceMode: "all" });
  });

  it("hides manual controls and shows bridge bar in synced mode", () => {
    vi.mocked(useEmulatorBridge).mockReturnValue({
      status: "connected",
      hand: [1, 2, 3],
      field: [4, 5],
      handReliable: true,
      phase: "hand",
      inDuel: true,
      lp: [9900, 9900],
      stats: { fusions: 2, terrain: 0, duelistId: 1 },
      scan: vi.fn(),
    });

    render(<HandFusionCalculator />);

    expect(screen.getByTestId("emulator-bridge-bar")).toBeTruthy();
    expect(screen.queryByTestId("hand-card-selector")).toBeNull();
    expect(screen.getByTestId("field-display")).toBeTruthy();
  });

  it("hides bridge bar when disconnected", () => {
    render(<HandFusionCalculator />);

    expect(screen.queryByTestId("emulator-bridge-bar")).toBeNull();
    expect(screen.getByTestId("hand-card-selector")).toBeTruthy();
  });
});
