import type { ReactNode } from "react";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import type { FocusedZone } from "../hand/use-zone-toggle.ts";
import { ZoneArena } from "../hand/ZoneArena.tsx";

export function DuelZoneView({
  focusedZone,
  onSwitchZone,
  handNode,
  handCount,
  fieldNode,
  fieldCount,
}: {
  focusedZone: FocusedZone;
  onSwitchZone: (zone: FocusedZone) => void;
  handNode: ReactNode;
  handCount: number;
  fieldNode: ReactNode;
  fieldCount: number;
}) {
  return (
    <ZoneArena
      field={{ children: fieldNode, count: fieldCount, maxCount: 5 }}
      focusedZone={focusedZone}
      hand={{ children: handNode, count: handCount, maxCount: HAND_SIZE }}
      onSwitchZone={onSwitchZone}
    />
  );
}
