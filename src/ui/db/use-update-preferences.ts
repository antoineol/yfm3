import { useMutation } from "convex/react";
import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE } from "../../engine/types/constants.ts";
import { userIdAtom } from "../lib/atoms.ts";

export function useUpdatePreferences() {
  const userId = useAtomValue(userIdAtom);
  const updatePreferences = useMutation(api.collection.updatePreferences);

  return function setDeckSize(v: number) {
    if (v >= HAND_SIZE && v <= DECK_SIZE && userId) {
      updatePreferences({ userId, deckSize: v });
    }
  };
}
