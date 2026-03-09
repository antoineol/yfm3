import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { ConfigFormValues } from "../features/config/config-schema.ts";

export function useUpdatePreferences() {
  const mutate = useMutation(api.collection.updatePreferences);
  return (values: ConfigFormValues) => {
    void mutate(values);
  };
}
