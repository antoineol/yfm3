import type { ReactNode } from "react";
import { ZonePanel } from "./ZonePanel.tsx";

/**
 * 3D zone arena that renders hand and field zones with a focus toggle.
 * The focused zone appears in front; clicking the background zone switches focus.
 */
export function ZoneArena({
  focusedZone,
  onSwitchZone,
  hand,
  field,
}: {
  focusedZone: "hand" | "field";
  onSwitchZone: (zone: "hand" | "field") => void;
  hand: { count: number; maxCount: number; children: ReactNode };
  field: { count: number; maxCount: number; children: ReactNode };
}) {
  const zones =
    focusedZone === "hand" ? (["hand", "field"] as const) : (["field", "hand"] as const);

  return (
    <div className="fm-zone-arena -mb-10">
      {zones.map((zone) => (
        <div className="fm-zone-slot" key={zone} style={{ viewTransitionName: `${zone}-zone` }}>
          <ZonePanel
            active={focusedZone === zone}
            count={zone === "hand" ? hand.count : field.count}
            label={zone === "hand" ? "Hand" : "Field"}
            maxCount={zone === "hand" ? hand.maxCount : field.maxCount}
          >
            {zone === "hand" ? hand.children : field.children}
          </ZonePanel>
          {focusedZone !== zone && (
            <button
              aria-label={`Switch to ${zone}`}
              className="fm-zone-focus-btn"
              onClick={() => onSwitchZone(zone)}
              type="button"
            />
          )}
        </div>
      ))}
    </div>
  );
}
