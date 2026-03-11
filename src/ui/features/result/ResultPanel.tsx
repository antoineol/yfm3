import { PanelHeader } from "../../components/panel-chrome.tsx";
import { OptimizeButton } from "../optimize/OptimizeButton.tsx";
import { useOptimize } from "../optimize/use-optimize.ts";
import { OptimizationProgress } from "./OptimizationProgress.tsx";
import { SuggestedDeckComparison } from "./SuggestedDeckComparison.tsx";
import { useResultEntries } from "./use-result-entries.ts";

export function ResultPanel() {
  const data = useResultEntries();
  const { isOptimizing, optimize, cancel } = useOptimize();

  if (!data) {
    return (
      <>
        <PanelHeader title="Optimized Result" />
        {isOptimizing ? <OptimizationProgress onCancel={cancel} /> : <ResultEmptyState />}
      </>
    );
  }

  return (
    <>
      <PanelHeader badge={`${data.result.deck.length} cards`} title="Optimized Result" />
      <SuggestedDeckComparison data={data} onOptimize={optimize} />
    </>
  );
}

function ResultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <p className="text-gold/60 font-display text-sm uppercase tracking-wide">
        Awaiting optimization
      </p>
      <div
        className="w-32 h-0.5 rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)",
        }}
      />
      <OptimizeButton />
    </div>
  );
}
