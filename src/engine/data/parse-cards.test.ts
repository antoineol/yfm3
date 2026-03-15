import { beforeEach, describe, expect, it } from "vitest";
import { resetIdGenerator } from "./id-generator.ts";
import { parseReferenceCardsCsv } from "./parse-cards.ts";

describe("parseReferenceCardsCsv", () => {
  beforeEach(() => {
    resetIdGenerator(1000);
  });

  it("should parse CSV content to a CardDb object", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n" +
      "\tDark Magician\tSpellcaster\t\t\t2500\t2100\tpurple\n";

    const { monsterCardDb } = parseReferenceCardsCsv(mockCsv);

    expect(monsterCardDb).toHaveProperty("cards");
    expect(monsterCardDb).toHaveProperty("cardsByName");
    expect(monsterCardDb.cards.length).toBe(2);
    expect(monsterCardDb.cardsByName.size).toBe(2);

    const blueEyes = monsterCardDb.cards.find((card) => card.name === "Blue-Eyes White Dragon");
    expect(blueEyes).toBeDefined();
    expect(blueEyes?.id).toBe(123);
    expect(blueEyes?.kinds).toContain("Dragon");
    expect(blueEyes?.attack).toBe(3000);
    expect(blueEyes?.defense).toBe(2500);

    const darkMagician = monsterCardDb.cards.find((card) => card.name === "Dark Magician");
    expect(darkMagician).toBeDefined();
    expect(darkMagician?.id).toBeGreaterThanOrEqual(1000);
    expect(darkMagician?.kinds).toContain("Spellcaster");
  });

  it("should skip header line", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n";

    const { monsterCardDb } = parseReferenceCardsCsv(mockCsv);
    expect(monsterCardDb.cards.length).toBe(1);
  });

  it("should create a map for lookup by name", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n" +
      "\tDark Magician\tSpellcaster\t\t\t2500\t2100\tpurple\n";

    const { monsterCardDb } = parseReferenceCardsCsv(mockCsv);

    expect(monsterCardDb.cardsByName.has("Blue-Eyes White Dragon")).toBe(true);
    expect(monsterCardDb.cardsByName.has("Dark Magician")).toBe(true);

    const cardFromMap = monsterCardDb.cardsByName.get("Blue-Eyes White Dragon");
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

    const { monsterCardDb } = parseReferenceCardsCsv(mockCsv);

    expect(monsterCardDb.cards.length).toBe(3);

    const ids = monsterCardDb.cards.map((card) => card.id);
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

    const { monsterCardDb } = parseReferenceCardsCsv(mockCsv);
    expect(monsterCardDb.cards.length).toBe(2);
  });

  it("returns non-monster card names from excluded kinds in the same pass", () => {
    const mockCsv =
      "id\tlabel\tkind1\tkind2\tkind3\tattack\tdefense\tcolor\n" +
      "\tSalamandra\tEquip\n" +
      "\tDark Hole\tMagic\n" +
      "\tTrap Hole\tTrap\n" +
      "123\tBlue-Eyes White Dragon\tDragon\t\t\t3000\t2500\tblue\n";

    const { monsterCardDb, nonMonsterMaterialNames } = parseReferenceCardsCsv(mockCsv);

    expect(monsterCardDb.cardsByName.has("Salamandra")).toBe(false);
    expect(Array.from(nonMonsterMaterialNames).sort()).toEqual([
      "Dark Hole",
      "Salamandra",
      "Trap Hole",
    ]);
  });
});
