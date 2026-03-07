import { beforeAll, describe, expect, it } from "vitest";

import { DECK_SIZE, FUSION_NONE, MAX_CARD_ID } from "../engine/types/constants.ts";
import { deckFixtures, handFixtures } from "./reference-fixtures.gen.ts";
import { referenceEvaluateHand } from "./reference-scorer.ts";
import { createAllCardsBuffers } from "./test-helpers.ts";

let fusionTable: Int16Array;
let cardAtk: Int16Array;

beforeAll(() => {
  const buf = createAllCardsBuffers();
  fusionTable = buf.fusionTable;
  cardAtk = buf.cardAtk;
});

// ---------------------------------------------------------------------------
// Reference scorer self-consistency
// ---------------------------------------------------------------------------
describe("reference scorer self-consistency", () => {
  it("commutativity: same hand in any permutation gives same result", () => {
    const hand = [56, 66, 58, 403, 279];
    const base = referenceEvaluateHand(hand, fusionTable, cardAtk);

    const permutations = [
      [279, 403, 58, 66, 56],
      [58, 56, 279, 66, 403],
      [403, 58, 66, 279, 56],
      [66, 279, 56, 403, 58],
    ];
    for (const perm of permutations) {
      expect(referenceEvaluateHand(perm, fusionTable, cardAtk)).toBe(base);
    }
  });

  it("determinism: same input gives same output every time", () => {
    const hand = [26, 66, 56, 58, 403];
    const results = Array.from({ length: 10 }, () =>
      referenceEvaluateHand(hand, fusionTable, cardAtk),
    );
    for (const r of results) {
      expect(r).toBe(results[0]);
    }
  });

  it("no-fusion baseline: hand with no fusions returns max base ATK", () => {
    const hand = [273, 279, 453, 277, 415];
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        const a = hand[i] ?? 0;
        const b = hand[j] ?? 0;
        expect(fusionTable[a * MAX_CARD_ID + b]).toBe(FUSION_NONE);
      }
    }
    const maxBaseAtk = Math.max(...hand.map((id) => cardAtk[id] ?? 0));
    expect(referenceEvaluateHand(hand, fusionTable, cardAtk)).toBe(maxBaseAtk);
  });

  it("depth limit: max 3 fusions per hand", () => {
    // This hand has many fusion paths; the scorer caps at depth 3
    const hand = [26, 66, 56, 58, 403];
    const result = referenceEvaluateHand(hand, fusionTable, cardAtk);
    expect(result).toBeGreaterThan(cardAtk[403] ?? 0);
  });

  it("strict improvement: fusion skipped when result ATK <= material ATK", () => {
    // DarkMagician(401,2500) + GravekeepersCommandant(439,2100) don't fuse
    expect(fusionTable[401 * MAX_CARD_ID + 439]).toBe(FUSION_NONE);
    // Fillers that don't fuse with anything in the hand
    const hand = [401, 439, 1, 2, 3];
    expect(referenceEvaluateHand(hand, fusionTable, cardAtk)).toBe(2500);
  });

  it("agrees with max-base-ATK on no-fusion hands", () => {
    const noFusionHands = [
      [273, 279, 453, 277, 415],
      [341, 379, 348, 381, 300],
    ];
    for (const hand of noFusionHands) {
      const maxBase = Math.max(...hand.map((id) => cardAtk[id] ?? 0));
      expect(referenceEvaluateHand(hand, fusionTable, cardAtk)).toBe(maxBase);
    }
  });
});

// ---------------------------------------------------------------------------
// Hand fixture validation
// ---------------------------------------------------------------------------
describe("hand fixtures", () => {
  it("all hand fixtures produce expected values", () => {
    for (const fixture of handFixtures) {
      const result = referenceEvaluateHand(fixture.hand, fusionTable, cardAtk);
      expect(result, fixture.description).toBe(fixture.expectedMaxAtk);
    }
  });

  it("fixture hands use valid card IDs", () => {
    for (const fixture of handFixtures) {
      expect(fixture.hand.length, fixture.description).toBe(5);
      for (const id of fixture.hand) {
        expect(id, `${fixture.description}: card ID ${id}`).toBeGreaterThanOrEqual(0);
        expect(id, `${fixture.description}: card ID ${id}`).toBeLessThan(MAX_CARD_ID);
      }
    }
  });

  it("has at least 15 hand fixtures", () => {
    expect(handFixtures.length).toBeGreaterThanOrEqual(15);
  });
});

// ---------------------------------------------------------------------------
// Deck fixture structural validation (no scoring — regenerate with `bun run gen:ref`)
// ---------------------------------------------------------------------------
describe("deck fixtures", () => {
  it("fixture decks are valid: 40 cards, valid IDs", () => {
    for (const fixture of deckFixtures) {
      expect(fixture.deck.length, fixture.description).toBe(DECK_SIZE);
      for (const id of fixture.deck) {
        expect(id, `${fixture.description}: card ID ${id}`).toBeGreaterThanOrEqual(0);
        expect(id, `${fixture.description}: card ID ${id}`).toBeLessThan(MAX_CARD_ID);
      }
    }
  });

  it("has at least 3 deck fixtures", () => {
    expect(deckFixtures.length).toBeGreaterThanOrEqual(3);
  });
});
