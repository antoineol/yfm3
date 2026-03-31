import { useEffect, useMemo, useRef } from "react";
import type {
  RankBreakdown,
  RankFactors,
  VictoryType,
} from "../../../engine/ranking/rank-scoring.ts";
import { computeRankBreakdown } from "../../../engine/ranking/rank-scoring.ts";
import { useBridge } from "../../lib/bridge-context.tsx";

// ── Types ──────────────────────────────────────────────────────────────

export interface RankTrackerState {
  breakdown: RankBreakdown;
  isPartial: boolean;
  isDuelActive: boolean;
  isDuelEnded: boolean;
  isVisible: boolean;
}

// ── Neutral factor values (produce 0 score contribution where possible) ──

const NEUTRAL_FACTORS: RankFactors = {
  turns: 15, // 9..28 → 0
  effectiveAttacks: 5, // 4..9 → 0
  defensiveWins: 0, // <2 → 0
  faceDownPlays: 0, // <1 → 0
  fusionsInitiated: 2, // 1..4 → 0
  equipMagicUsed: 2, // 1..4 → 0
  pureMagicUsed: 0, // <1 → +2 (no 0-point bucket exists)
  trapsTriggered: 0, // <1 → +2 (no 0-point bucket exists)
  remainingCards: 15, // 8..27 → 0
  remainingLp: 4000, // 1000..6999 → 0
};

/** Keys of RankFactors in the same order as rankCounters from RAM. */
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

// ── Hook ───────────────────────────────────────────────────────────────

export function useRankTracker(): RankTrackerState {
  const bridge = useBridge();
  const lastBreakdownRef = useRef<RankBreakdown | null>(null);

  const isDuelActive = bridge.inDuel;
  const isDuelEnded = bridge.phase === "ended";
  const isVisible = bridge.status === "connected" && (isDuelActive || isDuelEnded);

  const hasFullCounters =
    bridge.stats?.rankCounters != null && bridge.stats.rankCounters.length === 10;
  const isPartial = !hasFullCounters;

  const factors = useMemo((): RankFactors => {
    if (hasFullCounters) {
      const counters = bridge.stats?.rankCounters ?? [];
      const result: Record<string, number> = {};
      for (let i = 0; i < RANK_COUNTER_KEYS.length; i++) {
        const key = RANK_COUNTER_KEYS[i];
        if (key) result[key] = counters[i] ?? 0;
      }
      return result as unknown as RankFactors;
    }

    // Partial mode: use what we have, fill the rest with neutral values
    const remainingCards =
      bridge.shuffledDeck != null
        ? bridge.shuffledDeck.filter((id) => id !== 0).length
        : NEUTRAL_FACTORS.remainingCards;
    const remainingLp = bridge.lp != null ? bridge.lp[0] : NEUTRAL_FACTORS.remainingLp;
    const fusionsInitiated = bridge.stats?.fusions ?? NEUTRAL_FACTORS.fusionsInitiated;

    return {
      ...NEUTRAL_FACTORS,
      fusionsInitiated,
      remainingCards,
      remainingLp,
    };
  }, [hasFullCounters, bridge.stats, bridge.shuffledDeck, bridge.lp]);

  const victoryType: VictoryType = "normal";

  const breakdown = useMemo(() => computeRankBreakdown(factors, victoryType), [factors]);

  // Freeze breakdown at duel end (store last value before inDuel goes false)
  useEffect(() => {
    if (isDuelActive || isDuelEnded) {
      lastBreakdownRef.current = breakdown;
    }
  }, [breakdown, isDuelActive, isDuelEnded]);

  // During ended state, return the frozen breakdown if the current one
  // has reverted to default (no bridge data). Otherwise return the live one.
  const effectiveBreakdown =
    isDuelEnded && !isDuelActive && lastBreakdownRef.current != null
      ? lastBreakdownRef.current
      : breakdown;

  return {
    breakdown: effectiveBreakdown,
    isPartial,
    isDuelActive,
    isDuelEnded,
    isVisible,
  };
}
