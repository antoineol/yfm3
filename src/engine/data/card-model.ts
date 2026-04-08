import type { cardKinds, colors, guardianStars } from "./rp-types.ts";

export type CardKind = (typeof cardKinds)[number];
export type Color = (typeof colors)[number];
export type GuardianStar = (typeof guardianStars)[number];

export type CardId = number;
export type AttackValue = number;

/** cardId → number of copies owned by the player. */
export type Collection = ReadonlyMap<CardId, number>;

// The immutable definition of a card
export const nonMonsterTypes = new Set([
  // English (RP mod)
  "Magic",
  "Equip",
  "Trap",
  "Ritual",
  // French (vanilla / original game)
  "Magie",
  "Équipement",
  "Piège",
  "Rituel",
]);

export interface CardSpec {
  id: CardId;
  name: string;
  kinds: CardKind[];
  /** Raw type string from the CSV (e.g. "Dragon", "Magic", "Equip", "Trap", "Ritual"). */
  cardType?: string;
  /** true for monster cards (have ATK/DFD/stars), false for spell/trap cards. */
  isMonster: boolean;
  color?: Color;
  guardianStar1?: GuardianStar;
  guardianStar2?: GuardianStar;
  attack: AttackValue;
  defense: number;
  level?: number;
  attribute?: string;
  description?: string;
  starchipCost?: number;
  password?: number;
}
