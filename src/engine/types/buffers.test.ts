import { describe, expect, it } from "vitest";
import { createBuffers } from "./buffers.ts";
import { DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./constants.ts";

describe("OptBuffers", () => {
  it("exact sizes", () => {
    const b = createBuffers();
    expect(b.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
    expect(b.cardAtk.length).toBe(MAX_CARD_ID);
    expect(b.deck.length).toBe(DECK_SIZE);
    expect(b.cardCounts.length).toBe(MAX_CARD_ID);
    expect(b.availableCounts.length).toBe(MAX_CARD_ID);
    expect(b.handSlots.length).toBe(NUM_HANDS * HAND_SIZE);
    expect(b.handScores.length).toBe(NUM_HANDS);
    expect(b.affectedHandIds.length).toBe(NUM_HANDS * HAND_SIZE);
    expect(b.affectedHandOffsets.length).toBe(DECK_SIZE);
    expect(b.affectedHandCounts.length).toBe(DECK_SIZE);
  });
});
