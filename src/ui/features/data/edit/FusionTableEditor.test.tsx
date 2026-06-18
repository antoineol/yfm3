// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../../../engine/data/game-db.ts";
import type { BridgeGameData } from "../../../../engine/worker/messages.ts";

const cardDb = createCardDb();
const cards: CardSpec[] = [
  {
    id: 1,
    name: "Thunder Dragon",
    attack: 1600,
    defense: 1500,
    kinds: ["Thunder"],
    isMonster: true,
  },
  {
    id: 2,
    name: "Dragon Zombie",
    attack: 1600,
    defense: 0,
    kinds: ["Zombie"],
    isMonster: true,
  },
  {
    id: 3,
    name: "Twin-headed Thunder Dragon",
    attack: 2800,
    defense: 2100,
    kinds: ["Thunder"],
    isMonster: true,
  },
  {
    id: 4,
    name: "Unrelated Result",
    attack: 1000,
    defense: 1000,
    kinds: ["Warrior"],
    isMonster: true,
  },
];
for (const card of cards) addCard(cardDb, card);

const mocks = vi.hoisted(() => ({
  selectedCard: undefined as CardSpec | undefined,
  fetchIsoBackups: vi.fn(async () => []),
  putFusionTable: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../lib/fusion-table-context.tsx", () => ({
  useFusionTable: () => ({ cardDb }),
}));

vi.mock("../../../components/CardAutocomplete.tsx", () => ({
  CardAutocomplete: ({ onSelect }: { onSelect: (card: CardSpec) => void }) => (
    <button onClick={() => onSelect(mocks.selectedCard as CardSpec)} type="button">
      Pick card
    </button>
  ),
}));

vi.mock("./IsoBackupsDrawer.tsx", () => ({
  IsoBackupsDrawerButton: () => <button type="button">Backups</button>,
}));

vi.mock("./bridge-client.ts", () => ({
  fetchIsoBackups: mocks.fetchIsoBackups,
  putFusionTable: mocks.putFusionTable,
}));

const { FusionTableEditor } = await import("./FusionTableEditor.tsx");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mocks.fetchIsoBackups.mockClear();
  mocks.putFusionTable.mockReset();
});

describe("FusionTableEditor", () => {
  test("filters by result, deletes visible fusions, and saves the replacement table", async () => {
    mocks.selectedCard = cards[2];
    mocks.putFusionTable.mockResolvedValue({
      ok: true,
      backup: null,
      closedGame: false,
      fusionTable: [{ material1: 1, material2: 4, result: 4 }],
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <Provider store={createStore()}>
        <FusionTableEditor gameData={makeGameData()} />
      </Provider>,
    );

    expect(screen.getByText("Pick a card to load matching fusions.")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Pick card" }));

    expect(screen.getAllByText("Twin-headed Thunder Dragon").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unrelated Result")).toBeNull();

    fireEvent.click(screen.getByLabelText("2 visible"));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected · 2" }));

    expect(screen.getByText("1 fusion · 2 deleted")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mocks.putFusionTable).toHaveBeenCalledTimes(1));
    expect(mocks.putFusionTable).toHaveBeenCalledWith([{ material1: 1, material2: 4, result: 4 }]);
    await waitFor(() => expect(mocks.fetchIsoBackups).toHaveBeenCalledTimes(1));
  });
});

function makeGameData(): BridgeGameData {
  return {
    artworkKey: "test",
    cards: [],
    deckLimits: null,
    duelists: [],
    equipBonuses: null,
    equipTable: [],
    fieldBonusTable: null,
    fusionTable: [
      { material1: 1, material2: 2, result: 3 },
      { material1: 1, material2: 3, result: 3 },
      { material1: 1, material2: 4, result: 4 },
    ],
    perEquipBonuses: null,
    rankScoring: null,
  };
}
