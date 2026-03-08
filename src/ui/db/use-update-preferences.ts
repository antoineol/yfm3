import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../engine/types/constants.ts";

export function useUpdateDeckSize() {
  const updatePreferences = useMutation(api.collection.updatePreferences);

  return function setDeckSize(v: number) {
    if (v >= HAND_SIZE && v <= DECK_SIZE) {
      updatePreferences({ deckSize: v });
    }
  };
}

export function useUpdateFusionDepth() {
  const updatePreferences = useMutation(api.collection.updatePreferences);

  return function setFusionDepth(v: number) {
    if (v >= 1 && v <= MAX_FUSION_DEPTH) {
      updatePreferences({ fusionDepth: v });
    }
  };
}
