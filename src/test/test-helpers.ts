import { setConfig } from "../engine/config.ts";
import type { Collection } from "../engine/data/card-model.ts";
import { initializeBuffers, mulberry32 } from "../engine/initialize-buffers.ts";
import type { OptBuffers } from "../engine/types/buffers.ts";
import { MAX_CARD_ID, MAX_COPIES } from "../engine/types/constants.ts";

/** Build a collection where every possible card is owned at MAX_COPIES. */
function allCardsCollection(): Collection {
  const m = new Map<number, number>();
  for (let id = 0; id < MAX_CARD_ID; id++) m.set(id, MAX_COPIES);
  return m;
}

export function createAllCardsBuffers(deckSize?: number): OptBuffers {
  if (deckSize != null) setConfig({ deckSize });
  return initializeBuffers(allCardsCollection(), mulberry32(42));
}
