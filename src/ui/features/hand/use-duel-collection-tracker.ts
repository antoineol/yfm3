import { useEffect, useRef } from "react";
import type { DropPool, RankFactors } from "../../../engine/ranking/rank-scoring.ts";
import { computeRankBreakdown } from "../../../engine/ranking/rank-scoring.ts";
import type { BridgeDuelist, BridgeGameData } from "../../../engine/worker/messages.ts";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";
import type { DuelStats } from "../../lib/bridge-state-interpreter.ts";

export interface CollectionSnapshot {
  collection: Record<number, number>;
  deck: number[];
  rewardEvidence: RewardEvidence | null;
}

type X15HiddenPoolSource = "selector" | "inferred";

export interface RewardEvidence {
  duelistId: number;
  rankLabel: string | null;
  rankDropPool: DropPool | null;
  selectorDropPool: DropPool | null;
  selectorContext: {
    cardCountMode: number;
    skillFlag: number;
    computedPool: number;
  } | null;
  gainedCards: Array<{ cardId: number; qty: number }>;
  poolMatches: Array<{
    dropPool: DropPool;
    possible: boolean;
    matchedCards: number;
    totalCards: number;
    logProbability: number | null;
    impossibleCardIds: number[];
  }>;
  bestDropPool: DropPool | null;
  x15Match: {
    visiblePool: DropPool;
    hiddenPool: DropPool;
    hiddenPoolSource: "selector" | "inferred";
    possible: boolean;
    matchedCards: number;
    totalCards: number;
    logProbability: number | null;
    possibleVisibleCardIds: number[];
  } | null;
}

/**
 * Watch bridge.inDuel transitions and detect collection changes after a duel starts.
 * Fires callbacks synchronously from effects — no internal state, just refs.
 */
export function useDuelCollectionTracker(
  bridge: EmulatorBridge,
  modMismatch: boolean,
  onDuelStart: () => void,
  onNewCards: (snapshot: CollectionSnapshot) => void,
): void {
  const wasInDuelRef = useRef(false);
  const preDuelCollectionRef = useRef<Record<number, number> | null>(null);
  const hasFiredRef = useRef(false);
  const latestRewardStatsRef = useRef<DuelStats | null>(null);

  // Keep callbacks fresh without re-triggering effects.
  const onDuelStartRef = useRef(onDuelStart);
  const onNewCardsRef = useRef(onNewCards);
  useEffect(() => {
    onDuelStartRef.current = onDuelStart;
  });
  useEffect(() => {
    onNewCardsRef.current = onNewCards;
  });

  // ── Track duel entry ─────────────────────────────────────────
  useEffect(() => {
    const isInDuel = bridge.inDuel;
    const wasInDuel = wasInDuelRef.current;
    wasInDuelRef.current = isInDuel;

    if (isInDuel !== wasInDuel) {
      console.log(
        `[PostDuel] inDuel: ${String(wasInDuel)} → ${String(isInDuel)}, phase: ${bridge.phase}`,
      );
    }

    if (modMismatch) return;
    if (isInDuel && !wasInDuel) {
      console.log(`[PostDuel] Duel started — phase: ${bridge.phase}`);
      preDuelCollectionRef.current = bridge.collection ? { ...bridge.collection } : null;
      hasFiredRef.current = false;
      latestRewardStatsRef.current = null;
      onDuelStartRef.current();
    }
  }, [bridge.inDuel, bridge.phase, bridge.collection, modMismatch]);

  // ── Detect collection changes after duel start ────────────────
  const { collection, deckDefinition, gameData, stats } = bridge;
  useEffect(() => {
    if (modMismatch) return;
    if (!preDuelCollectionRef.current || !stats) return;
    latestRewardStatsRef.current = mergeRewardStats(latestRewardStatsRef.current, stats);
  }, [stats, modMismatch]);

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (modMismatch) return;
    if (!collection || !preDuelCollectionRef.current) return;

    const gainedCards = findNewCardQuantities(preDuelCollectionRef.current, collection);
    if (gainedCards.length === 0) return;

    if (!deckDefinition) return;

    console.log(
      `[PostDuel] Collection changed after duel start: ${String(
        gainedCards.reduce((sum, c) => sum + c.qty, 0),
      )} new card(s)`,
    );
    hasFiredRef.current = true;
    onNewCardsRef.current({
      collection: { ...collection },
      deck: [...deckDefinition],
      rewardEvidence: buildRewardEvidence(
        mergeRewardStats(latestRewardStatsRef.current, stats),
        gameData,
        gainedCards,
      ),
    });
  }, [collection, deckDefinition, gameData, stats, modMismatch]);
}

