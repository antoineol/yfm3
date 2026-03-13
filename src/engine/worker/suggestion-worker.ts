import { findBestDeckSwapSuggestion } from "../suggest-deck-swap.ts";
import type { SuggestionInit, SuggestionResult } from "./messages.ts";

self.onmessage = (event: MessageEvent<SuggestionInit>) => {
  const suggestion = findBestDeckSwapSuggestion(event.data);
  const result: SuggestionResult = {
    type: "SUGGESTION_RESULT",
    suggestion,
  };
  self.postMessage(result);
};
