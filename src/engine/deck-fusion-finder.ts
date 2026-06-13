import { applyFieldBonus } from "./data/field-bonus.ts";
import type { CardDb } from "./data/game-db.ts";
import { compareRankedPlays, type RankedPlay } from "./play-ranking.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

export type DeckFusion = {
  resultCardId: number;
  resultAtk: number;
  resultDef: number;
  resultName: string;
  /** Number of original deck cards consumed (2 = direct fusion, 3+ = chain). */
  materialCount: number;
  /** Each entry is a distinct sequence of original deck card IDs that produces this result. */
  materialPaths: number[][];
};

/**
 * Find all fusions achievable from a deck's unique card set.
 *
 * For each unique pair of cards, checks the fusion table. For chain fusions,
 * recursively checks if a fusion result can fuse with another deck card.
 *
 * Returns results sorted by the shared play-ranking criteria available without
 * a concrete hand: result ATK, material count, result DEF, then lower-value
 * materials.
 */
export function findDeckFusions(
  deckCardIds: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  terrain = 0,
): DeckFusion[] {
  const uniqueCards = [...new Set(deckCardIds)];
  const results = new Map<string, DeckFusion>();

  exploreFusions(uniqueCards, fusionTable, cardDb, fusionDepth, results, terrain);

  return sortDeckFusions(Array.from(results.values()), cardDb);
}

function exploreFusions(
  deckCards: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  results: Map<string, DeckFusion>,
  terrain: number,
): void {
  const deckSet = new Set(deckCards);

  for (let i = 0; i < deckCards.length; i++) {
    const a = deckCards[i] ?? 0;
    for (let j = i + 1; j < deckCards.length; j++) {
      const b = deckCards[j] ?? 0;
      const resultId = fusionTable[a * MAX_CARD_ID + b] ?? FUSION_NONE;
      if (resultId === FUSION_NONE) continue;

      recordDeckFusion(resultId, 2, [a, b], cardDb, results, terrain);

      if (fusionDepth > 1) {
        exploreChains(
          resultId,
          [a, b],
          deckSet,
          fusionTable,
          cardDb,
          fusionDepth,
          1,
          results,
          terrain,
        );
      }
    }
  }
}

function exploreChains(
  currentResultId: number,
  materials: number[],
  deckSet: Set<number>,
  fusionTable: Int16Array,
  cardDb: CardDb,
  maxDepth: number,
  depth: number,
  results: Map<string, DeckFusion>,
  terrain: number,
): void {
  const usedSet = new Set(materials);

  for (const cardId of deckSet) {
    if (usedSet.has(cardId)) continue;

    const resultId = fusionTable[currentResultId * MAX_CARD_ID + cardId] ?? FUSION_NONE;
    if (resultId === FUSION_NONE) continue;

    const newMaterials = [...materials, cardId];
    recordDeckFusion(resultId, newMaterials.length, newMaterials, cardDb, results, terrain);

    if (depth < maxDepth - 1) {
      exploreChains(
        resultId,
        newMaterials,
        deckSet,
        fusionTable,
        cardDb,
        maxDepth,
        depth + 1,
        results,
        terrain,
      );
    }
  }
}

function recordDeckFusion(
  resultId: number,
  materialCount: number,
  materials: number[],
  cardDb: CardDb,
  results: Map<string, DeckFusion>,
  terrain: number,
): void {
  // Key by result + material count to separate 2-material vs 3-material routes
  const key = `${String(resultId)}_${String(materialCount)}`;
  const existing = results.get(key);

  if (existing) {
    const pathKey = materials
      .slice()
      .sort((a, b) => a - b)
      .join(",");
    const isDuplicate = existing.materialPaths.some(
      (p) =>
        p
          .slice()
          .sort((a, b) => a - b)
          .join(",") === pathKey,
    );
    if (!isDuplicate) {
      existing.materialPaths.push(materials);
      existing.materialPaths.sort((a, b) => compareMaterialPaths(a, b, cardDb));
    }
    return;
  }

  const card = cardDb.cardsById.get(resultId);
  const baseAtk = card?.attack ?? 0;
  const baseDef = card?.defense ?? 0;
  results.set(key, {
    resultCardId: resultId,
    resultAtk: terrain ? applyFieldBonus(baseAtk, terrain, card?.cardType) : baseAtk,
    resultDef: terrain ? applyFieldBonus(baseDef, terrain, card?.cardType) : baseDef,
    resultName: card?.name ?? `Card #${String(resultId)}`,
    materialCount,
    materialPaths: [materials],
  });
}

function sortDeckFusions(fusions: DeckFusion[], cardDb: CardDb): DeckFusion[] {
  for (const fusion of fusions) {
    fusion.materialPaths.sort((a, b) => compareMaterialPaths(a, b, cardDb));
  }
  return fusions.sort((a, b) =>
    compareRankedPlays(rankedDeckFusion(a, cardDb), rankedDeckFusion(b, cardDb)),
  );
}

function rankedDeckFusion(fusion: DeckFusion, cardDb: CardDb): RankedPlay {
  const consumed = materialPathStats(fusion.materialPaths[0] ?? [], cardDb);
  return {
    resultAtk: fusion.resultAtk,
    resultDef: fusion.resultDef,
    consumedCardCount: fusion.materialCount,
    consumedMaterialAtk: consumed.atk,
    consumedMaterialDef: consumed.def,
  };
}

function compareMaterialPaths(a: number[], b: number[], cardDb: CardDb): number {
  const aStats = materialPathStats(a, cardDb);
  const bStats = materialPathStats(b, cardDb);
  if (aStats.atk !== bStats.atk) return aStats.atk - bStats.atk;
  return aStats.def - bStats.def;
}

function materialPathStats(path: number[], cardDb: CardDb): { atk: number; def: number } {
  return path.reduce(
    (sum, cardId) => {
      const card = cardDb.cardsById.get(cardId);
      sum.atk += card?.attack ?? 0;
      sum.def += card?.defense ?? 0;
      return sum;
    },
    { atk: 0, def: 0 },
  );
}
