import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useBridge } from "../../lib/bridge-context.tsx";
import { localCpuSwapsAtom } from "../../lib/bridge-snapshot-atoms.ts";

const EMPTY_CPU_SWAPS: readonly [] = [];

/**
 * Syncs CPU swap detections from the bridge to a local Jotai atom.
 *
 * CPU swaps are ephemeral (accumulated during a duel, cleared when it ends),
 * so they are always stored locally — no Convex round-trip needed.
 */
export function useSyncCpuSwaps() {
  const { cpuSwaps, inDuel, phase } = useBridge();
  const setLocalSwaps = useSetAtom(localCpuSwapsAtom);
  const visibleSwaps = inDuel && phase !== "ended" ? cpuSwaps : EMPTY_CPU_SWAPS;

  // Sync swap detections to local atom
  useEffect(() => {
    setLocalSwaps((current) => (sameCpuSwaps(current, visibleSwaps) ? current : [...visibleSwaps]));
  }, [setLocalSwaps, visibleSwaps]);
}

function sameCpuSwaps(
  a: readonly { slotIndex: number; fromCardId: number; toCardId: number; timestamp: number }[],
  b: readonly { slotIndex: number; fromCardId: number; toCardId: number; timestamp: number }[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) return false;
    if (
      x.slotIndex !== y.slotIndex ||
      x.fromCardId !== y.fromCardId ||
      x.toCardId !== y.toCardId ||
      x.timestamp !== y.timestamp
    ) {
      return false;
    }
  }
  return true;
}
