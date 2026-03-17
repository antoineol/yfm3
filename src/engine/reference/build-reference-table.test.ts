import { describe, expect, it } from "vitest";
import { buildReferenceTableData } from "./build-reference-table.ts";

describe("buildReferenceTableData", () => {
  it("builds fusion table and registers fusion-only result card", () => {
    const result = buildReferenceTableData({
      cards: [
        { cardId: 1, name: "Dragon Whelp", attack: 1200, defense: 900 },
        { cardId: 2, name: "Wing Eagle", attack: 1300, defense: 1000 },
      ],
      fusions: [
        {
          materialA: "Dragon Whelp",
          materialB: "Wing Eagle",
          resultName: "Sky Dragon",
          resultAttack: 2100,
          resultDefense: 1500,
        },
      ],
    });

    expect(result.cardDb.cardsByName.get("Sky Dragon")).toBeDefined();
    expect(result.cardAtk.length).toBeGreaterThan(0);
    expect(result.fusionTable.length).toBeGreaterThan(0);
  });

  it("throws on duplicate card names", () => {
    expect(() =>
      buildReferenceTableData({
        cards: [
          { cardId: 1, name: "Dragon", attack: 1000, defense: 800 },
          { cardId: 2, name: "dragon", attack: 1200, defense: 900 },
        ],
        fusions: [],
      }),
    ).toThrow("Duplicate card name");
  });

  it("throws on duplicate card IDs", () => {
    expect(() =>
      buildReferenceTableData({
        cards: [
          { cardId: 1, name: "Dragon", attack: 1000, defense: 800 },
          { cardId: 1, name: "Whelp", attack: 1200, defense: 900 },
        ],
        fusions: [],
      }),
    ).toThrow("Duplicate cardId");
  });
});
