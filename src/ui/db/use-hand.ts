import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthMutation, useAuthQuery } from "../core/convex-hooks.ts";

export type HandCard = {
  docId: Id<"hand">;
  cardId: number;
};

export function useHand(): HandCard[] | undefined {
  const hand = useAuthQuery(api.hand.getHand);
  return useMemo(
    () =>
      hand
        ?.slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((doc) => ({ docId: doc._id, cardId: doc.cardId })),
    [hand],
  );
}

export function useHandMutations() {
  const addToHand = useAuthMutation(api.hand.addToHand);
  const removeFromHand = useAuthMutation(api.hand.removeFromHand);
  const removeMultipleFromHand = useAuthMutation(api.hand.removeMultipleFromHand);
  const clearHand = useAuthMutation(api.hand.clearHand);
  return { addToHand, removeFromHand, removeMultipleFromHand, clearHand };
}
