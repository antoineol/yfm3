import { ensureCsvLoaded } from "../initialize-buffers-browser.ts";
import type { ModId } from "../mods.ts";
import {
  type DeckSwapSuggestion,
  type FindBestDeckSwapSuggestionOptions,
  findBestDeckSwapSuggestion,
} from "../suggest-deck-swap.ts";

self.onmessage = async (
  event: MessageEvent<{
    requestId: number;
    options: FindBestDeckSwapSuggestionOptions;
    modId: ModId;
  }>,
) => {
  const { requestId, options, modId } = event.data;
  await ensureCsvLoaded(modId);
  self.postMessage({
    requestId,
    suggestion: findBestDeckSwapSuggestion(options, modId) as DeckSwapSuggestion | null,
  });
};
