import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { localCpuSwapsAtom } from "../../lib/bridge-snapshot-atoms.ts";

/**
 * Syncs CPU swap detections from the bridge to persistent storage.
 * - Auto-sync mode: writes to Jotai atom (local-only)
 * - Manual mode: appends to Convex (persisted)
 */
export function useSyncCpuSwaps() {
  const autoSync = useBridgeAutoSync();
  const { cpuSwaps, inDuel } = useBridge();
  const setLocalSwaps = useSetAtom(localCpuSwapsAtom);
  const append = useAuthMutation(api.userSettings.appendCpuSwaps);
  const clear = useAuthMutation(api.userSettings.clearCpuSwaps);

  const syncedCountRef = useRef(0);
  const prevInDuelRef = useRef(inDuel);

  // Sync swap detections
  useEffect(() => {
    if (cpuSwaps.length > syncedCountRef.current) {
      if (autoSync) {
        setLocalSwaps([...cpuSwaps]);
      } else {
        void append({ swaps: cpuSwaps.slice(syncedCountRef.current) });
      }
      syncedCountRef.current = cpuSwaps.length;
    }
  }, [cpuSwaps, autoSync, append, setLocalSwaps]);

  // Clear swaps when duel ends
  useEffect(() => {
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = inDuel;
    if (wasInDuel && !inDuel) {
      if (autoSync) {
        setLocalSwaps([]);
      } else {
        void clear();
      }
      syncedCountRef.current = 0;
    }
  }, [inDuel, autoSync, clear, setLocalSwaps]);
}
