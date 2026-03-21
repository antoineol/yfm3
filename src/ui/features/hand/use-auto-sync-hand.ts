import { useMutation } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import type { HandCard } from "../../db/use-hand.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

/**
 * Auto-syncs the emulator hand to the local DB when data is reliable.
 *
 * During HAND_SELECT (phase "hand"), the selected card's status changes in
 * RAM which shrinks the filtered hand. Syncing that decrease would remove
 * the card from the DB prematurely — and on cancel it wouldn't come back.
 * Fix: during "hand" phase, only sync when bridge has >= cards (e.g. after
 * draw). Decreases are always temporary selections, never real plays.
 */
export function useAutoSyncHand(bridge: EmulatorBridge, currentHand: HandCard[]) {
  const batchMigrateHand = useMutation(api.hand.batchMigrateHand);

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

  const bridgeHandKey = bridge.hand.join(",");
  const currentHandKey = currentHand.map((c) => c.cardId).join(",");
  const handsDiffer = bridgeHandKey !== currentHandKey && bridge.hand.length > 0;
  const isHandDecrease = bridge.phase === "hand" && bridge.hand.length < currentHand.length;

  useEffect(() => {
    if (bridge.inDuel && bridge.handReliable && handsDiffer && !isHandDecrease) {
      syncHand();
    }
  }, [bridge.inDuel, bridge.handReliable, handsDiffer, isHandDecrease, syncHand]);
}
