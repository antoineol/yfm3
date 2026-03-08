import { afterEach, describe, expect, it } from "vitest";
import { resetConfig, setConfig } from "../config.ts";
import { createBuffers } from "./buffers.ts";
import { CHOOSE_5, DECK_SIZE, HAND_SIZE, MAX_CARD_ID, NUM_HANDS } from "./constants.ts";

afterEach(() => resetConfig());

describe("OptBuffers", () => {
  it("exact sizes with default deck size", () => {
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

  it("sizes scale with custom deck size", () => {
    setConfig({ deckSize: 20 });
    const b = createBuffers();
    const expectedHands = Math.min(NUM_HANDS, CHOOSE_5[20] ?? 0);
    expect(b.deck.length).toBe(20);
    expect(b.affectedHandOffsets.length).toBe(20);
    expect(b.affectedHandCounts.length).toBe(20);
    expect(b.handScores.length).toBe(expectedHands);
    expect(b.handSlots.length).toBe(expectedHands * HAND_SIZE);
    expect(b.affectedHandIds.length).toBe(expectedHands * HAND_SIZE);
    // Game data arrays are unchanged
    expect(b.fusionTable.length).toBe(MAX_CARD_ID * MAX_CARD_ID);
    expect(b.cardAtk.length).toBe(MAX_CARD_ID);
  });

  it("caps numHands at C(deckSize,5) for small decks", () => {
    setConfig({ deckSize: 5 });
    const b = createBuffers();
    // C(5,5) = 1 → only 1 hand possible
    expect(b.handScores.length).toBe(1);
    expect(b.handSlots.length).toBe(HAND_SIZE);
    expect(b.deck.length).toBe(5);
  });
});
