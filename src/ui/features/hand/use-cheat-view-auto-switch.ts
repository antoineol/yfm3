import { useEffect, useRef } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { DuelPhase } from "../../lib/bridge-state-interpreter.ts";

/** Phases that indicate it is the player's turn (not opponent, not transient). */
const PLAYER_PHASES = new Set(["hand", "draw", "fusion", "field", "battle"]);

/**
 * Auto-switches cheat view between player/opponent based on duel and phase transitions.
 * Resets to player view when a new duel starts, follows turn changes during a duel.
 */
export function useCheatViewAutoSwitch(): void {
  const bridge = useBridge();
  const cheatMode = useCheatMode();
  const cheatView = useCheatView();
  const updatePreferences = useUpdatePreferences();

  const prevBridgeRef = useRef<{ inDuel: boolean; phase: DuelPhase }>({
    inDuel: false,
    phase: "other",
  });
  useEffect(() => {
    const prev = prevBridgeRef.current;
    prevBridgeRef.current = { inDuel: bridge.inDuel, phase: bridge.phase };

    if (!bridge.inDuel) return;

    const enteredPlayerPhase =
      PLAYER_PHASES.has(bridge.phase) && (!prev.inDuel || !PLAYER_PHASES.has(prev.phase));

    if (enteredPlayerPhase && cheatView === "opponent") {
      updatePreferences({ cheatView: "player" });
      return;
    }

    if (!cheatMode) return;

    if (prev.phase !== "opponent" && bridge.phase === "opponent") {
      if (cheatView !== "opponent") updatePreferences({ cheatView: "opponent" });
    } else if (prev.phase === "opponent" && PLAYER_PHASES.has(bridge.phase)) {
      if (cheatView !== "player") updatePreferences({ cheatView: "player" });
    }
  }, [bridge.phase, bridge.inDuel, cheatMode, cheatView, updatePreferences]);
}
