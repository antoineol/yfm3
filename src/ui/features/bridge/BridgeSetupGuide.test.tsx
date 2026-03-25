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
  it("renders 4 bridge-specific setup steps", () => {
    render(<BridgeSetupGuide />);
    expect(screen.getByText("Download the bridge")).toBeDefined();
    expect(screen.getByText("Extract the zip and double-click start-bridge.bat")).toBeDefined();
    expect(screen.getByText("Open DuckStation and load the game")).toBeDefined();
    expect(screen.getByText("Enable shared memory export in DuckStation")).toBeDefined();
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

  it("shows waiting-for-game panel when bridge detail is waiting_for_game", () => {
    mockBridge.mockReturnValue(defaultBridge({ status: "connected", detail: "waiting_for_game" }));
    render(<BridgeSetupGuide />);
    expect(screen.getByText(/no game is running/)).toBeDefined();
  });
});
