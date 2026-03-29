import { useCallback, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import type { HandCard } from "../../db/use-hand.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Auto-syncs the emulator hand to the local DB when data is reliable.
 *
 * During the draw phase the game writes cards to RAM one at a time.
 * Each 50 ms poll catches an intermediate state (1→2→3→4→5 cards).
 * Syncing every intermediate state causes batchMigrateHand to delete-all
 * + re-insert, giving every card a new docId / React key, which makes
 * auto-animate flicker.  Fix: skip sync during "draw" phase entirely
 * and wait for "hand" (HAND_SELECT) which has the complete hand.
 *
 * During HAND_SELECT (phase "hand"), the selected card's status changes in
 * RAM which shrinks the filtered hand. Syncing that decrease would remove
 * the card from the DB prematurely — and on cancel it wouldn't come back.
 * Fix: during "hand" phase, only sync when bridge has >= cards (e.g. after
 * draw). Decreases are always temporary selections, never real plays.
 *
 * On duel start the Convex hand still has stale cards from the previous
 * duel. We clear the hand when inDuel transitions to true so the UI shows
 * empty slots during the brief draw animation instead of old cards.
 */
export function useAutoSyncHand(bridge: EmulatorBridge, currentHand: HandCard[]) {
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

  // Clear stale hand when a new duel starts
  useEffect(() => {
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = bridge.inDuel;
    if (modMismatch) return;
    if (bridge.inDuel && !wasInDuel) {
      void clearHand();
    }
  }, [bridge.inDuel, clearHand, modMismatch]);

  const bridgeHandKey = bridge.hand.join(",");
  const currentHandKey = currentHand.map((c) => c.cardId).join(",");
  const handsDiffer = bridgeHandKey !== currentHandKey && bridge.hand.length > 0;
  const isHandDecrease = bridge.phase === "hand" && bridge.hand.length < currentHand.length;
  const isDuringDraw = bridge.phase === "draw";

  useEffect(() => {
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
    modMismatch,
    bridge.inDuel,
    bridge.handReliable,
    handsDiffer,
    isHandDecrease,
    isDuringDraw,
    syncHand,
  ]);
}
