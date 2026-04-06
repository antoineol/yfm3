import { ensureCsvLoaded } from "../initialize-buffers-browser.ts";
import type { ModId } from "../mods.ts";
import {
  type DeckSwapSuggestion,
  type FindBestDeckSwapSuggestionOptions,
  findBestDeckSwapSuggestion,
} from "../suggest-deck-swap.ts";
import type { BridgeGameData } from "./messages.ts";

self.onmessage = async (
  event: MessageEvent<{
    requestId: number;
    options: FindBestDeckSwapSuggestionOptions;
    modId: ModId;
    gameData?: BridgeGameData;
  }>,
) => {
  const { requestId, options, modId, gameData } = event.data;
  await ensureCsvLoaded(modId, !!gameData);
  self.postMessage({
    requestId,
    suggestion: findBestDeckSwapSuggestion(options, modId, gameData) as DeckSwapSuggestion | null,
  });
};
