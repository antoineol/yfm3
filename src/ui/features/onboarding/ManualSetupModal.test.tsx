// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { manualSetupModalOpenAtom } from "../../lib/atoms.ts";

const mockSetSelectedMod = vi.fn();
let mockSelectedMod = "vanilla";
const mockImportData = vi.fn();

vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: vi.fn(() => mockSelectedMod),
  useSetSelectedMod: vi.fn(() => mockSetSelectedMod),
}));

vi.mock("convex/react", () => ({
  useMutation: () => mockImportData,
}));

vi.mock("../../../../convex/_generated/api", () => ({
  api: { importExport: { importData: "importData" } },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../config/import-export-schema.ts", () => ({
  importExportSchema: {
    safeParse: vi.fn(() => ({
      success: true,
      data: { collection: [], deck: [] },
    })),
  },
}));

import { ManualSetupModal } from "./ManualSetupModal.tsx";

function Opener() {
  const setOpen = useSetAtom(manualSetupModalOpenAtom);
  return (
    <button onClick={() => setOpen(true)} type="button">
      open-modal
    </button>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}

afterEach(() => {
  cleanup();
  mockSelectedMod = "vanilla";
});

describe("ManualSetupModal", () => {
  it("renders nothing when atom is false", () => {
    render(<ManualSetupModal />, { wrapper: Wrapper });
    expect(screen.queryByText("Setup guide")).toBeNull();
  });

  it("renders modal content when atom is true", () => {
    render(
      <>
        <Opener />
        <ManualSetupModal />
      </>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByText("open-modal"));
    expect(screen.getByText("Setup guide")).toBeDefined();
    expect(screen.getByText("Vanilla")).toBeDefined();
    expect(screen.getByText("Remastered Perfected")).toBeDefined();
    expect(screen.getByText("Download game")).toBeDefined();
    expect(screen.getByText("Load sample collection")).toBeDefined();
  });

  it("calls setSelectedMod when a version is clicked", () => {
    render(
      <>
        <Opener />
        <ManualSetupModal />
      </>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByText("open-modal"));
    fireEvent.click(screen.getByText("Remastered Perfected"));
    expect(mockSetSelectedMod).toHaveBeenCalledWith({ selectedMod: "rp" });
  });

  it("shows mod-specific download label", () => {
    mockSelectedMod = "rp";
    render(
      <>
        <Opener />
        <ManualSetupModal />
      </>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByText("open-modal"));
    expect(screen.getByText("Download RP mod")).toBeDefined();
  });
});
