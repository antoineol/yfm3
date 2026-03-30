import { useAtomValue } from "jotai";
import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";
import { bridgeCollectionAtom } from "../lib/bridge-snapshot-atoms.ts";
import { useBridgeAutoSync } from "./use-user-preferences.ts";

export function useOwnedCardTotals() {
  const autoSync = useBridgeAutoSync();
  const bridgeCollection = useAtomValue(bridgeCollectionAtom);
  const convexTotals = useAuthQuery(
    api.ownedCards.getOwnedCardTotals,
    autoSync ? "skip" : undefined,
  );

  if (autoSync) return bridgeCollection ?? undefined;
  return convexTotals;
}
