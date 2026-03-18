import { describe, expect, it } from "vitest";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import type { RefCard, RefFusion } from "./build-reference-table.ts";
import { buildReferenceTableData } from "./build-reference-table.ts";

const dragon: RefCard = {
  id: 1,
  atk: 1200,
  def: 700,
  type: "Dragon",
  guardianStar1: "Uranus",
  guardianStar2: "Mercury",
  name: "Baby Dragon",
};
const eagle: RefCard = {
  id: 2,
  atk: 1800,
  def: 1500,
  type: "WingedBeast",
  guardianStar1: "Neptune",
  guardianStar2: "Mars",
  name: "Wing Eagle",
};
const fusion1: RefFusion = { material1Id: 1, material2Id: 2, resultId: 5, resultAtk: 2100 };

describe("buildReferenceTableData", () => {
  it("builds fusion table entry for valid pair", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    expect(result.fusionTable[1 * MAX_CARD_ID + 2]).toBe(5);
  });

  it("fusion table is symmetric", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    expect(result.fusionTable[1 * MAX_CARD_ID + 2]).toBe(result.fusionTable[2 * MAX_CARD_ID + 1]);
  });

  it("populates cardAtk for registered cards", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [] });
    expect(result.cardAtk[1]).toBe(1200);
    expect(result.cardAtk[2]).toBe(1800);
  });

  it("throws on cardId out of range", () => {
    expect(() =>
      buildReferenceTableData({
        cards: [{ ...dragon, id: 0 }],
        fusions: [],
      }),
    ).toThrow("out of range");
    expect(() =>
      buildReferenceTableData({
        cards: [{ ...dragon, id: MAX_CARD_ID }],
        fusions: [],
      }),
    ).toThrow("out of range");
  });

  it("fills unused slots with FUSION_NONE", () => {
    const result = buildReferenceTableData({ cards: [dragon], fusions: [] });
    expect(result.fusionTable[0]).toBe(FUSION_NONE);
    expect(result.fusionTable[1 * MAX_CARD_ID + 1]).toBe(FUSION_NONE);
  });

  it("works with empty cards and fusions", () => {
    const result = buildReferenceTableData({ cards: [], fusions: [] });
    expect(result.cardDb.cards).toHaveLength(0);
    expect(result.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
  });

  it("exposes raw fusions on the result", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    expect(result.fusions).toHaveLength(1);
    expect(result.fusions[0]).toBe(fusion1);
  });

  it("populates cardsById from input cards", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [] });
    expect(result.cardDb.cardsById.get(1)?.name).toBe("Baby Dragon");
    expect(result.cardDb.cardsById.get(2)?.name).toBe("Wing Eagle");
  });

  it("maps type string to kinds array", () => {
    const result = buildReferenceTableData({ cards: [dragon], fusions: [] });
    expect(result.cardDb.cardsById.get(1)?.kinds).toEqual(["Dragon"]);
  });

  it("maps 'Winged Beast' (with space) to WingedBeast kind", () => {
    const wb: RefCard = { ...eagle, type: "Winged Beast" };
    const result = buildReferenceTableData({ cards: [wb], fusions: [] });
    expect(result.cardDb.cardsById.get(2)?.kinds).toEqual(["WingedBeast"]);
  });

  it("excludes Magic/Trap/Equip/Ritual types from kinds", () => {
    const magic: RefCard = { ...dragon, id: 3, name: "Dark Hole", type: "Magic" };
    const result = buildReferenceTableData({ cards: [magic], fusions: [] });
    expect(result.cardDb.cardsById.get(3)?.kinds).toEqual([]);
  });

  it("parses color from RefCard", () => {
    const blueCard: RefCard = { ...dragon, color: "blue" };
    const result = buildReferenceTableData({ cards: [blueCard], fusions: [] });
    expect(result.cardDb.cardsById.get(1)?.color).toBe("blue");
  });

  it("parses guardian stars from RefCard", () => {
    const result = buildReferenceTableData({ cards: [dragon], fusions: [] });
    const card = result.cardDb.cardsById.get(1);
    expect(card?.guardianStar1).toBe("Uranus");
    expect(card?.guardianStar2).toBe("Mercury");
  });
});
