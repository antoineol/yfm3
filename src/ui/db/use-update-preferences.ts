import { useMutation } from "convex/react";
import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE, MAX_FUSION_DEPTH } from "../../engine/types/constants.ts";
import { userIdAtom } from "../lib/atoms.ts";

export function useUpdateDeckSize() {
  const userId = useAtomValue(userIdAtom);
  const updatePreferences = useMutation(api.collection.updatePreferences);

  return function setDeckSize(v: number) {
    if (v >= HAND_SIZE && v <= DECK_SIZE && userId) {
      updatePreferences({ userId, deckSize: v });
    }
  };
}

export function useUpdateFusionDepth() {
  const userId = useAtomValue(userIdAtom);
  const updatePreferences = useMutation(api.collection.updatePreferences);

  return function setFusionDepth(v: number) {
    if (v >= 1 && v <= MAX_FUSION_DEPTH && userId) {
      updatePreferences({ userId, fusionDepth: v });
    }
  };
}
