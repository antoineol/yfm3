// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../engine/data/game-db.ts";
import type { RefDuelistCard, RefFusion } from "../../engine/reference/build-reference-table.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { useCardDetail } from "../lib/card-detail-context.tsx";
import type { FusionTableData } from "../lib/fusion-table-context.tsx";
import { CardDetailModal } from "./CardDetailModal.tsx";

const testDuelists: RefDuelistCard[] = [
  { duelistId: 1, duelistName: "Simon Muran", cardId: 1, deck: 75, saPow: 45, bcd: 0, saTec: 15 },
  { duelistId: 2, duelistName: "Teana", cardId: 1, deck: 0, saPow: 50, bcd: 50, saTec: 0 },
  { duelistId: 3, duelistName: "Seto", cardId: 99, deck: 0, saPow: 100, bcd: 0, saTec: 0 },
];

const testFusions: RefFusion[] = [
  // Baby Dragon (1) + Lonely Card (999) → Fusion Beast (50)
  { material1Id: 1, material2Id: 999, resultId: 50, resultAtk: 2000 },
];

// Forward-declared; assigned after testDb is built below.
// eslint-disable-next-line prefer-const -- assigned after testDb creation
let mockFusionTableData: Pick<FusionTableData, "duelists" | "fusions" | "cardDb"> =
  undefined as never;

vi.mock("../lib/fusion-table-context.tsx", () => ({
  useFusionTable: () => mockFusionTableData,
  useHasReferenceData: () => true,
}));

const mockOwnedTotals = vi.fn<() => Record<number, number> | undefined>(() => undefined);
vi.mock("../db/use-owned-card-totals.ts", () => ({
  useOwnedCardTotals: () => mockOwnedTotals(),
}));

vi.mock("../lib/use-selected-mod.ts", () => ({
  useSelectedMod: () => "rp",
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

const fusionResultCard: CardSpec = {
  id: 50,
  name: "Fusion Beast",
  kinds: ["Beast"],
  isMonster: true,
  attack: 2000,
  defense: 1500,
};

const testDb = createCardDb();
addCard(testDb, testCard);
addCard(testDb, noDropCard);
addCard(testDb, fusionResultCard);

mockFusionTableData = { duelists: testDuelists, fusions: testFusions, cardDb: testDb };

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
    expect(screen.getByText("#1")).toBeTruthy();
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
    // biome-ignore lint/style/noNonNullAssertion: test helper — element is guaranteed present
    fireEvent.click(screen.getAllByLabelText("Close")[0]!);
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

  it("hides Owned badge when ownedTotals is undefined", () => {
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.queryByText("Owned")).toBeNull();
  });

  it("shows Owned badge with need styling when below max copies", () => {
    mockOwnedTotals.mockReturnValue({ 1: 1 });
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Owned")).toBeTruthy();
    const badge = screen.getByText("1");
    expect(badge.className).toContain("text-text-need");
  });

  it("shows Owned badge with muted styling at max copies", () => {
    mockOwnedTotals.mockReturnValue({ 1: 3 });
    renderModal();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Owned")).toBeTruthy();
    // The "3" appears in multiple places (level, owned), find the one in the owned badge
    const ownedSection = screen.getByText("Owned").closest("div");
    const badge = ownedSection?.querySelector(".text-text-muted");
    expect(badge).not.toBeNull();
  });

  it("shows Fused by section with materials for a fusion result card", () => {
    renderModal(50);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Fused by")).toBeTruthy();
    // Materials are visible immediately (no collapse)
    expect(screen.getByText("Baby Dragon")).toBeTruthy();
    expect(screen.getByText("Lonely Card")).toBeTruthy();
  });

  it("shows Fuses to section with result and ATK for a material card", () => {
    renderModal(1);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Fuses to")).toBeTruthy();
    // "With" column shows card ID, "Result" shows fusion result name
    expect(screen.getByText("#999")).toBeTruthy();
    expect(screen.getByText("Fusion Beast")).toBeTruthy();
    expect(screen.getByText("2000")).toBeTruthy();
  });

  it("renders fusion card links as new-tab anchors", () => {
    renderModal(50);
    fireEvent.click(screen.getByText("Open"));
    const link = screen.getByText("Baby Dragon").closest("a") as HTMLAnchorElement;
    expect(link.target).toBe("_blank");
    expect(link.href).toContain("#data/cards/1");
  });

  it("shows empty message when no fusions produce the card", () => {
    renderModal(1);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("No fusions produce this card.")).toBeTruthy();
  });

  it("shows empty message when card has no fusions as material", () => {
    renderModal(50);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("This card has no fusions.")).toBeTruthy();
  });
});
