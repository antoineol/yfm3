import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

/**
 * Auto-syncs the emulator's collection and deck to Convex when data changes.
 *
 * Collection data is always valid in RAM (persists across all game screens),
 * so no phase or reliability gating is needed — we sync on every change.
 */
export function useAutoSyncCollection(bridge: EmulatorBridge) {
  const syncFromBridge = useMutation(api.importExport.syncCollectionFromBridge);
  const lastKeyRef = useRef("");

  const collectionKey = bridge.collection ? JSON.stringify(bridge.collection) : "";
  const deckKey = bridge.deckDefinition ? bridge.deckDefinition.join(",") : "";
  const combinedKey = `${collectionKey}|${deckKey}`;

  useEffect(() => {
    if (bridge.status !== "connected") return;
    if (!bridge.collection || !bridge.deckDefinition) return;
    if (combinedKey === lastKeyRef.current) return;
    lastKeyRef.current = combinedKey;

    const ownedCards = Object.entries(bridge.collection).map(([id, qty]) => ({
      cardId: Number(id),
      quantity: qty,
    }));

    void syncFromBridge({ ownedCards, deck: bridge.deckDefinition });
  }, [bridge.status, bridge.collection, bridge.deckDefinition, combinedKey, syncFromBridge]);
}
