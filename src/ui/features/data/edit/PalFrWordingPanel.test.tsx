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
  fetchIsoBackups: vi.fn(async () => []),
  fetchPalFrWordingStatus: vi.fn(),
  postRestoreIsoBackup: vi.fn(),
  putDuelistPool: vi.fn(),
  putPalFrWordingEntry: vi.fn(),
}));

const { fetchIsoBackups, fetchPalFrWordingStatus, putPalFrWordingEntry } = await import(
  "./bridge-client.ts"
);
const { PalFrWordingPanel } = await import("./PalFrWordingPanel.tsx");

const fetchIsoBackupsMock = fetchIsoBackups as unknown as ReturnType<typeof vi.fn>;
const fetchPalFrWordingStatusMock = fetchPalFrWordingStatus as unknown as ReturnType<typeof vi.fn>;
const putPalFrWordingEntryMock = putPalFrWordingEntry as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fetchIsoBackupsMock.mockClear();
  fetchPalFrWordingStatusMock.mockReset();
  putPalFrWordingEntryMock.mockReset();
});

describe("PalFrWordingPanel", () => {
  test("shows unsupported state for non-French discs", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: false,
      gameSerial: "SLUS_014.11",
      discFilename: "US.bin",
      reason: "PAL French wording edits are currently supported only for SLES_039.48.",
    });

    render(<PalFrWordingPanel />);

    expect(await screen.findByText("Unsupported")).toBeDefined();
    expect(screen.getByText(/SLES_039\.48/)).toBeDefined();
  });

  test("edits one entry and refreshes ISO backups", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      entries: [
        entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Si vous persitez", 24),
        entry(
          "pal-fr:cardDescription:cfef00",
          "cardDescription",
          6,
          0xcfef00,
          "Ressemble à statue",
          24,
        ),
      ],
    });
    putPalFrWordingEntryMock.mockResolvedValue({
      ok: true,
      backup: {
        filename: "20260606_120000.iso",
        timestamp: "2026-06-06T10:00:00.000Z",
        sizeBytes: 1,
      },
      closedGame: false,
      entry: entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Si vous persistez", 24),
    });

    render(<PalFrWordingPanel />);

    expect(await screen.findByText(/PAL-FR\.bin/)).toBeDefined();
    const editor = screen.getByRole("textbox", { name: "PAL FR wording text" });
    fireEvent.change(editor, { target: { value: "Si vous persistez" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(putPalFrWordingEntryMock).toHaveBeenCalledWith(
        "pal-fr:script:d0bc1c",
        "Si vous persistez",
      ),
    );
    await waitFor(() => expect(fetchIsoBackupsMock).toHaveBeenCalledTimes(1));
    expect(screen.getByDisplayValue("Si vous persistez")).toBeDefined();
  });

  test("disables apply when the encoded text exceeds the entry budget", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      entries: [entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Court", 5)],
    });

    render(<PalFrWordingPanel />);

    const editor = await screen.findByRole("textbox", { name: "PAL FR wording text" });
    fireEvent.change(editor, { target: { value: "Beaucoup trop long" } });

    expect(screen.getByText("18/5 bytes")).toBeDefined();
    expect((screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});

function entry(
  id: string,
  kind: "cardDescription" | "cardName" | "script",
  entryIndex: number,
  offset: number,
  text: string,
  maxByteLength: number,
) {
  return {
    id,
    kind,
    entryIndex,
    offset,
    byteLength: text.length,
    maxByteLength,
    text,
  };
}
