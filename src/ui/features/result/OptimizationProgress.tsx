import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button.tsx";
import { liveBestScoreAtom } from "../../lib/atoms.ts";

/** Default optimization time budget in ms (matches orchestrator DEFAULT_TIME_LIMIT). */
const TIME_BUDGET_MS = 15_000;

export function OptimizationProgress({ onCancel }: { onCancel: () => void }) {
  const liveBestScore = useAtomValue(liveBestScoreAtom);
  const { elapsed, progress } = useTimerProgress();
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-5 text-center px-6">
      <p className="text-gold font-display text-sm uppercase tracking-widest">
        Optimizing Deck&hellip;
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="relative h-2 rounded-full bg-bg-surface overflow-hidden border border-border-subtle">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, var(--color-gold-dim), var(--color-gold), var(--color-gold-bright))",
              boxShadow: "0 0 12px var(--color-gold-dim), 0 0 4px var(--color-gold)",
            }}
          />
          {/* Shimmer overlay on the filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{
              width: `${pct}%`,
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] font-mono">
          <span className="text-text-muted">{elapsed}s</span>
          <span className="text-gold-dim">{pct}%</span>
        </div>
      </div>

      {/* Live best score */}
      {liveBestScore > 0 && (
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] text-text-secondary uppercase tracking-wide">
            Best so far
          </span>
          <span className="font-mono font-bold text-gold text-lg tabular-nums">
            ~{liveBestScore.toFixed(1)}
          </span>
          <span className="text-[11px] text-text-muted">ATK</span>
        </div>
      )}

      <Button onClick={onCancel} size="sm" variant="outline">
        Cancel
      </Button>
    </div>
  );
}

/** Client-side timer that provides smooth progress independent of worker callbacks. */
function useTimerProgress(): { elapsed: number; progress: number } {
  const startRef = useRef(performance.now());
  const [state, setState] = useState({ elapsed: 0, progress: 0 });

  useEffect(() => {
    startRef.current = performance.now();
    const id = setInterval(() => {
      const elapsedMs = performance.now() - startRef.current;
      setState({
        elapsed: Math.floor(elapsedMs / 1000),
        progress: Math.min(elapsedMs / TIME_BUDGET_MS, 1),
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  return state;
}
