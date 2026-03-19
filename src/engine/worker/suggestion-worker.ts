import { ensureCsvLoaded } from "../initialize-buffers-browser.ts";
import {
  type DeckSwapSuggestion,
  type FindBestDeckSwapSuggestionOptions,
  findBestDeckSwapSuggestion,
} from "../suggest-deck-swap.ts";

self.onmessage = async (
  event: MessageEvent<{ requestId: number; options: FindBestDeckSwapSuggestionOptions }>,
) => {
  await ensureCsvLoaded();
  self.postMessage({
    requestId: event.data.requestId,
    suggestion: findBestDeckSwapSuggestion(event.data.options) as DeckSwapSuggestion | null,
  });
};
