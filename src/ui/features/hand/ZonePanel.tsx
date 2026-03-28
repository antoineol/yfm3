export function ZonePanel({
  active,
  label,
  count,
  maxCount,
  children,
}: {
  active: boolean;
  label: string;
  count: number;
  maxCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`fm-zone ${active ? "fm-zone--active" : "fm-zone--inactive"}`}>
      <div className="fm-zone-header">
        <span className="fm-zone-header-label">{label}</span>
        <span className="fm-zone-header-count">
          {String(count)}/{String(maxCount)}
        </span>
      </div>
      {children}
    </div>
  );
}
