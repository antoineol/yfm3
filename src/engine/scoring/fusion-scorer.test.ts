import { beforeAll, describe, expect, it } from "vitest";
import { handFixtures } from "../../test/reference-fixtures.gen.ts";
import { referenceEvaluateHand } from "../../test/reference-scorer.ts";
import { createAllCardsBuffers } from "../../test/test-helpers.ts";
import type { OptBuffers } from "../types/buffers.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { FusionScorer } from "./fusion-scorer.ts";

let buf: OptBuffers;
const scorer = new FusionScorer();

beforeAll(() => {
  buf = createAllCardsBuffers();
});

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------
describe("FusionScorer", () => {
  it("no-fusion hand: returns highest base ATK", () => {
    const hand = new Uint16Array([273, 279, 453, 277, 415]);
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        const a = hand[i] ?? 0;
        const b = hand[j] ?? 0;
        expect(buf.fusionTable[a * MAX_CARD_ID + b]).toBe(FUSION_NONE);
      }
    }
    const maxBase = Math.max(...Array.from(hand).map((id) => buf.cardAtk[id] ?? 0));
    expect(scorer.evaluateHand(hand, buf)).toBe(maxBase);
  });

  it("single fusion: two cards fuse, result ATK returned", () => {
    const hand = new Uint16Array([56, 443, 403, 279, 453]);
    expect(scorer.evaluateHand(hand, buf)).toBe(4000);
  });

  it("2-fusion chain: A+B→X, X+C→Y", () => {
    const hand = new Uint16Array([56, 66, 58, 403, 279]);
    expect(scorer.evaluateHand(hand, buf)).toBe(4000);
  });

  it("3-fusion chain: maximum depth chain works", () => {
    const hand = new Uint16Array([26, 66, 56, 58, 403]);
    expect(scorer.evaluateHand(hand, buf)).toBe(4000);
  });

  it("chain depth limit (F4): 4th fusion is NOT attempted", () => {
    const hand = new Uint16Array([26, 66, 56, 58, 403]);
    const refResult = referenceEvaluateHand(Array.from(hand), buf.fusionTable, buf.cardAtk);
    expect(scorer.evaluateHand(hand, buf)).toBe(refResult);
  });

  it("fusion result re-fuse by kind", () => {
    const hand = new Uint16Array([66, 56, 46, 6, 73]);
    expect(scorer.evaluateHand(hand, buf)).toBe(3500);
  });

  it("best chain selected: when multiple chains possible, highest ATK wins", () => {
    const hand = new Uint16Array([56, 443, 174, 6, 73]);
    expect(scorer.evaluateHand(hand, buf)).toBe(4000);
  });

  it("strict improvement: result ATK <= material ATK → no fusion", () => {
    const hand = new Uint16Array([401, 439, 6, 73, 176]);
    expect(scorer.evaluateHand(hand, buf)).toBe(3300);
  });

  it("commutativity: same hand in any permutation gives same result", () => {
    const cards = [56, 66, 58, 403, 279];
    const base = scorer.evaluateHand(new Uint16Array(cards), buf);

    const permutations = [
      [279, 403, 58, 66, 56],
      [58, 56, 279, 66, 403],
      [403, 58, 66, 279, 56],
      [66, 279, 56, 403, 58],
    ];
    for (const perm of permutations) {
      expect(scorer.evaluateHand(new Uint16Array(perm), buf)).toBe(base);
    }
  });

  it("determinism: same input gives same output every time", () => {
    const hand = new Uint16Array([26, 66, 56, 58, 403]);
    const results = Array.from({ length: 20 }, () => scorer.evaluateHand(hand, buf));
    for (const r of results) {
      expect(r).toBe(results[0]);
    }
  });

  it("all-identical hand: 5x Kuriboh, no self-fusion", () => {
    const hand = new Uint16Array([73, 73, 73, 73, 73]);
    expect(scorer.evaluateHand(hand, buf)).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// Agreement with reference scorer on all fixtures
// ---------------------------------------------------------------------------
describe("FusionScorer matches reference scorer", () => {
  it("matches on all hand fixtures", () => {
    for (const fixture of handFixtures) {
      const hand = new Uint16Array(fixture.hand);
      expect(scorer.evaluateHand(hand, buf), fixture.description).toBe(fixture.expectedMaxAtk);
    }
  });

  it("matches reference scorer on random hands from the deck", () => {
    const deck = buf.deck;
    const hands = [
      [0, 1, 2, 3, 4],
      [5, 10, 15, 20, 25],
      [35, 36, 37, 38, 39],
      [0, 9, 18, 27, 36],
      [3, 7, 14, 22, 31],
    ];

    for (const slots of hands) {
      const cardIds = slots.map((s) => deck[s] ?? 0);
      const hand = new Uint16Array(cardIds);
      const refResult = referenceEvaluateHand(cardIds, buf.fusionTable, buf.cardAtk);
      expect(scorer.evaluateHand(hand, buf)).toBe(refResult);
    }
  });
});
