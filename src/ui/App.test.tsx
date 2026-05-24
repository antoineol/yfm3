// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EmulatorBridge } from "./lib/bridge-message-processor.ts";

const mocks = vi.hoisted(() => {
  const bridge: EmulatorBridge = {
    status: "connected",
    detail: "ready",
    detailMessage: null,
    settingsPatched: false,
    version: "test",
    hand: [],
    field: [],
    handReliable: false,
    phase: "other",
    opponentPhase: "other",
    inDuel: false,
    lp: null,
    stats: null,
    collection: null,
    deckDefinition: null,
    shuffledDeck: null,
    modFingerprint: null,
    gameSerial: null,
    gameData: null,
    gameDataError: null,
    restartFailed: false,
    updating: false,
    updateStaged: false,
    stageFailed: false,
    opponentHand: [],
    opponentField: [],
    cursorTarget: null,
    cpuSwaps: [],
    unlockedDuelists: null,
    scan: vi.fn(),
    restartEmulator: vi.fn(),
    updateAndRestart: vi.fn(),
    stageUpdate: vi.fn(),
  };

  return {
    bridge,
    useHasReferenceData: vi.fn(() => true),
    usePostDuelSuggestion: vi.fn(() => ({
      state: "idle",
      progress: 0,
      liveBestScore: 0,
      result: null,
      currentDeck: [],
      dismiss: vi.fn(),
    })),
  };
});

vi.mock("@base-ui/react/tabs", () => ({
  Tabs: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock("../engine/config.ts", () => ({ setConfig: vi.fn() }));
vi.mock("./db/use-deck.ts", () => ({ useDeck: vi.fn(() => [{ cardId: 42 }, { cardId: 7 }]) }));
vi.mock("./db/use-user-preferences.ts", () => ({ useBridgeAutoSync: vi.fn(() => true) }));
vi.mock("./lib/use-emulator-bridge.ts", () => ({
  useEmulatorBridge: vi.fn(() => mocks.bridge),
}));
vi.mock("./lib/use-selected-mod.ts", () => ({ useSelectedMod: vi.fn(() => "rp") }));
vi.mock("./lib/use-tab-from-hash.ts", () => ({
  useTabFromHash: vi.fn(() => ["deck"]),
  useSubTabFromHash: vi.fn(() => ["collection", vi.fn()]),
}));
vi.mock("./lib/bridge-snapshot-atoms.ts", () => ({ useHydrateBridgeSnapshot: vi.fn() }));
vi.mock("./lib/fusion-table-context.tsx", () => ({
  FusionTableProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useHasReferenceData: mocks.useHasReferenceData,
}));
vi.mock("./features/collection/use-auto-sync-collection.ts", () => ({
  useAutoSyncCollection: vi.fn(),
}));
vi.mock("./features/hand/use-post-duel-suggestion.ts", () => ({
  usePostDuelSuggestion: mocks.usePostDuelSuggestion,
}));
vi.mock("./features/onboarding/TabOnboardingGate.tsx", () => ({
  TabOnboardingGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useShowOnboarding: vi.fn(() => false),
}));

vi.mock("./components/BottomTabBar.tsx", () => ({ BottomTabBar: () => null }));
vi.mock("./components/RequireReferenceData.tsx", () => ({
  RequireReferenceData: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("./components/panel-chrome.tsx", () => ({
  PanelCard: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
vi.mock("./features/auth/Header.tsx", () => ({ Header: () => null }));
vi.mock("./features/bridge/GameDataErrorBanner.tsx", () => ({ GameDataErrorBanner: () => null }));
vi.mock("./features/bridge/ModMismatchBanner.tsx", () => ({ ModMismatchBanner: () => null }));
vi.mock("./features/collection/CollectionPanel.tsx", () => ({ CollectionPanel: () => null }));
vi.mock("./features/data/CardDetailModal.tsx", () => ({ CardDetailModal: () => null }));
vi.mock("./features/data/DataPanel.tsx", () => ({ DataPanel: () => null }));
vi.mock("./features/deck/DeckPanel.tsx", () => ({ DeckPanel: () => null }));
vi.mock("./features/deck/DeckSubTabs.tsx", () => ({
  DECK_SUB_TABS: ["collection", "deck", "result", "farm", "edit"],
  DeckSubTabs: () => null,
}));
vi.mock("./features/duel/DuelPage.tsx", () => ({ DuelPage: () => null }));
vi.mock("./features/farm/FarmPanel.tsx", () => ({ FarmPanelWrapper: () => null }));
vi.mock("./features/onboarding/ManualSetupModal.tsx", () => ({ ManualSetupModal: () => null }));
vi.mock("./features/result/ResultPanel.tsx", () => ({ ResultPanel: () => null }));
vi.mock("./features/saves/SavesPanel.tsx", () => ({ SavesPanel: () => null }));

import App from "./App.tsx";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.useHasReferenceData.mockReturnValue(true);
});

describe("App", () => {
  it("keeps post-duel detection app-wide instead of depending on the active tab", () => {
    render(<App />);

    expect(mocks.usePostDuelSuggestion).toHaveBeenCalledWith(mocks.bridge, [42, 7]);
  });

  it("keeps post-duel detection mounted before card data providers are ready", () => {
    mocks.useHasReferenceData.mockReturnValue(false);

    render(<App />);

    expect(mocks.usePostDuelSuggestion).toHaveBeenCalledWith(mocks.bridge, [42, 7]);
  });
});
