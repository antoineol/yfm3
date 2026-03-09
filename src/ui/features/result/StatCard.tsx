export function StatItem({
  label,
  value,
  hero,
  variant,
  muted,
}: {
  label: string;
  value: string;
  hero?: boolean;
  variant?: "up";
  muted?: boolean;
}) {
  const color =
    variant === "up"
      ? "text-stat-up"
      : hero
        ? "text-gold"
        : muted
          ? "text-text-muted"
          : "text-text-primary";
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      <span className={`font-mono font-bold ${color} ${hero ? "text-lg" : "text-sm"}`}>
        {value}
      </span>
    </div>
  );
}
