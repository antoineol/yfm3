// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";
import { BuyPanel } from "./BuyPanel.tsx";

vi.mock("../../lib/use-selected-mod.ts", () => ({
  useSelectedMod: () => "rp",
}));

afterEach(cleanup);

const cheapHighValue: CardSpec = {
  id: 101,
  name: "Cheap High Value",
  attack: 2000,
  defense: 1000,
  kinds: ["Dragon"],
  isMonster: true,
  starchipCost: 100,
};

const belowMinAtk: CardSpec = {
  id: 102,
  name: "Weak Card",
  attack: 800,
  defense: 500,
  kinds: ["Fairy"],
  isMonster: true,
  starchipCost: 50,
};

const notForSale: CardSpec = {
  id: 103,
  name: "Not For Sale",
  attack: 2500,
  defense: 2000,
  kinds: ["Warrior"],
  isMonster: true,
  starchipCost: 999999,
};

const nonMonster: CardSpec = {
  id: 104,
  name: "Raigeki",
  attack: 0,
  defense: 0,
  kinds: [],
  isMonster: false,
  starchipCost: 200,
};

const premium: CardSpec = {
  id: 105,
  name: "Premium Monster",
  attack: 3000,
  defense: 2500,
  kinds: ["Dragon"],
  isMonster: true,
  starchipCost: 5000,
};

function renderPanel(ownedTotals: Record<number, number> | undefined = undefined) {
  const db = createCardDb();
  for (const c of [cheapHighValue, belowMinAtk, notForSale, nonMonster, premium]) {
    addCard(db, c);
  }
  return render(
    <CardDbProvider cardDb={db}>
      <BuyPanel cards={db.cards} ownedTotals={ownedTotals} />
    </CardDbProvider>,
  );
}

describe("BuyPanel", () => {
  it("lists only buyable monsters above the default min-ATK threshold", () => {
    renderPanel();
    expect(screen.getAllByText("Cheap High Value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Premium Monster").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Weak Card")).toBeNull();
    expect(screen.queryByText("Not For Sale")).toBeNull();
    expect(screen.queryByText("Raigeki")).toBeNull();
  });

  it("hides cards the player already owns 3 copies of by default", () => {
    renderPanel({ [cheapHighValue.id]: 3 });
    expect(screen.queryByText("Cheap High Value")).toBeNull();
    expect(screen.getAllByText("Premium Monster").length).toBeGreaterThanOrEqual(1);
  });
});
