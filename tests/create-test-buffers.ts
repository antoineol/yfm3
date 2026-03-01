import { initializeOptimizer, mulberry32 } from "@engine/initialize-buffers.ts";
import type { OptBuffers } from "@engine/types/buffers.ts";
import { MAX_COPIES } from "@engine/types/constants.ts";

export function createTestBuffers(): OptBuffers {
  return initializeOptimizer(mulberry32(42), (buf, cards) => {
    for (const card of cards) buf.availableCounts[card.id] = MAX_COPIES;
  });
}
