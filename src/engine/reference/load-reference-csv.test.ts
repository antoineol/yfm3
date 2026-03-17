import { describe, expect, it } from "vitest";
import { buildReferenceTableData, loadReferenceCsv } from "./load-reference-csv.ts";

describe("loadReferenceCsv", () => {
  it("loads reference snapshots and builds table", () => {
    const cardsCsv = [
      "cardId,name,attack,defense,kind1,kind2",
      "1,Dragon Whelp,1200,900,Dragon,",
      "2,Wing Eagle,1300,1000,Winged Beast,",
    ].join("\n");

    const fusionsCsv = [
      "materialA,materialB,resultName,resultAttack,resultDefense",
      "Dragon Whelp,Wing Eagle,Sky Dragon,2100,1500",
    ].join("\n");

    const loaded = loadReferenceCsv(cardsCsv, fusionsCsv);

    expect(loaded.cardDb.cardsByName.get("Sky Dragon")).toBeDefined();
    expect(loaded.cardAtk.length).toBeGreaterThan(0);
  });

  it("rejects duplicate card names", () => {
    expect(() =>
      buildReferenceTableData({
        cards: [
          { cardId: 1, name: "A", attack: 1, defense: 1 },
          { cardId: 2, name: "a", attack: 2, defense: 2 },
        ],
        fusions: [],
      }),
    ).toThrow("Duplicate card name");
  });
});
