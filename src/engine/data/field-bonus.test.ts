import { describe, expect, it } from "vitest";
import type { CardSpec } from "./card-model.ts";
import { applyFieldBonus, cardFieldBonus, fieldBonus, terrainName } from "./field-bonus.ts";

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

describe("terrainName", () => {
  it("returns names for valid terrains", () => {
    expect(terrainName(1)).toBe("Forest");
    expect(terrainName(2)).toBe("Wasteland");
    expect(terrainName(3)).toBe("Mountain");
    expect(terrainName(4)).toBe("Meadow");
    expect(terrainName(5)).toBe("Sea");
    expect(terrainName(6)).toBe("Dark");
  });

  it("returns null for Normal terrain", () => {
    expect(terrainName(0)).toBeNull();
  });

  it("returns null for unknown terrain IDs", () => {
    expect(terrainName(7)).toBeNull();
    expect(terrainName(-1)).toBeNull();
  });
});
