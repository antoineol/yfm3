import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import type { ScorerResponse } from "../../../engine/worker/messages.ts";
import { useCollection } from "../../db/use-collection.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";

/**
 * Auto-computes the exact expected ATK for a deck whenever it changes.
 * Runs in a Web Worker to keep the UI responsive.
 * Returns `null` while loading or if the deck is not full-size.
 */
export function useDeckScore(deckCardIds: number[]): number | null {
  const [score, setScore] = useAtom(currentDeckScoreAtom);
  const collection = useCollection();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const prevKeyRef = useRef("");

  useEffect(() => {
    // Stable identity check: sort + join to ignore order changes from re-renders
    const key = deckCardIds
      .slice()
      .sort((a, b) => a - b)
      .join(",");
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    // Only score full-size decks with a loaded collection
    if (deckCardIds.length !== deckSize || !collection) {
      setScore(null);
      return;
    }

    setScore(null); // clear stale value while computing

    const worker = new Worker(new URL("../../../engine/worker/scorer-worker.ts", import.meta.url), {
      type: "module",
    });

    let cancelled = false;

    worker.onmessage = (e: MessageEvent<ScorerResponse>) => {
      if (!cancelled) setScore(e.data.expectedAtk);
      worker.terminate();
    };
    worker.onerror = (err) => {
      console.error("Deck score worker error:", err);
      worker.terminate();
    };

    worker.postMessage({
      type: "SCORE",
      collection,
      deck: deckCardIds,
      config: { deckSize, fusionDepth },
    });

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [deckCardIds, deckSize, fusionDepth, collection, setScore]);

  return score;
}
