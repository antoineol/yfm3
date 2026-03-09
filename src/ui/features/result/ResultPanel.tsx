import { useAtomValue } from "jotai";
import { CardTable } from "../../components/CardTable.tsx";
import { PanelHeader } from "../../components/panel-chrome.tsx";
import { isOptimizingAtom } from "../../lib/atoms.ts";
import { StatItem } from "./StatCard.tsx";
import { useResultEntries } from "./use-result-entries.ts";

export function ResultPanel() {
  const data = useResultEntries();
  const isOptimizing = useAtomValue(isOptimizingAtom);

  if (!data) {
    return (
      <>
        <PanelHeader title="Optimized Result" />
        {isOptimizing ? <ResultLoadingState /> : <ResultEmptyState />}
      </>
    );
  }

  const { entries, result } = data;

  return (
    <>
      <PanelHeader badge={`${result.deck.length} cards`} title="Optimized Result" />
      <div className="flex items-baseline flex-wrap gap-x-5 gap-y-2 mb-3">
        <StatItem hero label="Expected ATK" value={result.expectedAtk.toFixed(1)} />
        {result.currentDeckScore != null && (
          <StatItem label="Current Deck" value={result.currentDeckScore.toFixed(1)} />
        )}
        {result.improvement != null && (
          <StatItem
            label="Improvement"
            value={`\u25b2 ${result.improvement.toFixed(1)}`}
            variant="up"
          />
        )}
        <StatItem label="Elapsed" muted value={`${(result.elapsedMs / 1000).toFixed(1)}s`} />
      </div>
      <div className="max-h-[70vh] flex-1 overflow-y-auto">
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
        }}
      />
    </div>
  );
}

function ResultLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-gold font-display text-sm uppercase tracking-wide">Optimizing&hellip;</p>
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
