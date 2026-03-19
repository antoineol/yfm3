import type { cardKinds, colors, guardianStars } from "./rp-types.ts";

export type CardKind = (typeof cardKinds)[number];
export type Color = (typeof colors)[number];
export type GuardianStar = (typeof guardianStars)[number];

export type CardId = number;
export type AttackValue = number;

/** cardId → number of copies owned by the player. */
export type Collection = ReadonlyMap<CardId, number>;

// The immutable definition of a card
export interface CardSpec {
  id: CardId;
  name: string;
  kinds: CardKind[];
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

export interface CardRefByName {
  name: string;
}

export interface KindIdentifier {
  kind: CardKind;
  color?: Color;
}

export type FusionMaterial = CardRefByName | KindIdentifier;

export type FusionMaterials = {
  name: string;
  materials: Set<string>; // Set of material pair keys (e.g. "Dragon:Beast")
  attack: AttackValue;
  defense: number;
};

export interface FusionDb {
  fusions: FusionMaterials[];
}
