import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useBridge } from "../../lib/bridge-context.tsx";
import { localCpuSwapsAtom } from "../../lib/bridge-snapshot-atoms.ts";

/**
 * Syncs CPU swap detections from the bridge to a local Jotai atom.
 *
 * CPU swaps are ephemeral (accumulated during a duel, cleared when it ends),
 * so they are always stored locally — no Convex round-trip needed.
 */
export function useSyncCpuSwaps() {
  const { cpuSwaps, inDuel } = useBridge();
  const setLocalSwaps = useSetAtom(localCpuSwapsAtom);

  const syncedCountRef = useRef(0);
  const prevInDuelRef = useRef(inDuel);

  // Sync swap detections to local atom
  useEffect(() => {
    if (cpuSwaps.length > syncedCountRef.current) {
      setLocalSwaps([...cpuSwaps]);
      syncedCountRef.current = cpuSwaps.length;
    }
  }, [cpuSwaps, setLocalSwaps]);

  // Clear swaps when duel ends
  useEffect(() => {
    const wasInDuel = prevInDuelRef.current;
    prevInDuelRef.current = inDuel;
    if (wasInDuel && !inDuel) {
      setLocalSwaps([]);
      syncedCountRef.current = 0;
    }
  }, [inDuel, setLocalSwaps]);
}
