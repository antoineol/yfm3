// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";
import { OpponentAvailablePool } from "./OpponentAvailablePool.tsx";

vi.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [null],
}));

vi.mock("../../components/MiniGameCard.tsx", () => ({
  MiniGameCard: ({ card }: { card: CardSpec }) => <span>{card.name}</span>,
}));

afterEach(cleanup);

const cardDb = createCardDb();
for (const id of [11, 13, 15, 108, 109]) {
  addCard(cardDb, {
    id,
    name: `Card ${String(id)}`,
    attack: 100,
    defense: 100,
    kinds: [],
    isMonster: true,
  });
}

function renderPool() {
  return render(
    <CardDbProvider cardDb={cardDb}>
      <OpponentAvailablePool
        handCards={[
          { cardId: 11, slotId: 40 },
          null,
          { cardId: 13, slotId: 42 },
          null,
          { cardId: 15, slotId: 44 },
        ]}
        reserveCards={[
          { cardId: 108, slotId: 47 },
          { cardId: 109, slotId: 48 },
        ]}
      />
    </CardDbProvider>,
  );
}

describe("OpponentAvailablePool", () => {
  it("skips empty hand slots and keeps reserve cards adjacent", () => {
    renderPool();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items.map((item) => item.getAttribute("aria-label"))).toEqual([
      "Opponent hand card 1",
      "Opponent hand card 2",
      "Opponent hand card 3",
      "Opponent reserve card 1 next draw",
      "Opponent reserve card 2",
    ]);
    expect(screen.queryByLabelText(/empty/i)).toBeNull();
  });
});
