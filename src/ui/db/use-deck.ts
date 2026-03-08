import { useQuery } from "convex/react";
import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { userIdAtom } from "../lib/atoms.ts";

export function useDeck() {
  const userId = useAtomValue(userIdAtom);
  return useQuery(api.deck.getDeck, userId ? { userId } : "skip");
}
