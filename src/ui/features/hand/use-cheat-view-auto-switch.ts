import { useEffect, useRef } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";

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

  // Reset to player view when a new duel starts
  const prevInDuelRef = useRef(bridge.inDuel);
  useEffect(() => {
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = bridge.inDuel;
    if (!wasInDuel && bridge.inDuel && cheatView === "opponent") {
      updatePreferences({ cheatView: "player" });
    }
  }, [bridge.inDuel, cheatView, updatePreferences]);

  // Auto-switch player/opponent view to follow turn changes
  const prevPhaseRef = useRef(bridge.phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = bridge.phase;

    if (!cheatMode || !bridge.inDuel) return;

    if (prev !== "opponent" && bridge.phase === "opponent") {
      if (cheatView !== "opponent") updatePreferences({ cheatView: "opponent" });
    } else if (prev === "opponent" && PLAYER_PHASES.has(bridge.phase)) {
      if (cheatView !== "player") updatePreferences({ cheatView: "player" });
    }
  }, [bridge.phase, bridge.inDuel, cheatMode, cheatView, updatePreferences]);
}
