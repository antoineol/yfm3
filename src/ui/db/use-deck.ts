import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";

export function useDeck() {
  return useAuthQuery(api.deck.getDeck);
}
