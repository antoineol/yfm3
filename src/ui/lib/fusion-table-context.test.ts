import { describe, expect, it } from "vitest";
import { FUSION_NONE, MAX_CARD_ID } from "../../engine/types/constants.ts";
import { buildFusionTableData } from "./fusion-table-context.tsx";

describe("buildFusionTableData", () => {
  const data = buildFusionTableData();

  it("returns a fusionTable of expected size", () => {
    expect(data.fusionTable).toBeInstanceOf(Int16Array);
    expect(data.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
  });

  it("returns a cardAtk array of expected size", () => {
    expect(data.cardAtk).toBeInstanceOf(Int16Array);
    expect(data.cardAtk.length).toBe(MAX_CARD_ID);
  });

  it("returns maxCardId matching the constant", () => {
    expect(data.maxCardId).toBe(MAX_CARD_ID);
  });

  it("cardAtk contains non-zero values for known cards", () => {
    const nonZero = Array.from(data.cardAtk).filter((v) => v > 0);
    expect(nonZero.length).toBeGreaterThan(100);
  });

  it("fusionTable contains at least some valid fusion entries", () => {
    let validEntries = 0;
    for (let i = 0; i < data.fusionTable.length; i++) {
      if (data.fusionTable[i] !== FUSION_NONE && data.fusionTable[i] !== 0) {
        validEntries++;
      }
    }
    expect(validEntries).toBeGreaterThan(1000);
  });

  it("fusionTable is symmetric (a→b same as b→a)", () => {
    let checked = 0;
    for (let a = 1; a < 50; a++) {
      for (let b = a + 1; b < 50; b++) {
        const ab = data.fusionTable[a * MAX_CARD_ID + b];
        const ba = data.fusionTable[b * MAX_CARD_ID + a];
        if (ab !== FUSION_NONE || ba !== FUSION_NONE) {
          expect(ab).toBe(ba);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
