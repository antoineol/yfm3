import {
  type DeckSwapSuggestion,
  type FindBestDeckSwapSuggestionOptions,
  findBestDeckSwapSuggestion,
} from "../suggest-deck-swap.ts";

self.onmessage = (
  event: MessageEvent<{ requestId: number; options: FindBestDeckSwapSuggestionOptions }>,
) => {
  self.postMessage({
    requestId: event.data.requestId,
    suggestion: findBestDeckSwapSuggestion(event.data.options) as DeckSwapSuggestion | null,
  });
};
