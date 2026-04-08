import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { DEFAULT_MOD, MODS, type ModId } from "../../engine/mods.ts";
import { useAuthMutation, useAuthQuery } from "../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../db/use-user-preferences.ts";
import { readLocal, writeLocal } from "./local-store.ts";

export const LOCAL_MOD_KEY = "yfm_settings:selectedMod";

/**
 * Internal: returns undefined while the Convex mod query is still loading.
 * In autoSync mode (localStorage), returns synchronously — never undefined.
 */
function useRawSelectedMod(): ModId | undefined {
  const autoSync = useBridgeAutoSync();
  const convexMod = useAuthQuery(api.userSettings.getSelectedMod, autoSync ? "skip" : undefined);

  const [localMod] = useState<ModId>(
    () => (readLocal<string>(LOCAL_MOD_KEY) as ModId) ?? DEFAULT_MOD,
  );

  if (autoSync) return isValidModId(localMod) ? localMod : DEFAULT_MOD;
  // convexMod is undefined while auth or query is loading — don't fall back to default yet
  if (convexMod === undefined) return undefined;
  return isValidModId(convexMod) ? convexMod : DEFAULT_MOD;
}

/** Read the user's currently selected mod. Falls back to DEFAULT_MOD while loading. */
export function useSelectedMod(): ModId {
  return useRawSelectedMod() ?? DEFAULT_MOD;
}

/** Like useSelectedMod, but returns undefined while the Convex query is still loading. */
export function useSelectedModSettled(): ModId | undefined {
  return useRawSelectedMod();
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

function isValidModId(value: string | undefined): value is ModId {
  return typeof value === "string" && value in MODS;
}
