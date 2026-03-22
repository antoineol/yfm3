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
  /** Material card IDs that came from the field (empty if none). */
  fieldMaterialCardIds: number[];
  /** Equip cards applied after fusions (empty if none). */
  equipCardIds: number[];
};

/** A field card with its live (equip-boosted) ATK/DEF from game RAM. */
export type FieldCardInfo = { cardId: number; atk: number; def: number };

type CardSource = "hand" | "field" | "result";

/**
 * A card in the working hand with its source tracked.
 * originalIndex >= 0 identifies the card's position in its source array.
 * source "result" means it's a fusion result (intermediate or final).
 * liveAtk/liveDef are set only for field cards to carry their current boosted values.
 */
type TaggedCard = {
  cardId: number;
  originalIndex: number;
  source: CardSource;
  liveAtk?: number;
  liveDef?: number;
};

type ConsumedCard = { cardId: number; source: CardSource };

/**
 * Find all achievable fusion chains from a hand of up to 5 cards,
 * including equip bonuses applied after the last fusion.
 * Optionally includes field cards as first material (FM rule: field card
 * can only be material1 at depth 0).
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
  fieldCards?: FieldCardInfo[],
): FusionChainResult[] {
  const tagged: TaggedCard[] = [
    ...handCardIds.map((cardId, i) => ({ cardId, originalIndex: i, source: "hand" as const })),
    ...(fieldCards ?? []).map((fc, i) => ({
      cardId: fc.cardId,
      originalIndex: i,
      source: "field" as const,
      liveAtk: fc.atk,
      liveDef: fc.def,
    })),
  ];
  const results = new Map<string, FusionChainResult>();
  dfs(tagged, fusionTable, cardDb, fusionDepth, 0, [], [], results, equipCompat);

  // Also check direct plays (no fusion) with equip bonuses
  if (equipCompat) {
    for (let i = 0; i < tagged.length; i++) {
      const monster = tagged[i];
      if (!monster) continue;
      const card = cardDb.cardsById.get(monster.cardId);
      // For field cards, use live ATK (includes existing equip boosts); otherwise use DB base ATK
      const currentAtk = monster.liveAtk ?? card?.attack ?? 0;
      const currentDef = monster.liveDef ?? card?.defense ?? 0;
      if (currentAtk === 0) continue;
      const equips = findCompatibleEquips(tagged, [i], monster.cardId, equipCompat);
      if (equips.length === 0) continue;
      const bonus = equips.reduce((sum, eqId) => sum + equipBonus(eqId), 0);
      const fieldPrefix = monster.source === "field" ? "f" : "";
      const key = `${fieldPrefix}${String(monster.cardId)}+${equips.join(",")}`;
      const existing = results.get(key);
      if (existing && existing.resultAtk >= currentAtk + bonus) continue;
      results.set(key, {
        resultCardId: monster.cardId,
        resultAtk: currentAtk + bonus,
        resultDef: currentDef + bonus,
        resultName: card?.name ?? `Card #${monster.cardId}`,
        steps: [],
        materialCardIds: monster.source === "hand" ? [monster.cardId] : [],
        fieldMaterialCardIds: monster.source === "field" ? [monster.cardId] : [],
        equipCardIds: equips,
      });
    }
  }

  // Filter out results that consume no hand cards at all (field-only, no equips)
  const filtered = Array.from(results.values()).filter(
    (r) => r.materialCardIds.length > 0 || r.equipCardIds.length > 0,
  );

  return sortByAtkDesc(filtered);
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
    if (!card || card.source === "field") continue;
    if (equipCompat[card.cardId * MAX_CARD_ID + monsterId]) {
      equips.push(card.cardId);
    }
  }
  return equips;
}

function dfs(
  hand: TaggedCard[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  maxDepth: number,
  depth: number,
  steps: FusionStep[],
  consumedCards: ConsumedCard[],
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

      // FM field rule: skip if both materials are field-sourced
      if (a.source === "field" && b.source === "field") continue;

      // Field card must be material1 (it's already on the board)
      let m1 = a;
      let m2 = b;
      if (b.source === "field") {
        m1 = b;
        m2 = a;
      }

      const resultId = fusionTable[m1.cardId * MAX_CARD_ID + m2.cardId] ?? FUSION_NONE;
      if (resultId === FUSION_NONE) continue;

      const step: FusionStep = {
        material1CardId: m1.cardId,
        material2CardId: m2.cardId,
        resultCardId: resultId,
      };
      const newSteps = [...steps, step];

      // Track which original cards are consumed
      const newConsumed = [...consumedCards];
      if (m1.source !== "result") newConsumed.push({ cardId: m1.cardId, source: m1.source });
      if (m2.source !== "result") newConsumed.push({ cardId: m2.cardId, source: m2.source });

      // Check equip bonuses from remaining hand cards
      let equips: number[] = [];
      let bonus = 0;
      if (equipCompat) {
        equips = findCompatibleEquips(hand, [i, j], resultId, equipCompat);
        bonus = equips.reduce((sum: number, eqId: number) => sum + equipBonus(eqId), 0);
      }
      recordResult(resultId, newSteps, newConsumed, equips, bonus, cardDb, results);

      // Recurse: fuse result with remaining hand cards
      const remaining = buildRemainingHand(hand, i, j, resultId);
      if (remaining.length >= 2 && depth < maxDepth - 1) {
        dfs(
          remaining,
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

/** Build remaining hand after consuming cards at skipI/skipJ, adding the fusion result.
 *  Field-sourced cards are stripped — they can only participate at depth 0. */
function buildRemainingHand(
  hand: TaggedCard[],
  skipI: number,
  skipJ: number,
  resultId: number,
): TaggedCard[] {
  const remaining: TaggedCard[] = [];
  for (let k = 0; k < hand.length; k++) {
    const card = hand[k];
    if (k === skipI || k === skipJ || !card) continue;
    if (card.source === "field") continue;
    remaining.push(card);
  }
  remaining.push({ cardId: resultId, originalIndex: -1, source: "result" });
  return remaining;
}

/** Keep result with highest effective ATK per unique (resultCardId + equips + field flag) combo. */
function recordResult(
  resultId: number,
  steps: FusionStep[],
  consumedCards: ConsumedCard[],
  equipCardIds: number[],
  equipBonusTotal: number,
  cardDb: CardDb,
  results: Map<string, FusionChainResult>,
): void {
  const materialCardIds = consumedCards.filter((c) => c.source === "hand").map((c) => c.cardId);
  const fieldMaterialCardIds = consumedCards
    .filter((c) => c.source === "field")
    .map((c) => c.cardId);
  const fieldPrefix = fieldMaterialCardIds.length > 0 ? "f" : "";
  const key = `${fieldPrefix}${String(resultId)}+${equipCardIds.join(",")}`;
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
    fieldMaterialCardIds,
    equipCardIds,
  });
}

function sortByAtkDesc(results: FusionChainResult[]): FusionChainResult[] {
  return results.sort((a, b) => b.resultAtk - a.resultAtk);
}
