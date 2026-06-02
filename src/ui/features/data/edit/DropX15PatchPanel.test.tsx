// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("./bridge-client.ts", () => ({
  fetchDropX15Status: vi.fn(),
  putDropX15Patch: vi.fn(),
  fetchIsoBackups: vi.fn(async () => []),
  postRestoreIsoBackup: vi.fn(),
  putDuelistPool: vi.fn(),
}));

const { fetchDropX15Status, fetchIsoBackups, putDropX15Patch } = await import("./bridge-client.ts");
const { DropX15PatchPanel } = await import("./DropX15PatchPanel.tsx");

const fetchDropX15StatusMock = fetchDropX15Status as unknown as ReturnType<typeof vi.fn>;
const fetchIsoBackupsMock = fetchIsoBackups as unknown as ReturnType<typeof vi.fn>;
const putDropX15PatchMock = putDropX15Patch as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fetchDropX15StatusMock.mockReset();
  putDropX15PatchMock.mockReset();
  fetchIsoBackupsMock.mockClear();
});

describe("DropX15PatchPanel", () => {
  test("shows active state when 15-card drops are already enabled", async () => {
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: true,
      definitionId: "ghost-loop-limits",
      definitionName: "Ghost/FMR loop-limit x15",
      cardDropCount: 15,
      starchipMultiplier: 15,
      availableDropCounts: [15],
      gameSerial: "SLUS_014.11",
      discFilename: "Compatible.iso",
    });

    render(<DropX15PatchPanel />);

    expect(await screen.findByText("15 rewards")).toBeDefined();
    expect(button("Apply").disabled).toBe(true);
  });

  test("keeps the patch button disabled for unsupported discs", async () => {
    fetchDropX15StatusMock.mockResolvedValue({
      supported: false,
      enabled: false,
      gameSerial: "SLES_039.48",
      discFilename: "PAL.iso",
      reason:
        "No compatible 15-card drop patch layout was found. Supported layouts are Ghost/FMR loop limits and Ghost Drop More Cards.",
    });

    render(<DropX15PatchPanel />);

    expect(await screen.findByText("Unsupported")).toBeDefined();
    expect(screen.getByText(/No compatible 15-card drop patch layout/)).toBeDefined();
    expect(button("Apply").disabled).toBe(true);
  });

  test("changes the selected drop count and refreshes ISO backups", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x1",
      cardDropCount: 1,
      starchipMultiplier: 1,
      availableDropCounts: [1, 5, 15, 1000],
      gameSerial: "SLES_039.48",
      discFilename: "PAL.bin",
    });
    putDropX15PatchMock.mockResolvedValue({
      ok: true,
      backup: {
        filename: "20260426_122000.iso",
        timestamp: "2026-04-26T10:20:00.000Z",
        sizeBytes: 1,
      },
      changed: true,
      closedGame: true,
      status: {
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        definitionName: "Ghost Drop More Cards x15",
        cardDropCount: 15,
        starchipMultiplier: 15,
        availableDropCounts: [1, 5, 15, 1000],
        gameSerial: "SLES_039.48",
      },
    });

    render(<DropX15PatchPanel />);

    expect(await screen.findByText("PAL.bin: 1 card per duel.")).toBeDefined();
    expect(button("Apply").disabled).toBe(true);

    fireEvent.change(screen.getByRole("combobox", { name: "Card drops per duel" }), {
      target: { value: "15" },
    });
    expect(button("Apply").disabled).toBe(false);
    fireEvent.click(button("Apply"));

    await waitFor(() => expect(putDropX15PatchMock).toHaveBeenCalledWith(15));
    await waitFor(() => expect(fetchIsoBackupsMock).toHaveBeenCalledTimes(1));
    await screen.findByText("15 rewards");
    expect(button("Apply").disabled).toBe(true);
  });

  test("shows PAL x30 as active but not selectable", async () => {
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: true,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x30",
      cardDropCount: 30,
      starchipMultiplier: 30,
      availableDropCounts: [1, 5, 15, 50, 150, 1000],
      gameSerial: "SLES_039.48",
      discFilename: "PAL.bin",
    });

    render(<DropX15PatchPanel />);

    expect(await screen.findByText("30 rewards")).toBeDefined();
    expect(
      screen.getByText("PAL.bin: 30 cards per duel. Choose a supported target to change it."),
    ).toBeDefined();
    expect(screen.getByRole("option", { name: "x50" })).toBeDefined();
    expect(screen.getByRole("option", { name: "x1000" })).toBeDefined();
    expect(button("Apply").disabled).toBe(true);
  });

  test("allows reapplying the selected count when starchips do not match cards", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x150",
      cardDropCount: 150,
      starchipMultiplier: 15,
      availableDropCounts: [1, 5, 15, 50, 150, 1000],
      gameSerial: "SLES_039.48",
      discFilename: "PAL.bin",
    });
    putDropX15PatchMock.mockResolvedValue({
      ok: true,
      backup: null,
      changed: true,
      closedGame: false,
      status: {
        supported: true,
        enabled: true,
        definitionId: "ghost-drop-more-cards",
        definitionName: "Ghost Drop More Cards x150",
        cardDropCount: 150,
        starchipMultiplier: 150,
        availableDropCounts: [1, 5, 15, 50, 150, 1000],
        gameSerial: "SLES_039.48",
      },
    });

    render(<DropX15PatchPanel />);

    expect(
      await screen.findByText(
        "PAL.bin: 150 cards per duel. Starchips are x15; apply x150 to match them.",
      ),
    ).toBeDefined();
    expect(button("Apply").disabled).toBe(false);

    fireEvent.click(button("Apply"));

    await waitFor(() => expect(putDropX15PatchMock).toHaveBeenCalledWith(150));
  });
});

function button(name: string): HTMLButtonElement {
  return screen.getByRole("button", { name }) as HTMLButtonElement;
}
