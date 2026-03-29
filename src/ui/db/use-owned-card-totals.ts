import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";

export function useOwnedCardTotals() {
  return useAuthQuery(api.ownedCards.getOwnedCardTotals);
}
