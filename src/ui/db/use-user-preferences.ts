import { useQuery } from "convex/react";
import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";
import { userIdAtom } from "../lib/atoms.ts";

export function useUserPreferences() {
  const userId = useAtomValue(userIdAtom);
  return useQuery(api.collection.getUserPreferences, userId ? { userId } : "skip");
}

export function useDeckSize() {
  const prefs = useUserPreferences();
  return prefs?.deckSize ?? DECK_SIZE;
}

export function useFusionDepth() {
  const prefs = useUserPreferences();
  return prefs?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
}
