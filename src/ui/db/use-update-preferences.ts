import type { FunctionArgs } from "convex/server";
import { api } from "../../../convex/_generated/api";
import { useAuthMutation } from "../core/convex-hooks.ts";

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
  const mutateModSettings = useAuthMutation(api.userModSettings.updateModSettings);
  const mutateUserSettings = useAuthMutation(api.userSettings.updateUserSettings);
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
