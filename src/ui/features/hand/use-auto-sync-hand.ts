import { useCallback, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { isKnownModId, modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Auto-syncs the emulator hand to Convex in manual mode.
 *
 * In auto-sync mode this is a no-op — the bridge hand is consumed directly
 * by HandFusionCalculator without round-tripping through Convex.
 *
 * In manual mode (with bridge connected), the hand is synced to Convex only
 * at duel end. During the duel the UI displays bridge data directly, so
 * mid-duel syncs are wasted writes that thrash subscriptions.
 */
export function useAutoSyncHand(bridge: EmulatorBridge) {
  const autoSync = useBridgeAutoSync();
  const batchMigrateHand = useAuthMutation(api.hand.batchMigrateHand);
  const clearHand = useAuthMutation(api.hand.clearHand);
  const prevInDuelRef = useRef(false);
  const lastHandRef = useRef<number[]>([]);
  const modId = useSelectedMod();
  const detectedMod = bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const unknownBeforeSwitch =
    detectedMod === null && bridge.modFingerprint != null && isKnownModId(modId);
  const modMismatch = (detectedMod !== null && detectedMod !== modId) || unknownBeforeSwitch;

  // Track the latest hand during the duel so we can persist it at duel end
  useEffect(() => {
    if (bridge.inDuel && bridge.handReliable && bridge.hand.length > 0) {
      lastHandRef.current = bridge.hand;
    }
  }, [bridge.inDuel, bridge.handReliable, bridge.hand]);

  const syncHand = useCallback(
    (hand: number[]) => {
      if (hand.length === 0) return;
      void batchMigrateHand({
        handData: hand.map((cardId, i) => ({
          cardId,
          copyId: `emu-${String(i)}`,
          order: i,
        })),
      });
    },
    [batchMigrateHand],
  );

  // Clear stale hand when a new duel starts; persist hand when duel ends
  useEffect(() => {
    if (autoSync) return;
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = bridge.inDuel;
    if (modMismatch) return;

    if (bridge.inDuel && !wasInDuel) {
      // Duel start → clear stale hand from previous session
      void clearHand();
      lastHandRef.current = [];
    } else if (!bridge.inDuel && wasInDuel) {
      // Duel end → persist the last known hand
      syncHand(lastHandRef.current);
    }
  }, [autoSync, bridge.inDuel, clearHand, modMismatch, syncHand]);
}
