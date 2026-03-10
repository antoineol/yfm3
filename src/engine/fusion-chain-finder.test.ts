import { beforeAll, describe, expect, it } from "vitest";
import { addCard, type CardDb, createCardDb } from "./data/game-db.ts";
import { type FusionChainResult, findFusionChains } from "./fusion-chain-finder.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

// ---------------------------------------------------------------------------
// Test universe: small set of cards with known fusions
// ---------------------------------------------------------------------------
// Cards:  1=Alpha(500), 2=Beta(600), 3=Gamma(700), 4=Delta(800), 5=Epsilon(900)
// Fusions: 1+2→10(1200), 10+3→11(1800), 11+4→12(2500), 2+3→13(1400)
// This gives a 3-step chain: 1+2→10, 10+3→11, 11+4→12 yielding ATK 2500.

let cardDb: CardDb;
let fusionTable: Int16Array;

function addTestCard(db: CardDb, id: number, name: string, atk: number): void {
  addCard(db, { id, name, kinds: [], attack: atk, defense: 0 });
}

function setFusion(ft: Int16Array, a: number, b: number, result: number): void {
  ft[a * MAX_CARD_ID + b] = result;
  ft[b * MAX_CARD_ID + a] = result;
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
  setFusion(fusionTable, 1, 2, 10); // Alpha + Beta → AlphaBeta (1200)
  setFusion(fusionTable, 10, 3, 11); // AlphaBeta + Gamma → ABGamma (1800)
  setFusion(fusionTable, 11, 4, 12); // ABGamma + Delta → ABGDelta (2500)
  setFusion(fusionTable, 2, 3, 13); // Beta + Gamma → BetaGamma (1400)
});

function byAtk(results: FusionChainResult[]): number[] {
  return results.map((r) => r.resultAtk);
}

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------
describe("findFusionChains", () => {
  it("returns empty array when no fusions are possible", () => {
    const results = findFusionChains([4, 5], fusionTable, cardDb, 3);
    expect(results).toEqual([]);
  });

  it("finds a single-step fusion", () => {
    const results = findFusionChains([1, 2, 5], fusionTable, cardDb, 3);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.steps).toHaveLength(1);
    expect(ab?.steps[0]).toEqual({ material1CardId: 1, material2CardId: 2, resultCardId: 10 });
    expect(ab?.resultAtk).toBe(1200);
    expect(ab?.resultName).toBe("AlphaBeta");
  });

  it("finds a 2-step chain", () => {
    const results = findFusionChains([1, 2, 3, 5], fusionTable, cardDb, 3);
    const abg = results.find((r) => r.resultCardId === 11);
    expect(abg).toBeDefined();
    expect(abg?.steps).toHaveLength(2);
    expect(abg?.resultAtk).toBe(1800);
  });

  it("finds a 3-step chain", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    const deep = results.find((r) => r.resultCardId === 12);
    expect(deep).toBeDefined();
    expect(deep?.steps).toHaveLength(3);
    expect(deep?.resultAtk).toBe(2500);
  });

  it("results are sorted by ATK descending", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    const atks = byAtk(results);
    for (let i = 1; i < atks.length; i++) {
      expect(atks[i]).toBeLessThanOrEqual(atks[i - 1] ?? 0);
    }
  });

  it("deduplicates by resultCardId, keeping fewest steps", () => {
    // Card 11 (ABGamma) can be reached via 2 steps. There shouldn't be duplicates.
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    const ids = results.map((r) => r.resultCardId);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("materialCardIds contains only original hand cards", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);

    // Single fusion: Alpha(1) + Beta(2) → AlphaBeta(10)
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab?.materialCardIds).toEqual([1, 2]);

    // 2-step chain: 1+2→10, 10+3→11. Materials from hand: 1, 2, 3
    const abg = results.find((r) => r.resultCardId === 11);
    expect(abg?.materialCardIds).toHaveLength(3);
    expect(abg?.materialCardIds.sort()).toEqual([1, 2, 3]);

    // 3-step chain: 1+2→10, 10+3→11, 11+4→12. Materials from hand: 1, 2, 3, 4
    const deep = results.find((r) => r.resultCardId === 12);
    expect(deep?.materialCardIds).toHaveLength(4);
    expect(deep?.materialCardIds.sort()).toEqual([1, 2, 3, 4]);
  });

  it("finds alternative fusions from the same hand", () => {
    // Hand [1, 2, 3] can produce: AlphaBeta(10) via 1+2, BetaGamma(13) via 2+3, ABGamma(11) via chain
    const results = findFusionChains([1, 2, 3], fusionTable, cardDb, 3);
    const ids = new Set(results.map((r) => r.resultCardId));
    expect(ids.has(10)).toBe(true); // AlphaBeta
    expect(ids.has(13)).toBe(true); // BetaGamma
    expect(ids.has(11)).toBe(true); // ABGamma (chain)
  });
});

// ---------------------------------------------------------------------------
// Fusion depth limit
// ---------------------------------------------------------------------------
describe("findFusionChains respects fusionDepth", () => {
  it("fusionDepth=1: only single fusions", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 1);
    for (const r of results) {
      expect(r.steps).toHaveLength(1);
    }
  });

  it("fusionDepth=2: chains up to 2 steps", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 2);
    // Should find 2-step chain (ABGamma) but not 3-step (ABGDelta)
    expect(results.find((r) => r.resultCardId === 11)).toBeDefined();
    expect(results.find((r) => r.resultCardId === 12)).toBeUndefined();
  });

  it("fusionDepth=3: finds the full 3-step chain", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    expect(results.find((r) => r.resultCardId === 12)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("findFusionChains edge cases", () => {
  it("empty hand returns no results", () => {
    expect(findFusionChains([], fusionTable, cardDb, 3)).toEqual([]);
  });

  it("single card returns no results", () => {
    expect(findFusionChains([1], fusionTable, cardDb, 3)).toEqual([]);
  });

  it("duplicate cards in hand: both copies usable as materials", () => {
    // Two copies of Alpha + Beta: can fuse either copy with Beta
    const results = findFusionChains([1, 1, 2], fusionTable, cardDb, 3);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.materialCardIds).toEqual([1, 2]);
  });

  it("hand with 2 cards that fuse", () => {
    const results = findFusionChains([1, 2], fusionTable, cardDb, 3);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultCardId).toBe(10);
  });
});
