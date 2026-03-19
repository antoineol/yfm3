// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import type { RefFusion } from "../../../engine/reference/build-reference-table.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";
import { CardDetailProvider } from "../../lib/card-detail-context.tsx";
import { FusionsTable } from "./FusionsTable.tsx";

afterEach(cleanup);

const cardDb = createCardDb();
addCard(cardDb, {
  id: 1,
  name: "Dragon A",
  attack: 1200,
  defense: 700,
  kinds: ["Dragon"],
  isMonster: true,
});
addCard(cardDb, {
  id: 2,
  name: "Fairy B",
  attack: 800,
  defense: 600,
  kinds: ["Fairy"],
  isMonster: true,
});
addCard(cardDb, {
  id: 3,
  name: "Beast C",
  attack: 1500,
  defense: 1000,
  kinds: ["Beast"],
  isMonster: true,
});
addCard(cardDb, {
  id: 4,
  name: "Warrior D",
  attack: 2000,
  defense: 1800,
  kinds: ["Warrior"],
  isMonster: true,
});

const fusions: RefFusion[] = [
  { material1Id: 1, material2Id: 2, resultId: 3, resultAtk: 1500 },
  { material1Id: 2, material2Id: 3, resultId: 4, resultAtk: 2000 },
];

function renderTable() {
  return render(
    <CardDetailProvider>
      <CardDbProvider cardDb={cardDb}>
        <FusionsTable cardDb={cardDb} fusions={fusions} />
      </CardDbProvider>
    </CardDetailProvider>,
  );
}

describe("FusionsTable", () => {
  it("renders all fusions when no filter is active", () => {
    renderTable();
    expect(screen.getByText("2 fusions")).toBeTruthy();
    expect(screen.getAllByText("Dragon A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Warrior D").length).toBeGreaterThanOrEqual(1);
  });

  it("renders filter combobox with placeholder", () => {
    renderTable();
    expect(screen.getByPlaceholderText("Filter by card…")).toBeTruthy();
  });

  it("shows empty state when no fusions exist", () => {
    render(
      <CardDetailProvider>
        <CardDbProvider cardDb={cardDb}>
          <FusionsTable cardDb={cardDb} fusions={[]} />
        </CardDbProvider>
      </CardDetailProvider>,
    );
    expect(screen.getByText("No fusions.")).toBeTruthy();
    expect(screen.getByText("0 fusions")).toBeTruthy();
  });
});
