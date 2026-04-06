import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { DEFAULT_MOD, isKnownModId, type ModId } from "../../engine/mods.ts";
import { useAuthMutation, useAuthQuery } from "../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../db/use-user-preferences.ts";
import { readLocal, writeLocal } from "./local-store.ts";

export const LOCAL_MOD_KEY = "yfm_settings:selectedMod";

/** Read the user's currently selected mod. Falls back to DEFAULT_MOD while loading. */
export function useSelectedMod(): ModId {
  const autoSync = useBridgeAutoSync();
  const convexMod = useAuthQuery(api.userSettings.getSelectedMod, autoSync ? "skip" : undefined);

  const [localMod] = useState<ModId>(
    () => (readLocal<string>(LOCAL_MOD_KEY) as ModId) ?? DEFAULT_MOD,
  );

  if (autoSync) return localMod || DEFAULT_MOD;
  return isKnownModId(convexMod ?? "") ? (convexMod as string) : DEFAULT_MOD;
}

/** Returns a mutation to change the selected mod. */
export function useSetSelectedMod() {
  const autoSync = useBridgeAutoSync();
  const convexSetMod = useAuthMutation(api.userSettings.setSelectedMod);

  const localSetMod = useCallback((args: { selectedMod: string }) => {
    writeLocal(LOCAL_MOD_KEY, args.selectedMod);
    window.location.reload();
  }, []);

  return autoSync ? localSetMod : convexSetMod;
}
