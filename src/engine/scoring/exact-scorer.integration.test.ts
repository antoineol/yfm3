import { describe, expect, it } from "vitest";
import { deckFixtures } from "../../test/reference-fixtures.gen.ts";
import { referenceScoreDeck } from "../../test/reference-scorer.ts";
import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import { exactScore } from "./exact-scorer.ts";
import { FusionScorer } from "./fusion-scorer.ts";

describe("exactScore", () => {
  const buf = createAllCardsBuffers();
  const scorer = new FusionScorer();

  it("matches reference deck scorer on all deck fixtures", () => {
    for (const fixture of deckFixtures) {
      // Load fixture deck into buffers
      for (let i = 0; i < 40; i++) {
        buf.deck[i] = fixture.deck[i] ?? 0;
      }
      const exact = exactScore(buf, scorer);
      const reference = referenceScoreDeck(fixture.deck, buf.fusionTable, buf.cardAtk);
      expect(exact).toBeCloseTo(reference, 6);
    }
  });

  it("is deterministic: same deck produces the same score", () => {
    const fixture = deckFixtures[0];
    if (!fixture) throw new Error("No deck fixtures");
    for (let i = 0; i < 40; i++) {
      buf.deck[i] = fixture.deck[i] ?? 0;
    }
    const score1 = exactScore(buf, scorer);
    const score2 = exactScore(buf, scorer);
    expect(score1).toBe(score2);
  });
});
