// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUpdatePreferences = vi.fn();
const mockSetSelectedMod = vi.fn();
let mockSelectedMod = "vanilla";
const mockSetHash = vi.fn();

vi.mock("../bridge/bridge-constants.ts", () => ({
  BRIDGE_DOWNLOAD_URL: "https://example.com/bridge.zip",
  DUCKSTATION_URL: "https://example.com/duckstation",
  BRIDGE_MIN_VERSION: "1.0.0",
}));

vi.mock("../../db/use-update-preferences.ts", () => ({
  useUpdatePreferences: vi.fn(() => mockUpdatePreferences),
}));

vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => mockSelectedMod),
  useSetSelectedMod: vi.fn(() => mockSetSelectedMod),
}));

vi.mock("../../lib/use-tab-from-hash.ts", () => ({
  useHash: vi.fn(() => ["", mockSetHash]),
}));

import { OnboardingModeChooser } from "./OnboardingModeChooser.tsx";

afterEach(() => {
  cleanup();
  mockSelectedMod = "vanilla";
});

describe("OnboardingModeChooser", () => {
  it("renders version selector with both mods", () => {
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Remastered Perfected")).toBeDefined();
    expect(screen.getByText("Vanilla")).toBeDefined();
  });

  it("calls setSelectedMod when a version is clicked", () => {
    render(<OnboardingModeChooser />);
    fireEvent.click(screen.getByText("Remastered Perfected"));
    expect(mockSetSelectedMod).toHaveBeenCalledWith({ selectedMod: "rp" });
  });

  it("renders both mode options", () => {
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Auto-Sync")).toBeDefined();
    expect(screen.getByText("Manual")).toBeDefined();
  });

  it("shows mod-specific download label from config", () => {
    mockSelectedMod = "rp";
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Download RP mod")).toBeDefined();

    cleanup();
    mockSelectedMod = "vanilla";
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Download game")).toBeDefined();
  });

  it("always shows DuckStation download link", () => {
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Download DuckStation")).toBeDefined();
  });

  it("auto-sync is always enabled regardless of mod", () => {
    render(<OnboardingModeChooser />);
    const autoSyncBtn = screen.getByText("Auto-Sync").closest("button");
    expect(autoSyncBtn?.disabled).toBeFalsy();
  });

  it("calls updatePreferences with bridgeAutoSync true when auto-sync card is clicked", () => {
    render(<OnboardingModeChooser />);
    fireEvent.click(screen.getByText("Auto-Sync"));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ bridgeAutoSync: true });
  });

  it("calls updatePreferences with bridgeAutoSync false and navigates to deck when manual card is clicked", () => {
    render(<OnboardingModeChooser />);
    fireEvent.click(screen.getByText("Manual"));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ bridgeAutoSync: false });
    expect(mockSetHash).toHaveBeenCalledWith("deck");
  });
});
