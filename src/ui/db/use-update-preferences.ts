import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { api } from "../../../convex/_generated/api";

type UpdateModSettingsArgs = FunctionArgs<typeof api.userModSettings.updateModSettings>;
type UpdateUserSettingsArgs = FunctionArgs<typeof api.userSettings.updateUserSettings>;

export type UpdatePreferencesArgs = UpdateModSettingsArgs & UpdateUserSettingsArgs;

export function useUpdatePreferences() {
  const mutateModSettings = useMutation(api.userModSettings.updateModSettings);
  const mutateUserSettings = useMutation(api.userSettings.updateUserSettings);
  return (values: UpdatePreferencesArgs) => {
    const { bridgeAutoSync, handSourceMode, cheatMode, cheatView, ...modValues } = values;
    const hasModValues = Object.values(modValues).some((v) => v !== undefined);
    const hasGlobalValues =
      bridgeAutoSync !== undefined ||
      handSourceMode !== undefined ||
      cheatMode !== undefined ||
      cheatView !== undefined;
    if (hasModValues) void mutateModSettings(modValues);
    if (hasGlobalValues)
      void mutateUserSettings({ bridgeAutoSync, handSourceMode, cheatMode, cheatView });
  };
}
