import type { CardDb } from "./data/game-db.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

export type FusionStep = {
  material1CardId: number;
  material2CardId: number;
  resultCardId: number;
};

export type FusionChainResult = {
  resultCardId: number;
  resultAtk: number;
  resultDef: number;
  resultName: string;
  /** Ordered steps: step[0] is the first fusion, step[n] is the final. */
  steps: FusionStep[];
  /** All material card IDs consumed from the hand (original hand cards only). */
  materialCardIds: number[];
};

/**
 * A card in the working hand: either an original hand card or a fusion result.
 * originalIndex >= 0 means it came from the original hand at that position.
 * originalIndex === -1 means it's a fusion result (intermediate or final).
 */
type TaggedCard = { cardId: number; originalIndex: number };

/**
 * Find all achievable fusion chains from a hand of up to 5 cards.
 *
 * Unlike FusionScorer (hot-path, typed arrays, returns only max ATK),
 * this returns full chain details for UI display. Runs once per user action.
 */
export function findFusionChains(
  handCardIds: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
): FusionChainResult[] {
  const tagged: TaggedCard[] = handCardIds.map((cardId, i) => ({ cardId, originalIndex: i }));
  const results = new Map<number, FusionChainResult>();
  dfs(tagged, handCardIds, fusionTable, cardDb, fusionDepth, 0, [], [], results);
  return sortByAtkDesc(Array.from(results.values()));
}

function dfs(
  hand: TaggedCard[],
  originalHand: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  maxDepth: number,
  depth: number,
  steps: FusionStep[],
  consumedIndices: number[],
  results: Map<number, FusionChainResult>,
): void {
  for (let i = 0; i < hand.length - 1; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      // FM rule: after the first fusion, one material must be the previous
      // result (always the last element — see buildRemainingHand).
      if (depth > 0 && j !== hand.length - 1) continue;

      const a = hand[i];
      const b = hand[j];
      if (!a || !b) continue;
      const resultId = fusionTable[a.cardId * MAX_CARD_ID + b.cardId] ?? FUSION_NONE;
      if (resultId === FUSION_NONE) continue;

      const step: FusionStep = {
        material1CardId: a.cardId,
        material2CardId: b.cardId,
        resultCardId: resultId,
      };
      const newSteps = [...steps, step];

      // Track which original hand cards are consumed
      const newConsumed = [...consumedIndices];
      if (a.originalIndex >= 0) newConsumed.push(a.originalIndex);
      if (b.originalIndex >= 0) newConsumed.push(b.originalIndex);

      const materialCardIds = newConsumed.map((idx) => originalHand[idx] ?? 0);
      recordResult(resultId, newSteps, materialCardIds, cardDb, results);

      // Recurse: fuse result with remaining hand cards
      const remaining = buildRemainingHand(hand, i, j, resultId);
      if (remaining.length >= 2 && depth < maxDepth - 1) {
        dfs(
          remaining,
          originalHand,
          fusionTable,
          cardDb,
          maxDepth,
          depth + 1,
          newSteps,
          newConsumed,
          results,
        );
      }
    }
  }
}

function buildRemainingHand(
  hand: TaggedCard[],
  skipI: number,
  skipJ: number,
  resultId: number,
): TaggedCard[] {
  const remaining: TaggedCard[] = [];
  for (let k = 0; k < hand.length; k++) {
    const card = hand[k];
    if (k !== skipI && k !== skipJ && card) remaining.push(card);
  }
  remaining.push({ cardId: resultId, originalIndex: -1 });
  return remaining;
}

/** Keep chain with fewest steps per resultCardId. */
function recordResult(
  resultId: number,
  steps: FusionStep[],
  materialCardIds: number[],
  cardDb: CardDb,
  results: Map<number, FusionChainResult>,
): void {
  const existing = results.get(resultId);
  if (existing && existing.steps.length <= steps.length) return;

  const card = cardDb.cardsById.get(resultId);
  results.set(resultId, {
    resultCardId: resultId,
    resultAtk: card?.attack ?? 0,
    resultDef: card?.defense ?? 0,
    resultName: card?.name ?? `Card #${resultId}`,
    steps,
    materialCardIds,
  });
}

function sortByAtkDesc(results: FusionChainResult[]): FusionChainResult[] {
  return results.sort((a, b) => b.resultAtk - a.resultAtk);
}
