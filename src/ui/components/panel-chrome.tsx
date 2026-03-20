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
      className={`min-h-0 flex flex-col min-w-0 bg-bg-panel border border-border-subtle rounded-xl p-3 shadow-panel ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  badge,
  children,
  stretch,
  bottomBar,
}: {
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
  /** When true, the children area fills remaining header space instead of shrink-wrapping. */
  stretch?: boolean;
  /** Overlay rendered on top of the bottom border (e.g. progress bar). */
  bottomBar?: ReactNode;
}) {
  return (
    <div className="relative flex items-center gap-3 pb-3 mb-2 border-b border-border-subtle">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold shrink-0">
        {title}
      </h2>
      {badge && <span className="text-xs text-text-secondary shrink-0">{badge}</span>}
      {children && (
        <div className={`-my-2 ${stretch ? "flex-1 min-w-0" : "ml-auto shrink-0"}`}>{children}</div>
      )}
      {bottomBar && (
        <div className="absolute -bottom-px left-0 right-0 h-1 lg:h-0.5 z-10">{bottomBar}</div>
      )}
    </div>
  );
}

export function PanelLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-gold-dim border-t-gold rounded-full animate-spin-gold" />
      <div className="space-y-2 w-full max-w-xs">
        {[1, 2, 3].map((i) => (
          <div
            className="h-4 rounded bg-bg-surface"
            key={i}
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

export function PanelBody({ children }: { children: ReactNode }) {
  return <div className="lg:max-xl:max-h-[70vh] flex-1 overflow-y-auto">{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-xs font-semibold uppercase tracking-widest text-gold-dim">
      {children}
    </span>
  );
}
