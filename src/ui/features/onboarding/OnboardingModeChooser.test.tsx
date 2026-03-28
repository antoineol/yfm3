// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useAtomValue } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUpdatePreferences = vi.fn();
const mockSetHash = vi.fn();

vi.mock("../../db/use-update-preferences.ts", () => ({
  useUpdatePreferences: vi.fn(() => mockUpdatePreferences),
}));

vi.mock("../../lib/use-tab-from-hash.ts", () => ({
  useHash: vi.fn(() => ["", mockSetHash]),
}));

import { manualSetupModalOpenAtom } from "../../lib/atoms.ts";
import { OnboardingModeChooser } from "./OnboardingModeChooser.tsx";

function ModalAtomReader() {
  const open = useAtomValue(manualSetupModalOpenAtom);
  return <span data-testid="modal-open">{String(open)}</span>;
}

afterEach(() => {
  cleanup();
});

describe("OnboardingModeChooser", () => {
  it("renders both mode options", () => {
    render(<OnboardingModeChooser />);
    expect(screen.getByText("Auto-Sync")).toBeDefined();
    expect(screen.getByText("Manual")).toBeDefined();
  });

  it("does not show version selector or download links", () => {
    render(<OnboardingModeChooser />);
    expect(screen.queryByText("Vanilla")).toBeNull();
    expect(screen.queryByText("Download DuckStation")).toBeNull();
    expect(screen.queryByText("PS1 BIOS (US)")).toBeNull();
  });

  it("calls updatePreferences with bridgeAutoSync true when auto-sync card is clicked", () => {
    render(<OnboardingModeChooser />);
    fireEvent.click(screen.getByText("Auto-Sync"));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ bridgeAutoSync: true });
  });

  it("calls updatePreferences with bridgeAutoSync false, opens modal, and navigates to deck when manual card is clicked", () => {
    render(
      <>
        <OnboardingModeChooser />
        <ModalAtomReader />
      </>,
    );
    fireEvent.click(screen.getByText("Manual"));
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ bridgeAutoSync: false });
    expect(mockSetHash).toHaveBeenCalledWith("deck");
    expect(screen.getByTestId("modal-open").textContent).toBe("true");
  });
});
