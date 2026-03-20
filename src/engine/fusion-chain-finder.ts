import type { CardDb } from "./data/game-db.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

const MEGAMORPH_ID = 657;

function equipBonus(equipId: number): number {
  return equipId === MEGAMORPH_ID ? 1000 : 500;
}

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
  /** Equip cards applied after fusions (empty if none). */
  equipCardIds: number[];
};

/**
 * A card in the working hand: either an original hand card or a fusion result.
 * originalIndex >= 0 means it came from the original hand at that position.
 * originalIndex === -1 means it's a fusion result (intermediate or final).
 */
type TaggedCard = { cardId: number; originalIndex: number };

/**
 * Find all achievable fusion chains from a hand of up to 5 cards,
 * including equip bonuses applied after the last fusion.
 *
 * Unlike FusionScorer (hot-path, typed arrays, returns only max ATK),
 * this returns full chain details for UI display. Runs once per user action.
 */
export function findFusionChains(
  handCardIds: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  equipCompat?: Uint8Array,
): FusionChainResult[] {
  const tagged: TaggedCard[] = handCardIds.map((cardId, i) => ({ cardId, originalIndex: i }));
  const results = new Map<string, FusionChainResult>();
  dfs(tagged, handCardIds, fusionTable, cardDb, fusionDepth, 0, [], [], results, equipCompat);

  // Also check direct plays (no fusion) with equip bonuses
  if (equipCompat) {
    for (let i = 0; i < tagged.length; i++) {
      const monster = tagged[i];
      if (!monster) continue;
      const baseAtk = cardDb.cardsById.get(monster.cardId)?.attack ?? 0;
      if (baseAtk === 0) continue;
      const equips = findCompatibleEquips(tagged, [i], monster.cardId, equipCompat);
      if (equips.length === 0) continue;
      const bonus = equips.reduce((sum, eqId) => sum + equipBonus(eqId), 0);
      const card = cardDb.cardsById.get(monster.cardId);
      const key = `${String(monster.cardId)}+${equips.join(",")}`;
      const existing = results.get(key);
      if (existing && existing.resultAtk >= baseAtk + bonus) continue;
      results.set(key, {
        resultCardId: monster.cardId,
        resultAtk: baseAtk + bonus,
        resultDef: (card?.defense ?? 0) + bonus,
        resultName: card?.name ?? `Card #${monster.cardId}`,
        steps: [],
        materialCardIds: [monster.cardId],
        equipCardIds: equips,
      });
    }
  }

  return sortByAtkDesc(Array.from(results.values()));
}

/** Find equip card IDs in `hand` compatible with `monsterId`, skipping indices in `skipIndices`. */
function findCompatibleEquips(
  hand: TaggedCard[],
  skipIndices: number[],
  monsterId: number,
  equipCompat: Uint8Array,
): number[] {
  const equips: number[] = [];
  for (let k = 0; k < hand.length; k++) {
    if (skipIndices.includes(k)) continue;
    const card = hand[k];
    if (!card) continue;
    if (equipCompat[card.cardId * MAX_CARD_ID + monsterId]) {
      equips.push(card.cardId);
    }
  }
  return equips;
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
  results: Map<string, FusionChainResult>,
  equipCompat?: Uint8Array,
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

      // Check equip bonuses from remaining hand cards
      let equips: number[] = [];
      let bonus = 0;
      if (equipCompat) {
        equips = findCompatibleEquips(hand, [i, j], resultId, equipCompat);
        bonus = equips.reduce((sum: number, eqId: number) => sum + equipBonus(eqId), 0);
      }
      recordResult(resultId, newSteps, materialCardIds, equips, bonus, cardDb, results);

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
          equipCompat,
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

/** Keep result with highest effective ATK per unique (resultCardId + equips) combo. */
function recordResult(
  resultId: number,
  steps: FusionStep[],
  materialCardIds: number[],
  equipCardIds: number[],
  equipBonusTotal: number,
  cardDb: CardDb,
  results: Map<string, FusionChainResult>,
): void {
  const key = `${String(resultId)}+${equipCardIds.join(",")}`;
  const card = cardDb.cardsById.get(resultId);
  const effectiveAtk = (card?.attack ?? 0) + equipBonusTotal;
  const existing = results.get(key);
  if (existing && existing.resultAtk >= effectiveAtk) return;

  results.set(key, {
    resultCardId: resultId,
    resultAtk: effectiveAtk,
    resultDef: (card?.defense ?? 0) + equipBonusTotal,
    resultName: card?.name ?? `Card #${resultId}`,
    steps,
    materialCardIds,
    equipCardIds,
  });
}

function sortByAtkDesc(results: FusionChainResult[]): FusionChainResult[] {
  return results.sort((a, b) => b.resultAtk - a.resultAtk);
}
