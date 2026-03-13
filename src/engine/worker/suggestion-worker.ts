import {
  type DeckSwapSuggestion,
  type FindBestDeckSwapSuggestionOptions,
  findBestDeckSwapSuggestion,
} from "../suggest-deck-swap.ts";

self.onmessage = (event: MessageEvent<FindBestDeckSwapSuggestionOptions>) => {
  self.postMessage(findBestDeckSwapSuggestion(event.data) as DeckSwapSuggestion | null);
};
