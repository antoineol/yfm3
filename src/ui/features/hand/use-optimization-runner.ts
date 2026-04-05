import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import type { Collection } from "../../../engine/data/card-model.ts";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { optimizeDeckParallel } from "../../../engine/index-browser.ts";
import type { ModId } from "../../../engine/mods.ts";
import type { BridgeGameData } from "../../../engine/worker/messages.ts";
import {
  useDeckSize,
  useFusionDepth,
  useTerrain,
  useUseEquipment,
} from "../../db/use-user-preferences.ts";
import { postDuelLiveBestScoreAtom, postDuelProgressAtom } from "../../lib/atoms.ts";
import type { CollectionSnapshot } from "./use-duel-collection-tracker.ts";

/** Time budget for post-duel optimization (shorter than manual 15s). */
const POST_DUEL_TIME_LIMIT = 10_000;

export interface OptimizationCallbacks {
  onComplete: (result: OptimizeDeckParallelResult, currentDeck: number[]) => void;
  onError: () => void;
}

/**
 * Run deck optimization when a collection snapshot is provided.
 * Automatically aborts when snapshot becomes null or on unmount.
 */
export function useOptimizationRunner(
  snapshot: CollectionSnapshot | null,
  context: { modId: ModId; gameData: BridgeGameData | null },
  callbacks: OptimizationCallbacks,
): { abort: () => void } {
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const useEquipment = useUseEquipment();
  const terrain = useTerrain();

  const setProgress = useSetAtom(postDuelProgressAtom);
  const setLiveBestScore = useSetAtom(postDuelLiveBestScoreAtom);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep callbacks fresh without restarting the optimization effect.
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  // ── Run optimization when snapshot is provided ──────────────────
  useEffect(() => {
    if (!snapshot) return;

    let totalCards = 0;
    for (const count of Object.values(snapshot.collection)) {
      totalCards += count;
    }
    if (totalCards < deckSize) {
      callbacksRef.current.onError();
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const col: Collection = new Map(
      Object.entries(snapshot.collection).map(([id, qty]) => [Number(id), qty]),
    );
    const deckForOpt = snapshot.deck.filter((id) => id > 0);

    optimizeDeckParallel(col, {
      timeLimit: POST_DUEL_TIME_LIMIT,
      signal: controller.signal,
      currentDeck: deckForOpt.length === deckSize ? deckForOpt : undefined,
      deckSize,
      fusionDepth,
      useEquipment,
      terrain,
      modId: context.modId,
      gameData: context.gameData ?? undefined,
      onProgress: (p, bestScore) => {
        setProgress(p);
        setLiveBestScore(bestScore);
      },
    })
      .then((res) => {
        if (controller.signal.aborted) return;
        callbacksRef.current.onComplete(res, deckForOpt);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          callbacksRef.current.onError();
        }
      })
      .finally(() => {
        setProgress(0);
        setLiveBestScore(0);
        abortControllerRef.current = null;
      });

    return () => {
      controller.abort();
    };
  }, [
    snapshot,
    deckSize,
    fusionDepth,
    useEquipment,
    terrain,
    context.modId,
    context.gameData,
    setProgress,
    setLiveBestScore,
  ]);

  return { abort };
}
