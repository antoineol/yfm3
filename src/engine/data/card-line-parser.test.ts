import { describe, expect, it } from "vitest";
import { parseCardFromCsv } from "./card-line-parser.ts";

describe("parseCardFromCsv", () => {
  it("should return null for invalid input", () => {
    expect(parseCardFromCsv([])).toBeNull();
    expect(parseCardFromCsv(["", "", ""])).toBeNull();
  });

  it("should require a card name", () => {
    expect(parseCardFromCsv(["123", "", "Dragon", "", "", "3000", "2500"])).toBeNull();
  });

  it("should parse a valid card with an existing ID", () => {
    const result = parseCardFromCsv([
      "123",
      "Blue-Eyes White Dragon",
      "Dragon",
      "",
      "",
      "3000",
      "2500",
      "blue",
    ]);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(123);
    expect(result?.name).toBe("Blue-Eyes White Dragon");
    expect(result?.kinds).toEqual(["Dragon"]);
    expect(result?.color).toBe("blue");
    expect(result?.attack).toBe(3000);
    expect(result?.defense).toBe(2500);
  });

  it("should generate an ID when none is provided", () => {
    const result = parseCardFromCsv(["", "Dark Magician", "Spellcaster", "", "", "2500", "2100"]);

    expect(result).not.toBeNull();
    expect(result?.id).toBeGreaterThanOrEqual(1000);
    expect(result?.name).toBe("Dark Magician");
  });

  it("should handle multiple kinds", () => {
    const result = parseCardFromCsv([
      "",
      "Thunder Dragon",
      "Dragon",
      "Thunder",
      "",
      "1600",
      "1500",
    ]);

    expect(result).not.toBeNull();
    expect(result?.kinds).toContain("Dragon");
    expect(result?.kinds).toContain("Thunder");
    expect(result?.kinds.length).toBe(2);
  });

  it("should handle all three kind columns", () => {
    const result = parseCardFromCsv([
      "",
      "Triple Type Card",
      "Spellcaster",
      "Female",
      "Dragon",
      "1500",
      "1000",
    ]);

    expect(result).not.toBeNull();
    expect(result?.kinds).toContain("Spellcaster");
    expect(result?.kinds).toContain("Female");
    expect(result?.kinds).toContain("Dragon");
    expect(result?.kinds.length).toBe(3);
  });

  it("should throw an error for invalid kinds", () => {
    expect(() =>
      parseCardFromCsv(["", "Test Card", "Dragon", "InvalidKind", "", "1500", "1200"]),
    ).toThrow();
    expect(() =>
      parseCardFromCsv(["", "Test Card", "InvalidKind", "", "", "1500", "1200"]),
    ).toThrow();
    expect(() =>
      parseCardFromCsv(["", "Test Card", "Dragon", "", "InvalidKind", "1500", "1200"]),
    ).toThrow();
  });

  it("should throw an error for missing attack or defense", () => {
    expect(() => parseCardFromCsv(["", "Effect Card", "Spellcaster", "", "", "", ""])).toThrow();
  });

  it("should handle cards without color", () => {
    const result = parseCardFromCsv(["", "Normal Card", "Warrior", "", "", "1500", "1200"]);

    expect(result).not.toBeNull();
    expect(result?.color).toBeUndefined();
  });
});
