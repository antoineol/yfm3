import { useAtomValue, useSetAtom } from "jotai";
import type { Collection } from "../../engine/data/card-model.ts";
import { optimizeDeckParallel } from "../../engine/index-browser.ts";
import { useCollection } from "../db/use-collection.ts";
import { useDeck } from "../db/use-deck.ts";
import { useDeckSize } from "../db/use-user-preferences.ts";
import { isOptimizingAtom, resultAtom } from "./atoms.ts";

export function useOptimize() {
  const isOptimizing = useAtomValue(isOptimizingAtom);
  const setIsOptimizing = useSetAtom(isOptimizingAtom);
  const setResult = useSetAtom(resultAtom);
  const collection = useCollection();
  const deck = useDeck();
  const deckSize = useDeckSize();

  function optimize() {
    if (!collection) return;
    setIsOptimizing(true);
    setResult(null);
    const currentDeck = deck?.map((d) => d.cardId);
    const col: Collection = new Map(
      Object.entries(collection).map(([id, qty]) => [Number(id), qty]),
    );
    optimizeDeckParallel(col, { currentDeck, deckSize })
      .then((res) => setResult(res))
      .catch((err) => console.error("Optimization failed:", err))
      .finally(() => setIsOptimizing(false));
  }

  return { optimize, isOptimizing };
}
