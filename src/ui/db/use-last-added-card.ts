import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";

export function useLastAddedCard() {
  return useAuthQuery(api.userModSettings.getLastAddedCard);
}
