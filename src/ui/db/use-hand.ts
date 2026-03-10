import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export type HandCard = {
  docId: Id<"hand">;
  cardId: number;
};

export function useHand(): HandCard[] | undefined {
  const hand = useQuery(api.hand.getHand, {});
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
  const addToHand = useMutation(api.hand.addToHand);
  const removeFromHand = useMutation(api.hand.removeFromHand);
  const removeMultipleFromHand = useMutation(api.hand.removeMultipleFromHand);
  const clearHand = useMutation(api.hand.clearHand);
  return { addToHand, removeFromHand, removeMultipleFromHand, clearHand };
}
