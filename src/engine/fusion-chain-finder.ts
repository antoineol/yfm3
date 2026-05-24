import { getConfig } from "./config.ts";
import { applyFieldBonus, fieldBonus } from "./data/field-bonus.ts";
import type { CardDb } from "./data/game-db.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

function equipBonusForCard(equipId: number, perEquip?: Record<number, number>): number {
  if (perEquip?.[equipId] != null) return perEquip[equipId];
  const cfg = getConfig();
  return equipId === cfg.megamorphId ? cfg.megamorphBonus : cfg.equipBonus;
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
type PlayCandidateMap = Map<string, FusionChainResult[]>;
type PlaySelectionContext = {
  handCardIds: number[];
  fusionTable: Int16Array;
  cardDb: CardDb;
  fusionDepth: number;
  equipCompat: Uint8Array | undefined;
  terrain: number;
  perEquipBonuses: Record<number, number> | undefined;
  remainingBestAtkCache: Map<string, number>;
};

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

type ConsumedCard = { cardId: number; source: CardSource; liveAtk?: number };

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
  terrain = 0,
  perEquipBonuses?: Record<number, number>,
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
  const candidates: PlayCandidateMap = new Map();
  dfs(
    tagged,
    fusionTable,
    cardDb,
    fusionDepth,
    0,
    [],
    [],
    candidates,
    equipCompat,
    terrain,
    perEquipBonuses,
  );

  enumerateDirectPlays(tagged, cardDb, candidates, equipCompat, terrain, perEquipBonuses);

  const results = selectBestCandidates(
    candidates,
    handCardIds,
    fusionTable,
    cardDb,
    fusionDepth,
    equipCompat,
    terrain,
    perEquipBonuses,
  );

  // Filter out results that consume no hand cards at all (field-only, no equips)
  const filtered = results.filter((r) => r.materialCardIds.length > 0 || r.equipCardIds.length > 0);

  return pruneDominatedPlays(sortByAtkDesc(filtered));
}

function selectBestCandidates(
  candidates: PlayCandidateMap,
  handCardIds: number[],
  fusionTable: Int16Array,
  cardDb: CardDb,
  fusionDepth: number,
  equipCompat: Uint8Array | undefined,
  terrain: number,
  perEquipBonuses: Record<number, number> | undefined,
): FusionChainResult[] {
  const context: PlaySelectionContext = {
    handCardIds,
    fusionTable,
    cardDb,
    fusionDepth,
    equipCompat,
    terrain,
    perEquipBonuses,
    remainingBestAtkCache: new Map(),
  };
  return Array.from(candidates.values(), (group) => selectBestCandidate(group, context));
}

function selectBestCandidate(
  group: FusionChainResult[],
  context: PlaySelectionContext,
): FusionChainResult {
  let best = group[0];
  if (!best) throw new Error("Cannot select from an empty play group");

  for (let i = 1; i < group.length; i++) {
    const candidate = group[i];
    if (candidate && comparePlayCandidates(candidate, best, context) > 0) {
      best = candidate;
    }
  }

  return best;
}

function comparePlayCandidates(
  candidate: FusionChainResult,
  incumbent: FusionChainResult,
  context: PlaySelectionContext,
): number {
  if (candidate.resultAtk !== incumbent.resultAtk) return candidate.resultAtk - incumbent.resultAtk;

  const candidateRemainingAtk = remainingBestAtk(candidate, context);
  const incumbentRemainingAtk = remainingBestAtk(incumbent, context);
  if (candidateRemainingAtk !== incumbentRemainingAtk) {
    return candidateRemainingAtk - incumbentRemainingAtk;
  }

  const consumedCountDiff = totalConsumedCards(incumbent) - totalConsumedCards(candidate);
  if (consumedCountDiff !== 0) return consumedCountDiff;

  return (
    consumedMaterialAtk(incumbent, context.cardDb) - consumedMaterialAtk(candidate, context.cardDb)
  );
}

