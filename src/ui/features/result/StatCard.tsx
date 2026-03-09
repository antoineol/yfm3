export function StatCard({
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
