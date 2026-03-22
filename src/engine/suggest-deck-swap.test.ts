import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OptBuffers } from "./types/buffers.ts";

const { mockExactScore } = vi.hoisted(() => ({
  mockExactScore: vi.fn<(buf: OptBuffers) => number>(),
}));

vi.mock("./initialize-buffers-browser.ts", async () => {
  const { getConfig } = await import("./config.ts");

  return {
    initializeSuggestionBuffersBrowser: () => {
      const { deckSize } = getConfig();
      return {
        fusionTable: new Int16Array(0),
        cardAtk: new Int16Array(16),
        equipCompat: new Uint8Array(0),
        deck: new Int16Array(deckSize),
        cardCounts: new Uint8Array(16),
        availableCounts: new Uint8Array(16),
        handSlots: new Uint8Array(0),
        handScores: new Int16Array(0),
        affectedHandIds: new Uint16Array(0),
        affectedHandOffsets: new Uint32Array(deckSize),
        affectedHandCounts: new Uint16Array(deckSize),
      };
    },
  };
});

vi.mock("./scoring/compute-initial-scores.ts", () => ({
  computeInitialScores: vi.fn(),
}));

vi.mock("./scoring/fusion-scorer.ts", () => ({
  FusionScorer: class {},
}));

vi.mock("./scoring/delta-evaluator.ts", () => ({
  DeltaEvaluator: class {
    computeDelta(slotIndex: number) {
      return (
        {
          0: 1,
          1: 1,
          2: 10,
          3: 20,
          4: 30,
          5: 5,
        }[slotIndex] ?? 0
      );
    }
  },
}));

vi.mock("./scoring/exact-scorer.ts", () => ({
  exactScore: (buf: OptBuffers) => mockExactScore(buf),
}));

import { resetConfig } from "./config.ts";
import { findBestDeckSwapSuggestion } from "./suggest-deck-swap.ts";

beforeEach(() => {
  mockExactScore.mockImplementation((buf) =>
    Array.from(buf.deck).reduce((sum, cardId) => sum + score(cardId), 0),
  );
});

afterEach(() => {
  resetConfig();
  vi.clearAllMocks();
});

describe("findBestDeckSwapSuggestion", () => {
  it("returns the best improving swap", () => {
    expect(
      findBestDeckSwapSuggestion({
        addedCardId: 5,
        config: { useEquipment: true, deckSize: 5, fusionDepth: 3 },
        deck: [1, 1, 2, 3, 4],
      }),
    ).toEqual({ removedCardId: 4, improvement: 14 });
  });

  it("returns null when the deck is not full", () => {
    expect(
      findBestDeckSwapSuggestion({
        addedCardId: 5,
        config: { useEquipment: true, deckSize: 3, fusionDepth: 3 },
        deck: [1, 1],
      }),
    ).toBeNull();
  });

  it("exact-scores the shortlisted candidates before picking the suggestion", () => {
    mockExactScore.mockImplementation((buf) => {
      const deck = Array.from(buf.deck);
      if (!deck.includes(6)) return 150;
      if (!deck.includes(4)) return 125;
      if (!deck.includes(3)) return 120;
      if (!deck.includes(2)) return 110;
      if (!deck.includes(7)) return 105;
      return 100;
    });

    expect(
      findBestDeckSwapSuggestion({
        addedCardId: 5,
        config: { useEquipment: true, deckSize: 6, fusionDepth: 3 },
        deck: [1, 7, 2, 3, 4, 6],
      }),
    ).toEqual({ removedCardId: 4, improvement: 25 });
  });

  it("returns null when no swap strictly improves the score", () => {
    mockExactScore.mockImplementation(() => 100);

    expect(
      findBestDeckSwapSuggestion({
        addedCardId: 5,
        config: { useEquipment: true, deckSize: 2, fusionDepth: 3 },
        deck: [1, 2],
      }),
    ).toBeNull();
  });

  it("reuses a provided current deck score", () => {
    findBestDeckSwapSuggestion({
      addedCardId: 5,
      config: { useEquipment: true, deckSize: 5, fusionDepth: 3 },
      currentDeckScore: 18,
      deck: [1, 1, 2, 3, 4],
    });

    expect(mockExactScore).toHaveBeenCalledTimes(2);
  });
});

function score(cardId: number): number {
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
