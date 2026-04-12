import type { DuelStats } from "../../lib/bridge-state-interpreter.ts";

export function DuelEnded({ lp, stats }: { lp: [number, number] | null; stats: DuelStats | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-gold font-display font-semibold tracking-wider uppercase text-sm">
        Duel complete
      </p>
      {lp && (
        <p className="text-text-muted text-xs tabular-nums">
          LP {String(lp[0])} vs {String(lp[1])}
        </p>
      )}
      {stats && stats.fusions > 0 && (
        <p className="text-text-muted/60 text-xs">
          {String(stats.fusions)} fusion{stats.fusions > 1 ? "s" : ""} performed
        </p>
      )}
    </div>
  );
}
