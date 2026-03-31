import { useEffect, useMemo, useState } from "react";
import type { RankBreakdown } from "../../../engine/ranking/rank-scoring.ts";
import type { TargetRank } from "../../../engine/ranking/rank-spectrum.ts";
import {
  SPECTRUM_SEGMENTS,
  scoreToColor,
  scoreToPosition,
  scoreToSegmentIndex,
  TARGET_RANK_OPTIONS,
  targetRankToSegmentIndex,
} from "../../../engine/ranking/rank-spectrum.ts";
import { type RankTrackerState, useRankTracker } from "./use-rank-tracker.ts";

// ── Main component ────────────────────────────────────────────────────

export function RankTracker() {
  const tracker = useRankTracker();
  if (!tracker.isVisible) return null;

  return (
    <div className="fm-rank-tracker">
      <RankTrackerHeader tracker={tracker} />
      <RankTrackerDetails tracker={tracker} />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────

function RankTrackerHeader({ tracker }: { tracker: RankTrackerState }) {
  const { breakdown, isDuelEnded } = tracker;
  const label = isDuelEnded ? "FINAL RANK" : "RANK";

  return (
    <div className="fm-rank-header">
      <span
        className="text-xs font-display shrink-0"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
      <SpectrumBar breakdown={breakdown} targetRank={tracker.targetRank} />
      <TargetRankSelect onChange={tracker.setTargetRank} value={tracker.targetRank} />
    </div>
  );
}

// ── Spectrum bar ──────────────────────────────────────────────────────

function SpectrumBar({
  breakdown,
  targetRank,
}: {
  breakdown: RankBreakdown;
  targetRank: TargetRank;
}) {
  const position = scoreToPosition(breakdown.total);
  const targetIdx = targetRankToSegmentIndex(targetRank);
  const scoreColor = scoreToColor(breakdown.total);

  return (
    <div className="fm-rank-bar">
      <div className="flex w-full h-full rounded-sm overflow-hidden">
        {SPECTRUM_SEGMENTS.map((seg, i) => (
          <div
            className={`fm-rank-segment ${i === targetIdx ? "fm-rank-segment--target" : ""}`}
            key={seg.label}
            style={{ backgroundColor: seg.color }}
          />
        ))}
      </div>
      <div
        className="fm-rank-indicator"
        style={{
          left: `${String(position * 100)}%`,
          color: scoreColor,
        }}
      >
        <span className="fm-rank-indicator-diamond" />
        <span className="fm-rank-indicator-score font-mono text-xs">{breakdown.total}</span>
      </div>
    </div>
  );
}

// ── Target rank dropdown ──────────────────────────────────────────────

function TargetRankSelect({
  value,
  onChange,
}: {
  value: TargetRank;
  onChange: (rank: TargetRank) => void;
}) {
  return (
    <select
      className="fm-rank-target-select text-xs font-body"
      onChange={(e) => onChange(e.target.value as TargetRank)}
      value={value}
    >
      {TARGET_RANK_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ── Expandable details ────────────────────────────────────────────────

function RankTrackerDetails({ tracker }: { tracker: RankTrackerState }) {
  const [open, setOpen] = useState(false);

  // Collapse when a new duel starts
  useEffect(() => {
    if (tracker.isDuelActive) {
      setOpen(false);
    }
  }, [tracker.isDuelActive]);

  const sortedFactors = useMemo(
    () => buildSortedFactors(tracker.breakdown, tracker.isPartial),
    [tracker.breakdown, tracker.isPartial],
  );

  const scoreColor = scoreToColor(tracker.breakdown.total);
  const rankLabel = tracker.breakdown.rank.label;
  const segmentIdx = scoreToSegmentIndex(tracker.breakdown.total);
  const targetIdx = targetRankToSegmentIndex(tracker.targetRank);
  const inTarget = segmentIdx === targetIdx;

  return (
    <>
      <button
        className="fm-rank-details-toggle"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span className="font-display text-sm" style={{ color: scoreColor }}>
            {rankLabel}
          </span>
          {inTarget && (
            <span className="text-xs" style={{ color: "var(--color-stat-up)" }}>
              on target
            </span>
          )}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {open ? "Hide details" : "Show details"}
        </span>
      </button>
      <div className={`fm-rank-details ${open ? "fm-rank-details--open" : ""}`}>
        <div className="fm-rank-details-inner">
          <div className="fm-rank-factor-list">
            {sortedFactors.map((f) => (
              <FactorRow factor={f} key={f.name} targetRank={tracker.targetRank} />
            ))}
            <VictoryBonusRow bonus={tracker.breakdown.victoryBonus} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Factor rows ───────────────────────────────────────────────────────

interface SortedFactor {
  name: string;
  rawValue: number;
  points: number;
  minPoints: number;
  maxPoints: number;
  isEstimated: boolean;
}

/** Factor keys that are estimated (not read from RAM) in partial mode. */
const PARTIAL_ESTIMATED_KEYS = new Set([
  "Turns",
  "Eff. attacks",
  "Def. wins",
  "Face-downs",
  "Equips",
  "Magic",
  "Traps",
]);

function buildSortedFactors(breakdown: RankBreakdown, isPartial: boolean): SortedFactor[] {
  return breakdown.factors
    .map((f) => ({
      ...f,
      isEstimated: isPartial && PARTIAL_ESTIMATED_KEYS.has(f.name),
    }))
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
}

function FactorRow({ factor, targetRank }: { factor: SortedFactor; targetRank: TargetRank }) {
  const colorClass = getFactorColorClass(factor.points, targetRank);
  const barStyle = computeMiniBarStyle(factor);

  return (
    <div className={`fm-rank-factor ${factor.isEstimated ? "fm-rank-factor--estimated" : ""}`}>
      <span className="fm-rank-factor-name text-xs">{factor.name}</span>
      <span className="fm-rank-factor-count text-xs font-mono tabular-nums">{factor.rawValue}</span>
      <span className={`fm-rank-factor-points text-xs font-mono tabular-nums ${colorClass}`}>
        {formatPoints(factor.points)}
      </span>
      <div className="fm-rank-factor-bar">
        <div className={`fm-rank-factor-bar-fill ${colorClass}`} style={barStyle} />
      </div>
    </div>
  );
}

function VictoryBonusRow({ bonus }: { bonus: number }) {
  return (
    <div className="fm-rank-factor fm-rank-factor--victory">
      <span className="fm-rank-factor-name text-xs">Win type</span>
      <span className="fm-rank-factor-count text-xs font-mono" />
      <span className="fm-rank-factor-points text-xs font-mono tabular-nums text-text-muted">
        {formatPoints(bonus)}
      </span>
      <span className="fm-rank-factor-bar" />
    </div>
  );
}

function formatPoints(pts: number): string {
  if (pts > 0) return `+${String(pts)}`;
  return String(pts);
}

// ── Color logic ───────────────────────────────────────────────────────

function getFactorColorClass(points: number, targetRank: TargetRank): string {
  if (points === 0) return "text-text-muted";

  // BCD targets: no directional coloring
  if (targetRank === "BCD") return "text-text-secondary";

  // POW targets: higher score = better → positive = green, negative = red
  const isPow = targetRank === "S-POW" || targetRank === "A-POW";
  if (isPow) {
    return points > 0 ? "text-stat-up" : "text-stat-atk";
  }

  // TEC targets: lower score = better → negative = green, positive = red (reversed)
  return points < 0 ? "text-stat-up" : "text-stat-atk";
}

// ── Mini bar computation ──────────────────────────────────────────────

function computeMiniBarStyle(factor: SortedFactor): React.CSSProperties {
  const range = factor.maxPoints - factor.minPoints;
  if (range === 0) return {};

  const centerPct = ((0 - factor.minPoints) / range) * 100;
  const valuePct = ((factor.points - factor.minPoints) / range) * 100;

  if (factor.points >= 0) {
    // Bar extends right from center
    const widthPct = valuePct - centerPct;
    return {
      left: `${String(centerPct)}%`,
      width: `${String(Math.abs(widthPct))}%`,
    };
  }

  // Bar extends left from center
  const widthPct = centerPct - valuePct;
  return {
    left: `${String(valuePct)}%`,
    width: `${String(Math.abs(widthPct))}%`,
  };
}
