// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../engine/data/game-db.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { CardDetailProvider, useCardDetail } from "../lib/card-detail-context.tsx";
import { CardDetailModal } from "./CardDetailModal.tsx";

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

const testDb = createCardDb();
addCard(testDb, testCard);

function OpenButton({ cardId }: { cardId: number }) {
  const { openCard } = useCardDetail();
  return (
    <button onClick={() => openCard(cardId)} type="button">
      Open
    </button>
  );
}

function renderModal(cardId?: number) {
  return render(
    <CardDbProvider cardDb={testDb}>
      <CardDetailProvider>
        <OpenButton cardId={cardId ?? 1} />
        <CardDetailModal />
      </CardDetailProvider>
    </CardDbProvider>,
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
    // ATK/DEF appear in both game card and detail panel
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
});
