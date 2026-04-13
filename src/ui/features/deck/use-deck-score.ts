import { useAtom } from "jotai";
import { useEffect } from "react";
import { MODS } from "../../../engine/mods.ts";
import { DECK_SIZE } from "../../../engine/types/constants.ts";
import type { ScorerResponse } from "../../../engine/worker/messages.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize, useFusionDepth, useUseEquipment } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

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
  const ownedCardTotals = useOwnedCardTotals();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const useEquipment = useUseEquipment();
  const modId = useSelectedMod();
  const bridge = useBridge();

  useEffect(() => {
    // Stable identity check: sort + join to ignore order changes from re-renders
    const key = deckCardIds
      .slice()
      .sort((a, b) => a - b)
      .join(",");

    // Skip if already scored for this exact deck (survives tab-switch remounts)
    if (key === lastCompletedKey) return;

    // Only score full-size decks with a loaded collection.
    // Accept both deckSize (scoring slots) and DECK_SIZE (full deck with utility
    // cards) so scoring works when preserveUtilityCards is enabled.
    const validLength = deckCardIds.length === deckSize || deckCardIds.length === DECK_SIZE;
    if (!validLength || !ownedCardTotals) {
      setScore(null);
      lastCompletedKey = "";
      return;
    }

    // Keep previous score visible while recomputing (avoid null gap that hides
    // dependent UI like the improvement %). The score is only nulled when the
    // deck becomes invalid (not full-size / no collection) — see guard above.

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
      collection: ownedCardTotals,
      deck: deckCardIds,
      config: {
        deckSize,
        fusionDepth,
        useEquipment,
        megamorphId: bridge.gameData?.equipBonuses?.megamorphId ?? MODS[modId].megamorphId,
        equipBonus: bridge.gameData?.equipBonuses?.equipBonus ?? 500,
        megamorphBonus: bridge.gameData?.equipBonuses?.megamorphBonus ?? 1000,
        terrain: 0,
        fieldBonusTable: bridge.gameData?.fieldBonusTable ?? null,
      },
      modId,
      gameData: bridge.gameData ?? undefined,
    });

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [
    deckCardIds,
    deckSize,
    fusionDepth,
    useEquipment,
    ownedCardTotals,
    setScore,
    modId,
    bridge.gameData,
  ]);

  return score;
}

/** Reset module-level cache. Exported for tests only. */
export function _resetDeckScoreCache() {
  lastCompletedKey = "";
}
