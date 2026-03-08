import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";

export function useUserPreferences() {
  return useQuery(api.collection.getUserPreferences, {});
}

export function useDeckSize() {
  const prefs = useUserPreferences();
  return prefs?.deckSize ?? DECK_SIZE;
}

export function useFusionDepth() {
  const prefs = useUserPreferences();
  return prefs?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
}
