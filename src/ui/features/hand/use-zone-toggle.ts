import { useStore } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { openCardIdAtom } from "../../lib/atoms.ts";
import type { DuelPhase } from "../../lib/bridge-state-interpreter.ts";

export type FocusedZone = "hand" | "field";

/**
 * Animated hand/field zone toggle with phase-based auto-switching.
 * Uses the View Transitions API for smooth DOM-order swaps.
 */
export function useZoneToggle(isSynced: boolean, phase: DuelPhase) {
  const [focusedZone, setFocusedZone] = useState<FocusedZone>("hand");
  const store = useStore();

  const animatedSetZone = useCallback(
    (zone: FocusedZone) => {
      // Skip view-transition animation when the card modal is open —
      // the transition pseudo-elements render in the top layer and
      // would paint above the modal.
      const modalOpen = store.get(openCardIdAtom) !== null;
      if (document.startViewTransition && !modalOpen) {
        document.startViewTransition(() => {
          flushSync(() => setFocusedZone(zone));
        });
      } else {
        setFocusedZone(zone);
      }
    },
    [store],
  );

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
