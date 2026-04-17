import type { FunctionArgs } from "convex/server";
import { useSetAtom } from "jotai";
import { api } from "../../../convex/_generated/api";
import { useAuthMutation } from "../core/convex-hooks.ts";
import { setAutoSyncMode } from "../lib/auto-sync-mode.ts";
import {
  type LocalSettings,
  localSettingsAtom,
  persistLocalSettings,
} from "../lib/bridge-snapshot-atoms.ts";
import { useBridgeAutoSync } from "./use-user-preferences.ts";

type UpdateModSettingsArgs = Omit<
  FunctionArgs<typeof api.userModSettings.updateModSettings>,
  "anonymousId"
>;
type UpdateUserSettingsArgs = Omit<
  FunctionArgs<typeof api.userSettings.updateUserSettings>,
  "anonymousId"
>;

export type UpdatePreferencesArgs = UpdateModSettingsArgs & UpdateUserSettingsArgs;

export function useUpdatePreferences() {
  const autoSync = useBridgeAutoSync();
  const setLocalSettings = useSetAtom(localSettingsAtom);
  const mutateModSettings = useAuthMutation(api.userModSettings.updateModSettings);
  const mutateUserSettings = useAuthMutation(api.userSettings.updateUserSettings);

  return (values: UpdatePreferencesArgs) => {
    const { bridgeAutoSync, handSourceMode, cheatMode, cheatView, targetRank, ...modValues } =
      values;

    // Always persist bridgeAutoSync to localStorage (solves bootstrap problem)
    if (bridgeAutoSync !== undefined) {
      setAutoSyncMode(bridgeAutoSync);
    }

    if (autoSync) {
      // In auto-sync mode, persist settings locally (Jotai + localStorage)
      const patch: Partial<LocalSettings> = {};
      if (modValues.deckSize !== undefined) {
        patch.deckSize = modValues.deckSize;
        patch.deckSizeOverride = modValues.deckSize;
      }
      if (modValues.fusionDepth !== undefined) patch.fusionDepth = modValues.fusionDepth;
      if (modValues.useEquipment !== undefined) patch.useEquipment = modValues.useEquipment;
      if (modValues.terrain !== undefined) patch.terrain = modValues.terrain;
      if (handSourceMode !== undefined) patch.handSourceMode = handSourceMode;
      if (cheatMode !== undefined) patch.cheatMode = cheatMode;
      if (cheatView !== undefined) patch.cheatView = cheatView;
      if (targetRank !== undefined) patch.targetRank = targetRank as LocalSettings["targetRank"];

      if (Object.keys(patch).length > 0) {
        setLocalSettings((prev) => {
          const next = { ...prev, ...patch };
          persistLocalSettings(next);
          return next;
        });
      }
      return;
    }

    // Manual mode: existing Convex path
    const hasModValues = Object.values(modValues).some((v) => v !== undefined);
    const hasGlobalValues =
      bridgeAutoSync !== undefined ||
      handSourceMode !== undefined ||
      cheatMode !== undefined ||
      cheatView !== undefined ||
      targetRank !== undefined;
    if (hasModValues) void mutateModSettings(modValues);
    if (hasGlobalValues)
      void mutateUserSettings({ bridgeAutoSync, handSourceMode, cheatMode, cheatView, targetRank });
  };
}
