import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { resetConfig, setConfig } from "./config.ts";
import { addCard, type CardDb, createCardDb } from "./data/game-db.ts";
import { explainScore } from "./score-explainer.ts";
import { FusionScorer } from "./scoring/fusion-scorer.ts";
import type { OptBuffers } from "./types/buffers.ts";
import { CHOOSE_5, FUSION_NONE, MAX_CARD_ID, NUM_HANDS } from "./types/constants.ts";

// ---------------------------------------------------------------------------
// Test universe: 5 base cards + fusions (same as fusion-chain-finder tests)
// ---------------------------------------------------------------------------

let cardDb: CardDb;
let fusionTable: Int16Array;
let cardAtk: Int16Array;

function addTestCard(db: CardDb, id: number, name: string, atk: number): void {
  addCard(db, { id, name, kinds: [], isMonster: true, attack: atk, defense: 0 });
}

function setFusion(ft: Int16Array, a: number, b: number, result: number): void {
  ft[a * MAX_CARD_ID + b] = result;
  ft[b * MAX_CARD_ID + a] = result;
}

function makeBuffers(deckCardIds: number[]): OptBuffers {
  const deckSize = deckCardIds.length;
  const numHands = Math.min(NUM_HANDS, CHOOSE_5[deckSize] ?? 0);
  const deck = new Int16Array(deckSize);
  for (let i = 0; i < deckSize; i++) {
    deck[i] = deckCardIds[i] ?? 0;
  }
  return {
    fusionTable,
    cardAtk,
    equipCompat: new Uint8Array(MAX_CARD_ID * MAX_CARD_ID),
    deck,
    cardCounts: new Uint8Array(MAX_CARD_ID),
    availableCounts: new Uint8Array(MAX_CARD_ID),
    handSlots: new Uint8Array(numHands * 5),
    handScores: new Int16Array(numHands),
    affectedHandIds: new Uint16Array(numHands * 5),
    affectedHandOffsets: new Uint32Array(deckSize),
    affectedHandCounts: new Uint16Array(deckSize),
    scoringSlots: deckSize,
  };
}

beforeAll(() => {
  cardDb = createCardDb();
  addTestCard(cardDb, 1, "Alpha", 500);
  addTestCard(cardDb, 2, "Beta", 600);
  addTestCard(cardDb, 3, "Gamma", 700);
  addTestCard(cardDb, 4, "Delta", 800);
  addTestCard(cardDb, 5, "Epsilon", 900);
  addTestCard(cardDb, 10, "AlphaBeta", 1200);
  addTestCard(cardDb, 11, "ABGamma", 1800);
  addTestCard(cardDb, 12, "ABGDelta", 2500);
  addTestCard(cardDb, 13, "BetaGamma", 1400);

  fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  setFusion(fusionTable, 1, 2, 10);
  setFusion(fusionTable, 10, 3, 11);
  setFusion(fusionTable, 11, 4, 12);
  setFusion(fusionTable, 2, 3, 13);

  cardAtk = new Int16Array(MAX_CARD_ID);
  for (const card of cardDb.cards) {
    cardAtk[card.id] = card.attack;
  }

  setConfig({ deckSize: 5, fusionDepth: 3 });
});

afterEach(() => {
  resetConfig();
  setConfig({ deckSize: 5, fusionDepth: 3 });
});

describe("explainScore", () => {
  it("returns correct expectedAtk for a single hand (5-card deck)", () => {
    const buf = makeBuffers([1, 2, 3, 4, 5]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    // With 5 cards, there's exactly 1 hand: [1,2,3,4,5]
    // Best fusion chain: 1+2→10(1200), 10+3→11(1800), 11+4→12(2500)
    // So max ATK = 2500
    expect(result.expectedAtk).toBe(2500);
    expect(result.distribution).toHaveLength(1);
    expect(result.distribution[0]?.atk).toBe(2500);
    expect(result.distribution[0]?.probabilityMax).toBe(1);
  });

  it("distribution probabilities sum to 1", () => {
    // 6-card deck → C(6,5) = 6 hands
    setConfig({ deckSize: 6, fusionDepth: 3 });
    const buf = makeBuffers([1, 2, 3, 4, 5, 4]); // two copies of Delta(800)
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    const totalProb = result.distribution.reduce((sum, b) => sum + b.probabilityMax, 0);
    expect(totalProb).toBeCloseTo(1, 10);
  });

  it("distribution counts sum to total hands", () => {
    setConfig({ deckSize: 6, fusionDepth: 3 });
    const buf = makeBuffers([1, 2, 3, 4, 5, 4]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    const totalCount = result.distribution.reduce((sum, b) => sum + b.count, 0);
    expect(totalCount).toBe(CHOOSE_5[6]);

    setConfig({ deckSize: 5, fusionDepth: 3 });
  });

  it("distribution is sorted by ATK descending", () => {
    setConfig({ deckSize: 6, fusionDepth: 3 });
    const buf = makeBuffers([1, 2, 3, 4, 5, 4]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    for (let i = 1; i < result.distribution.length; i++) {
      const curr = result.distribution[i];
      const prev = result.distribution[i - 1];
      if (curr && prev) {
        expect(curr.atk).toBeLessThanOrEqual(prev.atk);
      }
    }

    setConfig({ deckSize: 5, fusionDepth: 3 });
  });

  it("returns empty distribution for empty deck", () => {
    setConfig({ deckSize: 0, fusionDepth: 3 });
    const buf = makeBuffers([]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    expect(result.expectedAtk).toBe(0);
    expect(result.distribution).toEqual([]);

    setConfig({ deckSize: 5, fusionDepth: 3 });
  });

  it("handles deck with no fusions (only base ATK values)", () => {
    // Cards 4 and 5 don't fuse with each other
    setConfig({ deckSize: 5, fusionDepth: 3 });
    const buf = makeBuffers([4, 4, 4, 5, 5]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    // Max ATK = Epsilon(900) for every hand
    expect(result.expectedAtk).toBe(900);
    expect(result.distribution).toHaveLength(1);
    expect(result.distribution[0]?.atk).toBe(900);
  });

  it("respects fusionDepth config", () => {
    // With fusionDepth=1, the full chain 1+2→10+3→11+4→12 is truncated
    setConfig({ deckSize: 5, fusionDepth: 1 });
    const buf = makeBuffers([1, 2, 3, 4, 5]);
    const scorer = new FusionScorer();
    const result = explainScore(buf, scorer);

    // fusionDepth=1: only 1-step fusions. Best is BetaGamma(1400) or AlphaBeta(1200).
    // Actually best single fusion from [1,2,3,4,5]: 2+3→13(1400)
    expect(result.expectedAtk).toBe(1400);
  });
});
