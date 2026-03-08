import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useDeck() {
  return useQuery(api.deck.getDeck, {});
}
