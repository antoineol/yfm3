import { parseCsvFusion } from "@engine/data/csv-fusion-parser.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const originalWarn = console.warn;

describe("CSV Line Parser Tests", () => {
  beforeAll(() => {
    console.warn = () => {
      /* Do nothing */
    };
  });

  afterAll(() => {
    console.warn = originalWarn;
  });

  it("should parse a line with single materials", () => {
    const result = parseCsvFusion({
      material1: "Spellcaster",
      material2: "Warrior",
      fusionName: "Dark Magician Knight",
      fusionAttack: "2500",
      fusionDefense: "2100",
    });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.length).toBe(1);
    const fusion = result[0];
    if (!fusion) throw new Error("Fusion not found");

    expect(fusion.name).toBe("Dark Magician Knight");
    expect(fusion.materials).toBeInstanceOf(Set);
    expect(fusion.materials.size).toBe(1);
    expect(fusion.materials.has("Spellcaster:Warrior")).toBe(true);
    expect(fusion.attack).toBe(2500);
    expect(fusion.defense).toBe(2100);
  });

  it("should parse a line with multiple materials in one cell", () => {
    const result = parseCsvFusion({
      material1: "Spellcaster",
      material2: "Magicians Robe / Magicians Rod",
      fusionName: "Dark Magician",
      fusionAttack: "2500",
      fusionDefense: "2100",
    });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.length).toBe(2);

    const fusion1 = result[0];
    if (!fusion1) throw new Error("Fusion 1 not found");

    expect(fusion1.name).toBe("Dark Magician");
    expect(fusion1.materials).toBeInstanceOf(Set);
    expect(fusion1.materials.size).toBe(1);
    expect(fusion1.materials.has("Magicians Robe:Spellcaster")).toBe(true);
    expect(fusion1.attack).toBe(2500);
    expect(fusion1.defense).toBe(2100);

    const fusion2 = result[1];
    if (!fusion2) throw new Error("Fusion 2 not found");

    expect(fusion2.name).toBe("Dark Magician");
    expect(fusion2.materials).toBeInstanceOf(Set);
    expect(fusion2.materials.size).toBe(1);
    expect(fusion2.materials.has("Magicians Rod:Spellcaster")).toBe(true);
    expect(fusion2.attack).toBe(2500);
    expect(fusion2.defense).toBe(2100);
  });

  it("should parse a line with multiple materials in both cells", () => {
    const result = parseCsvFusion({
      material1: "Spellcaster / Fiend",
      material2: "Warrior / Dragon",
      fusionName: "Super Monster",
      fusionAttack: "3000",
      fusionDefense: "2500",
    });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.length).toBe(4);

    const allFusionKeys = result.flatMap((fusion) => Array.from(fusion.materials.values()));
    expect(allFusionKeys).toContain("Spellcaster:Warrior");
    expect(allFusionKeys).toContain("Dragon:Spellcaster");
    expect(allFusionKeys).toContain("Fiend:Warrior");
    expect(allFusionKeys).toContain("Dragon:Fiend");

    result.forEach((fusion) => {
      expect(fusion.name).toBe("Super Monster");
      expect(fusion.attack).toBe(3000);
      expect(fusion.defense).toBe(2500);
      expect(fusion.materials).toBeInstanceOf(Set);
      expect(fusion.materials.size).toBe(1);
    });
  });

  it("should return null for invalid lines", () => {
    const invalidLine = {
      material1: "",
      material2: "",
      fusionName: "",
      fusionAttack: "",
      fusionDefense: "",
    };
    expect(() => parseCsvFusion(invalidLine)).toThrow("Not enough data for a valid fusion");
  });
});
