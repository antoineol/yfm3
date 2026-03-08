import { useAtomValue } from "jotai";
import { resultAtom } from "../lib/atoms.ts";
import { useCardDb } from "../lib/card-db-context.tsx";
import { buildCardEntries, CardTable } from "./CardTable.tsx";
import { PanelHeader } from "./panel-chrome.tsx";

export function ResultPanel() {
  const result = useAtomValue(resultAtom);
  const cardDb = useCardDb();

  if (!result) {
    return (
      <>
        <PanelHeader title="Optimized Result" />
        <ResultEmptyState />
      </>
    );
  }

  const counts = new Map<number, number>();
  for (const id of result.deck) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const entries = buildCardEntries(counts, cardDb);

  return (
    <>
      <PanelHeader title="Optimized Result" badge={`${result.deck.length} cards`} />
      <div className="flex flex-wrap gap-3 mb-4">
        <StatCard label="Expected ATK" value={result.expectedAtk.toFixed(1)} hero />
        {result.currentDeckScore != null && (
          <StatCard label="Current Deck" value={result.currentDeckScore.toFixed(1)} />
        )}
        {result.improvement != null && (
          <StatCard
            label="Improvement"
            value={`\u25b2 ${result.improvement.toFixed(1)}`}
            variant="up"
          />
        )}
        <StatCard label="Elapsed" value={`${(result.elapsedMs / 1000).toFixed(1)}s`} small />
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <CardTable entries={entries} />
      </div>
    </>
  );
}

function ResultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-gold/60 font-display text-sm uppercase tracking-wide">
        Awaiting optimization
      </p>
      <div
        className="w-32 h-0.5 rounded-full mt-2"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hero,
  variant,
  small,
}: {
  label: string;
  value: string;
  hero?: boolean;
  variant?: "up";
  small?: boolean;
}) {
  const valueColor = variant === "up" ? "text-stat-up" : hero ? "text-gold" : "text-text-primary";
  return (
    <div className="flex-1 min-w-[100px] bg-bg-surface border border-border-accent rounded-lg p-3">
      <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">{label}</div>
      <div
        className={`font-mono font-bold ${valueColor} ${hero ? "text-2xl" : small ? "text-sm" : "text-lg"}`}
      >
        {value}
      </div>
    </div>
  );
}
