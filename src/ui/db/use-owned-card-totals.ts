import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useOwnedCardTotals() {
  return useQuery(api.ownedCards.getOwnedCardTotals, {});
}
