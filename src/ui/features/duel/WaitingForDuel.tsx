export function WaitingForDuel() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            className="w-10 h-14 sm:w-12 sm:h-16 rounded border border-gold-dim/30 bg-bg-surface/60 animate-pulse"
            key={i}
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-border-subtle) 25%, transparent 25%, transparent 50%, var(--color-border-subtle) 50%, var(--color-border-subtle) 75%, transparent 75%)",
              backgroundSize: "8px 8px",
              opacity: 0.35,
              animationDelay: `${String(i * 150)}ms`,
            }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-text-secondary text-sm font-medium">Start a duel to see your hand</p>
        <p className="text-text-muted/60 text-xs">
          Your best fusion plays will appear here automatically
        </p>
      </div>
    </div>
  );
}
