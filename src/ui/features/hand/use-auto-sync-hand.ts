import { useCallback, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import type { HandCard } from "../../db/use-hand.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Auto-syncs the emulator hand to the local DB when data is reliable.
 *
 * In auto-sync mode this is a no-op — the bridge hand is consumed directly
 * by HandFusionCalculator without round-tripping through Convex.
 *
 * In manual mode (with bridge connected), syncs hand to Convex.
 */
export function useAutoSyncHand(bridge: EmulatorBridge, currentHand: HandCard[]) {
  const autoSync = useBridgeAutoSync();
  const batchMigrateHand = useAuthMutation(api.hand.batchMigrateHand);
  const clearHand = useAuthMutation(api.hand.clearHand);
  const prevInDuelRef = useRef(false);
  const modId = useSelectedMod();
  const detectedMod = bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const modMismatch = detectedMod !== null && detectedMod !== modId;

  const syncHand = useCallback(() => {
    if (bridge.hand.length === 0) return;
    void batchMigrateHand({
      handData: bridge.hand.map((cardId, i) => ({
        cardId,
        copyId: `emu-${String(i)}`,
        order: i,
      })),
    });
  }, [bridge.hand, batchMigrateHand]);

  // Clear stale hand when a new duel starts (manual mode only)
  useEffect(() => {
    if (autoSync) return;
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = bridge.inDuel;
    if (modMismatch) return;
    if (bridge.inDuel && !wasInDuel) {
      void clearHand();
    }
  }, [autoSync, bridge.inDuel, clearHand, modMismatch]);

  const bridgeHandKey = bridge.hand.join(",");
  const currentHandKey = currentHand.map((c) => c.cardId).join(",");
  const handsDiffer = bridgeHandKey !== currentHandKey && bridge.hand.length > 0;
  const isHandDecrease = bridge.phase === "hand" && bridge.hand.length < currentHand.length;
  const isDuringDraw = bridge.phase === "draw";

  // Sync hand to Convex (manual mode only)
  useEffect(() => {
    if (autoSync) return;
    if (
      !modMismatch &&
      bridge.inDuel &&
      bridge.handReliable &&
      handsDiffer &&
      !isHandDecrease &&
      !isDuringDraw
    ) {
      syncHand();
    }
  }, [
    autoSync,
    modMismatch,
    bridge.inDuel,
    bridge.handReliable,
    handsDiffer,
    isHandDecrease,
    isDuringDraw,
    syncHand,
  ]);
}
