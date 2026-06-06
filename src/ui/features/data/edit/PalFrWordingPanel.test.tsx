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
  getCachedPalFrWordingStatus: vi.fn(() => null),
  primePalFrWordingStatusCache: vi.fn(),
  postRestoreIsoBackup: vi.fn(),
  putDuelistPool: vi.fn(),
  putPalFrWordingEntries: vi.fn(),
}));

const {
  fetchIsoBackups,
  fetchPalFrWordingStatus,
  getCachedPalFrWordingStatus,
  primePalFrWordingStatusCache,
  putPalFrWordingEntries,
} = await import("./bridge-client.ts");
const { PalFrWordingPage } = await import("./PalFrWordingPanel.tsx");

const fetchIsoBackupsMock = fetchIsoBackups as unknown as ReturnType<typeof vi.fn>;
const fetchPalFrWordingStatusMock = fetchPalFrWordingStatus as unknown as ReturnType<typeof vi.fn>;
const getCachedPalFrWordingStatusMock = getCachedPalFrWordingStatus as unknown as ReturnType<
  typeof vi.fn
>;
const primePalFrWordingStatusCacheMock = primePalFrWordingStatusCache as unknown as ReturnType<
  typeof vi.fn
>;
const putPalFrWordingEntriesMock = putPalFrWordingEntries as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fetchIsoBackupsMock.mockClear();
  fetchPalFrWordingStatusMock.mockReset();
  getCachedPalFrWordingStatusMock.mockReset();
  getCachedPalFrWordingStatusMock.mockReturnValue(null);
  primePalFrWordingStatusCacheMock.mockReset();
  putPalFrWordingEntriesMock.mockReset();
});

describe("PalFrWordingPage", () => {
  test("shows a structured loading state while checking the active disc", () => {
    fetchPalFrWordingStatusMock.mockReturnValue(new Promise(() => {}));

    render(<PalFrWordingPage backHref="#data/edit/1" />);

    expect(screen.getByRole("heading", { name: "PAL FR wording" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Back" })).toBeDefined();
    expect(screen.getByText("Active ISO text tables")).toBeDefined();
    expect(screen.queryByText("Checking the active disc.")).toBeNull();
  });

  test("shows unsupported state for non-French discs", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: false,
      gameSerial: "SLUS_014.11",
      discFilename: "US.bin",
      reason: "PAL French wording edits are currently supported only for SLES_039.48.",
    });

    render(<PalFrWordingPage backHref="#data/edit/1" />);

    expect(await screen.findByText(/SLES_039\.48/)).toBeDefined();
  });

  test("saves multiple entries and refreshes ISO backups", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
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
    putPalFrWordingEntriesMock.mockResolvedValue({
      ok: true,
      backup: {
        filename: "20260606_120000.iso",
        timestamp: "2026-06-06T10:00:00.000Z",
        sizeBytes: 1,
      },
      closedGame: false,
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [
        entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Si vous persistez", 24),
        entry(
          "pal-fr:cardDescription:cfef00",
          "cardDescription",
          6,
          0xcfef00,
          "Ressemble à une statue",
          24,
        ),
      ],
    });

    render(<PalFrWordingPage backHref="#data/edit/1" cacheKey="pal-fr:disc-a" />);

    expect(await screen.findByText(/PAL-FR\.bin/)).toBeDefined();
    fireEvent.change(
      screen.getByRole("textbox", { name: "PAL FR wording text pal-fr:script:d0bc1c" }),
      { target: { value: "Si vous persistez" } },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "PAL FR wording text pal-fr:cardDescription:cfef00" }),
      { target: { value: "Ressemble à une statue" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save · 2" }));

    await waitFor(() =>
      expect(putPalFrWordingEntriesMock).toHaveBeenCalledWith([
        { entryId: "pal-fr:script:d0bc1c", text: "Si vous persistez" },
        { entryId: "pal-fr:cardDescription:cfef00", text: "Ressemble à une statue" },
      ]),
    );
    await waitFor(() => expect(fetchIsoBackupsMock).toHaveBeenCalledTimes(1));
    expect(primePalFrWordingStatusCacheMock).toHaveBeenCalledWith(
      "pal-fr:disc-a",
      expect.objectContaining({
        supported: true,
        entries: expect.arrayContaining([expect.objectContaining({ text: "Si vous persistez" })]),
      }),
    );
    expect(screen.getByDisplayValue("Si vous persistez")).toBeDefined();
  });

  test("confirms before leaving with unsaved edits", async () => {
    const confirm = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Court", 12)],
    });

    render(<PalFrWordingPage backHref="#data/edit/1" />);

    const editor = await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:script:d0bc1c",
    });
    fireEvent.change(editor, { target: { value: "Courte faute" } });
    const backLink = screen.getByRole("link", { name: "Back" }) as HTMLAnchorElement;
    const blocked = fireEvent.click(backLink);

    expect(confirm).toHaveBeenCalledWith("Discard unsaved PAL FR wording changes?");
    expect(blocked).toBe(false);
    expect(backLink.getAttribute("href")).toBe("#data/edit/1");

    const allowed = fireEvent.click(backLink);

    expect(allowed).toBe(true);
  });

  test("renders cached wording immediately without refetching", async () => {
    getCachedPalFrWordingStatusMock.mockReturnValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Texte cache", 20)],
    });

    render(<PalFrWordingPage backHref="#data/edit/1" cacheKey="pal-fr:disc-a" />);

    expect(screen.getByDisplayValue("Texte cache")).toBeDefined();
    expect(screen.queryByText("Active ISO text tables")).toBeNull();
    expect(fetchPalFrWordingStatusMock).not.toHaveBeenCalled();
  });

  test("disables global save when any changed row exceeds its entry budget", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:script:d0bc1c", "script", 762, 0xd0bc1c, "Court", 5)],
    });

    render(<PalFrWordingPage backHref="#data/edit/1" />);

    const editor = await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:script:d0bc1c",
    });
    fireEvent.change(editor, { target: { value: "Beaucoup trop long" } });

    expect(screen.getByText("18/5")).toBeDefined();
    expect((screen.getByRole("button", { name: "Save · 1" }) as HTMLButtonElement).disabled).toBe(
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

function glyphPatch(applied: boolean, changed: boolean) {
  return {
    applied,
    changed,
    targets: [],
  };
}
