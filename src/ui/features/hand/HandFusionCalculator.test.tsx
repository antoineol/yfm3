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

vi.mock("../../lib/use-emulator-bridge.ts", () => ({
  useEmulatorBridge: vi.fn(() => ({
    status: "disconnected",
    hand: [],
    inDuel: false,
    lp: null,
    scan: vi.fn(),
  })),
}));

vi.mock("./EmulatorBridgeBar.tsx", () => ({
  EmulatorBridgeBar: () => <div data-testid="emulator-bridge-bar" />,
}));

import { HandFusionCalculator } from "./HandFusionCalculator.tsx";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("HandFusionCalculator", () => {
  it("hydrates source mode from preferences and persists toggle changes", () => {
    render(<HandFusionCalculator />);

    expect(screen.getByTestId("hand-card-selector").textContent).toBe("deck");

    fireEvent.click(screen.getByText("All cards"));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ handSourceMode: "all" });
  });
});
