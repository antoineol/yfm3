// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

const mockUpdatePreferences = vi.fn();

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
    modFingerprint: null,
    restartFailed: false,
    scan: vi.fn(),
    restartEmulator: vi.fn(),
    ...overrides,
  };
}

const mockBridge = vi.fn<() => EmulatorBridge>(() => defaultBridge());

vi.mock("./bridge-constants.ts", () => ({
  BRIDGE_DOWNLOAD_URL: "https://example.com/bridge.zip",
  DUCKSTATION_URL: "https://example.com/duckstation",
  BRIDGE_MIN_VERSION: "1.0.0",
}));

vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridge: () => mockBridge(),
}));

vi.mock("../../db/use-update-preferences.ts", () => ({
  useUpdatePreferences: vi.fn(() => mockUpdatePreferences),
}));

import { BridgeSetupGuide } from "./BridgeSetupGuide.tsx";

afterEach(cleanup);

describe("BridgeSetupGuide", () => {
  it("renders 5 setup steps", () => {
    render(<BridgeSetupGuide />);
    expect(screen.getByText("Download the bridge")).toBeDefined();
    expect(screen.getByText("Extract the zip and double-click start-bridge.bat")).toBeDefined();
    expect(screen.getByText("Open DuckStation")).toBeDefined();
    expect(screen.getByText("Enable shared memory export in DuckStation")).toBeDefined();
    expect(screen.getByText("Load the game in DuckStation")).toBeDefined();
  });

  it("shows requirements disclaimer", () => {
    render(<BridgeSetupGuide />);
    expect(screen.getByText(/Requires/)).toBeDefined();
    expect(screen.getByText("Windows")).toBeDefined();
    expect(screen.getByText("DuckStation")).toBeDefined();
  });

  it("shows switch mode link", () => {
    render(<BridgeSetupGuide />);
    expect(screen.getByText("Switch mode")).toBeDefined();
  });

  it("calls updatePreferences with bridgeAutoSync null when switch mode is clicked", () => {
    render(<BridgeSetupGuide />);
    fireEvent.click(screen.getByText("Switch mode"));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ bridgeAutoSync: null });
  });

  it("shows step 5 as active when waiting_for_game without redundant status banner", () => {
    mockBridge.mockReturnValue(defaultBridge({ status: "connected", detail: "waiting_for_game" }));
    render(<BridgeSetupGuide />);
    expect(screen.getByText("Load the game in DuckStation")).toBeDefined();
    expect(screen.queryByText(/Start or load a game/)).toBeNull();
  });

  it("shows restart button when settingsPatched and resets on restartFailed", () => {
    const bridge = defaultBridge({
      status: "connected",
      detail: "no_shared_memory",
      settingsPatched: true,
    });
    mockBridge.mockReturnValue(bridge);
    const { rerender } = render(<BridgeSetupGuide />);

    // Confirm and click restart
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByText("Restart DuckStation"));
    expect(bridge.restartEmulator).toHaveBeenCalled();
    expect(screen.getByText("Restarting DuckStation...")).toBeDefined();

    // Simulate bridge reporting failure
    mockBridge.mockReturnValue(
      defaultBridge({
        status: "connected",
        detail: "no_shared_memory",
        settingsPatched: true,
        restartFailed: true,
      }),
    );
    rerender(<BridgeSetupGuide />);

    // Button should reappear with error message
    expect(screen.getByText("Restart DuckStation")).toBeDefined();
    expect(screen.getByText(/Restart failed/)).toBeDefined();
  });
});