function remainingBestAtk(play: FusionChainResult, context: PlaySelectionContext): number {
  const remaining = removeConsumedHandCards(context.handCardIds, [
    ...play.materialCardIds,
    ...play.equipCardIds,
  ]);
  const cacheKey = remaining.join(",");
  const cached = context.remainingBestAtkCache.get(cacheKey);
  if (cached != null) return cached;

  const results = findFusionChains(
    remaining,
    context.fusionTable,
    context.cardDb,
    context.fusionDepth,
    context.equipCompat,
    undefined,
    context.terrain,
    context.perEquipBonuses,
  );
  const bestAtk = results[0]?.resultAtk ?? 0;
  context.remainingBestAtkCache.set(cacheKey, bestAtk);
  return bestAtk;
}

function removeConsumedHandCards(handCardIds: number[], consumedCardIds: number[]): number[] {
  const remaining = [...handCardIds];
  for (const cardId of consumedCardIds) {
    const index = remaining.indexOf(cardId);
    if (index >= 0) remaining.splice(index, 1);
  }
  return remaining;
}

function totalConsumedCards(play: FusionChainResult): number {
  return play.materialCardIds.length + play.fieldMaterialCardIds.length + play.equipCardIds.length;
}

function consumedMaterialAtk(play: FusionChainResult, cardDb: CardDb): number {
  return [...play.materialCardIds, ...play.fieldMaterialCardIds].reduce(
    (sum, cardId) => sum + (cardDb.cardsById.get(cardId)?.attack ?? 0),
    0,
  );
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
  results: PlayCandidateMap,
  equipCompat: Uint8Array | undefined,
  terrain: number,
  perEquipBonuses?: Record<number, number>,
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
      if (m1.source !== "result")
        newConsumed.push({ cardId: m1.cardId, source: m1.source, liveAtk: m1.liveAtk });
      if (m2.source !== "result")
        newConsumed.push({ cardId: m2.cardId, source: m2.source, liveAtk: m2.liveAtk });

      // Check equip bonuses from remaining hand cards
      let equips: number[] = [];
      let bonus = 0;
      if (equipCompat) {
        equips = findCompatibleEquips(hand, [i, j], resultId, equipCompat);
        bonus = equips.reduce(
          (sum: number, eqId: number) => sum + equipBonusForCard(eqId, perEquipBonuses),
          0,
        );
      }
      recordResult(resultId, newSteps, newConsumed, equips, bonus, cardDb, results, terrain);

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
          terrain,
          perEquipBonuses,
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

/** Record a fusion result, unless it sacrifices a field card with higher ATK than the result. */
function recordResult(
  resultId: number,
  steps: FusionStep[],
  consumedCards: ConsumedCard[],
  equipCardIds: number[],
  equipBonusTotal: number,
  cardDb: CardDb,
  results: PlayCandidateMap,
  terrain: number,
): void {
  const materialCardIds = consumedCards.filter((c) => c.source === "hand").map((c) => c.cardId);
  const fieldMaterialCardIds = consumedCards
    .filter((c) => c.source === "field")
    .map((c) => c.cardId);
  const card = cardDb.cardsById.get(resultId);
  const effectiveAtk =
    applyFieldBonus(card?.attack ?? 0, terrain, card?.cardType) + equipBonusTotal;

  // Skip fusions that sacrifice a field card with higher ATK than the result
  for (const c of consumedCards) {
    if (c.source === "field" && c.liveAtk != null) {
      const consumedAtk = c.liveAtk + fieldBonus(terrain, cardDb.cardsById.get(c.cardId)?.cardType);
      if (effectiveAtk <= consumedAtk) return;
    }
  }

  const fieldPrefix = fieldMaterialCardIds.length > 0 ? "f" : "";
  upsertPlay(results, `${fieldPrefix}${String(resultId)}+${equipCardIds.join(",")}`, {
    resultCardId: resultId,
    resultAtk: effectiveAtk,
    resultDef: applyFieldBonus(card?.defense ?? 0, terrain, card?.cardType) + equipBonusTotal,
    resultName: card?.name ?? `Card #${resultId}`,
    steps,
    materialCardIds,
    fieldMaterialCardIds,
    equipCardIds,
  });
}

/**
 * Enumerate direct plays: hand monsters played as-is, and hand/field monsters
 * boosted by compatible equips from the hand.
 */
function enumerateDirectPlays(
  tagged: TaggedCard[],
  cardDb: CardDb,
  results: PlayCandidateMap,
  equipCompat: Uint8Array | undefined,
  terrain: number,
  perEquipBonuses: Record<number, number> | undefined,
): void {
  for (let i = 0; i < tagged.length; i++) {
    const monster = tagged[i];
    if (!monster) continue;
    const card = cardDb.cardsById.get(monster.cardId);
    const fb = fieldBonus(terrain, card?.cardType);
    // For field cards, use live ATK (includes existing equip boosts) + field bonus;
    // otherwise use DB base ATK with field bonus applied.
    const baseAtk =
      monster.liveAtk != null
        ? monster.liveAtk + fb
        : applyFieldBonus(card?.attack ?? 0, terrain, card?.cardType);
    const baseDef =
      monster.liveDef != null
        ? monster.liveDef + fb
        : applyFieldBonus(card?.defense ?? 0, terrain, card?.cardType);
    if (baseAtk === 0) continue;
    const name = card?.name ?? `Card #${monster.cardId}`;

    if (monster.source === "hand") {
      upsertPlay(results, `${String(monster.cardId)}+`, {
        resultCardId: monster.cardId,
        resultAtk: baseAtk,
        resultDef: baseDef,
        resultName: name,
        steps: [],
        materialCardIds: [monster.cardId],
        fieldMaterialCardIds: [],
        equipCardIds: [],
      });
    }

    if (!equipCompat) continue;
    const equips = findCompatibleEquips(tagged, [i], monster.cardId, equipCompat);
    if (equips.length === 0) continue;
    const bonus = equips.reduce((sum, eqId) => sum + equipBonusForCard(eqId, perEquipBonuses), 0);
    const fieldPrefix = monster.source === "field" ? "f" : "";
    upsertPlay(results, `${fieldPrefix}${String(monster.cardId)}+${equips.join(",")}`, {
      resultCardId: monster.cardId,
      resultAtk: baseAtk + bonus,
      resultDef: baseDef + bonus,
      resultName: name,
      steps: [],
      materialCardIds: monster.source === "hand" ? [monster.cardId] : [],
      fieldMaterialCardIds: monster.source === "field" ? [monster.cardId] : [],
      equipCardIds: equips,
    });
  }
}

/**
 * Add `candidate` to its displayed play group. Groups are collapsed after all
 * paths are known, so equivalent plays can choose the path with the best
 * leftover hand.
 */
function upsertPlay(results: PlayCandidateMap, key: string, candidate: FusionChainResult): void {
  const group = results.get(key);
  if (group) {
    group.push(candidate);
    return;
  }
  results.set(key, [candidate]);
}

/**
 * Remove plays dominated by strictly better alternatives.
 * A play is dominated if another play exists with the same result card and field
 * origin, a strict superset of equips, and equal-or-higher ATK.
 */
function pruneDominatedPlays(results: FusionChainResult[]): FusionChainResult[] {
  return results.filter((a) => {
    const aIsField = a.fieldMaterialCardIds.length > 0;
    return !results.some((b) => {
      if (a === b) return false;
      if (a.resultCardId !== b.resultCardId) return false;
      if (aIsField !== b.fieldMaterialCardIds.length > 0) return false;
      if (a.equipCardIds.length >= b.equipCardIds.length) return false;
      if (a.resultAtk > b.resultAtk) return false;
      const bEquipSet = new Set(b.equipCardIds);
      return a.equipCardIds.every((eq) => bEquipSet.has(eq));
    });
  });
}

function sortByAtkDesc(results: FusionChainResult[]): FusionChainResult[] {
  return results.sort((a, b) => {
    if (b.resultAtk !== a.resultAtk) return b.resultAtk - a.resultAtk;
    return a.steps.length - b.steps.length;
  });
}
