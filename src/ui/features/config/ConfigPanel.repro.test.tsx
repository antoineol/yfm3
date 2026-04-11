// @vitest-environment happy-dom
/**
 * Tests that ConfigPanel auto-saves on change for all field types.
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockSave = vi.fn();
vi.mock("../../db/use-update-preferences.ts", () => ({
  useUpdatePreferences: () => mockSave,
}));
vi.mock("../../db/use-user-preferences.ts", () => ({
  useBridgeAutoSync: vi.fn(() => false),
  useBridgeAutoSyncSetting: vi.fn(() => false),
  useDeckSize: vi.fn(() => 40),
  useFusionDepth: vi.fn(() => 3),
  useUseEquipment: vi.fn(() => true),
  useTerrain: vi.fn(() => 0),
  useUserModSettings: vi.fn(() => null),
  useHandSourceMode: vi.fn(() => "all"),
  useCheatMode: vi.fn(() => false),
  useCheatView: vi.fn(() => "player"),
  useTargetRank: vi.fn(() => "S-POW"),
  useCpuSwaps: vi.fn(() => []),
}));
vi.mock("../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: vi.fn(() => null),
}));
vi.mock("../../core/convex-hooks.ts", () => ({
  useAuthQuery: vi.fn(() => undefined),
  useAuthMutation: vi.fn(() => vi.fn()),
}));
vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => "rp"),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

import { ConfigPanel } from "./ConfigPanel.tsx";

function renderPanel() {
  const store = createStore();
  return render(
    createElement(Provider, { store }, createElement(ConfigPanel, { onClose: vi.fn() })),
  );
}

afterEach(() => {
  cleanup();
  mockSave.mockClear();
});

describe("ConfigPanel save", () => {
  it("saves on terrain change", async () => {
    renderPanel();
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "6" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ terrain: 6 }));
  });

  it("saves on second terrain change", async () => {
    renderPanel();
    const select = screen.getByLabelText("Field");
    fireEvent.change(select, { target: { value: "6" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    fireEvent.change(select, { target: { value: "3" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  });

  it("saves on deck size change", async () => {
    renderPanel();
    const input = screen.getByLabelText("Scoring cards");
    fireEvent.change(input, { target: { value: "30" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ deckSize: 30 }));
  });

  it("saves on second deck size change", async () => {
    renderPanel();
    const input = screen.getByLabelText("Scoring cards");

    fireEvent.change(input, { target: { value: "30" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));

    fireEvent.change(input, { target: { value: "20" } });
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  });

  it("saves on checkbox toggle", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ useEquipment: false }));
  });

  it("does not save invalid deck size", async () => {
    renderPanel();
    const input = screen.getByLabelText("Scoring cards");
    fireEvent.change(input, { target: { value: "999" } });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockSave).not.toHaveBeenCalled();
  });
});
