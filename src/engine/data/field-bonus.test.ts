import { afterEach, describe, expect, it } from "vitest";
import { resetConfig, setConfig } from "../config.ts";
import type { CardSpec } from "./card-model.ts";
import { applyFieldBonus, buildTerrainNames, cardFieldBonus, fieldBonus } from "./field-bonus.ts";

describe("fieldBonus", () => {
  it("returns 0 for Normal terrain (0)", () => {
    expect(fieldBonus(0, "Dragon")).toBe(0);
  });

  it("returns 0 for undefined cardType", () => {
    expect(fieldBonus(3, undefined)).toBe(0);
  });

  it("returns +500 for boosted types", () => {
    // Forest (1)
    expect(fieldBonus(1, "Beast-Warrior")).toBe(500);
    expect(fieldBonus(1, "Insect")).toBe(500);
    expect(fieldBonus(1, "Plant")).toBe(500);
    expect(fieldBonus(1, "Beast")).toBe(500);
    // Wasteland (2)
    expect(fieldBonus(2, "Zombie")).toBe(500);
    expect(fieldBonus(2, "Dinosaur")).toBe(500);
    expect(fieldBonus(2, "Rock")).toBe(500);
    // Mountain (3)
    expect(fieldBonus(3, "Dragon")).toBe(500);
    expect(fieldBonus(3, "Winged Beast")).toBe(500);
    expect(fieldBonus(3, "Thunder")).toBe(500);
    // Meadow (4)
    expect(fieldBonus(4, "Warrior")).toBe(500);
    expect(fieldBonus(4, "Beast-Warrior")).toBe(500);
    // Sea (5)
    expect(fieldBonus(5, "Aqua")).toBe(500);
    expect(fieldBonus(5, "Thunder")).toBe(500);
    // Dark (6)
    expect(fieldBonus(6, "Spellcaster")).toBe(500);
    expect(fieldBonus(6, "Fiend")).toBe(500);
  });

  it("returns -500 for weakened types", () => {
    // Sea (5) weakens Machine, Pyro
    expect(fieldBonus(5, "Machine")).toBe(-500);
    expect(fieldBonus(5, "Pyro")).toBe(-500);
    // Dark (6) weakens Fairy
    expect(fieldBonus(6, "Fairy")).toBe(-500);
  });

  it("returns 0 for unaffected types", () => {
    expect(fieldBonus(1, "Dragon")).toBe(0); // Dragon not boosted by Forest
    expect(fieldBonus(3, "Warrior")).toBe(0); // Warrior not boosted by Mountain
    expect(fieldBonus(6, "Dragon")).toBe(0); // Dragon neutral on Dark
  });

  it("returns 0 for non-monster types", () => {
    expect(fieldBonus(1, "Magic")).toBe(0);
    expect(fieldBonus(6, "Trap")).toBe(0);
    expect(fieldBonus(3, "Equip")).toBe(0);
  });

  it("returns 0 for unknown terrain IDs", () => {
    expect(fieldBonus(7, "Dragon")).toBe(0);
    expect(fieldBonus(99, "Fiend")).toBe(0);
  });
});

describe("applyFieldBonus", () => {
  it("adds bonus to base stat", () => {
    expect(applyFieldBonus(1500, 3, "Dragon")).toBe(2000);
  });

  it("subtracts penalty from base stat", () => {
    expect(applyFieldBonus(1500, 5, "Machine")).toBe(1000);
  });

  it("floors at 0 for weak monsters", () => {
    expect(applyFieldBonus(200, 6, "Fairy")).toBe(0);
  });

  it("returns base stat when no bonus applies", () => {
    expect(applyFieldBonus(1500, 0, "Dragon")).toBe(1500);
    expect(applyFieldBonus(1500, 1, "Dragon")).toBe(1500);
  });
});

