import { describe, expect, it } from "vitest";
import type { FusionStep } from "../../../engine/fusion-chain-finder.ts";
import { extractMaterialLines } from "./FusionChainSteps.tsx";

describe("extractMaterialLines", () => {
  it("returns two materials for a single-step fusion", () => {
    const steps: FusionStep[] = [{ material1CardId: 10, material2CardId: 20, resultCardId: 30 }];

    expect(extractMaterialLines(steps)).toEqual([{ cardId: 10 }, { cardId: 20, resultCardId: 30 }]);
  });

  it("returns ordered materials for a multi-step chain", () => {
    // Gearfried(10) + Lord of Zemia(20) → Dark Crusader(30)
    // Dark Crusader(30) + Celtic Guardian(40) → Dark Blade(50)
    // Dark Blade(50) + Mazera DeVille(60) → Emissary(70)
    const steps: FusionStep[] = [
      { material1CardId: 10, material2CardId: 20, resultCardId: 30 },
      { material1CardId: 30, material2CardId: 40, resultCardId: 50 },
      { material1CardId: 50, material2CardId: 60, resultCardId: 70 },
    ];

    expect(extractMaterialLines(steps)).toEqual([
      { cardId: 10 },
      { cardId: 20, resultCardId: 30 },
      { cardId: 40, resultCardId: 50 },
      { cardId: 60, resultCardId: 70 },
    ]);
  });

  it("handles continuation where prev result is material2", () => {
    // A(1) + B(2) → C(3)
    // D(4) + C(3) → E(5)  — prev result is in material2 position
    const steps: FusionStep[] = [
      { material1CardId: 1, material2CardId: 2, resultCardId: 3 },
      { material1CardId: 4, material2CardId: 3, resultCardId: 5 },
    ];

    expect(extractMaterialLines(steps)).toEqual([
      { cardId: 1 },
      { cardId: 2, resultCardId: 3 },
      { cardId: 4, resultCardId: 5 },
    ]);
  });

  it("marks field material in single-step fusion", () => {
    const steps: FusionStep[] = [{ material1CardId: 10, material2CardId: 20, resultCardId: 30 }];

    expect(extractMaterialLines(steps, [10])).toEqual([
      { cardId: 10, fromField: true },
      { cardId: 20, resultCardId: 30 },
    ]);
  });

  it("does not mark non-field materials", () => {
    const steps: FusionStep[] = [{ material1CardId: 10, material2CardId: 20, resultCardId: 30 }];

    expect(extractMaterialLines(steps, [99])).toEqual([
      { cardId: 10 },
      { cardId: 20, resultCardId: 30 },
    ]);
  });

  it("no field marking when fieldMaterialCardIds is empty", () => {
    const steps: FusionStep[] = [{ material1CardId: 10, material2CardId: 20, resultCardId: 30 }];

    expect(extractMaterialLines(steps, [])).toEqual([
      { cardId: 10 },
      { cardId: 20, resultCardId: 30 },
    ]);
  });
});
