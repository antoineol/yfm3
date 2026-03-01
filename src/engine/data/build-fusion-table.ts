import { MAX_CARD_ID } from "../types/constants.ts";
import type { CardSpec, FusionMaterials } from "./card-model.ts";
import { isValidCardKind } from "./parser-utils.ts";

/**
 * Resolve parsed fusions against cards to fill the fusionTable Int16Array.
 *
 * For each fusion recipe, resolves material pair keys to card ID pairs and sets
 * fusionTable[a * MAX_CARD_ID + b] = resultAttack when:
 * - resultAttack > cardAtk[a] AND resultAttack > cardAtk[b] (strict improvement)
 * - resultAttack > existing value (keep highest when multiple recipes match)
 */
export function buildFusionTable(
  cards: CardSpec[],
  fusions: FusionMaterials[],
  fusionTable: Int16Array,
  cardAtk: Int16Array,
): void {
  const { nameToIds, kindToIds, colorKindToIds } = buildLookupMaps(cards);

  for (const fusion of fusions) {
    const resultAttack = fusion.attack;

    for (const materialKey of fusion.materials) {
      const parts = materialKey.split(":");
      if (parts.length !== 2) continue;

      const leftIds = resolveKeyPart(parts[0] as string, nameToIds, kindToIds, colorKindToIds);
      const rightIds = resolveKeyPart(parts[1] as string, nameToIds, kindToIds, colorKindToIds);

      for (const a of leftIds) {
        if (a >= MAX_CARD_ID) continue;
        const atkA = cardAtk[a] ?? 0;
        if (resultAttack <= atkA) continue;

        for (const b of rightIds) {
          if (b >= MAX_CARD_ID || a === b) continue;
          const atkB = cardAtk[b] ?? 0;
          if (resultAttack <= atkB) continue;

          // Set symmetrically, keeping highest result
          const idxAB = a * MAX_CARD_ID + b;
          const idxBA = b * MAX_CARD_ID + a;
          if (resultAttack > (fusionTable[idxAB] ?? 0)) {
            fusionTable[idxAB] = resultAttack;
          }
          if (resultAttack > (fusionTable[idxBA] ?? 0)) {
            fusionTable[idxBA] = resultAttack;
          }
        }
      }
    }
  }
}

/**
 * Build lookup maps from the card database
 */
function buildLookupMaps(cards: CardSpec[]) {
  const nameToIds = new Map<string, number[]>();
  const kindToIds = new Map<string, number[]>();
  const colorKindToIds = new Map<string, number[]>();

  for (const card of cards) {
    // Name lookup
    const nameIds = nameToIds.get(card.name);
    if (nameIds) {
      nameIds.push(card.id);
    } else {
      nameToIds.set(card.name, [card.id]);
    }

    // Kind lookup - each card kind
    for (const kind of card.kinds) {
      const kindIds = kindToIds.get(kind);
      if (kindIds) {
        kindIds.push(card.id);
      } else {
        kindToIds.set(kind, [card.id]);
      }

      // Color-qualified kind lookup
      if (card.color) {
        const colorKindKey = `[${card.color}]${kind}`;
        const ckIds = colorKindToIds.get(colorKindKey);
        if (ckIds) {
          ckIds.push(card.id);
        } else {
          colorKindToIds.set(colorKindKey, [card.id]);
        }
      }
    }
  }

  return { nameToIds, kindToIds, colorKindToIds };
}

/**
 * Resolve a single part of a material pair key to a set of card IDs.
 *
 * Key part formats:
 * - "[blue]Reptile" → color-qualified kind, matches only blue Reptile cards
 * - "Dragon" (valid kind) → matches all cards with that kind
 * - "Kuriboh" (not a kind) → matches by card name
 */
function resolveKeyPart(
  part: string,
  nameToIds: Map<string, number[]>,
  kindToIds: Map<string, number[]>,
  colorKindToIds: Map<string, number[]>,
): number[] {
  // Check for color-qualified kind: [color]Kind
  const colorMatch = /^\[(\w+)\](\w+)$/.exec(part);
  if (colorMatch) {
    const key = `[${colorMatch[1]}]${colorMatch[2]}`;
    return colorKindToIds.get(key) ?? [];
  }

  // Check if it's a valid kind name
  if (isValidCardKind(part)) {
    return kindToIds.get(part) ?? [];
  }

  // Otherwise it's a card name
  return nameToIds.get(part) ?? [];
}
