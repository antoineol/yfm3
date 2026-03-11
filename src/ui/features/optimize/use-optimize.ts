import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import type { Collection } from "../../../engine/data/card-model.ts";
import { optimizeDeckParallel } from "../../../engine/index-browser.ts";
import { useCollection } from "../../db/use-collection.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { isOptimizingAtom, liveBestScoreAtom, resultAtom } from "../../lib/atoms.ts";

export function useOptimize() {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const setIsOptimizing = useSetAtom(isOptimizingAtom);
  const setResult = useSetAtom(resultAtom);
  const setLiveBestScore = useSetAtom(liveBestScoreAtom);
  const collection = useCollection();
  const deck = useDeck();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const totalCards = collection ? Object.values(collection).reduce((sum, qty) => sum + qty, 0) : 0;
  const canOptimize = !isOptimizing && totalCards >= deckSize;

  function optimize() {
    if (!collection) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsOptimizing(true);
    setResult(null);
    setLiveBestScore(0);

    const currentDeck = deck?.map((d) => d.cardId);
    const col: Collection = new Map(
      Object.entries(collection).map(([id, qty]) => [Number(id), qty]),
    );
    optimizeDeckParallel(col, {
      currentDeck,
      deckSize,
      fusionDepth,
      signal: controller.signal,
      onProgress: (_progress, bestScore) => {
        setLiveBestScore(bestScore);
      },
    })
      .then((res) => setResult(res))
      .catch((err) => console.error("Optimization failed:", err))
      .finally(() => {
        setIsOptimizing(false);
        abortControllerRef.current = null;
      });
  }

  function cancel() {
    abortControllerRef.current?.abort();
  }

  return { optimize, cancel, isOptimizing, canOptimize };
}
