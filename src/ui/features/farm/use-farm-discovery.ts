import { useCallback, useMemo, useRef, useState } from "react";
import type { DropMode } from "../../../engine/farm/discover-farmable-fusions.ts";
import type {
  FarmWorkerResponse,
  SerializedFarmDiscoveryResult,
} from "../../../engine/worker/messages.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useFusionDepth } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

interface FarmCache {
  pow: SerializedFarmDiscoveryResult;
  tec: SerializedFarmDiscoveryResult;
  key: string;
}

export type FarmStatus = "idle" | "loading" | "done";

export function useFarmDiscovery(deckScore: number | null): {
  pow: SerializedFarmDiscoveryResult | null;
  tec: SerializedFarmDiscoveryResult | null;
  status: FarmStatus;
  compute: () => void;
  dropMode: DropMode;
  setDropMode: (dm: DropMode) => void;
} {
  const ownedTotals = useOwnedCardTotals();
  const fusionDepth = useFusionDepth();
  const modId = useSelectedMod();
  const bridge = useBridge();

  const [dropMode, setDropMode] = useState<DropMode>("pow");
  const [cache, setCache] = useState<FarmCache | null>(null);
  const [status, setStatus] = useState<FarmStatus>("idle");

  // Stable key derived from inputs — changes when cache should be invalidated.
  const unlockedDuelists = bridge.unlockedDuelists;

  // Stable key derived from inputs — changes when cache should be invalidated.
  const cacheKey = useMemo(
    () => JSON.stringify([ownedTotals, deckScore, fusionDepth, modId, unlockedDuelists]),
    [ownedTotals, deckScore, fusionDepth, modId, unlockedDuelists],
  );

  // If inputs changed since last computation, the cache is stale.
  const isCacheValid = cache !== null && cache.key === cacheKey;
  const effectiveStatus = isCacheValid ? "done" : status === "loading" ? "loading" : "idle";

  const workerRef = useRef<Worker | null>(null);

  const compute = useCallback(() => {
    if (deckScore == null || !ownedTotals) return;
    if (isCacheValid) return;

    // Cancel any in-flight worker.
    workerRef.current?.terminate();

    setStatus("loading");

    const worker = new Worker(new URL("../../../engine/worker/farm-worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    const capturedKey = cacheKey;

    worker.onmessage = (e: MessageEvent<FarmWorkerResponse>) => {
      setCache({ pow: e.data.pow, tec: e.data.tec, key: capturedKey });
      setStatus("done");
      workerRef.current = null;
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error("Farm worker error:", err);
      setStatus("idle");
      workerRef.current = null;
      worker.terminate();
    };

    worker.postMessage({
      type: "FARM",
      collection: ownedTotals,
      deckScore,
      fusionDepth,
      modId,
      gameData: bridge.gameData ?? undefined,
      unlockedDuelists: unlockedDuelists ?? undefined,
    });
  }, [
    deckScore,
    ownedTotals,
    fusionDepth,
    modId,
    bridge.gameData,
    unlockedDuelists,
    cacheKey,
    isCacheValid,
  ]);

  return {
    pow: isCacheValid ? cache.pow : null,
    tec: isCacheValid ? cache.tec : null,
    status: effectiveStatus,
    compute,
    dropMode,
    setDropMode,
  };
}
