import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { isKnownModId, modIdForFingerprint } from "../../../engine/mods.ts";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";
import {
  bridgeCollectionAtom,
  bridgeDeckAtom,
  collectionKey as collectionStorageKey,
  deckKey as deckStorageKey,
} from "../../lib/bridge-snapshot-atoms.ts";
import { writeLocal } from "../../lib/local-store.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/** Fast numeric fingerprint for a Record<number, number>. */
function collectionFingerprint(col: Record<number, number> | null): number {
  if (!col) return 0;
  let h = 0;
  for (const k in col) {
    const v = col[k] ?? 0;
    h = ((h << 5) - h + Number(k) * 31 + v) | 0;
  }
  return h;
}

/** Fast numeric fingerprint for a number[]. */
function deckFingerprint(deck: number[] | null): number {
  if (!deck) return 0;
  let h = 0;
  for (let i = 0; i < deck.length; i++) {
    const v = deck[i] ?? 0;
    h = ((h << 5) - h + v * (i + 1)) | 0;
  }
  return h;
}

/** Debounce delay for manual-mode Convex sync (ms). */
const SYNC_DEBOUNCE_MS = 1000;

/**
 * Auto-syncs the emulator's collection and deck when data changes.
 *
 * In auto-sync mode, writes to local Jotai atoms + localStorage.
 * In manual mode, writes to Convex (debounced, diff-based on server).
 *
 * Collection data is always valid in RAM (persists across all game screens),
 * so no phase or reliability gating is needed — we sync on every change.
 */
export function useAutoSyncCollection(bridge: EmulatorBridge) {
  const autoSync = useBridgeAutoSync();
  const setBridgeCollection = useSetAtom(bridgeCollectionAtom);
  const setBridgeDeck = useSetAtom(bridgeDeckAtom);
  const syncFromBridge = useAuthMutation(api.importExport.syncCollectionFromBridge);
  const lastCollectionFpRef = useRef(0);
  const lastDeckFpRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const modId = useSelectedMod();

  const collectionFp = collectionFingerprint(bridge.collection);
  const deckFp = deckFingerprint(bridge.deckDefinition);

  const detectedMod = bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const unknownBeforeSwitch =
    detectedMod === null && bridge.modFingerprint != null && isKnownModId(modId);
  const modMismatch = (detectedMod !== null && detectedMod !== modId) || unknownBeforeSwitch;

  useEffect(() => {
    if (bridge.status !== "connected") return;
    if (!bridge.collection || !bridge.deckDefinition) return;
    if (modMismatch) return;

    const collectionChanged = collectionFp !== lastCollectionFpRef.current;
    const deckChanged = deckFp !== lastDeckFpRef.current;
    if (!collectionChanged && !deckChanged) return;

    lastCollectionFpRef.current = collectionFp;
    lastDeckFpRef.current = deckFp;

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

    // Manual mode: debounced Convex sync (mutations are diff-based on server)
    clearTimeout(debounceRef.current);
    // Capture current bridge data for the closure
    const ownedCards = Object.entries(bridge.collection).map(([id, qty]) => ({
      cardId: Number(id),
      quantity: qty,
    }));
    const deckSnapshot = bridge.deckDefinition;

    debounceRef.current = setTimeout(() => {
      void syncFromBridge({ ownedCards, deck: deckSnapshot, mod: modId }).then(() => {
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
    }, SYNC_DEBOUNCE_MS);
  }, [
    bridge.status,
    bridge.collection,
    bridge.deckDefinition,
    collectionFp,
    deckFp,
    syncFromBridge,
    modId,
    modMismatch,
    autoSync,
    setBridgeCollection,
    setBridgeDeck,
  ]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
    };
  }, []);
}
