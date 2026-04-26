import { useMemo, useState } from "react";
import type { RankBreakdown } from "../../../engine/ranking/rank-scoring.ts";
import {
  SEGMENT_WIDTHS,
  SPECTRUM_SEGMENTS,
  scoreToColor,
  scoreToPosition,
} from "../../../engine/ranking/rank-spectrum.ts";
import {
  type FactorZone,
  type FactorZoneLayout,
  getActiveZoneIndex,
  getFactorZoneDefinitions,
} from "../../../engine/ranking/rank-zone-layout.ts";
import { type RankTrackerState, useRankTracker } from "./use-rank-tracker.ts";

// ── Constants ─────────────────────────────────────────────────────────

const STORAGE_KEY = "fm-rank-details-open";

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
      <SpectrumBar breakdown={breakdown} />
    </div>
  );
}

// ── Spectrum bar ──────────────────────────────────────────────────────

function SpectrumBar({ breakdown }: { breakdown: RankBreakdown }) {
  const position = scoreToPosition(breakdown.total);
  const scoreColor = scoreToColor(breakdown.total);

  return (
    <div className="fm-rank-bar">
      <div className="flex w-full h-full rounded-sm overflow-hidden gap-px">
        {SPECTRUM_SEGMENTS.map((seg, i) => (
          <div
            className="fm-rank-segment"
            key={seg.label}
            style={{ backgroundColor: seg.color, flex: SEGMENT_WIDTHS[i] }}
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

// ── Expandable details ────────────────────────────────────────────────

function RankTrackerDetails({ tracker }: { tracker: RankTrackerState }) {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const factors = useMemo(
    () => buildFactorRows(tracker.breakdown, tracker.isPartial),
    [tracker.breakdown, tracker.isPartial],
  );
  const zoneDefinitions = useMemo(
    () => getFactorZoneDefinitions(tracker.profile),
    [tracker.profile],
  );

  const scoreColor = scoreToColor(tracker.breakdown.total);
  const rankLabel = tracker.breakdown.rank.label;

  return (
    <>
      <button className="fm-rank-details-toggle" onClick={toggleOpen} type="button">
        <span className="font-display text-sm" style={{ color: scoreColor }}>
          {rankLabel}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {open ? "Hide details" : "Show details"}
        </span>
      </button>
      <div className={`fm-rank-details ${open ? "fm-rank-details--open" : ""}`}>
        <div className="fm-rank-details-inner">
          <div className="fm-rank-factor-list">
            {factors.map((f, i) => (
              <FactorZoneRow
                factor={f}
                key={f.name}
                profile={tracker.profile}
                zoneLayout={zoneDefinitions[i]}
              />
            ))}
            <VictoryBonusRow bonus={tracker.breakdown.victoryBonus} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Factor zone rows ──────────────────────────────────────────────────

interface FactorRowData {
  name: string;
  rawValue: number;
  points: number;
  factorIndex: number;
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

function buildFactorRows(breakdown: RankBreakdown, isPartial: boolean): FactorRowData[] {
  return breakdown.factors.map((f, i) => ({
    name: f.name,
    rawValue: f.rawValue,
    points: f.points,
    factorIndex: i,
    isEstimated: isPartial && PARTIAL_ESTIMATED_KEYS.has(f.name),
  }));
}

function FactorZoneRow({
  factor,
  profile,
  zoneLayout,
}: {
  factor: FactorRowData;
  profile: RankTrackerState["profile"];
  zoneLayout: FactorZoneLayout | undefined;
}) {
  const activeIdx = getActiveZoneIndex(factor.factorIndex, factor.rawValue, profile);
  const zones = zoneLayout?.zones ?? [];
  const cursorLeft = computeCursorPosition(activeIdx, factor.rawValue, zones);

  return (
    <div className={`fm-rank-factor ${factor.isEstimated ? "fm-rank-factor--estimated" : ""}`}>
      <span className="fm-rank-factor-name text-xs">{factor.name}</span>
      <div className="fm-rank-zone-bar">
        {zones.map((zone, i) => {
          const isActive = i === activeIdx;
          return (
            <div
              className={`fm-rank-zone ${isActive ? "fm-rank-zone--active" : ""}`}
              key={zone.points}
              style={getZoneStyle(zone.points, isActive)}
            >
              <span className="fm-rank-zone-edge">{zone.leftLabel}</span>
              <span className="fm-rank-zone-points">{formatPoints(zone.points)}</span>
              <span className="fm-rank-zone-edge">{zone.rightLabel}</span>
            </div>
          );
        })}
        <div className="fm-rank-cursor" style={{ left: `${String(cursorLeft)}%` }}>
          {formatCursorValue(factor.rawValue, zoneLayout?.key)}
        </div>
      </div>
    </div>
  );
}

function VictoryBonusRow({ bonus }: { bonus: number }) {
  return (
    <div className="fm-rank-factor fm-rank-factor--victory">
      <span className="fm-rank-factor-name text-xs">Win type</span>
      <span className="fm-rank-factor-victory-pts text-xs font-mono tabular-nums text-text-muted">
        {formatPoints(bonus)}
      </span>
    </div>
  );
}

// ── Cursor position ───────────────────────────────────────────────────

/** Inset so the cursor never sits exactly at a zone boundary. */
const ZONE_INSET = 0.1;

function computeCursorPosition(activeIdx: number, rawValue: number, zones: FactorZone[]): number {
  const zone = zones[activeIdx];
  if (!zone || zones.length === 0) return 0;

  const zoneWidth = 100 / zones.length;
  let posInZone: number;

  if (zone.rangeStart === zone.rangeEnd) {
    posInZone = 0.5;
  } else {
    const raw = (rawValue - zone.rangeStart) / (zone.rangeEnd - zone.rangeStart);
    posInZone = Math.max(0, Math.min(1, raw));
  }

  // Map [0,1] → [INSET, 1-INSET] so the cursor stays visibly inside its zone
  posInZone = ZONE_INSET + posInZone * (1 - 2 * ZONE_INSET);

  return (activeIdx + posInZone) * zoneWidth;
}

function formatCursorValue(rawValue: number, key: string | undefined): string {
  if (key === "remainingLp" && rawValue >= 1000) {
    return rawValue % 1000 === 0
      ? `${String(rawValue / 1000)}k`
      : `${(rawValue / 1000).toFixed(1)}k`;
  }
  return String(rawValue);
}

function formatPoints(pts: number): string {
  if (pts > 0) return `+${String(pts)}`;
  return String(pts);
}

// ── Zone style (background alpha + adaptive text color) ──────────────

function getZoneBaseRgb(points: number): [number, number, number] {
  if (points > 0) return [232, 163, 76]; // warm (--color-rank-a-pow)
  if (points < 0) return [90, 200, 232]; // cool (--color-rank-a-tec)
  return [96, 85, 72]; // neutral (--color-rank-bcd)
}

function getZoneStyle(points: number, isActive: boolean): React.CSSProperties {
  const [r, g, b] = getZoneBaseRgb(points);
  const bgAlpha = isActive ? 0.9 : 0.3;
  const needsDarkText = isActive && points !== 0;

  return {
    backgroundColor: `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(bgAlpha)})`,
    color: needsDarkText ? "rgba(0, 0, 0, 0.9)" : "#fff",
    textShadow: needsDarkText ? "none" : "0 1px 3px rgba(0, 0, 0, 0.8)",
  };
}
