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
  useCheatMode: vi.fn(() => false),
  useCheatView: vi.fn(() => "player"),
  useCpuSwaps: vi.fn(() => []),
}));

import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

function defaultBridge(overrides: Partial<EmulatorBridge> = {}): EmulatorBridge {
  return {
    status: "disconnected",
    detail: "bridge_not_found",
    detailMessage: null,
    settingsPatched: false,
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
    shuffledDeck: null,
    modFingerprint: null,
    gameData: null,
    gameDataError: null,
    restartFailed: false,
    updating: false,
    updateStaged: false,
    stageFailed: false,
    opponentHand: [],
    opponentField: [],
    cpuSwaps: [],
    opponentPhase: "other" as const,
    scan: vi.fn(),
    restartEmulator: vi.fn(),
    updateAndRestart: vi.fn(),
    stageUpdate: vi.fn(),
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

vi.mock("./use-sync-cpu-swaps.ts", () => ({
  useSyncCpuSwaps: vi.fn(),
}));

vi.mock("./CpuCheatBanner.tsx", () => ({
  CpuCheatBanner: () => null,
}));

vi.mock("./OpponentPanel.tsx", () => ({
  OpponentPanel: () => <div data-testid="opponent-panel" />,
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

import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { HandFusionCalculator } from "./HandFusionCalculator.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function inDuelBridge(phase: string) {
  return defaultBridge({
    status: "connected",
    inDuel: true,
    phase: phase as EmulatorBridge["phase"],
  });
}

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

  describe("auto-switch cheat view on turn change", () => {
    it("switches to opponent view when phase becomes opponent", () => {
      vi.mocked(useCheatMode).mockReturnValue(true);
      vi.mocked(useCheatView).mockReturnValue("player");
      mockBridge.mockReturnValue(inDuelBridge("hand"));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(inDuelBridge("opponent"));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ cheatView: "opponent" });
    });

    it("switches back to player view when phase leaves opponent", () => {
      vi.mocked(useCheatMode).mockReturnValue(true);
      vi.mocked(useCheatView).mockReturnValue("opponent");
      mockBridge.mockReturnValue(inDuelBridge("opponent"));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(inDuelBridge("hand"));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ cheatView: "player" });
    });

    it("does not switch when cheat mode is off", () => {
      vi.mocked(useCheatMode).mockReturnValue(false);
      mockBridge.mockReturnValue(inDuelBridge("hand"));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(inDuelBridge("opponent"));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });

    it("does not switch when not in a duel", () => {
      vi.mocked(useCheatMode).mockReturnValue(true);
      mockBridge.mockReturnValue(defaultBridge({ phase: "hand", inDuel: false }));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(defaultBridge({ phase: "opponent", inDuel: false }));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });

    it("ignores transitions to 'other' or 'ended'", () => {
      vi.mocked(useCheatMode).mockReturnValue(true);
      mockBridge.mockReturnValue(inDuelBridge("hand"));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(inDuelBridge("other"));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });

    it("skips update when cheatView already matches", () => {
      vi.mocked(useCheatMode).mockReturnValue(true);
      vi.mocked(useCheatView).mockReturnValue("opponent");
      mockBridge.mockReturnValue(inDuelBridge("hand"));

      const { rerender } = render(<HandFusionCalculator />);
      mockUpdatePreferences.mockClear();

      mockBridge.mockReturnValue(inDuelBridge("opponent"));
      rerender(<HandFusionCalculator />);

      expect(mockUpdatePreferences).not.toHaveBeenCalled();
    });
  });
});
