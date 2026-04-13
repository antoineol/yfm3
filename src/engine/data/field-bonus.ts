import { getConfig } from "../config.ts";
import type { CardSpec } from "./card-model.ts";

/** Vanilla field power bonus amount (flat, applied to both ATK and DEF). */
const FIELD_BONUS = 500;

/**
 * Stable monster-type → game enum index. Matches the EXE's CARD_TYPES order
 * (Dragon=0 … Plant=19) and is used to index into the live `fieldBonusTable`
 * scanned from RAM. Type names are stable across vanilla/RP/Alpha mods.
 */
export const CARD_TYPE_INDEX: Readonly<Record<string, number>> = {
  Dragon: 0,
  Spellcaster: 1,
  Zombie: 2,
  Warrior: 3,
  "Beast-Warrior": 4,
  Beast: 5,
  "Winged Beast": 6,
  Fiend: 7,
  Fairy: 8,
  Insect: 9,
  Dinosaur: 10,
  Reptile: 11,
  Fish: 12,
  "Sea Serpent": 13,
  Machine: 14,
  Thunder: 15,
  Aqua: 16,
  Pyro: 17,
  Rock: 18,
  Plant: 19,
};

/** Vanilla fallback: terrain ID → cardType strings that receive +500. */
const VANILLA_BOOST: Record<number, Set<string>> = {
  1: new Set(["Beast-Warrior", "Insect", "Plant", "Beast"]), // Forest
  2: new Set(["Zombie", "Dinosaur", "Rock"]), // Wasteland
  3: new Set(["Dragon", "Winged Beast", "Thunder"]), // Mountain
  4: new Set(["Warrior", "Beast-Warrior"]), // Meadow
  5: new Set(["Aqua", "Thunder"]), // Sea
  6: new Set(["Spellcaster", "Fiend"]), // Dark
};

/** Vanilla fallback: terrain ID → cardType strings that receive -500. */
const VANILLA_WEAKEN: Record<number, Set<string>> = {
  5: new Set(["Machine", "Pyro"]), // Sea
  6: new Set(["Fairy"]), // Dark
};

function vanillaBonus(terrain: number, cardType: string): number {
  if (VANILLA_BOOST[terrain]?.has(cardType)) return FIELD_BONUS;
  if (VANILLA_WEAKEN[terrain]?.has(cardType)) return -FIELD_BONUS;
  return 0;
}

/**
 * Returns the ATK/DEF bonus (typically ±500 or 0) for a card type on the
 * given terrain. Reads `getConfig().fieldBonusTable` first — populated from
 * the running game's RAM, so mods (Alpha) get correct values automatically.
 * Falls back to hardcoded vanilla rules when no table is loaded.
 */
export function fieldBonus(terrain: number, cardType: string | undefined): number {
  if (!cardType || terrain < 1 || terrain > 6) return 0;
  const table = getConfig().fieldBonusTable;
  const typeIndex = CARD_TYPE_INDEX[cardType];
  if (table && typeIndex !== undefined) return table[typeIndex * 6 + (terrain - 1)] ?? 0;
  return vanillaBonus(terrain, cardType);
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

/** Vanilla terrain names — used as a fallback when gameData is unavailable. */
export const VANILLA_TERRAIN_NAMES: Record<number, string> = {
  1: "Forest",
  2: "Wasteland",
  3: "Mountain",
  4: "Meadow",
  5: "Sea",
  6: "Dark",
};

/**
 * Game card ID for each terrain's activating field card. The PS1 engine
 * uses these IDs across vanilla, RP and Alpha mods (the cards at 330–335
 * change name/effect, but the slot mapping is hardcoded in the EXE).
 */
const TERRAIN_FIELD_CARD_ID: Record<number, number> = {
  1: 330,
  2: 331,
  3: 332,
  4: 333,
  5: 334,
  6: 335,
};

/** All valid terrain IDs (1–6). */
export const TERRAIN_IDS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Build the terrain id → display name map from the running mod's card list.
 * Each terrain's name is taken from its field card (ID 330–335). Missing
 * cards fall back to vanilla names so the dropdown stays usable while
 * gameData loads or in manual mode.
 */
export function buildTerrainNames(
  cards: ReadonlyArray<{ id: number; name: string }> | null | undefined,
): Record<number, string> {
  if (!cards) return { ...VANILLA_TERRAIN_NAMES };
  const byId = new Map(cards.map((c) => [c.id, c.name]));
  const names: Record<number, string> = {};
  for (const t of TERRAIN_IDS) {
    const cardId = TERRAIN_FIELD_CARD_ID[t];
    names[t] =
      (cardId !== undefined && byId.get(cardId)) || VANILLA_TERRAIN_NAMES[t] || `Field ${t}`;
  }
  return names;
}
