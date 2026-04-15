import { useStore } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { openCardIdAtom } from "../../lib/atoms.ts";
import type { DuelPhase } from "../../lib/bridge-state-interpreter.ts";

export type FocusedZone = "hand" | "field";

function phaseToZone(phase: DuelPhase): FocusedZone | null {
  if (phase === "hand" || phase === "draw") return "hand";
  if (phase === "other") return null;
  return "field";
}

/**
 * Animated hand/field zone toggle with phase-based auto-switching.
 * Uses the View Transitions API for smooth DOM-order swaps.
 */
export function useZoneToggle(isSynced: boolean, phase: DuelPhase) {
  const [focusedZone, setFocusedZone] = useState<FocusedZone>("hand");
  const store = useStore();

  // Track current zone in a ref so the phase effect can short-circuit
  // same-zone transitions without adding `focusedZone` to its deps
  // (which would cause the effect to re-run after user clicks).
  const focusedZoneRef = useRef(focusedZone);
  focusedZoneRef.current = focusedZone;

  // Click path: state update must happen inside the view-transition
  // callback for the browser to capture the post-state snapshot, hence
  // `flushSync`. The card modal suppresses the animation (pseudo-elements
  // would paint above it).
  const switchZoneFromClick = useCallback(
    (zone: FocusedZone) => {
      if (zone === focusedZoneRef.current) return;
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
  const switchZoneFromPhase = useCallback(
    (zone: FocusedZone) => {
      if (zone === focusedZoneRef.current) return;
      const modalOpen = store.get(openCardIdAtom) !== null;
      if (document.startViewTransition && !modalOpen) {
        document.startViewTransition(() => {
          setFocusedZone(zone);
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
    const target = phaseToZone(phase);
    if (target !== null) switchZoneFromPhase(target);
  }, [phase, isSynced, switchZoneFromPhase]);

  return { focusedZone, switchZone: switchZoneFromClick };
}
