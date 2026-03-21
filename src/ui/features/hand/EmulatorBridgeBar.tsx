import type { DuelPhase, EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

const TERRAIN_NAMES: Record<number, string> = {
  0: "Normal",
  1: "Forest",
  2: "Wasteland",
  3: "Mountain",
  4: "Meadow",
  5: "Sea",
  6: "Dark",
};

export function EmulatorBridgeBar({ bridge }: { bridge: EmulatorBridge }) {
  if (!bridge.inDuel) {
    const isEnded = bridge.phase === "ended";
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary text-xs">
        <StatusDot color={isEnded ? "green" : "yellow"} />
        <span className="text-text-muted">
          {isEnded ? "Duel complete" : "Connected — waiting for duel"}
        </span>
        {isEnded && bridge.lp && (
          <span className="ml-auto text-text-muted tabular-nums">
            LP {String(bridge.lp[0])} vs {String(bridge.lp[1])}
          </span>
        )}
      </div>
    );
  }

  // ── In duel ──────────────────────────────────────────────────────
  const phaseInfo = PHASE_CONFIG[bridge.phase];
  const terrain = bridge.stats ? (TERRAIN_NAMES[bridge.stats.terrain] ?? "Unknown") : null;

  return (
    <div className={`rounded-lg text-xs transition-colors ${phaseInfo.bg}`}>
      {/* Phase + LP row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <StatusDot color={phaseInfo.dotColor} pulse={phaseInfo.pulse} />
        <span className={phaseInfo.textColor}>{phaseInfo.label}</span>
        {bridge.lp && (
          <span className="ml-auto text-text-muted tabular-nums">
            LP {String(bridge.lp[0])} vs {String(bridge.lp[1])}
          </span>
        )}
      </div>

      {/* Stats row */}
      {bridge.stats && (
        <div className="flex items-center gap-4 px-3 pb-2 text-text-muted/70">
          {terrain && <Stat label="Terrain" value={terrain} />}
          <Stat label="Fusions" value={String(bridge.stats.fusions)} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-text-muted/50">{label}</span>{" "}
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

// ── Phase display configuration ──────────────────────────────────

type PhaseConfig = {
  label: string;
  dotColor: "green" | "yellow" | "blue" | "neutral";
  pulse?: boolean;
  bg: string;
  textColor: string;
};

const PHASE_CONFIG: Record<DuelPhase, PhaseConfig> = {
  hand: {
    label: "Your turn",
    dotColor: "green",
    bg: "bg-surface-secondary",
    textColor: "text-green-400",
  },
  draw: {
    label: "Drawing...",
    dotColor: "green",
    pulse: true,
    bg: "bg-surface-secondary",
    textColor: "text-green-400",
  },
  fusion: {
    label: "Fusing",
    dotColor: "yellow",
    pulse: true,
    bg: "bg-yellow-950/20",
    textColor: "text-yellow-400/90",
  },
  field: {
    label: "Field play",
    dotColor: "yellow",
    bg: "bg-yellow-950/20",
    textColor: "text-yellow-400/90",
  },
  battle: {
    label: "Battle",
    dotColor: "yellow",
    bg: "bg-yellow-950/20",
    textColor: "text-yellow-400/90",
  },
  opponent: {
    label: "Opponent's turn",
    dotColor: "blue",
    bg: "bg-blue-950/20",
    textColor: "text-blue-400/90",
  },
  ended: {
    label: "Duel complete",
    dotColor: "green",
    bg: "bg-surface-secondary",
    textColor: "text-green-400",
  },
  other: {
    label: "In duel",
    dotColor: "neutral",
    bg: "bg-surface-secondary",
    textColor: "text-text-muted",
  },
};

// ── Status dot ───────────────────────────────────────────────────

function StatusDot({
  color,
  pulse,
}: {
  color: "green" | "yellow" | "blue" | "neutral";
  pulse?: boolean;
}) {
  const colorClass =
    color === "green"
      ? "bg-green-400"
      : color === "yellow"
        ? "bg-yellow-400"
        : color === "blue"
          ? "bg-blue-400"
          : "bg-neutral-500";

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${colorClass} ${pulse ? "animate-pulse" : ""}`}
    />
  );
}
