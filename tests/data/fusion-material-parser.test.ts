import { parseFusionMaterial } from "@engine/data/fusion-material-parser.ts";
import { describe, expect, it } from "vitest";

describe("parseFusionMaterial", () => {
  it("should parse a single material", () => {
    const materials = parseFusionMaterial("Spellcaster");
    expect(materials.length).toBe(1);
    expect(materials[0]).toEqual({ kind: "Spellcaster" });
  });

  it("should parse multiple materials separated by /", () => {
    const materials = parseFusionMaterial("Magicians Robe / Magicians Rod");
    expect(materials.length).toBe(2);
    expect(materials[0]).toEqual({ name: "Magicians Robe" });
    expect(materials[1]).toEqual({ name: "Magicians Rod" });
  });

  it("should parse materials with color", () => {
    const materials = parseFusionMaterial("[blue] Spellcaster / [red] Warrior");
    expect(materials.length).toBe(2);
    expect(materials[0]).toEqual({ kind: "Spellcaster", color: "blue" });
    expect(materials[1]).toEqual({ kind: "Warrior", color: "red" });
  });

  it("should throw error for empty cell", () => {
    expect(() => parseFusionMaterial("")).toThrow("Empty material cell");
  });

  it("should filter out empty material parts in a cell", () => {
    const materials = parseFusionMaterial("Spellcaster / / Warrior");
    expect(materials.length).toBe(2);
    expect(materials[0]).toEqual({ kind: "Spellcaster" });
    expect(materials[1]).toEqual({ kind: "Warrior" });
  });
});
