import { describe, expect, it } from "vitest";
import { createBuffers } from "../types/buffers.ts";
import { MAX_CARD_ID } from "../types/constants.ts";
import { buildFusionTable } from "./build-fusion-table.ts";
import type { CardSpec, FusionMaterials } from "./card-model.ts";

function makeFusionTable(cards: CardSpec[], fusions: FusionMaterials[]) {
  const { fusionTable, cardAtk } = createBuffers();
  for (const c of cards) {
    cardAtk[c.id] = c.attack;
  }
  buildFusionTable(cards, fusions, fusionTable, cardAtk);
  return fusionTable;
}

describe("buildFusionTable – FUSION_ALIASES", () => {
  const timeWizard: CardSpec = {
    id: 12,
    name: "Time Wizard",
    kinds: ["Spellcaster"],
    color: "blue",
    attack: 500,
    defense: 400,
  };
  const timeWizardOfTomorrow: CardSpec = {
    id: 470,
    name: "Time Wizard Of Tomorrow",
    kinds: ["Spellcaster"],
    color: "blue",
    attack: 500,
    defense: 400,
  };
  const babyDragon: CardSpec = {
    id: 1,
    name: "Baby Dragon",
    kinds: ["Dragon"],
    attack: 1200,
    defense: 700,
  };
  const thousandDragon: CardSpec = {
    id: 600,
    name: "Thousand Dragon",
    kinds: ["Dragon"],
    attack: 2400,
    defense: 2000,
  };

  const fusion: FusionMaterials = {
    name: "Thousand Dragon",
    materials: new Set(["Dragon:Time Wizard"]),
    attack: 2400,
    defense: 2000,
  };

  it("Time Wizard fuses with Dragon to produce Thousand Dragon", () => {
    const cards = [timeWizard, timeWizardOfTomorrow, babyDragon, thousandDragon];
    const ft = makeFusionTable(cards, [fusion]);

    expect(ft[babyDragon.id * MAX_CARD_ID + timeWizard.id]).toBe(thousandDragon.id);
  });

  it("Time Wizard Of Tomorrow also fuses with Dragon via alias", () => {
    const cards = [timeWizard, timeWizardOfTomorrow, babyDragon, thousandDragon];
    const ft = makeFusionTable(cards, [fusion]);

    expect(ft[babyDragon.id * MAX_CARD_ID + timeWizardOfTomorrow.id]).toBe(thousandDragon.id);
  });

  it("alias works even when Time Wizard itself is absent from card list", () => {
    const cards = [timeWizardOfTomorrow, babyDragon, thousandDragon];
    const ft = makeFusionTable(cards, [fusion]);

    expect(ft[babyDragon.id * MAX_CARD_ID + timeWizardOfTomorrow.id]).toBe(thousandDragon.id);
  });
});
