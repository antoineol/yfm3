import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DeckSwapSuggestion,
  FindBestDeckSwapSuggestionOptions,
} from "../../../engine/suggest-deck-swap.ts";

interface SuggestionWorkerResponse {
  requestId: number;
  suggestion: DeckSwapSuggestion | null;
}

interface UseDeckSwapSuggestionOptions {
  addedCardId: number | null;
  currentDeckScore: number | null;
  deck: Array<{ cardId: number }> | undefined;
  deckSize: number;
  fusionDepth: number;
  ownedCardTotals: Record<number, number> | undefined;
}

export function useDeckSwapSuggestion(options: UseDeckSwapSuggestionOptions) {
  const { addedCardId, currentDeckScore, deck, deckSize, fusionDepth, ownedCardTotals } = options;
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<DeckSwapSuggestion | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);
  const deckCardIdsKey = useMemo(() => deckCardIds.join(","), [deckCardIds]);
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
  const request = useMemo<FindBestDeckSwapSuggestionOptions | null>(() => {
    if (
      addedCardId === null ||
      stableOwnedCardTotals === undefined ||
      stableDeckCardIds.length !== deckSize
    ) {
      return null;
    }

    return {
      addedCardId,
      collection: stableOwnedCardTotals,
      config: { deckSize, fusionDepth },
      currentDeckScore,
      deck: stableDeckCardIds,
    };
  }, [
    addedCardId,
    currentDeckScore,
    deckSize,
    fusionDepth,
    stableDeckCardIds,
    stableOwnedCardTotals,
  ]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../../engine/worker/suggestion-worker.ts", import.meta.url),
      { type: "module" },
    );

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!request) {
      setLoading(false);
      setSuggestion(null);
      return;
    }

    const worker = workerRef.current;
    if (!worker) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setSuggestion(null);

    worker.onmessage = (event: MessageEvent<SuggestionWorkerResponse>) => {
      if (event.data.requestId !== requestIdRef.current) return;
      setLoading(false);
      setSuggestion(event.data.suggestion);
    };
    worker.onerror = (error) => {
      console.error("Suggestion lookup failed:", error);
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setSuggestion(null);
      }
    };
    worker.postMessage({ requestId, options: request });

    return () => {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    };
  }, [request]);

  return { loading, suggestion, clearSuggestion: () => setSuggestion(null) };
}

function serializeOwnedCardTotals(ownedCardTotals: Record<number, number> | undefined) {
  if (ownedCardTotals === undefined) return "";

  return Object.entries(ownedCardTotals)
    .sort(([leftCardId], [rightCardId]) => Number(leftCardId) - Number(rightCardId))
    .map(([cardId, quantity]) => `${cardId}:${quantity}`)
    .join(",");
}
