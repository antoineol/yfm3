import { type CardType, cardTypeAliases, cardTypeDisplayNames, cardTypes } from "./rp-types.ts";

const validCardTypes = new Set<string>(cardTypes);

export function displayCardType(type: string): string {
  return cardTypeDisplayNames[type as CardType] ?? type;
}

export function normalizeCardType(type: string): string {
  return cardTypeAliases[type] ?? type;
}

export function isCardType(type: string): type is CardType {
  return validCardTypes.has(type);
}
