import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";
import { useBridgeAutoSync } from "./use-user-preferences.ts";

export function useLastAddedCard() {
  const autoSync = useBridgeAutoSync();
  // Collection is read-only in auto-sync — last-added hint is unused
  return useAuthQuery(api.userModSettings.getLastAddedCard, autoSync ? "skip" : undefined);
}
