import { describe, expect, it } from "vitest";
import { parseCardCell } from "./card-cell-parser.ts";
import type { CardRefByName, KindIdentifier } from "./card-model.ts";
import { isCardRefByName, isKindIdentifier } from "./fusion-utils.ts";

describe("Card Cell Parser Tests", () => {
  it("should parse a simple card kind", () => {
    const result = parseCardCell("Dragon");
    expect(result).toHaveLength(1);
    if (!result?.[0]) throw new Error("Result is null");

    const cardIdentifier = result[0];
    expect(isKindIdentifier(cardIdentifier)).toBe(true);
    expect((cardIdentifier as KindIdentifier).kind).toBe("Dragon");
    expect((cardIdentifier as KindIdentifier).color).toBeUndefined();
  });

  it("should parse a card name", () => {
    const result = parseCardCell("Dark Magician");
    expect(result).toHaveLength(1);
    if (!result?.[0]) throw new Error("Result is null");

    const cardIdentifier = result[0];
    expect(isCardRefByName(cardIdentifier)).toBe(true);
    expect((cardIdentifier as CardRefByName).name).toBe("Dark Magician");
  });

  it("should parse a colored card kind", () => {
    const result = parseCardCell("[Blue] Dragon");
    expect(result).toHaveLength(1);
    if (!result?.[0]) throw new Error("Result is null");

    const cardIdentifier = result[0];
    expect(isKindIdentifier(cardIdentifier)).toBe(true);
    expect((cardIdentifier as KindIdentifier).kind).toBe("Dragon");
    expect((cardIdentifier as KindIdentifier).color).toBe("blue");
  });

  it("should parse multiple cards separated by /", () => {
    const result = parseCardCell("Magicians Robe / Magicians Rod");
    expect(result).toHaveLength(2);
    if (!result?.[0]) throw new Error("Result is null");
    if (!result?.[1]) throw new Error("Result is null");

    expect(isCardRefByName(result[0])).toBe(true);
    expect(isCardRefByName(result[1])).toBe(true);

    expect((result[0] as CardRefByName).name).toBe("Magicians Robe");
    expect((result[1] as CardRefByName).name).toBe("Magicians Rod");
  });

  it("should handle empty cells", () => {
    expect(parseCardCell("")).toHaveLength(0);
    expect(parseCardCell(" ")).toHaveLength(0);
    expect(parseCardCell(undefined as unknown as string)).toHaveLength(0);
  });

  it("should throw an error for excluded kinds", () => {
    expect(() => parseCardCell("Magic")).toThrow("Excluded kind found: Magic");
  });

  it("should throw an error for invalid colors", () => {
    expect(() => parseCardCell("[Purple] Dragon")).toThrow("Invalid color: purple");
  });
});
