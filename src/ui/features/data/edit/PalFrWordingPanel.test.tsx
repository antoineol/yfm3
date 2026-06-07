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
  invalidatePalFrWordingStatusCache: vi.fn(),
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

    render(<PalFrWordingPage backHref="#data/edit" selectedTab="names" />);

    expect(screen.getByRole("heading", { name: "PAL FR wording" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Back" })).toBeDefined();
    expect(screen.queryByText("Checking the active disc.")).toBeNull();
  });

  test("shows unsupported state for non-French discs", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: false,
      gameSerial: "SLUS_014.11",
      discFilename: "US.bin",
      reason: "PAL French wording edits are currently supported only for SLES_039.48.",
    });

    render(<PalFrWordingPage backHref="#data/edit" selectedTab="names" />);

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
        entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Dragon Blanc", 24),
        entry("pal-fr:cardDescription:6", "cardDescription", 6, 0xcfef00, "Ressemble à statue", 24),
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
        entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "D. Blanc", 24),
        entry(
          "pal-fr:cardDescription:6",
          "cardDescription",
          6,
          0xcfef00,
          "Ressemble à une statue",
          24,
        ),
      ],
    });

    const { rerender } = render(
      <PalFrWordingPage
        backHref="#data/edit"
        cacheKey="pal-fr:disc-a"
        cards={[card(5, "Oil de Feu", "Monster", 800, 600), card(6, "Dragon", "Dragon", 1200, 800)]}
        selectedTab="descriptions"
      />,
    );

    expect(screen.queryByText("Offset")).toBeNull();
    expect(screen.queryByText("Type")).toBeNull();
    expect(await screen.findByText("#5 · Oil de Feu")).toBeDefined();
    const descriptionEditor = screen.getByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardDescription:6",
    }) as HTMLTextAreaElement;
    expect(descriptionEditor.maxLength).toBe(124);
    expect(descriptionEditor.style.width).toBe("31ch");
    fireEvent.change(descriptionEditor, { target: { value: "Ressemble à une statue" } });
    expect(screen.getByRole("tab", { name: "Card descriptions (1)" })).toBeDefined();

    expect(screen.getByRole("tab", { name: "Card names" }).getAttribute("href")).toBe(
      "#data/edit/wording/names",
    );
    expect(screen.queryByRole("tab", { name: "Dialogs" })).toBeNull();
    rerender(
      <PalFrWordingPage
        backHref="#data/edit"
        cacheKey="pal-fr:disc-a"
        cards={[card(5, "Oil de Feu", "Monster", 800, 600), card(6, "Dragon", "Dragon", 1200, 800)]}
        selectedTab="names"
      />,
    );
    const nameEditor = (await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardName:0",
    })) as HTMLTextAreaElement;
    expect(nameEditor.maxLength).toBe(33);
    expect(nameEditor.style.width).toBe("35ch");
    fireEvent.change(nameEditor, { target: { value: "D. Blanc" } });
    expect(screen.getByRole("tab", { name: "Card names (1)" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Save · 2" }));

    await waitFor(() =>
      expect(putPalFrWordingEntriesMock).toHaveBeenCalledWith([
        { entryId: "pal-fr:cardName:0", text: "D. Blanc" },
        { entryId: "pal-fr:cardDescription:6", text: "Ressemble à une statue" },
      ]),
    );
    await waitFor(() => expect(fetchIsoBackupsMock).toHaveBeenCalledTimes(1));
    expect(primePalFrWordingStatusCacheMock).toHaveBeenCalledWith(
      "pal-fr:disc-a",
      expect.objectContaining({
        supported: true,
        entries: expect.arrayContaining([expect.objectContaining({ text: "D. Blanc" })]),
      }),
    );
    expect(screen.getByDisplayValue("D. Blanc")).toBeDefined();
  });

  test("enforces global display line constraints while editing", async () => {
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [
        entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Dragon Blanc", 80),
        entry(
          "pal-fr:cardDescription:6",
          "cardDescription",
          6,
          0xcfef00,
          "Ressemble à statue",
          160,
        ),
      ],
    });

    const { rerender } = render(
      <PalFrWordingPage backHref="#data/edit" selectedTab="descriptions" />,
    );

    const descriptionEditor = (await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardDescription:6",
    })) as HTMLTextAreaElement;
    fireEvent.change(descriptionEditor, {
      target: { value: `${"x".repeat(35)}\n${"y".repeat(35)}` },
    });

    expect(descriptionEditor.value).toBe(`${"x".repeat(29)}\n${"y".repeat(29)}`);
    expect(screen.getByRole("tab", { name: "Card descriptions (1)" })).toBeDefined();

    descriptionEditor.value = "";
    descriptionEditor.setSelectionRange(0, 0);
    fireEvent.paste(descriptionEditor, {
      clipboardData: { getData: () => "z".repeat(35) },
    });
    expect(descriptionEditor.value).toBe("z".repeat(29));

    rerender(<PalFrWordingPage backHref="#data/edit" selectedTab="names" />);

    const nameEditor = (await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardName:0",
    })) as HTMLTextAreaElement;
    fireEvent.change(nameEditor, { target: { value: "Dragon\nBlanc" } });
    expect(nameEditor.value).toBe("Dragon");

    fireEvent.change(nameEditor, { target: { value: "x".repeat(40) } });
    expect(nameEditor.value).toBe("x".repeat(33));
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
      entries: [entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Court", 12)],
    });

    render(<PalFrWordingPage backHref="#data/edit" selectedTab="names" />);

    const editor = await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardName:0",
    });
    fireEvent.change(editor, { target: { value: "Courte faute" } });
    const backLink = screen.getByRole("link", { name: "Back" }) as HTMLAnchorElement;
    const blocked = fireEvent.click(backLink);

    expect(confirm).toHaveBeenCalledWith("Discard unsaved PAL FR wording changes?");
    expect(blocked).toBe(false);
    expect(backLink.getAttribute("href")).toBe("#data/edit");

    const allowed = fireEvent.click(backLink);

    expect(allowed).toBe(true);
  });

  test("renders cached wording immediately without refetching", async () => {
    getCachedPalFrWordingStatusMock.mockReturnValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Texte cache", 20)],
    });

    render(<PalFrWordingPage backHref="#data/edit" cacheKey="pal-fr:disc-a" selectedTab="names" />);

    expect(screen.getByDisplayValue("Texte cache")).toBeDefined();
    expect(screen.queryByText("Active ISO text tables")).toBeNull();
    expect(fetchPalFrWordingStatusMock).not.toHaveBeenCalled();
  });

  test("allows display-valid wording to exceed the original entry byte slot", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchPalFrWordingStatusMock.mockResolvedValue({
      supported: true,
      gameSerial: "SLES_039.48",
      discFilename: "PAL-FR.bin",
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Court", 5)],
    });
    putPalFrWordingEntriesMock.mockResolvedValue({
      ok: true,
      backup: null,
      closedGame: false,
      glyphRenderingPatch: glyphPatch(true, false),
      entries: [entry("pal-fr:cardName:0", "cardName", 0, 0xd1be93, "Beaucoup trop long", 18)],
    });

    render(<PalFrWordingPage backHref="#data/edit" selectedTab="names" />);

    const editor = await screen.findByRole("textbox", {
      name: "PAL FR wording text pal-fr:cardName:0",
    });
    fireEvent.change(editor, { target: { value: "Beaucoup trop long" } });

    expect(screen.queryByText("18/5")).toBeNull();
    const save = screen.getByRole("button", { name: "Save · 1" }) as HTMLButtonElement;
    expect(save.disabled).toBe(false);
    fireEvent.click(save);

    await waitFor(() =>
      expect(putPalFrWordingEntriesMock).toHaveBeenCalledWith([
        { entryId: "pal-fr:cardName:0", text: "Beaucoup trop long" },
      ]),
    );
  });
});

function entry(
  id: string,
  kind: "cardDescription" | "cardName",
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

function card(id: number, name: string, type: string, atk: number, def: number) {
  return {
    id,
    name,
    atk,
    def,
    gs1: "",
    gs2: "",
    type,
    color: "",
    labelColor: "",
    level: 1,
    attribute: "",
    description: "",
    starchipCost: 0,
    password: "",
  };
}