/** Find card IDs whose quantity increased between two collection snapshots. */
export function findNewCards(
  before: Record<number, number>,
  after: Record<number, number>,
): number[] {
  return findNewCardQuantities(before, after).map((card) => card.cardId);
}

export function findNewCardQuantities(
  before: Record<number, number>,
  after: Record<number, number>,
): Array<{ cardId: number; qty: number }> {
  const newCards: Array<{ cardId: number; qty: number }> = [];
  for (const [idStr, qty] of Object.entries(after)) {
    const id = Number(idStr);
    const prevQty = before[id] ?? 0;
    if (qty > prevQty) {
      newCards.push({ cardId: id, qty: qty - prevQty });
    }
  }
  return newCards;
}

export function mergeRewardStats(
  previous: DuelStats | null,
  current: DuelStats | null,
): DuelStats | null {
  if (!previous) return current;
  if (!current) return previous;
  return {
    ...current,
    duelistId: current.duelistId > 0 ? current.duelistId : previous.duelistId,
    rankCounters: current.rankCounters ?? previous.rankCounters,
    rewardPoolContext: current.rewardPoolContext ?? previous.rewardPoolContext,
  };
}

const RANK_COUNTER_KEYS: readonly (keyof RankFactors)[] = [
  "turns",
  "effectiveAttacks",
  "defensiveWins",
  "faceDownPlays",
  "fusionsInitiated",
  "equipMagicUsed",
  "pureMagicUsed",
  "trapsTriggered",
  "remainingCards",
  "remainingLp",
];

const DROP_POOLS: readonly DropPool[] = ["SA-POW", "BCD", "SA-TEC"];

export function buildRewardEvidence(
  stats: DuelStats | null,
  gameData: BridgeGameData | null,
  gainedCards: Array<{ cardId: number; qty: number }>,
): RewardEvidence | null {
  const duelistId = stats?.duelistId ?? 0;
  if (!gameData || duelistId < 1) return null;

  const duelist = gameData.duelists[duelistId - 1];
  if (!duelist) return null;

  const rank = rankFromCounters(stats, gameData);
  const selectorDropPool = dropPoolFromSelector(stats?.rewardPoolContext?.computedPool);
  const poolMatches = buildPoolMatches(duelist, gainedCards);
  const bestDropPool = findBestPool(poolMatches);
  const x15Match = selectorDropPool
    ? buildX15Match(duelist, rank?.dropPool ?? null, selectorDropPool, gainedCards, "selector")
    : inferX15Match(duelist, rank?.dropPool ?? null, gainedCards);

  return {
    duelistId,
    rankLabel: rank?.label ?? null,
    rankDropPool: rank?.dropPool ?? null,
    selectorDropPool,
    selectorContext: stats?.rewardPoolContext ?? null,
    gainedCards,
    poolMatches,
    bestDropPool,
    x15Match,
  };
}

function rankFromCounters(
  stats: DuelStats | null,
  gameData: BridgeGameData,
): { label: string; dropPool: DropPool } | null {
  const counters = stats?.rankCounters;
  if (!counters || counters.length !== RANK_COUNTER_KEYS.length) return null;

  const values: Record<string, number> = {};
  for (let i = 0; i < RANK_COUNTER_KEYS.length; i++) {
    const key = RANK_COUNTER_KEYS[i];
    if (key) values[key] = counters[i] ?? 0;
  }

  return computeRankBreakdown(
    values as unknown as RankFactors,
    "normal",
    gameData.rankScoring ?? "vanilla",
  ).rank;
}

function buildPoolMatches(
  duelist: BridgeDuelist,
  gainedCards: Array<{ cardId: number; qty: number }>,
): RewardEvidence["poolMatches"] {
  return DROP_POOLS.map((dropPool) => {
    const weights = weightsForDropPool(duelist, dropPool);
    let matchedCards = 0;
    let logProbability = 0;
    const impossibleCardIds: number[] = [];

    for (const card of gainedCards) {
      const weight = weights[card.cardId - 1] ?? 0;
      if (weight <= 0) {
        impossibleCardIds.push(card.cardId);
        continue;
      }
      matchedCards += card.qty;
      logProbability += Math.log(weight / 2048) * card.qty;
    }

    const totalCards = gainedCards.reduce((sum, card) => sum + card.qty, 0);
    const possible = impossibleCardIds.length === 0;
    return {
      dropPool,
      possible,
      matchedCards,
      totalCards,
      logProbability: possible ? logProbability : null,
      impossibleCardIds,
    };
  });
}

