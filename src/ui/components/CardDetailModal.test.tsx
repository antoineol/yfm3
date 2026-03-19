// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../engine/reference/build-reference-table.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import type { FusionTableData } from "../lib/fusion-table-context.tsx";
import { CardDetailModal } from "./CardDetailModal.tsx";

const testDuelists: RefDuelistCard[] = [
  { duelistId: 1, duelistName: "Simon Muran", cardId: 1, deck: 75, saPow: 45, bcd: 0, saTec: 15 },
  { duelistId: 2, duelistName: "Teana", cardId: 1, deck: 0, saPow: 50, bcd: 50, saTec: 0 },
  { duelistId: 3, duelistName: "Seto", cardId: 99, deck: 0, saPow: 100, bcd: 0, saTec: 0 },
];

vi.mock("../lib/fusion-table-context.tsx", () => ({
  useFusionTable: (): Pick<FusionTableData, "duelists"> => ({ duelists: testDuelists }),
  useHasReferenceData: () => true,
}));

afterEach(cleanup);

const testCard: CardSpec = {
  id: 1,
  name: "Baby Dragon",
  kinds: ["Dragon"],
  isMonster: true,
  attack: 1200,
  defense: 700,
  level: 3,
  attribute: "Earth",
  guardianStar1: "Saturn",
  guardianStar2: "Sun",
  description: "Much more than just a child",
  starchipCost: 20,
  password: 1,
};

const noDropCard: CardSpec = {
  id: 999,
  name: "Lonely Card",
  kinds: ["Fiend"],
  isMonster: true,
  attack: 100,
  defense: 100,
};

const testDb = createCardDb();
addCard(testDb, testCard);
addCard(testDb, noDropCard);

function OpenButton({ cardId }: { cardId: number }) {
  const { openCard } = useCardDetail();
  return (
    <button onClick={() => openCard(cardId)} type="button">
      Open
    </button>
  );
}

function renderModal(cardId?: number) {
  const store = createStore();
  return render(
    <Provider store={store}>
      <CardDbProvider cardDb={testDb}>
        <OpenButton cardId={cardId ?? 1} />
        <CardDetailModal />
      </CardDbProvider>
    </Provider>,
  );
}

describe("CardDetailModal", () => {
  it("does not render content when no card is selected", () => {
    renderModal();
    expect(screen.queryByText("Baby Dragon")).toBeNull();
  });

  it("shows card details when opened", () => {
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    // Card name appears in game card banner, below-card label, and detail title
    expect(screen.getAllByText("Baby Dragon").length).toBeGreaterThanOrEqual(2);
    // ATK/DFD appear in both game card and detail panel
    expect(screen.getAllByText("1200").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("700").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Dragon")).toBeTruthy();
    expect(screen.getByText("Earth")).toBeTruthy();
    // Description appears in both game card desc box and detail panel
    expect(screen.getAllByText("Much more than just a child").length).toBeGreaterThanOrEqual(1);
  });

  it("shows guardian stars", () => {
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Saturn")).toBeTruthy();
    expect(screen.getByText("Sun")).toBeTruthy();
  });

  it("closes when close button is clicked", () => {
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getAllByText("Baby Dragon").length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByLabelText("Close"));
    // After closing, the card name in the modal title should be gone
    // (the "Baby Dragon" text from the Open button context won't appear as modal title)
    expect(screen.queryByText("Much more than just a child")).toBeNull();
  });

  it("shows dropped-by section with duelists and rates", () => {
    renderModal(1);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Simon Muran")).toBeTruthy();
    expect(screen.getByText("Teana")).toBeTruthy();
    // Seto only drops card 99, not card 1
    expect(screen.queryByText("Seto")).toBeNull();
    // Simon SA-POW 45/2048 = 2.2%, Teana SA-POW 50/2048 = 2.4% (appears twice: saPow + bcd)
    expect(screen.getByText("2.2%")).toBeTruthy();
    expect(screen.getAllByText("2.4%").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty message when no duelists drop the card", () => {
    renderModal(999);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("No duelists drop this card.")).toBeTruthy();
  });

  it("renders duelist names as links to data tab", () => {
    renderModal(1);
    fireEvent.click(screen.getByText("Open"));
    const link = screen.getByText("Simon Muran").closest("a") as HTMLAnchorElement;
    expect(link.href).toContain("#data/duelists/1");
    expect(link.target).toBe("_blank");
  });

  it("sorts dropped-by table when clicking column headers", () => {
    renderModal(1);
    fireEvent.click(screen.getByText("Open"));

    const rows = () =>
      // biome-ignore lint/style/noNonNullAssertion: test helper — element is guaranteed present
      screen.getByText("Dropped by").closest("div")!.querySelectorAll("tbody tr");

    // Simon saPow=45 bcd=0 saTec=15 total=60; Teana saPow=50 bcd=50 saTec=0 total=100
    // Default sort: descending by total → Teana first
    const firstDuelist = (r: NodeListOf<Element>) => r[0]?.querySelector("td")?.textContent;
    const secondDuelist = (r: NodeListOf<Element>) => r[1]?.querySelector("td")?.textContent;
    expect(firstDuelist(rows())).toBe("Teana");
    expect(secondDuelist(rows())).toBe("Simon Muran");

    // Click SA-POW → desc: Teana (50) > Simon (45)
    fireEvent.click(screen.getByText("SA-POW"));
    expect(firstDuelist(rows())).toBe("Teana");
    expect(secondDuelist(rows())).toBe("Simon Muran");

    // Click SA-POW again → asc: Simon (45) < Teana (50)
    fireEvent.click(screen.getByText("SA-POW"));
    expect(firstDuelist(rows())).toBe("Simon Muran");
    expect(secondDuelist(rows())).toBe("Teana");

    // Click SA-POW third time → clears sort, back to default
    fireEvent.click(screen.getByText("SA-POW"));
    expect(firstDuelist(rows())).toBe("Teana");

    // Click BCD → desc: Teana (50) > Simon (0)
    fireEvent.click(screen.getByText("BCD"));
    expect(firstDuelist(rows())).toBe("Teana");

    // Click SA-TEC → desc: Simon (15) > Teana (0)
    fireEvent.click(screen.getByText("SA-TEC"));
    expect(firstDuelist(rows())).toBe("Simon Muran");
  });
});
