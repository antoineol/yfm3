import { beforeEach, describe, expect, it } from "vitest";
import { resetIdGenerator } from "./id-generator.ts";
import { parseCardCsv } from "./parse-card-csv.ts";

describe("parseCardCsv", () => {
  beforeEach(() => {
    resetIdGenerator(1000);
  });

  it("should parse CSV content to a CardDb object", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n" +
      "\tDark Magician\tSpellcaster\t\t\t2500\t2100\tpurple\n";

    const result = parseCardCsv(mockCsv);

    expect(result).toHaveProperty("cards");
    expect(result).toHaveProperty("cardsByName");
    expect(result.cards.length).toBe(2);
    expect(result.cardsByName.size).toBe(2);

    const blueEyes = result.cards.find((card) => card.name === "Blue-Eyes White Dragon");
    expect(blueEyes).toBeDefined();
    expect(blueEyes?.id).toBe(123);
    expect(blueEyes?.kinds).toContain("Dragon");
    expect(blueEyes?.attack).toBe(3000);
    expect(blueEyes?.defense).toBe(2500);

    const darkMagician = result.cards.find((card) => card.name === "Dark Magician");
    expect(darkMagician).toBeDefined();
    expect(darkMagician?.id).toBeGreaterThanOrEqual(1000);
    expect(darkMagician?.kinds).toContain("Spellcaster");
  });

  it("should skip header line", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n";

    const result = parseCardCsv(mockCsv);
    expect(result.cards.length).toBe(1);
  });

  it("should create a map for lookup by name", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n" +
      "\tDark Magician\tSpellcaster\t\t\t2500\t2100\tpurple\n";

    const result = parseCardCsv(mockCsv);

    expect(result.cardsByName.has("Blue-Eyes White Dragon")).toBe(true);
    expect(result.cardsByName.has("Dark Magician")).toBe(true);

    const cardFromMap = result.cardsByName.get("Blue-Eyes White Dragon");
    expect(cardFromMap).toBeDefined();
    expect(cardFromMap?.name).toBe("Blue-Eyes White Dragon");
    expect(cardFromMap?.id).toBe(123);
  });

  it("should increment auto-generated ID for each card without ID", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "\tCard A\tWarrior\t\t\t1500\t1200\tred\n" +
      "\tCard B\tSpellcaster\t\t\t1000\t800\tpurple\n" +
      "\tCard C\tDragon\t\t\t2000\t1700\tblue\n";

    const result = parseCardCsv(mockCsv);

    expect(result.cards.length).toBe(3);

    const ids = result.cards.map((card) => card.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids[0]).toBeGreaterThanOrEqual(1000);
    expect(ids[1]).toBeGreaterThanOrEqual(1000);
    expect(ids[2]).toBeGreaterThanOrEqual(1000);
  });

  it("should skip empty lines", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n" +
      "\t\t\t\t\t\t\t\n" +
      "\tDark Magician\tSpellcaster\t\t\t2500\t2100\tpurple\n";

    const result = parseCardCsv(mockCsv);
    expect(result.cards.length).toBe(2);
  });
});
