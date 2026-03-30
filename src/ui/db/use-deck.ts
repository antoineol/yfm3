import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import { useAuthQuery } from "../core/convex-hooks.ts";
import { bridgeDeckAtom } from "../lib/bridge-snapshot-atoms.ts";
import { useBridgeAutoSync } from "./use-user-preferences.ts";

export function useDeck() {
  const autoSync = useBridgeAutoSync();
  const bridgeDeck = useAtomValue(bridgeDeckAtom);
  const convexDeck = useAuthQuery(api.deck.getDeck, autoSync ? "skip" : undefined);

  return useMemo(() => {
    if (autoSync) {
      if (!bridgeDeck) return undefined;
      return bridgeDeck.filter((id) => id > 0).map((cardId) => ({ cardId }));
    }
    return convexDeck;
  }, [autoSync, bridgeDeck, convexDeck]);
}
