import { describe, expect, it } from "vitest";
import { parseCardsGrid, parseFusionsGrid } from "../../convex/syncReferenceData.ts";

const cardHeaders = ["id", "name", "attack", "defense", "kind1", "kind2", "kind3", "color"];
const fusionHeaders = ["materialA", "materialB", "resultName", "resultAttack", "resultDefense"];

function cardsGrid(...rows: string[][]): string[][] {
  return [cardHeaders, ...rows];
}
function fusionsGrid(...rows: string[][]): string[][] {
  return [fusionHeaders, ...rows];
}

describe("parseCardsGrid", () => {
  it("parses a valid monster row", () => {
    const cards = parseCardsGrid(cardsGrid(["1", "Dragon", "1200", "900", "Dragon", "", "", "red"]));
    expect(cards).toEqual([
      { cardId: 1, name: "Dragon", attack: 1200, defense: 900, kind1: "Dragon", kind2: undefined, kind3: undefined, color: "red" },
    ]);
  });

  it("skips blank rows", () => {
    const cards = parseCardsGrid(cardsGrid(["", "", "", "", "", "", "", ""], ["1", "Dragon", "1200", "900", "", "", "", ""]));
    expect(cards).toHaveLength(1);
    expect(cards[0]!.cardId).toBe(1);
  });

  it("skips rows without id", () => {
    const cards = parseCardsGrid(cardsGrid(["", "Unnamed", "500", "400", "", "", "", ""]));
    expect(cards).toHaveLength(0);
  });

  it("skips non-monsters (missing attack or defense)", () => {
    const cards = parseCardsGrid(cardsGrid(
      ["1", "Spell Card", "", "0", "", "", "", ""],
      ["2", "Trap Card", "100", "", "", "", "", ""],
    ));
    expect(cards).toHaveLength(0);
  });

  it("throws on duplicate id", () => {
    expect(() => parseCardsGrid(cardsGrid(
      ["1", "Dragon A", "1000", "800", "", "", "", ""],
      ["1", "Dragon B", "1100", "900", "", "", "", ""],
    ))).toThrow("duplicate id 1");
  });

  it("throws on duplicate name (case-insensitive)", () => {
    expect(() => parseCardsGrid(cardsGrid(
      ["1", "Dragon", "1000", "800", "", "", "", ""],
      ["2", "dragon", "1100", "900", "", "", "", ""],
    ))).toThrow('duplicate name "dragon"');
  });

  it("normalizes whitespace in name and kinds", () => {
    const cards = parseCardsGrid(cardsGrid(["1", "  Blue  Eyes  ", "3000", "2500", "  Dragon  ", "", "", ""]));
    expect(cards[0]!.name).toBe("Blue Eyes");
    expect(cards[0]!.kind1).toBe("Dragon");
  });

  it("lowercases color", () => {
    const cards = parseCardsGrid(cardsGrid(["1", "Dragon", "1000", "800", "", "", "", "RED"]));
    expect(cards[0]!.color).toBe("red");
  });

  it("handles missing optional fields as undefined", () => {
    const cards = parseCardsGrid(cardsGrid(["1", "Dragon", "1000", "800", "", "", "", ""]));
    expect(cards[0]!.kind1).toBeUndefined();
    expect(cards[0]!.kind2).toBeUndefined();
    expect(cards[0]!.kind3).toBeUndefined();
    expect(cards[0]!.color).toBeUndefined();
  });

  it("throws on invalid id (non-number)", () => {
    expect(() => parseCardsGrid(cardsGrid(["abc", "Dragon", "1000", "800", "", "", "", ""]))).toThrow("invalid id");
  });

  it("returns empty array for header-only grid", () => {
    expect(parseCardsGrid([cardHeaders])).toEqual([]);
  });

  it("returns empty array for empty grid", () => {
    expect(parseCardsGrid([])).toEqual([]);
  });
});

describe("parseFusionsGrid", () => {
  it("parses a valid fusion row", () => {
    const fusions = parseFusionsGrid(fusionsGrid(["Dragon", "Eagle", "Sky Dragon", "2100", "1500"]));
    expect(fusions).toEqual([
      { materialA: "Dragon", materialB: "Eagle", resultName: "Sky Dragon", resultAttack: 2100, resultDefense: 1500 },
    ]);
  });

  it("skips blank rows", () => {
    const fusions = parseFusionsGrid(fusionsGrid(["", "", "", "", ""], ["A", "B", "C", "100", "200"]));
    expect(fusions).toHaveLength(1);
  });

  it("throws on missing required field", () => {
    expect(() => parseFusionsGrid(fusionsGrid(["", "B", "C", "100", "200"]))).toThrow("missing materialA");
    expect(() => parseFusionsGrid(fusionsGrid(["A", "B", "C", "abc", "200"]))).toThrow("invalid resultAttack");
  });

  it("returns empty array for empty grid", () => {
    expect(parseFusionsGrid([])).toEqual([]);
  });
});
