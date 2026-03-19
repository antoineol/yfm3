// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import { CardDetailProvider } from "../../lib/card-detail-context.tsx";
import { DuelistsPanel } from "./DuelistsPanel.tsx";

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

const noop = () => {};

function renderPanel(props?: {
  selectedDuelistId?: number;
  onDuelistChange?: (id: number) => void;
}) {
  return render(
    <CardDetailProvider>
      <DuelistsPanel
        cardDb={cardDb}
        duelists={duelists}
        onDuelistChange={props?.onDuelistChange ?? noop}
        selectedDuelistId={props?.selectedDuelistId}
      />
    </CardDetailProvider>,
  );
}

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

  it("calls onDuelistChange on select change", () => {
    const onChange = vi.fn();
    renderPanel({ onDuelistChange: onChange });
    const select = screen.getByLabelText("Duelist") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("shows card count badges", () => {
    renderPanel();
    // Both deck and drops sections have 2 cards each for Simon Muran
    const badges = screen.getAllByText("2 cards");
    expect(badges.length).toBe(2);
  });

  it("selects duelist from selectedDuelistId prop", () => {
    renderPanel({ selectedDuelistId: 2 });
    const select = screen.getByLabelText("Duelist") as HTMLSelectElement;
    expect(select.value).toBe("2");
    expect(screen.getByText("#2")).toBeTruthy();
  });
});
