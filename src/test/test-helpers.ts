import { initializeBuffers, mulberry32 } from "../engine/initialize-buffers.ts";
import type { OptBuffers } from "../engine/types/buffers.ts";
import { MAX_COPIES } from "../engine/types/constants.ts";

export function createAllCardsBuffers(): OptBuffers {
  return initializeBuffers((b, cards) => {
    for (const card of cards) b.availableCounts[card.id] = MAX_COPIES;
  }, mulberry32(42));
}
