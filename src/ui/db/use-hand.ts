import { useCallback, useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthMutation, useAuthQuery } from "../core/convex-hooks.ts";
import { useBridgeAutoSync } from "./use-user-preferences.ts";

export type HandCard = {
  docId: Id<"hand">;
  cardId: number;
};

const EMPTY_HAND: HandCard[] = [];

export function useHand(): HandCard[] | undefined {
  const autoSync = useBridgeAutoSync();
  const hand = useAuthQuery(api.hand.getHand, autoSync ? "skip" : undefined);

  return useMemo(() => {
    // In auto-sync mode, bridge hand is consumed directly by HandFusionCalculator
    if (autoSync) return EMPTY_HAND;
    return hand
      ?.slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((doc) => ({ docId: doc._id, cardId: doc.cardId }));
  }, [autoSync, hand]);
}

const noop = async () => {};

export function useHandMutations() {
  const autoSync = useBridgeAutoSync();
  const addToHand = useAuthMutation(api.hand.addToHand);
  const removeFromHand = useAuthMutation(api.hand.removeFromHand);
  const removeMultipleFromHand = useAuthMutation(api.hand.removeMultipleFromHand);
  const clearHand = useAuthMutation(api.hand.clearHand);

  // Stable no-op callbacks for auto-sync mode
  const noopAdd = useCallback(noop, []);
  const noopRemove = useCallback(noop, []);
  const noopRemoveMultiple = useCallback(noop, []);
  const noopClear = useCallback(noop, []);

  if (autoSync) {
    return {
      addToHand: noopAdd,
      removeFromHand: noopRemove,
      removeMultipleFromHand: noopRemoveMultiple,
      clearHand: noopClear,
    };
  }

  return { addToHand, removeFromHand, removeMultipleFromHand, clearHand };
}
