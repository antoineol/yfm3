import { useEffect, useMemo, useRef, useState } from "react";
import type { DeckSwapSuggestion } from "../../../engine/suggest-deck-swap.ts";
import { findBestDeckSwapSuggestionInWorker } from "../../../engine/suggest-deck-swap.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";

export interface DeckSwapSuggestionState {
  status: "idle" | "loading" | "ready";
  suggestion: DeckSwapSuggestion | null;
  clear: () => void;
}

interface DeckSwapSuggestionSnapshot {
  status: "idle" | "loading" | "ready";
  suggestion: DeckSwapSuggestion | null;
}

const IDLE_STATE: DeckSwapSuggestionSnapshot = { status: "idle", suggestion: null };

export function useDeckSwapSuggestion(): DeckSwapSuggestionState {
  const ownedCardTotals = useOwnedCardTotals();
  const deck = useDeck();
  const lastAdded = useLastAddedCard();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const [state, setState] = useState<DeckSwapSuggestionSnapshot>(IDLE_STATE);

  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);
  const deckCardIdsKey = useMemo(() => serializeCardIds(deckCardIds), [deckCardIds]);
  const ownedCardTotalsKey = useMemo(
    () => serializeOwnedCardTotals(ownedCardTotals),
    [ownedCardTotals],
  );
  const stableDeckCardIdsRef = useRef(deckCardIds);
  const stableDeckCardIdsKeyRef = useRef(deckCardIdsKey);
  const stableOwnedCardTotalsRef = useRef(ownedCardTotals);
  const stableOwnedCardTotalsKeyRef = useRef(ownedCardTotalsKey);

  if (stableDeckCardIdsKeyRef.current !== deckCardIdsKey) {
    stableDeckCardIdsRef.current = deckCardIds;
    stableDeckCardIdsKeyRef.current = deckCardIdsKey;
  }
  if (stableOwnedCardTotalsKeyRef.current !== ownedCardTotalsKey) {
    stableOwnedCardTotalsRef.current = ownedCardTotals;
    stableOwnedCardTotalsKeyRef.current = ownedCardTotalsKey;
  }

  const stableDeckCardIds = stableDeckCardIdsRef.current;
  const stableOwnedCardTotals = stableOwnedCardTotalsRef.current;
  const clear = () => setState(IDLE_STATE);

  useEffect(() => {
    if (stableOwnedCardTotals === undefined || deck === undefined || !lastAdded) {
      setState(IDLE_STATE);
      return;
    }
    if (stableDeckCardIds.length !== deckSize) {
      setState(IDLE_STATE);
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", suggestion: null });

    findBestDeckSwapSuggestionInWorker(
      {
        addedCardId: lastAdded.cardId,
        collection: stableOwnedCardTotals,
        config: { deckSize, fusionDepth },
        deck: stableDeckCardIds,
      },
      controller.signal,
    )
      .then((suggestion) => {
        setState(suggestion ? { status: "ready", suggestion } : IDLE_STATE);
      })
      .catch((error: Error) => {
        if (error.message !== "Suggestion aborted") {
          console.error("Suggestion lookup failed:", error);
          setState(IDLE_STATE);
        }
      });

    return () => controller.abort();
  }, [deck, deckSize, fusionDepth, lastAdded, stableDeckCardIds, stableOwnedCardTotals]);

  return { ...state, clear };
}

function serializeCardIds(cardIds: readonly number[]): string {
  return cardIds
    .slice()
    .sort((leftId, rightId) => leftId - rightId)
    .join(",");
}

function serializeOwnedCardTotals(ownedCardTotals: Record<number, number> | undefined): string {
  if (ownedCardTotals === undefined) {
    return "";
  }

  return Object.entries(ownedCardTotals)
    .sort(([leftId], [rightId]) => Number(leftId) - Number(rightId))
    .map(([cardId, quantity]) => `${cardId}:${quantity}`)
    .join(",");
}
