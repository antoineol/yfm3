import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export type FarmStatus = "idle" | "loading" | "done" | "error";

/** Worker timeout — if no response within 60s, assume the worker is stuck. */
const WORKER_TIMEOUT_MS = 60_000;

export function useFarmDiscovery(deckScore: number | null): {
  pow: SerializedFarmDiscoveryResult | null;
  tec: SerializedFarmDiscoveryResult | null;
  status: FarmStatus;
  errorMessage: string | null;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Memoize unlockedDuelists by value so bridge polling doesn't invalidate
  // the compute callback every ~50ms.
  const unlockedDuelistsKey = bridge.unlockedDuelists ? bridge.unlockedDuelists.join(",") : "";
  const unlockedDuelists = useMemo(
    () => (unlockedDuelistsKey ? unlockedDuelistsKey.split(",").map(Number) : null),
    [unlockedDuelistsKey],
  );

  // Stable key derived from inputs — changes when cache should be invalidated.
  const cacheKey = useMemo(
    () => JSON.stringify([ownedTotals, deckScore, fusionDepth, modId, unlockedDuelists]),
    [ownedTotals, deckScore, fusionDepth, modId, unlockedDuelists],
  );

  // If inputs changed since last computation, the cache is stale.
  const isCacheValid = cache !== null && cache.key === cacheKey;

  // Reset error state when inputs change so auto-trigger can retry.
  const prevCacheKeyRef = useRef(cacheKey);
  useEffect(() => {
    if (prevCacheKeyRef.current !== cacheKey) {
      prevCacheKeyRef.current = cacheKey;
      if (status === "error") {
        setStatus("idle");
        setErrorMessage(null);
      }
    }
  }, [cacheKey, status]);

  const effectiveStatus: FarmStatus = isCacheValid
    ? "done"
    : status === "loading"
      ? "loading"
      : status === "error"
        ? "error"
        : "idle";

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const failWorker = useCallback((msg: string) => {
    console.error("Farm worker failed:", msg);
    setErrorMessage(msg);
    setStatus("error");
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    clearTimeout(timeoutRef.current);
  }, []);

  const compute = useCallback(() => {
    if (deckScore == null || !ownedTotals) return;
    if (isCacheValid) return;

    // Cancel any in-flight worker.
    workerRef.current?.terminate();
    clearTimeout(timeoutRef.current);

    setStatus("loading");
    setErrorMessage(null);

    const worker = new Worker(new URL("../../../engine/worker/farm-worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    const capturedKey = cacheKey;

    // Timeout: if the worker doesn't respond, assume it's stuck.
    timeoutRef.current = setTimeout(() => {
      failWorker("Farm discovery timed out");
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<FarmWorkerResponse>) => {
      clearTimeout(timeoutRef.current);

      if (e.data.type === "FARM_ERROR") {
        failWorker(e.data.message);
        return;
      }

      setCache({ pow: e.data.pow, tec: e.data.tec, key: capturedKey });
      setStatus("done");
      setErrorMessage(null);
      workerRef.current = null;
      worker.terminate();
    };

    worker.onerror = (err) => {
      failWorker(err.message || "Unknown worker error");
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
    failWorker,
  ]);

  return {
    pow: isCacheValid ? cache.pow : null,
    tec: isCacheValid ? cache.tec : null,
    status: effectiveStatus,
    errorMessage,
    compute,
    dropMode,
    setDropMode,
  };
}
