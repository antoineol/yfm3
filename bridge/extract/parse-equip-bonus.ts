// ---------------------------------------------------------------------------
// Per-equip ATK bonus parsing from card descriptions
// ---------------------------------------------------------------------------

import type { CardStats, EquipEntry } from "./types.ts";

/**
 * Parse a numeric ATK bonus from an equip card's description text.
 * Matches patterns like "by 500!", "by 700 points!", "increases by\n500 points".
 * Returns null for special equips (Riryoku, Metalmorph, Megamorph) whose
 * descriptions don't contain a standard numeric ATK bonus.
 */
export function parseEquipBonusFromDescription(description: string): number | null {
  const match = description.match(/by\s+(\d+)/i);
  if (!match?.[1]) return null;
  const value = parseInt(match[1], 10);
  // ATK bonuses are >= 100. Small numbers (e.g. "by 2 levels") are not ATK bonuses.
  return value >= 100 ? value : null;
}

/**
 * Build a per-equip bonus map by parsing descriptions of all equip cards.
 * Only includes entries where a bonus was successfully parsed.
 */
export function buildPerEquipBonuses(
  cards: CardStats[],
  equips: EquipEntry[],
): Record<number, number> | null {
  const equipIds = new Set(equips.map((e) => e.equipId));
  const map: Record<number, number> = {};
  let count = 0;
  for (const card of cards) {
    if (!equipIds.has(card.id)) continue;
    const bonus = parseEquipBonusFromDescription(card.description);
    if (bonus !== null) {
      map[card.id] = bonus;
      count++;
    }
  }
  return count > 0 ? map : null;
}
