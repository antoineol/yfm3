import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { api } from "../../../convex/_generated/api";

type UpdatePreferencesArgs = FunctionArgs<typeof api.userPreferences.updatePreferences>;

export function useUpdatePreferences() {
  const mutate = useMutation(api.userPreferences.updatePreferences);
  return (values: UpdatePreferencesArgs) => {
    void mutate(values);
  };
}
