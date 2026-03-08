import { useMutation, useQuery } from "convex/react";
import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { DECK_SIZE, HAND_SIZE } from "../../engine/types/constants.ts";
import { userIdAtom } from "../lib/atoms.ts";

export function useUserPreferences() {
  const userId = useAtomValue(userIdAtom);
  const prefs = useQuery(api.collection.getUserPreferences, userId ? { userId } : "skip");
  const updatePreferences = useMutation(api.collection.updatePreferences);
  const deckSize = prefs?.deckSize ?? DECK_SIZE;

  function setDeckSize(v: number) {
    if (v >= HAND_SIZE && v <= DECK_SIZE && userId) {
      updatePreferences({ userId, deckSize: v });
    }
  }

  return { deckSize, setDeckSize };
}
