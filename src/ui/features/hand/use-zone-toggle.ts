import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import type { DuelPhase } from "../../lib/use-emulator-bridge.ts";

export type FocusedZone = "hand" | "field";

/**
 * Animated hand/field zone toggle with phase-based auto-switching.
 * Uses the View Transitions API for smooth DOM-order swaps.
 */
export function useZoneToggle(isSynced: boolean, phase: DuelPhase) {
  const [focusedZone, setFocusedZone] = useState<FocusedZone>("hand");

  const animatedSetZone = useCallback((zone: FocusedZone) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setFocusedZone(zone));
      });
    } else {
      setFocusedZone(zone);
    }
  }, []);

  useEffect(() => {
    if (!isSynced) {
      setFocusedZone("hand");
      return;
    }
    if (phase === "hand" || phase === "draw") {
      animatedSetZone("hand");
    } else if (phase !== "other") {
      animatedSetZone("field");
    }
  }, [phase, isSynced, animatedSetZone]);

  return { focusedZone, animatedSetZone };
}
