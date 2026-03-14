import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  addedCardAvailableCopies: number;
  currentDeckScore: number | null;
  deck: Array<{ cardId: number }> | undefined;
  deckSize: number;
  fusionDepth: number;
}

export function useDeckSwapSuggestion(options: UseDeckSwapSuggestionOptions) {
  const { addedCardId, addedCardAvailableCopies, currentDeckScore, deck, deckSize, fusionDepth } =
    options;
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<DeckSwapSuggestion | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);
  const deckCardIdsKey = useMemo(() => deckCardIds.join(","), [deckCardIds]);
  const stableDeckCardIdsRef = useRef(deckCardIds);
  const stableDeckCardIdsKeyRef = useRef(deckCardIdsKey);

  if (stableDeckCardIdsKeyRef.current !== deckCardIdsKey) {
    stableDeckCardIdsRef.current = deckCardIds;
    stableDeckCardIdsKeyRef.current = deckCardIdsKey;
  }

  const stableDeckCardIds = stableDeckCardIdsRef.current;
  const request = useMemo<FindBestDeckSwapSuggestionOptions | null>(() => {
    if (
      addedCardId === null ||
      addedCardAvailableCopies <= 0 ||
      stableDeckCardIds.length !== deckSize
    ) {
      return null;
    }

    return {
      addedCardId,
      config: { deckSize, fusionDepth },
      currentDeckScore,
      deck: stableDeckCardIds,
    };
  }, [
    addedCardId,
    currentDeckScore,
    deckSize,
    fusionDepth,
    addedCardAvailableCopies,
    stableDeckCardIds,
  ]);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!request) {
      setLoading(false);
      setSuggestion(null);
      return;
    }

    const worker = getSuggestionWorker(workerRef);

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

  const clearSuggestion = useCallback(() => setSuggestion(null), []);

  return { loading, suggestion, clearSuggestion };
}

function getSuggestionWorker(workerRef: { current: Worker | null }) {
  if (workerRef.current) return workerRef.current;

  workerRef.current = new Worker(
    new URL("../../../engine/worker/suggestion-worker.ts", import.meta.url),
    {
      type: "module",
    },
  );

  return workerRef.current;
}
