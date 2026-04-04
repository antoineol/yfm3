import type { CardSpec } from "./card-model.ts";

/** Field power bonus amount (flat, applied to both ATK and DEF). */
const FIELD_BONUS = 500;

/** Terrain ID → set of cardType strings that receive +500. */
const BOOST: Record<number, Set<string>> = {
  1: new Set(["Beast-Warrior", "Insect", "Plant", "Beast"]), // Forest
  2: new Set(["Zombie", "Dinosaur", "Rock"]), // Wasteland
  3: new Set(["Dragon", "Winged Beast", "Thunder"]), // Mountain
  4: new Set(["Warrior", "Beast-Warrior"]), // Meadow
  5: new Set(["Aqua", "Thunder"]), // Sea
  6: new Set(["Spellcaster", "Fiend"]), // Dark
};

/** Terrain ID → set of cardType strings that receive -500. */
const WEAKEN: Record<number, Set<string>> = {
  5: new Set(["Machine", "Pyro"]), // Sea
  6: new Set(["Fairy"]), // Dark
};

/** Returns +500, -500, or 0 for a card type on the given terrain. */
export function fieldBonus(terrain: number, cardType: string | undefined): number {
  if (!cardType || terrain === 0) return 0;
  if (BOOST[terrain]?.has(cardType)) return FIELD_BONUS;
  if (WEAKEN[terrain]?.has(cardType)) return -FIELD_BONUS;
  return 0;
}

/** Apply field power bonus to a base stat, floored at 0. */
export function applyFieldBonus(
  baseStat: number,
  terrain: number,
  cardType: string | undefined,
): number {
  return Math.max(0, baseStat + fieldBonus(terrain, cardType));
}

/** Compute field-boosted ATK and DEF for a card. Returns undefined if no bonus applies. */
export function cardFieldBonus(
  card: CardSpec,
  terrain: number,
): { atk: number; def: number } | undefined {
  const bonus = fieldBonus(terrain, card.cardType);
  if (bonus === 0) return undefined;
  return {
    atk: Math.max(0, card.attack + bonus),
    def: Math.max(0, card.defense + bonus),
  };
}

const TERRAIN_NAMES: Record<number, string> = {
  1: "Forest",
  2: "Wasteland",
  3: "Mountain",
  4: "Meadow",
  5: "Sea",
  6: "Dark",
};

/** Human-readable terrain name, or null for Normal (0) / unknown. */
export function terrainName(terrain: number): string | null {
  return TERRAIN_NAMES[terrain] ?? null;
}
