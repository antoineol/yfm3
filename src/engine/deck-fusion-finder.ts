import type { CardDb } from "./data/game-db.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

export type DeckFusion = {
  resultCardId: number;
  resultAtk: number;
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
 * Returns results grouped by material count and sorted by ATK descending.
 */
export function findDeckFusions(
  deckCardIds: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
): DeckFusion[] {
  const uniqueCards = [...new Set(deckCardIds)];
  const results = new Map<string, DeckFusion>();

  exploreFusions(uniqueCards, fusionTable, cardDb, fusionDepth, results);

  return sortAndGroup(Array.from(results.values()));
}

function exploreFusions(
  deckCards: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  results: Map<string, DeckFusion>,
): void {
  const deckSet = new Set(deckCards);

  for (let i = 0; i < deckCards.length; i++) {
    const a = deckCards[i] ?? 0;
    for (let j = i + 1; j < deckCards.length; j++) {
      const b = deckCards[j] ?? 0;
      const resultId = fusionTable[a * MAX_CARD_ID + b] ?? FUSION_NONE;
      if (resultId === FUSION_NONE) continue;

      recordDeckFusion(resultId, 2, [a, b], cardDb, results);

      if (fusionDepth > 1) {
        exploreChains(resultId, [a, b], deckSet, fusionTable, cardDb, fusionDepth, 1, results);
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
): void {
  const usedSet = new Set(materials);

  for (const cardId of deckSet) {
    if (usedSet.has(cardId)) continue;

    const resultId = fusionTable[currentResultId * MAX_CARD_ID + cardId] ?? FUSION_NONE;
    if (resultId === FUSION_NONE) continue;

    const newMaterials = [...materials, cardId];
    recordDeckFusion(resultId, newMaterials.length, newMaterials, cardDb, results);

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
    }
    return;
  }

  const card = cardDb.cardsById.get(resultId);
  results.set(key, {
    resultCardId: resultId,
    resultAtk: card?.attack ?? 0,
    resultName: card?.name ?? `Card #${String(resultId)}`,
    materialCount,
    materialPaths: [materials],
  });
}

function sortAndGroup(fusions: DeckFusion[]): DeckFusion[] {
  return fusions.sort((a, b) => {
    if (a.materialCount !== b.materialCount) return a.materialCount - b.materialCount;
    return b.resultAtk - a.resultAtk;
  });
}
