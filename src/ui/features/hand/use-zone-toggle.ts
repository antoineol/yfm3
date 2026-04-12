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

  // Click path: state update must happen inside the view-transition
  // callback for the browser to capture the post-state snapshot, hence
  // `flushSync`. The card modal suppresses the animation (pseudo-elements
  // would paint above it).
  const switchZoneFromClick = useCallback(
    (zone: FocusedZone) => {
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

  // Phase-driven auto-switch runs inside a post-commit `useEffect`, so
  // the view-transition API can observe the DOM mutation without
  // `flushSync` — React batches the setState into the normal commit.
  const switchZoneFromPhase = useCallback((zone: FocusedZone) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setFocusedZone(zone);
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
      switchZoneFromPhase("hand");
    } else if (phase !== "other") {
      switchZoneFromPhase("field");
    }
  }, [phase, isSynced, switchZoneFromPhase]);

  return { focusedZone, switchZone: switchZoneFromClick };
}
