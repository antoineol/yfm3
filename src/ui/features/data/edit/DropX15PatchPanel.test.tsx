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
      gameSerial: "SLUS_014.11",
      discFilename: "Compatible.iso",
    });

    render(<DropX15PatchPanel />);

    expect(await screen.findByText("15 rewards")).toBeDefined();
    expect(button("15 rewards active").disabled).toBe(true);
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
    expect(button("Enable 15 rewards").disabled).toBe(true);
  });

  test("enables 15-card drops and refreshes ISO backups", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x15",
      cardDropCount: 15,
      gameSerial: "SLUS_014.11",
      discFilename: "Compatible.iso",
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
        definitionId: "ghost-loop-limits",
        definitionName: "Ghost/FMR loop-limit x15",
        cardDropCount: 15,
        gameSerial: "SLUS_014.11",
      },
    });

    render(<DropX15PatchPanel />);

    expect(
      await screen.findByText("Compatible.iso is ready for 15-card and starchip rewards."),
    ).toBeDefined();
    fireEvent.click(await screen.findByRole("button", { name: "Enable 15 rewards" }));

    await waitFor(() => expect(putDropX15PatchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchIsoBackupsMock).toHaveBeenCalledTimes(1));
    await screen.findByRole("button", { name: "15 rewards active" });
    expect(button("15 rewards active").disabled).toBe(true);
  });

  test("shows the PAL 30-card reward target", async () => {
    fetchDropX15StatusMock.mockResolvedValue({
      supported: true,
      enabled: false,
      definitionId: "ghost-drop-more-cards",
      definitionName: "Ghost Drop More Cards x30",
      cardDropCount: 30,
      gameSerial: "SLES_039.48",
      discFilename: "PAL.bin",
    });

    render(<DropX15PatchPanel />);

    expect(
      await screen.findByText("PAL.bin is ready for 30-card and starchip rewards."),
    ).toBeDefined();
    expect(button("Enable 30 rewards").disabled).toBe(false);
  });
});

function button(name: string): HTMLButtonElement {
  return screen.getByRole("button", { name }) as HTMLButtonElement;
}
