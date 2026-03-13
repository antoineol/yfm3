import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import type { DeckSwapSuggestion } from "../../../engine/suggest-deck-swap.ts";
import { findBestDeckSwapSuggestionInWorker } from "../../../engine/suggest-deck-swap.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";

export interface DeckSwapSuggestionState {
  status: "idle" | "loading" | "ready";
  suggestion: DeckSwapSuggestion | null;
}

const IDLE_STATE: DeckSwapSuggestionState = { status: "idle", suggestion: null };

export function useDeckSwapSuggestion(): DeckSwapSuggestionState {
  const ownedCardTotals = useOwnedCardTotals();
  const deck = useDeck();
  const lastAdded = useLastAddedCard();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const currentDeckScore = useAtomValue(currentDeckScoreAtom);
  const [state, setState] = useState<DeckSwapSuggestionState>(IDLE_STATE);

  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);

  useEffect(() => {
    if (ownedCardTotals === undefined || deck === undefined || !lastAdded) {
      setState(IDLE_STATE);
      return;
    }
    if (deckCardIds.length !== deckSize) {
      setState(IDLE_STATE);
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", suggestion: null });

    findBestDeckSwapSuggestionInWorker(
      {
        addedCardId: lastAdded.cardId,
        collection: ownedCardTotals,
        config: { deckSize, fusionDepth },
        currentDeckScore,
        deck: deckCardIds,
      },
      controller.signal,
    )
      .then((suggestion) => {
        setState(suggestion ? { status: "ready", suggestion } : IDLE_STATE);
      })
      .catch((error: Error) => {
        if (error.message !== "Suggestion aborted") {
          console.error("Suggestion lookup failed:", error);
        }
      });

    return () => controller.abort();
  }, [ownedCardTotals, currentDeckScore, deck, deckCardIds, deckSize, fusionDepth, lastAdded]);

  return state;
}
