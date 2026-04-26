// ---------------------------------------------------------------------------
// Zone layout helpers for the rank factor gauge UI.
//
// Transforms the raw factor definitions (thresholds + points) from
// rank-scoring into visual zone structures consumed by RankTracker.
// ---------------------------------------------------------------------------

import type { RankFactors, RankScoringConfig } from "./rank-scoring.ts";
import { getFactorDefinitions } from "./rank-scoring.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single threshold zone within a factor. */
export interface FactorZone {
  points: number;
  /** Label for the left edge of this zone cell ("" if open-ended). */
  leftLabel: string;
  /** Label for the right edge of this zone cell ("" if open-ended). */
  rightLabel: string;
  /** Numeric value at the left edge (for cursor positioning). */
  rangeStart: number;
  /** Numeric value at the right edge (for cursor positioning). */
  rangeEnd: number;
}

/** Zone layout for a factor — name, key, and all zones in display order. */
export interface FactorZoneLayout {
  name: string;
  key: keyof RankFactors;
  zones: FactorZone[];
}

// ── Internals ─────────────────────────────────────────────────────────────────

type FactorDef = { name: string; key: keyof RankFactors; thresholds: number[]; points: number[] };

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get zone definitions for all 10 factors, ordered TEC->POW (ascending points).
 * Zones are sorted so the leftmost zone is most TEC-friendly (lowest points)
 * and the rightmost is most POW-friendly (highest points).
 */
export function getFactorZoneDefinitions(
  scoring: RankScoringConfig = "vanilla",
): FactorZoneLayout[] {
  return getFactorDefinitions(scoring).map((def) => {
    const zones = buildFactorZones(def);
    // If points descend (POW first), reverse so TEC is on the left, POW on the right
    if (zones.length >= 2 && (zones[0]?.points ?? 0) > (zones[zones.length - 1]?.points ?? 0)) {
      zones.reverse();
      for (const zone of zones) {
        [zone.leftLabel, zone.rightLabel] = [zone.rightLabel, zone.leftLabel];
        [zone.rangeStart, zone.rangeEnd] = [zone.rangeEnd, zone.rangeStart];
      }
    }
    return { name: def.name, key: def.key, zones };
  });
}

/**
 * Determine which zone index (0-based) a raw value maps to in display order.
 * The returned index matches the zone array from getFactorZoneDefinitions().
 */
export function getActiveZoneIndex(
  factorIndex: number,
  rawValue: number,
  scoring: RankScoringConfig = "vanilla",
): number {
  const def = getFactorDefinitions(scoring)[factorIndex];
  if (!def) return 0;

  let idx = def.thresholds.length;
  for (let i = 0; i < def.thresholds.length; i++) {
    const t = def.thresholds[i];
    if (t !== undefined && rawValue < t) {
      idx = i;
      break;
    }
  }

  const isReversed =
    def.points.length >= 2 && (def.points[0] ?? 0) > (def.points[def.points.length - 1] ?? 0);
  return isReversed ? def.points.length - 1 - idx : idx;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildFactorZones(def: FactorDef): FactorZone[] {
  const isLp = def.key === "remainingLp";
  const fmt = (n: number): string => {
    if (isLp && n >= 1000 && n % 1000 === 0) return `${String(n / 1000)}k`;
    return String(n);
  };

  return def.points.map((pts, i) => {
    const isFirst = i === 0;
    const isLast = i === def.thresholds.length;

    if (isFirst) {
      const t = def.thresholds[0] ?? 1;
      return {
        points: pts,
        leftLabel: "",
        rightLabel: fmt(t - 1),
        rangeStart: 0,
        rangeEnd: t - 1,
      };
    }

    if (isLast) {
      const t = def.thresholds[def.thresholds.length - 1] ?? 0;
      return {
        points: pts,
        leftLabel: fmt(t),
        rightLabel: "",
        rangeStart: t,
        rangeEnd: t + Math.max(10, Math.round(t * 0.3)),
      };
    }

    const lower = def.thresholds[i - 1] ?? 0;
    const upperExcl = def.thresholds[i] ?? 0;
    const upperIncl = upperExcl - 1;
    return {
      points: pts,
      leftLabel: fmt(lower),
      rightLabel: isLp ? fmt(upperExcl) : fmt(upperIncl),
      rangeStart: lower,
      rangeEnd: upperIncl,
    };
  });
}
