import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DEFAULT_MOD, MODS, type ModId } from "../../engine/mods.ts";

/** Read the user's currently selected mod. Falls back to DEFAULT_MOD while loading. */
export function useSelectedMod(): ModId {
  const selectedMod = useQuery(api.userSettings.getSelectedMod);
  return isValidModId(selectedMod) ? selectedMod : DEFAULT_MOD;
}

/** Returns a mutation to change the selected mod. */
export function useSetSelectedMod() {
  return useMutation(api.userSettings.setSelectedMod);
}

function isValidModId(value: string | undefined): value is ModId {
  return typeof value === "string" && value in MODS;
}
