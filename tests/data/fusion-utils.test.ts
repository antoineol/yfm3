import type { FusionMaterial } from "@engine/data/card-model.ts";
import { getMaterialPairKey } from "@engine/data/fusion-utils.ts";
import { describe, expect, it } from "vitest";

describe("Fusion Utils", () => {
  const material1: FusionMaterial = { kind: "Dragon" };
  const material2: FusionMaterial = { kind: "Warrior" };

  describe("getMaterialPairKey", () => {
    it("should generate consistent keys regardless of material order", () => {
      const key1 = getMaterialPairKey(material1, material2);
      const key2 = getMaterialPairKey(material2, material1);

      expect(key1).toEqual(key2);
      expect(key1).toEqual("Dragon:Warrior");
    });

    it("should encode color in the key", () => {
      const blueReptile: FusionMaterial = { kind: "Reptile", color: "blue" };
      const dragon: FusionMaterial = { kind: "Dragon" };

      const key = getMaterialPairKey(blueReptile, dragon);
      expect(key).toEqual("Dragon:[blue]Reptile");
    });

    it("should handle card name refs", () => {
      const namedCard: FusionMaterial = { name: "Kuriboh" };
      const dragon: FusionMaterial = { kind: "Dragon" };

      const key = getMaterialPairKey(namedCard, dragon);
      expect(key).toEqual("Dragon:Kuriboh");
    });
  });
});
