import { describe, expect, it } from "vitest";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { buildReferenceTableData } from "./build-reference-table.ts";

const dragon = { cardId: 1, name: "Dragon Whelp", attack: 1200, defense: 900 };
const eagle = { cardId: 2, name: "Wing Eagle", attack: 1300, defense: 1000 };
const fusion1 = {
  materialA: "Dragon Whelp",
  materialB: "Wing Eagle",
  resultName: "Sky Dragon",
  resultAttack: 2100,
  resultDefense: 1500,
};

describe("buildReferenceTableData", () => {
  it("builds fusion table and registers fusion-only result card", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    expect(result.cardDb.cardsByName.get("Sky Dragon")).toBeDefined();
    expect(result.fusionTable[1 * MAX_CARD_ID + 2]).toBeGreaterThan(0);
  });

  it("fusion table is symmetric", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    const ab = result.fusionTable[1 * MAX_CARD_ID + 2];
    const ba = result.fusionTable[2 * MAX_CARD_ID + 1];
    expect(ab).toBe(ba);
  });

  it("populates cardAtk for registered cards", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [] });
    expect(result.cardAtk[1]).toBe(1200);
    expect(result.cardAtk[2]).toBe(1300);
  });

  it("populates cardAtk for fusion-only result cards", () => {
    const result = buildReferenceTableData({ cards: [dragon, eagle], fusions: [fusion1] });
    const skyDragon = result.cardDb.cardsByName.get("Sky Dragon");
    expect(skyDragon).toBeDefined();
    expect(result.cardAtk[skyDragon?.id ?? -1]).toBe(2100);
  });

  it("throws on cardId out of range", () => {
    expect(() =>
      buildReferenceTableData({
        cards: [{ cardId: 0, name: "Zero", attack: 100, defense: 100 }],
        fusions: [],
      }),
    ).toThrow("out of range");
    expect(() =>
      buildReferenceTableData({
        cards: [{ cardId: MAX_CARD_ID, name: "Over", attack: 100, defense: 100 }],
        fusions: [],
      }),
    ).toThrow("out of range");
  });

  it("filters invalid kinds", () => {
    const result = buildReferenceTableData({
      cards: [
        { cardId: 1, name: "A", attack: 100, defense: 100, kind1: "Dragon", kind2: "NotAKind" },
      ],
      fusions: [],
    });
    const card = result.cardDb.cardsById.get(1);
    expect(card?.kinds).toEqual(["Dragon"]);
  });

  it("merges multiple material pairs for the same fusion result", () => {
    const result = buildReferenceTableData({
      cards: [
        { cardId: 1, name: "A", attack: 500, defense: 500 },
        { cardId: 2, name: "B", attack: 600, defense: 600 },
        { cardId: 3, name: "C", attack: 700, defense: 700 },
      ],
      fusions: [
        {
          materialA: "A",
          materialB: "B",
          resultName: "Fused",
          resultAttack: 2000,
          resultDefense: 1000,
        },
        {
          materialA: "A",
          materialB: "C",
          resultName: "Fused",
          resultAttack: 2000,
          resultDefense: 1000,
        },
      ],
    });
    // Both pairs should produce the same result card
    const fusedId = result.cardDb.cardsByName.get("Fused")?.id;
    expect(result.fusionTable[1 * MAX_CARD_ID + 2]).toBe(fusedId);
    expect(result.fusionTable[1 * MAX_CARD_ID + 3]).toBe(fusedId);
  });

  it("does not register fusion-only card when result already in cards", () => {
    const result = buildReferenceTableData({
      cards: [dragon, eagle, { cardId: 5, name: "Sky Dragon", attack: 2100, defense: 1500 }],
      fusions: [fusion1],
    });
    // Sky Dragon should keep its original id=5, not get a gap id
    expect(result.cardDb.cardsByName.get("Sky Dragon")?.id).toBe(5);
  });

  it("fills unused slots with FUSION_NONE", () => {
    const result = buildReferenceTableData({ cards: [dragon], fusions: [] });
    expect(result.fusionTable[0]).toBe(FUSION_NONE);
    expect(result.fusionTable[1 * MAX_CARD_ID + 1]).toBe(FUSION_NONE);
  });

  it("works with empty cards and fusions (edge case)", () => {
    const result = buildReferenceTableData({ cards: [], fusions: [] });
    expect(result.cardDb.cards).toHaveLength(0);
    expect(result.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
  });
});