describe("cardFieldBonus", () => {
  const dragon: CardSpec = {
    id: 1,
    name: "Blue-eyes White Dragon",
    kinds: ["Dragon"],
    cardType: "Dragon",
    isMonster: true,
    attack: 3000,
    defense: 2500,
  };

  const fairy: CardSpec = {
    id: 2,
    name: "Mystical Elf",
    kinds: ["Fairy"],
    cardType: "Fairy",
    isMonster: true,
    attack: 800,
    defense: 2000,
  };

  it("returns boosted stats for matching terrain", () => {
    expect(cardFieldBonus(dragon, 3)).toEqual({ atk: 3500, def: 3000 });
  });

  it("returns weakened stats for penalized terrain", () => {
    expect(cardFieldBonus(fairy, 6)).toEqual({ atk: 300, def: 1500 });
  });

  it("returns undefined when no bonus applies", () => {
    expect(cardFieldBonus(dragon, 0)).toBeUndefined();
    expect(cardFieldBonus(dragon, 1)).toBeUndefined();
  });

  it("floors weakened stats at 0", () => {
    const weakFairy: CardSpec = { ...fairy, attack: 100, defense: 200 };
    expect(cardFieldBonus(weakFairy, 6)).toEqual({ atk: 0, def: 0 });
  });
});

describe("buildTerrainNames", () => {
  it("falls back to vanilla names when gameData is missing", () => {
    expect(buildTerrainNames(null)).toEqual({
      1: "Forest",
      2: "Wasteland",
      3: "Mountain",
      4: "Meadow",
      5: "Sea",
      6: "Dark",
    });
  });

  it("uses field card names from cards 330–335 when present (Alpha mod)", () => {
    const cards = [
      { id: 330, name: "Toon World" },
      { id: 331, name: "Canyon" },
      { id: 332, name: "Dragon Ravine" },
      { id: 333, name: "Gaia Power" },
      { id: 334, name: "Umiiruka" },
      { id: 335, name: "Chaos Zone" },
    ];
    expect(buildTerrainNames(cards)).toEqual({
      1: "Toon World",
      2: "Canyon",
      3: "Dragon Ravine",
      4: "Gaia Power",
      5: "Umiiruka",
      6: "Chaos Zone",
    });
  });

  it("falls back per-terrain when a field card is missing", () => {
    const names = buildTerrainNames([{ id: 333, name: "Gaia Power" }]);
    expect(names[4]).toBe("Gaia Power");
    expect(names[1]).toBe("Forest");
  });
});

describe("fieldBonus with live RAM table (mod-aware)", () => {
  afterEach(() => resetConfig());

  // Alpha mod row excerpts decoded from RAM:
  //   Dinosaur(10) on Canyon(2) = +500 — vanilla also gives this
  //   Spellcaster(1) on Gaia Power(4) = -500 — vanilla gives 0
  //   Sea Serpent(13) on every terrain = +500 — vanilla gives 0
  //   Fish(12) on Toon World(1) = +500, on every other terrain = -500
  function alphaTable(): number[] {
    const t = new Array(120).fill(0);
    t[1 * 6 + (4 - 1)] = -500; // Spellcaster × Gaia
    t[10 * 6 + (2 - 1)] = 500; // Dinosaur × Canyon
    for (let terrain = 1; terrain <= 6; terrain++) t[13 * 6 + (terrain - 1)] = 500;
    t[12 * 6 + (1 - 1)] = 500; // Fish × Toon World
    for (let terrain = 2; terrain <= 6; terrain++) t[12 * 6 + (terrain - 1)] = -500;
    return t;
  }

  it("reads bonuses from the table when one is loaded", () => {
    setConfig({ fieldBonusTable: alphaTable() });
    expect(fieldBonus(2, "Dinosaur")).toBe(500);
    expect(fieldBonus(4, "Spellcaster")).toBe(-500);
    expect(fieldBonus(1, "Fish")).toBe(500);
    expect(fieldBonus(3, "Fish")).toBe(-500);
  });

  it("overrides vanilla rules when the table differs", () => {
    setConfig({ fieldBonusTable: alphaTable() });
    // Vanilla: Sea Serpent on Mountain = 0; Alpha: +500 everywhere
    expect(fieldBonus(3, "Sea Serpent")).toBe(500);
    // Vanilla: Spellcaster on Sogen(4) = 0; Alpha: -500
    expect(fieldBonus(4, "Spellcaster")).toBe(-500);
  });

  it("falls back to vanilla rules when no table is loaded", () => {
    setConfig({ fieldBonusTable: null });
    expect(fieldBonus(3, "Dragon")).toBe(500); // Mountain boosts Dragon
    expect(fieldBonus(3, "Sea Serpent")).toBe(0); // Vanilla has no boost
  });
});
