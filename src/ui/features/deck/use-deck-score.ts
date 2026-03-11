import { useAtom } from "jotai";
import { useEffect } from "react";
import type { ScorerResponse } from "../../../engine/worker/messages.ts";
import { useCollection } from "../../db/use-collection.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";

/**
 * Key of the last successfully scored deck.
 * Module-level so it persists across component remounts (e.g. tab switches).
 * Set only when the scorer worker responds — not when computation starts.
 */
let lastCompletedKey = "";

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

  useEffect(() => {
    // Stable identity check: sort + join to ignore order changes from re-renders
    const key = deckCardIds
      .slice()
      .sort((a, b) => a - b)
      .join(",");

    // Skip if already scored for this exact deck (survives tab-switch remounts)
    if (key === lastCompletedKey) return;

    // Only score full-size decks with a loaded collection
    if (deckCardIds.length !== deckSize || !collection) {
      setScore(null);
      lastCompletedKey = "";
      return;
    }

    setScore(null); // clear stale value while computing

    const worker = new Worker(new URL("../../../engine/worker/scorer-worker.ts", import.meta.url), {
      type: "module",
    });

    let cancelled = false;

    worker.onmessage = (e: MessageEvent<ScorerResponse>) => {
      if (!cancelled) {
        setScore(e.data.expectedAtk);
        lastCompletedKey = key;
      }
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

/** Reset module-level cache. Exported for tests only. */
export function _resetDeckScoreCache() {
  lastCompletedKey = "";
}
