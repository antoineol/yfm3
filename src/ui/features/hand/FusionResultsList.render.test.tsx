// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { addCard, createCardDb } from "../../../engine/data/game-db.ts";
import { type FusionChainResult, findFusionChains } from "../../../engine/fusion-chain-finder.ts";
import { CardDbProvider } from "../../lib/card-db-context.tsx";
import { FusionResultsList } from "./FusionResultsList.tsx";

vi.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [null],
}));

vi.mock("../../../engine/fusion-chain-finder.ts", () => ({
  findFusionChains: vi.fn(),
}));

vi.mock("../../db/use-user-preferences.ts", () => ({
  useFusionDepth: () => 3,
}));

vi.mock("../../lib/bridge-context.tsx", () => ({
  useBridgeOptional: () => null,
}));

vi.mock("../../lib/card-detail-context.tsx", () => ({
  useOpenCard: () => vi.fn(),
}));

vi.mock("../../lib/fusion-table-context.tsx", () => ({
  useFusionTable: () => ({
    fusionTable: new Int16Array(),
    equipCompat: undefined,
  }),
}));

vi.mock("../../lib/use-artwork-src.ts", () => ({
  useArtworkSrc: () => () => "card.png",
}));

const mockFindFusionChains = vi.mocked(findFusionChains);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FusionResultsList rendering", () => {
  it("does not render ATK/DFD numbers for non-monster results", () => {
    renderResults(ritualCard(), {
      resultAtk: 0,
      resultDef: 0,
      resultName: "Ultimate Dragon",
    });

    expect(screen.getAllByText("Ultimate Dragon").length).toBeGreaterThan(0);
    expect(screen.getByText("Ritual")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });

  it("renders ATK/DFD numbers for monster results", () => {
    renderResults(monsterCard(), {
      resultAtk: 3000,
      resultDef: 2500,
      resultName: "Blue-Eyes White Dragon",
    });

    expect(screen.getAllByText("3000")).toHaveLength(2);
    expect(screen.getAllByText("2500")).toHaveLength(2);
  });

  it("colors the result heading from label color metadata", () => {
    renderResults(
      { ...monsterCard(), labelColor: "purple" },
      {
        resultAtk: 3000,
        resultDef: 2500,
        resultName: "Blue-Eyes White Dragon",
      },
    );

    expect(screen.getByRole("button", { name: "Blue-Eyes White Dragon" }).style.color).toBe(
      "#d78be8",
    );
  });
});

function renderResults(
  card: CardSpec,
  result: Pick<FusionChainResult, "resultAtk" | "resultDef" | "resultName">,
) {
  const cardDb = createCardDb();
  addCard(cardDb, materialCard());
  addCard(cardDb, card);
  mockFindFusionChains.mockReturnValue([
    {
      resultCardId: card.id,
      steps: [],
      materialCardIds: [1],
      fieldMaterialCardIds: [],
      equipCardIds: [],
      ...result,
    },
  ]);

  render(
    <CardDbProvider cardDb={cardDb}>
      <FusionResultsList handCards={[{ cardId: 1, docId: "hand-1" as Id<"hand"> }]} />
    </CardDbProvider>,
  );
}

function materialCard(): CardSpec {
  return {
    id: 1,
    name: "Dragon Treasure",
    kinds: [],
    cardType: "Equip",
    isMonster: false,
    attack: 0,
    defense: 0,
  };
}

function ritualCard(): CardSpec {
  return {
    id: 675,
    name: "Ultimate Dragon",
    kinds: [],
    cardType: "Ritual",
    isMonster: false,
    attack: 0,
    defense: 0,
  };
}

function monsterCard(): CardSpec {
  return {
    id: 2,
    name: "Blue-Eyes White Dragon",
    kinds: ["Dragon"],
    isMonster: true,
    attack: 3000,
    defense: 2500,
  };
}
