// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import { CardDetailProvider } from "../../lib/card-detail-context.tsx";
import { DuelistsPanel, formatRate } from "./DuelistsPanel.tsx";

afterEach(cleanup);

const cardDb = createCardDb();
addCard(cardDb, {
  id: 10,
  name: "Dragon A",
  attack: 1200,
  defense: 700,
  kinds: ["Dragon"],
  isMonster: true,
});
addCard(cardDb, {
  id: 20,
  name: "Fairy B",
  attack: 800,
  defense: 600,
  kinds: ["Fairy"],
  isMonster: true,
});
addCard(cardDb, {
  id: 30,
  name: "Beast C",
  attack: 1500,
  defense: 1000,
  kinds: ["Beast"],
  isMonster: true,
});

const duelists: RefDuelistCard[] = [
  { duelistId: 1, duelistName: "Simon Muran", cardId: 10, deck: 75, saPow: 45, bcd: 0, saTec: 15 },
  { duelistId: 1, duelistName: "Simon Muran", cardId: 20, deck: 0, saPow: 40, bcd: 45, saTec: 0 },
  { duelistId: 1, duelistName: "Simon Muran", cardId: 30, deck: 70, saPow: 0, bcd: 0, saTec: 0 },
  { duelistId: 2, duelistName: "Teana", cardId: 10, deck: 80, saPow: 50, bcd: 50, saTec: 50 },
];

function renderPanel() {
  return render(
    <CardDetailProvider>
      <DuelistsPanel cardDb={cardDb} duelists={duelists} />
    </CardDetailProvider>,
  );
}

describe("formatRate", () => {
  it("returns dash for zero", () => {
    expect(formatRate(0)).toBe("—");
  });

  it("formats rate as percentage", () => {
    expect(formatRate(45)).toBe("2.2%");
  });

  it("formats large rate", () => {
    expect(formatRate(2048)).toBe("100.0%");
  });
});

describe("DuelistsPanel", () => {
  it("renders duelist selector with all duelists", () => {
    renderPanel();
    const select = screen.getByLabelText("Duelist") as HTMLSelectElement;
    const options = Array.from(select.options);
    expect(options.map((o) => o.text)).toEqual(["Simon Muran", "Teana"]);
  });

  it("shows deck cards for selected duelist", () => {
    renderPanel();
    // Dragon A (deck=75) appears in both deck and drops, so use getAllByText
    expect(screen.getAllByText("Dragon A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Beast C").length).toBe(1); // deck only, no drops
  });

  it("shows drop cards with rates", () => {
    renderPanel();
    // Simon Muran has drops for Dragon A (saPow=45, saTec=15) and Fairy B (saPow=40, bcd=45)
    const dropRates = screen.getAllByText(/\d+\.\d+%/);
    expect(dropRates.length).toBeGreaterThan(0);
  });

  it("switches duelist on select change", () => {
    renderPanel();
    const select = screen.getByLabelText("Duelist") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "2" } });
    // Teana has 1 deck card (Dragon A with deck=80)
    expect(screen.getByText("#2")).toBeTruthy();
  });

  it("shows card count badges", () => {
    renderPanel();
    // Both deck and drops sections have 2 cards each for Simon Muran
    const badges = screen.getAllByText("2 cards");
    expect(badges.length).toBe(2);
  });
});
