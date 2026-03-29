import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useBridge } from "../../lib/bridge-context.tsx";

/**
 * Syncs CPU swap detections from the bridge (in-memory) to Convex (persisted).
 * - Appends newly detected swaps as they arrive
 * - Clears persisted swaps when the duel ends
 */
export function useSyncCpuSwaps() {
  const { cpuSwaps, inDuel } = useBridge();
  const append = useAuthMutation(api.userSettings.appendCpuSwaps);
  const clear = useAuthMutation(api.userSettings.clearCpuSwaps);

  const syncedCountRef = useRef(0);
  const prevInDuelRef = useRef(inDuel);

  // Append newly detected swaps to Convex
  useEffect(() => {
    if (cpuSwaps.length > syncedCountRef.current) {
      void append({ swaps: cpuSwaps.slice(syncedCountRef.current) });
      syncedCountRef.current = cpuSwaps.length;
    }
  }, [cpuSwaps, append]);

  // Clear persisted swaps when duel ends
  useEffect(() => {
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = inDuel;
    if (wasInDuel && !inDuel) {
      void clear();
      syncedCountRef.current = 0;
    }
  }, [inDuel, clear]);
}
