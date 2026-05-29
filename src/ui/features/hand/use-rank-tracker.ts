import { useEffect, useMemo, useRef } from "react";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import type {
  RankBreakdown,
  RankFactors,
  RankScoringConfig,
  RankScoringProfile,
  VictoryType,
} from "../../../engine/ranking/rank-scoring.ts";
import { computeRankBreakdown } from "../../../engine/ranking/rank-scoring.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { BridgeState } from "../../lib/bridge-message-processor.ts";

// ── Types ──────────────────────────────────────────────────────────────

export interface RankTrackerState {
  breakdown: RankBreakdown;
  scoring: RankScoringConfig;
  isPartial: boolean;
  estimatedFactorNames: readonly string[];
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

const FACTOR_NAME_BY_KEY: Record<keyof RankFactors, string> = {
  turns: "Turns",
  effectiveAttacks: "Eff. attacks",
  defensiveWins: "Def. wins",
  faceDownPlays: "Face-downs",
  fusionsInitiated: "Fusions",
  equipMagicUsed: "Equips",
  pureMagicUsed: "Magic",
  trapsTriggered: "Traps",
  remainingCards: "Cards left",
  remainingLp: "Remaining LP",
};

// ── Hook ───────────────────────────────────────────────────────────────

export function useRankTracker(): RankTrackerState {
  const bridge = useBridge();
  const lastBreakdownRef = useRef<RankBreakdown | null>(null);

  const isDuelActive = bridge.inDuel;
  const isDuelEnded = bridge.phase === "ended";
  const isVisible = bridge.status === "connected" && (isDuelActive || isDuelEnded);
  const scoring = bridge.gameData?.rankScoring ?? getRankProfile(bridge.modFingerprint);

  const factors = useMemo((): RankFactors => {
    return rankFactorsForBridge({
      stats: bridge.stats,
      shuffledDeck: bridge.shuffledDeck,
      lp: bridge.lp,
    });
  }, [bridge.stats, bridge.shuffledDeck, bridge.lp]);
  const estimatedFactorNames = useMemo(
    () =>
      estimatedRankFactorNames({
        stats: bridge.stats,
        shuffledDeck: bridge.shuffledDeck,
        lp: bridge.lp,
      }),
    [bridge.stats, bridge.shuffledDeck, bridge.lp],
  );
  const isPartial = estimatedFactorNames.length > 0;

  const victoryType: VictoryType = "normal";

  const breakdown = useMemo(
    () => computeRankBreakdown(factors, victoryType, scoring),
    [factors, scoring],
  );

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
    scoring,
    isPartial,
    estimatedFactorNames,
    isDuelActive,
    isDuelEnded,
    isVisible,
  };
}

export function rankFactorsForBridge(
  bridge: Pick<BridgeState, "stats" | "shuffledDeck" | "lp">,
): RankFactors {
  if (bridge.stats?.rankCounters != null && bridge.stats.rankCounters.length === 10) {
    const counters = bridge.stats.rankCounters;
    const result: Record<string, number> = {};
    for (let i = 0; i < RANK_COUNTER_KEYS.length; i++) {
      const key = RANK_COUNTER_KEYS[i];
      if (key) result[key] = counters[i] ?? NEUTRAL_FACTORS[key];
    }
    return result as unknown as RankFactors;
  }

  // Partial mode: use what we have, fill the rest with neutral values.
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
}

export function estimatedRankFactorNames(
  bridge: Pick<BridgeState, "stats" | "shuffledDeck" | "lp">,
): readonly string[] {
  const counters = bridge.stats?.rankCounters;
  if (counters != null && counters.length === 10) {
    const missing: string[] = [];
    for (let i = 0; i < RANK_COUNTER_KEYS.length; i++) {
      const key = RANK_COUNTER_KEYS[i];
      if (key && counters[i] == null) missing.push(FACTOR_NAME_BY_KEY[key]);
    }
    return missing;
  }

  const estimated: string[] = [
    "Turns",
    "Eff. attacks",
    "Def. wins",
    "Face-downs",
    "Equips",
    "Magic",
    "Traps",
  ];
  if (bridge.stats == null) estimated.push("Fusions");
  if (bridge.shuffledDeck == null) estimated.push("Cards left");
  if (bridge.lp == null) estimated.push("Remaining LP");
  return estimated;
}

function getRankProfile(fingerprint: string | null): RankScoringProfile {
  return fingerprint && modIdForFingerprint(fingerprint) === "rp" ? "rp" : "vanilla";
}
