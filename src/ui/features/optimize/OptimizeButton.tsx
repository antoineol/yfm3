import { useOptimize } from "./use-optimize.ts";

export function OptimizeButton() {
  const { optimize, isOptimizing, canOptimize } = useOptimize();

  return (
    <button
      type="button"
      disabled={!canOptimize}
      onClick={optimize}
      className={`px-5 py-1.5 rounded-md font-bold uppercase tracking-wider text-sm transition-all
        ${isOptimizing
          ? "bg-gold text-bg-deep animate-[pulse-glow_2s_ease-in-out_infinite]"
          : canOptimize
            ? "bg-gold text-bg-deep hover:bg-gold-bright hover:shadow-[0_0_20px_var(--color-gold-dim)] cursor-pointer"
            : "bg-gold-dim/40 text-text-muted cursor-not-allowed"
        }`}
    >
      {isOptimizing ? "Optimizing\u2026" : "Optimize Deck"}
    </button>
  );
}
