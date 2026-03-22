import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";

type UserPreferences = Doc<"userPreferences">;

export type HandSourceMode = NonNullable<UserPreferences["handSourceMode"]>;

export const DEFAULT_HAND_SOURCE_MODE: HandSourceMode = "all";

export function useUserPreferences() {
  return useQuery(api.userPreferences.getUserPreferences, {});
}

export function useDeckSize() {
  const prefs = useUserPreferences();
  return prefs?.deckSize ?? DECK_SIZE;
}

export function useFusionDepth() {
  const prefs = useUserPreferences();
  return prefs?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
}

export function useHandSourceMode(): HandSourceMode {
  const prefs = useUserPreferences();
  return prefs?.handSourceMode ?? DEFAULT_HAND_SOURCE_MODE;
}

export function useUseEquipment() {
  const prefs = useUserPreferences();
  return prefs?.useEquipment ?? true;
}

export function useBridgeAutoSync() {
  const prefs = useUserPreferences();
  return prefs?.bridgeAutoSync ?? false;
}
