import type { ReactNode } from "react";

export function PanelCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-0 flex flex-col min-w-0 bg-bg-panel border border-border-subtle rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-baseline gap-3 pb-3 mb-3 border-b border-border-subtle">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">{title}</h2>
      {badge && <span className="text-xs text-text-secondary">{badge}</span>}
    </div>
  );
}

export function PanelLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 border-2 border-gold-dim border-t-gold rounded-full animate-[spin-gold_1s_linear_infinite]" />
      <div className="space-y-2 w-full max-w-xs">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 rounded bg-bg-surface"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-hover) 50%, var(--color-bg-surface) 75%)",
              backgroundSize: "200% 100%",
              animation: `shimmer 1.5s ease-in-out infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function PanelEmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-16 border-2 border-text-muted rounded-lg opacity-40" />
      <p className="text-text-secondary">{title}</p>
      <p className="text-xs text-text-muted">{subtitle}</p>
    </div>
  );
}
