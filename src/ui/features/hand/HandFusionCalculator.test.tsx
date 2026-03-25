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
  useDeckSize: vi.fn(() => 40),
  useFusionDepth: vi.fn(() => 3),
  useHandSourceMode: vi.fn(() => "deck"),
}));

import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

function defaultBridge(overrides: Partial<EmulatorBridge> = {}): EmulatorBridge {
  return {
    status: "disconnected",
    detail: "bridge_not_found",
    detailMessage: null,
    version: null,
    hand: [],
    field: [],
    handReliable: false,
    phase: "other",
    inDuel: false,
    lp: null,
    stats: null,
    collection: null,
    deckDefinition: null,
    scan: vi.fn(),
    ...overrides,
  };
}

const mockBridge = vi.fn<() => EmulatorBridge>(() => defaultBridge());

vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridge: () => mockBridge(),
}));

vi.mock("./HandCardSelector.tsx", () => ({
  HandCardSelector: () => <div data-testid="hand-card-selector">deck</div>,
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

vi.mock("../../lib/use-emulator-bridge.ts", () => ({}));

vi.mock("./EmulatorBridgeBar.tsx", () => ({
  EmulatorBridgeBar: () => <div data-testid="emulator-bridge-bar" />,
}));

vi.mock("./use-auto-sync-hand.ts", () => ({
  useAutoSyncHand: vi.fn(),
}));

vi.mock("./use-post-duel-suggestion.ts", () => ({
  usePostDuelSuggestion: vi.fn(() => ({
    state: "idle",
    progress: 0,
    liveBestScore: 0,
    result: null,
    currentDeck: [],
    dismiss: vi.fn(),
  })),
}));

vi.mock("./PostDuelSuggestion.tsx", () => ({
  PostDuelSuggestion: () => <div data-testid="post-duel-suggestion" />,
}));

import { HandFusionCalculator } from "./HandFusionCalculator.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HandFusionCalculator", () => {
  it("hydrates source mode from preferences and persists toggle changes", () => {
    render(<HandFusionCalculator />);

    // HandCardSelector is mocked, but the ToggleGroup is real
    fireEvent.click(screen.getByText("All cards"));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ handSourceMode: "all" });
  });

  it("hides manual controls and shows bridge bar in synced mode", () => {
    mockBridge.mockReturnValue(
      defaultBridge({
        status: "connected",
        detail: "ready",
        hand: [1, 2, 3],
        field: [
          { cardId: 4, atk: 1200, def: 800 },
          { cardId: 5, atk: 1000, def: 600 },
        ],
        handReliable: true,
        phase: "hand",
        inDuel: true,
        lp: [9900, 9900],
        stats: { fusions: 2, terrain: 0, duelistId: 1 },
      }),
    );

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