function weightsForDropPool(duelist: BridgeDuelist, dropPool: DropPool): number[] {
  if (dropPool === "SA-POW") return duelist.saPow;
  if (dropPool === "SA-TEC") return duelist.saTec;
  return duelist.bcd;
}

function findBestPool(matches: RewardEvidence["poolMatches"]): DropPool | null {
  const possible = matches.filter((match) => match.possible);
  if (possible.length === 0) {
    const best = [...matches].sort((a, b) => b.matchedCards - a.matchedCards)[0];
    return best?.dropPool ?? null;
  }
  possible.sort((a, b) => (b.logProbability ?? -Infinity) - (a.logProbability ?? -Infinity));
  return possible[0]?.dropPool ?? null;
}

function buildX15Match(
  duelist: BridgeDuelist,
  visiblePool: DropPool | null,
  hiddenPool: DropPool | null,
  gainedCards: Array<{ cardId: number; qty: number }>,
  hiddenPoolSource: X15HiddenPoolSource,
): RewardEvidence["x15Match"] {
  if (!visiblePool || !hiddenPool) return null;

  const visibleWeights = weightsForDropPool(duelist, visiblePool);
  const hiddenWeights = weightsForDropPool(duelist, hiddenPool);
  const totalCards = gainedCards.reduce((sum, card) => sum + card.qty, 0);
  let bestMatchedCards = 0;
  let bestLogProbability: number | null = null;
  const possibleVisibleCardIds: number[] = [];

  for (const visibleCard of gainedCards) {
    const visibleWeight = visibleWeights[visibleCard.cardId - 1] ?? 0;
    if (visibleWeight <= 0) continue;

    let matchedCards = 1;
    let logProbability = Math.log(visibleWeight / 2048);
    let possible = true;

    for (const card of gainedCards) {
      const hiddenQty = card.cardId === visibleCard.cardId ? card.qty - 1 : card.qty;
      if (hiddenQty <= 0) continue;

      const hiddenWeight = hiddenWeights[card.cardId - 1] ?? 0;
      if (hiddenWeight <= 0) {
        possible = false;
        continue;
      }
      matchedCards += hiddenQty;
      logProbability += Math.log(hiddenWeight / 2048) * hiddenQty;
    }

    if (matchedCards > bestMatchedCards) bestMatchedCards = matchedCards;
    if (possible) {
      possibleVisibleCardIds.push(visibleCard.cardId);
      if (bestLogProbability === null || logProbability > bestLogProbability) {
        bestLogProbability = logProbability;
      }
    }
  }

  return {
    visiblePool,
    hiddenPool,
    hiddenPoolSource,
    possible: possibleVisibleCardIds.length > 0,
    matchedCards: possibleVisibleCardIds.length > 0 ? totalCards : bestMatchedCards,
    totalCards,
    logProbability: bestLogProbability,
    possibleVisibleCardIds,
  };
}

function inferX15Match(
  duelist: BridgeDuelist,
  visiblePool: DropPool | null,
  gainedCards: Array<{ cardId: number; qty: number }>,
): RewardEvidence["x15Match"] {
  if (!visiblePool) return null;

  const matches = DROP_POOLS.map((hiddenPool) =>
    buildX15Match(duelist, visiblePool, hiddenPool, gainedCards, "inferred"),
  ).filter((match): match is NonNullable<RewardEvidence["x15Match"]> => match !== null);
  const rankPoolMatch = matches.find((match) => match.hiddenPool === visiblePool);
  if (rankPoolMatch?.possible) return rankPoolMatch;

  matches.sort((a, b) => {
    if (a.possible !== b.possible) return a.possible ? -1 : 1;
    if (a.matchedCards !== b.matchedCards) return b.matchedCards - a.matchedCards;
    return (b.logProbability ?? -Infinity) - (a.logProbability ?? -Infinity);
  });
  return matches[0] ?? null;
}

function dropPoolFromSelector(selector: number | undefined): DropPool | null {
  if (selector === 0) return "SA-POW";
  if (selector === 1) return "BCD";
  if (selector === 2) return "SA-TEC";
  return null;
}
