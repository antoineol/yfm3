import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import {
  bridgeCollectionAtom,
  bridgeDeckAtom,
  collectionKey as collectionStorageKey,
  deckKey as deckStorageKey,
} from "../../lib/bridge-snapshot-atoms.ts";
import { writeLocal } from "../../lib/local-store.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Auto-syncs the emulator's collection and deck when data changes.
 *
 * In auto-sync mode, writes to local Jotai atoms + localStorage.
 * In manual mode, writes to Convex.
 *
 * Collection data is always valid in RAM (persists across all game screens),
 * so no phase or reliability gating is needed — we sync on every change.
 */
export function useAutoSyncCollection(bridge: EmulatorBridge) {
  const autoSync = useBridgeAutoSync();
  const setBridgeCollection = useSetAtom(bridgeCollectionAtom);
  const setBridgeDeck = useSetAtom(bridgeDeckAtom);
  const syncFromBridge = useAuthMutation(api.importExport.syncCollectionFromBridge);
  const lastCollectionKeyRef = useRef("");
  const lastDeckKeyRef = useRef("");
  const hasInitializedRef = useRef(false);
  const modId = useSelectedMod();

  const collectionKeyStr = bridge.collection ? JSON.stringify(bridge.collection) : "";
  const deckKeyStr = bridge.deckDefinition ? bridge.deckDefinition.join(",") : "";

  const detectedMod = bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const modMismatch = detectedMod !== null && detectedMod !== modId;

  useEffect(() => {
    if (bridge.status !== "connected") return;
    if (!bridge.collection || !bridge.deckDefinition) return;
    if (modMismatch) return;

    const collectionChanged = collectionKeyStr !== lastCollectionKeyRef.current;
    const deckChanged = deckKeyStr !== lastDeckKeyRef.current;
    if (!collectionChanged && !deckChanged) return;

    lastCollectionKeyRef.current = collectionKeyStr;
    lastDeckKeyRef.current = deckKeyStr;

    if (autoSync) {
      // Write to local state + localStorage (no Convex)
      if (collectionChanged) {
        setBridgeCollection(bridge.collection);
        writeLocal(collectionStorageKey(modId), bridge.collection);
      }
      if (deckChanged) {
        setBridgeDeck(bridge.deckDefinition);
        writeLocal(deckStorageKey(modId), bridge.deckDefinition);
      }

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
      return;
    }

    // Manual mode: existing Convex sync path
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
    collectionKeyStr,
    deckKeyStr,
    syncFromBridge,
    modId,
    modMismatch,
    autoSync,
    setBridgeCollection,
    setBridgeDeck,
  ]);
}
