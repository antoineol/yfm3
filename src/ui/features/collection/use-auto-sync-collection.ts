import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Auto-syncs the emulator's collection and deck to Convex when data changes.
 *
 * Collection data is always valid in RAM (persists across all game screens),
 * so no phase or reliability gating is needed — we sync on every change.
 */
export function useAutoSyncCollection(bridge: EmulatorBridge) {
  const syncFromBridge = useAuthMutation(api.importExport.syncCollectionFromBridge);
  const lastCollectionKeyRef = useRef("");
  const lastDeckKeyRef = useRef("");
  const hasInitializedRef = useRef(false);
  const modId = useSelectedMod();

  const collectionKey = bridge.collection ? JSON.stringify(bridge.collection) : "";
  const deckKey = bridge.deckDefinition ? bridge.deckDefinition.join(",") : "";

  const detectedMod = bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const modMismatch = detectedMod !== null && detectedMod !== modId;

  useEffect(() => {
    if (bridge.status !== "connected") return;
    if (!bridge.collection || !bridge.deckDefinition) return;
    if (modMismatch) return;

    const collectionChanged = collectionKey !== lastCollectionKeyRef.current;
    const deckChanged = deckKey !== lastDeckKeyRef.current;
    if (!collectionChanged && !deckChanged) return;

    lastCollectionKeyRef.current = collectionKey;
    lastDeckKeyRef.current = deckKey;

    const ownedCards = Object.entries(bridge.collection).map(([id, qty]) => ({
      cardId: Number(id),
      quantity: qty,
    }));

    void syncFromBridge({ ownedCards, deck: bridge.deckDefinition, mod: modId }).then(() => {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        return;
      }
      const label =
        collectionChanged && deckChanged
          ? "Collection & deck"
          : collectionChanged
            ? "Collection"
            : "Deck";
      toast.success(`${label} synced from emulator`);
    });
  }, [
    bridge.status,
    bridge.collection,
    bridge.deckDefinition,
    collectionKey,
    deckKey,
    syncFromBridge,
    modId,
    modMismatch,
  ]);
}
