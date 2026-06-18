// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../../../engine/data/game-db.ts";
import type { BridgeDuelist, BridgeGameData } from "../../../../engine/worker/messages.ts";
import { DropPoolEditor } from "./DropPoolEditor.tsx";

const mocks = vi.hoisted(() => ({
  fusionTableData: undefined as unknown,
  ownedTotals: vi.fn<() => Record<number, number> | undefined>(() => undefined),
}));

vi.mock("../../../lib/fusion-table-context.tsx", () => ({
  useFusionTable: () => mocks.fusionTableData,
  useHasReferenceData: () => true,
}));

vi.mock("../../../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: () => mocks.ownedTotals(),
}));

vi.mock("../../../lib/bridge-context.tsx", () => ({
  useBridge: () => ({ detail: "disconnected" }),
  useBridgeOptional: () => null,
}));

afterEach(cleanup);

describe("DropPoolEditor", () => {
  it("switches from Drops to Deck without carrying an invalid drop sort key", () => {
    mocks.fusionTableData = { cardDb };

    render(
      <Provider store={createStore()}>
        <DropPoolEditor
          gameData={makeGameData([makeDuelist(1)])}
          onDuelistChange={() => undefined}
          selectedDuelistId={1}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Cards the AI builds its deck from." }));

    expect(screen.getByText("Distinct")).toBeTruthy();
    expect(screen.getAllByText("Deck").length).toBeGreaterThan(1);
  });
});

const cardDb = createCardDb();
addTestCard({
  id: 1,
  name: "Blue Dragon",
  attack: 1200,
  defense: 900,
  kinds: ["Dragon"],
  isMonster: true,
});
addTestCard({
  id: 2,
  name: "Red Warrior",
  attack: 1000,
  defense: 1100,
  kinds: ["Warrior"],
  isMonster: true,
});
addTestCard({
  id: 3,
  name: "Green Mage",
  attack: 800,
  defense: 1300,
  kinds: ["Spellcaster"],
  isMonster: true,
});

function addTestCard(card: CardSpec) {
  addCard(cardDb, card);
}

function makeDuelist(id: number): BridgeDuelist {
  return {
    id,
    name: `Duelist ${id}`,
    saPow: [100, 50, 0],
    bcd: [0, 20, 0],
    saTec: [0, 0, 10],
    deck: [0, 40, 80],
  };
}

function makeGameData(duelists: BridgeDuelist[]): BridgeGameData {
  return {
    artworkKey: "test",
    cards: [],
    deckLimits: null,
    duelists,
    equipBonuses: null,
    equipTable: [],
    fieldBonusTable: null,
    fusionTable: [],
    perEquipBonuses: null,
    rankScoring: null,
  };
}
