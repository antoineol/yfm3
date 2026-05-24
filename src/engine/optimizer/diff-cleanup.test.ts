import { afterEach, describe, expect, it, vi } from "vitest";
import { resetConfig, setConfig } from "../config.ts";
import { createBuffers, type OptBuffers } from "../types/buffers.ts";
import type { IDeltaEvaluator, IScorer } from "../types/interfaces.ts";
import { cleanupDeckAgainstCurrent } from "./diff-cleanup.ts";

afterEach(() => resetConfig());

describe("cleanupDeckAgainstCurrent", () => {
  it("reverts noisy changes when sampled score does not decrease", () => {
    const buf = makeBuffer([9, 2, 3, 4, 5]);
    const deltaEvaluator = makeDeltaEvaluator(() => 0);

    const score = cleanupDeckAgainstCurrent(
      buf,
      makeScorer(),
      deltaEvaluator,
      [1, 2, 3, 4, 5],
      100,
      performance.now() + 1000,
    );

    expect(score).toBe(100);
    expect(Array.from(buf.deck.subarray(0, 5))).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the suggested card when reverting would reduce sampled score", () => {
    const buf = makeBuffer([9, 2, 3, 4, 5]);
    const deltaEvaluator = makeDeltaEvaluator(() => -1);

    const score = cleanupDeckAgainstCurrent(
      buf,
      makeScorer(),
      deltaEvaluator,
      [1, 2, 3, 4, 5],
      100,
      performance.now() + 1000,
    );

    expect(score).toBe(100);
    expect(Array.from(buf.deck.subarray(0, 5))).toEqual([9, 2, 3, 4, 5]);
  });
});

function makeBuffer(deck: number[]): OptBuffers {
  setConfig({ deckSize: deck.length });
  const buf = createBuffers();
  buf.availableCounts.fill(1);
  for (let i = 0; i < deck.length; i++) {
    const cardId = deck[i] ?? 0;
    buf.deck[i] = cardId;
    buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
  }
  return buf;
}

function makeScorer(): IScorer {
  return { evaluateHand: vi.fn(() => 0) };
}

function makeDeltaEvaluator(computeDelta: () => number): IDeltaEvaluator {
  return {
    computeDelta: vi.fn(computeDelta),
    commitDelta: vi.fn(),
  };
}
