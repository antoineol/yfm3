import { describe, expect, it } from "vitest";
import type { KindIdentifier } from "./card-model.ts";
import { parseFusionResult } from "./fusion-result-parser.ts";

describe("Fusion Result Parser Tests", () => {
  it("should parse a result with materials", () => {
    const leftMaterial: KindIdentifier = { kind: "Dragon" };
    const rightMaterial: KindIdentifier = { kind: "Beast" };

    const result = parseFusionResult("Dark Magician", leftMaterial, rightMaterial, "2500", "2100");

    expect(result.name).toBe("Dark Magician");
    expect(result.materials).toBeInstanceOf(Set);
    expect(result.materials.size).toBe(1);
    expect(result.materials.has("Beast:Dragon")).toBe(true);
    expect(result.attack).toBe(2500);
    expect(result.defense).toBe(2100);
  });

  it("should throw error when attack is empty", () => {
    const leftMaterial: KindIdentifier = { kind: "Dragon" };
    const rightMaterial: KindIdentifier = { kind: "Beast" };

    expect(() =>
      parseFusionResult("Dark Magician", leftMaterial, rightMaterial, "", "2100"),
    ).toThrow("Not enough data for a valid fusion result");
  });

  it("should throw error for empty result", () => {
    const leftMaterial: KindIdentifier = { kind: "Dragon" };
    const rightMaterial: KindIdentifier = { kind: "Beast" };

    expect(() => parseFusionResult("", leftMaterial, rightMaterial, "2500", "2100")).toThrow(
      "Not enough data for a valid fusion result",
    );
  });

  it("should throw error if more than one card in result", () => {
    const leftMaterial: KindIdentifier = { kind: "Dragon" };
    const rightMaterial: KindIdentifier = { kind: "Beast" };

    expect(() =>
      parseFusionResult("Dark Magician/Dark Magician", leftMaterial, rightMaterial, "2500", "2100"),
    ).toThrow("Need exactly one card in result cell");
  });
});
