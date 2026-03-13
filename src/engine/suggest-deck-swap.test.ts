import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OptBuffers } from "./types/buffers.ts";

const mockExactScore = vi.fn<(buf: OptBuffers) => number>();

vi.mock("./initialize-buffers-browser.ts", () => ({
  initializeBuffersBrowser: vi.fn((collection: ReadonlyMap<number, number>) => {
    const buf = {
      fusionTable: new Int16Array(0),
      cardAtk: new Int16Array(16),
      deck: new Int16Array(5),
      cardCounts: new Uint8Array(16),
      availableCounts: new Uint8Array(16),
      handSlots: new Uint8Array(0),
      handScores: new Int16Array(0),
      affectedHandIds: new Uint16Array(0),
      affectedHandOffsets: new Uint32Array(5),
      affectedHandCounts: new Uint16Array(5),
    };

    for (const [cardId, quantity] of collection) {
      buf.availableCounts[cardId] = quantity;
    }

    return buf;
  }),
}));

vi.mock("./load-explicit-deck.ts", () => ({
  loadExplicitDeck: vi.fn(
    (buf: OptBuffers & { baselineDeck?: number[] }, deck: readonly number[]) => {
      buf.cardCounts.fill(0);
      for (let i = 0; i < deck.length; i++) {
        const cardId = deck[i] ?? 0;
        buf.deck[i] = cardId;
        buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
      }
      if (!buf.baselineDeck) {
        buf.baselineDeck = deck.slice();
      }
    },
  ),
}));

vi.mock("./scoring/compute-initial-scores.ts", () => ({
  computeInitialScores: vi.fn(),
}));

vi.mock("./scoring/fusion-scorer.ts", () => ({
  FusionScorer: class {},
}));

vi.mock("./scoring/delta-evaluator.ts", () => ({
  DeltaEvaluator: class {
    computeDelta(slotIndex: number, buf: OptBuffers & { baselineDeck?: number[] }) {
      const removedCardId = buf.baselineDeck?.[slotIndex] ?? 0;
      const addedCardId = buf.deck[slotIndex] ?? 0;
      return deltaScore(addedCardId) - deltaScore(removedCardId);
    }
  },
}));

vi.mock("./scoring/exact-scorer.ts", () => ({
  exactScore: (buf: OptBuffers) => mockExactScore(buf),
}));

import { findBestDeckSwapSuggestion } from "./suggest-deck-swap.ts";

beforeEach(() => {
  mockExactScore.mockImplementation((buf) =>
    Array.from(buf.deck).reduce((sum, cardId) => sum + exactScore(cardId), 0),
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("findBestDeckSwapSuggestion", () => {
  it("returns a positive suggestion when the added card improves the deck", () => {
    const suggestion = findBestDeckSwapSuggestion({
      addedCardId: 5,
      collection: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
      config: { deckSize: 5, fusionDepth: 3 },
      deck: [1, 1, 2, 3, 4],
    });

    expect(suggestion).toEqual({
      addedCardId: 5,
      removedCardId: 4,
      currentDeckScore: 18,
      suggestedScore: 32,
      improvement: 14,
    });
  });

  it("returns null when no single swap improves the deck", () => {
    mockExactScore.mockImplementation(() => 100);

    const suggestion = findBestDeckSwapSuggestion({
      addedCardId: 5,
      collection: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      config: { deckSize: 5, fusionDepth: 3 },
      deck: [1, 2, 3, 4, 1],
    });

    expect(suggestion).toBeNull();
  });

  it("ignores self-swaps when the added card is already in the deck", () => {
    const suggestion = findBestDeckSwapSuggestion({
      addedCardId: 5,
      collection: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 2 },
      config: { deckSize: 5, fusionDepth: 3 },
      deck: [5, 1, 2, 3, 4],
    });

    expect(suggestion?.removedCardId).toBe(4);
  });

  it("collapses duplicate outgoing copies before exact scoring", () => {
    findBestDeckSwapSuggestion({
      addedCardId: 5,
      collection: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
      config: { deckSize: 5, fusionDepth: 3 },
      deck: [1, 1, 2, 3, 4],
    });

    expect(mockExactScore).toHaveBeenCalledTimes(5);
  });

  it("can reject a sampled false positive after exact scoring", () => {
    mockExactScore.mockImplementation((buf) => (Array.from(buf.deck).includes(5) ? 18 : 18));

    const suggestion = findBestDeckSwapSuggestion({
      addedCardId: 5,
      collection: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
      config: { deckSize: 5, fusionDepth: 3 },
      deck: [1, 1, 2, 3, 4],
    });

    expect(suggestion).toBeNull();
  });
});

function deltaScore(cardId: number): number {
  return (
    {
      1: 4,
      2: 5,
      3: 6,
      4: 3,
      5: 14,
    }[cardId] ?? 0
  );
}

function exactScore(cardId: number): number {
  return (
    {
      1: 5,
      2: 4,
      3: 3,
      4: 1,
      5: 15,
    }[cardId] ?? 0
  );
}
