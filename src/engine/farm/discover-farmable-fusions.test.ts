import { beforeAll, describe, expect, it } from "vitest";
import { addCard, type CardDb, createCardDb } from "../data/game-db.ts";
import type { RefDuelistCard, RefFusion } from "../reference/build-reference-table.ts";
import { FUSION_NONE, MAX_CARD_ID } from "../types/constants.ts";
import { discoverFarmableFusions } from "./discover-farmable-fusions.ts";

// ---------------------------------------------------------------------------
// Test universe
// ---------------------------------------------------------------------------
// Cards:  1=Alpha(500), 2=Beta(600), 3=Gamma(700), 4=Delta(800), 5=Epsilon(900)
//         10=AlphaBeta(1200), 11=ABGamma(1800), 12=ABGDelta(2500), 13=BetaGamma(1400)
//         20=HighCard(3000)
// Fusions: 1+2→10(1200), 10+3→11(1800), 11+4→12(2500), 2+3→13(1400)
//
// Duelists:
//   D1 "Simon"  drops cards 3(bcd=100), 4(bcd=50), 20(bcd=30)
//   D2 "Heishin" drops cards 2(saPow=80), 5(saTec=60)

let cardDb: CardDb;
let fusionTable: Int16Array;
let cardAtk: Int16Array;
let fusions: RefFusion[];
let duelists: RefDuelistCard[];

function addTestCard(db: CardDb, id: number, name: string, atk: number): void {
  addCard(db, { id, name, kinds: [], isMonster: true, attack: atk, defense: 0 });
}

function setFusion(ft: Int16Array, a: number, b: number, result: number): void {
  ft[a * MAX_CARD_ID + b] = result;
  ft[b * MAX_CARD_ID + a] = result;
}

function makeDuelistRow(
  duelistId: number,
  duelistName: string,
  cardId: number,
  overrides: { saPow?: number; bcd?: number; saTec?: number } = {},
): RefDuelistCard {
  return {
    duelistId,
    duelistName,
    cardId,
    deck: 0,
    saPow: overrides.saPow ?? 0,
    bcd: overrides.bcd ?? 0,
    saTec: overrides.saTec ?? 0,
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
  addTestCard(cardDb, 20, "HighCard", 3000);

  fusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
  fusionTable.fill(FUSION_NONE);
  setFusion(fusionTable, 1, 2, 10); // Alpha + Beta → AlphaBeta (1200)
  setFusion(fusionTable, 10, 3, 11); // AlphaBeta + Gamma → ABGamma (1800)
  setFusion(fusionTable, 11, 4, 12); // ABGamma + Delta → ABGDelta (2500)
  setFusion(fusionTable, 2, 3, 13); // Beta + Gamma → BetaGamma (1400)

  cardAtk = new Int16Array(MAX_CARD_ID);
  for (const c of cardDb.cards) cardAtk[c.id] = c.attack;

  fusions = [
    { material1Id: 1, material2Id: 2, resultId: 10, resultAtk: 1200 },
    { material1Id: 10, material2Id: 3, resultId: 11, resultAtk: 1800 },
    { material1Id: 11, material2Id: 4, resultId: 12, resultAtk: 2500 },
    { material1Id: 2, material2Id: 3, resultId: 13, resultAtk: 1400 },
  ];

  duelists = [
    makeDuelistRow(1, "Simon", 3, { bcd: 100 }),
    makeDuelistRow(1, "Simon", 4, { bcd: 50 }),
    makeDuelistRow(1, "Simon", 20, { bcd: 30 }),
    makeDuelistRow(2, "Heishin", 2, { saPow: 80 }),
    makeDuelistRow(2, "Heishin", 5, { saTec: 60 }),
  ];
});

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------
describe("discoverFarmableFusions", () => {
  it("returns empty when collection has ≥3 copies of all fusion materials", () => {
    // Player owns 3+ copies of all cards — nothing to farm
    const collection = new Map([
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
      [20, 3],
    ]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      duelists,
      fusions,
      "pow",
    );
    expect(result.fusions).toEqual([]);
    expect(result.duelistRanking).toEqual([]);
  });

  it("suggests farming cards with <3 copies in collection", () => {
    // Player owns 1 copy of cards 1,2,3 and 3 copies of 20.
    // Cards 2,3 are droppable and have <3 copies → still farmable materials.
    // Card 20 has 3 copies → fully owned, not a farm target.
    const collection = new Map([
      [1, 1],
      [2, 1],
      [3, 2],
      [20, 3],
    ]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      duelists,
      fusions,
      "pow",
    );
    // HighCard(20) should NOT appear (3 copies = fully owned)
    const highCard = result.fusions.find((f) => f.resultCardId === 20 && f.depth === 0);
    expect(highCard).toBeUndefined();
    // But fusions using cards with <3 copies should still appear as farmable
    const hasFarmable = result.fusions.some((f) => f.missingMaterials.length > 0);
    expect(hasFarmable).toBe(true);
  });

  it("finds depth-0 standalone high-ATK droppable card", () => {
    // Player owns cards 1,2. deckScore=2000. HighCard(3000) is droppable by Simon.
    const collection = new Map([
      [1, 1],
      [2, 1],
    ]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      2000,
      duelists,
      fusions,
      "pow",
    );
    const standalone = result.fusions.find((f) => f.resultCardId === 20 && f.depth === 0);
    expect(standalone).toBeDefined();
    expect(standalone?.resultAtk).toBe(3000);
    expect(standalone?.missingMaterials).toEqual([20]);
    expect(standalone?.dropSources.get(20)?.[0]?.duelistName).toBe("Simon");
  });

  it("finds depth-1 fusion with one missing droppable material", () => {
    // Player owns 3x card 1 (Alpha). Card 2 (Beta) droppable by Heishin (saPow=80).
    // Fusion 1+2→10(1200). deckScore=1000.
    const collection = new Map([[1, 3]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      1,
      1000,
      duelists,
      fusions,
      "pow",
    );
    const fusion = result.fusions.find((f) => f.resultCardId === 10 && f.depth === 1);
    expect(fusion).toBeDefined();
    expect(fusion?.resultAtk).toBe(1200);
    expect(fusion?.materials).toEqual([1, 2]);
    expect(fusion?.missingMaterials).toEqual([2]);
    expect(fusion?.dropSources.get(2)?.[0]?.duelistName).toBe("Heishin");
  });

  it("finds depth-2 chain fusion", () => {
    // Player owns 3x card 1 (Alpha). Cards 2, 3 droppable.
    // Chain: 1+2→10, 10+3→11(1800). deckScore=1500.
    const collection = new Map([[1, 3]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      1500,
      duelists,
      fusions,
      "pow",
    );
    const chain = result.fusions.find((f) => f.resultCardId === 11 && f.depth === 2);
    expect(chain).toBeDefined();
    expect(chain?.resultAtk).toBe(1800);
    expect(chain?.materials.sort()).toEqual([1, 2, 3]);
    // Both 2 and 3 are missing
    expect(chain?.missingMaterials.sort()).toEqual([2, 3]);
  });

  it("filters out fusions below deckScore", () => {
    // deckScore=2000 means only results > 2000 matter.
    // Only ABGDelta(2500) and HighCard(3000) should appear.
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      2000,
      duelists,
      fusions,
      "pow",
    );
    for (const f of result.fusions) {
      expect(f.resultAtk).toBeGreaterThan(2000);
    }
  });

  it("filters out fusions where missing material is not droppable", () => {
    // Card 10 (AlphaBeta) is a fusion result but not droppable.
    // Fusion 10+3→11 should NOT appear if 10 is missing and not droppable.
    // Player owns nothing, deckScore=0.
    const collection = new Map<number, number>();
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      1,
      0,
      duelists,
      fusions,
      "pow",
    );
    // Check that fusion 10+3→11 at depth 1 is NOT present (10 is not droppable)
    const badFusion = result.fusions.find((f) => f.depth === 1 && f.materials.includes(10));
    expect(badFusion).toBeUndefined();
  });

  it("ranks duelists correctly", () => {
    // Simon drops cards 3,4,20 — helps with many fusions.
    // Heishin drops card 2 in POW mode — helps with fusions needing Beta.
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      duelists,
      fusions,
      "pow",
    );
    expect(result.duelistRanking.length).toBeGreaterThan(0);
    // Both Simon and Heishin should appear
    const simonRank = result.duelistRanking.find((d) => d.duelistId === 1);
    const heishinRank = result.duelistRanking.find((d) => d.duelistId === 2);
    expect(simonRank).toBeDefined();
    expect(heishinRank).toBeDefined();
    expect(simonRank?.fusionCount).toBeGreaterThan(0);
    expect(heishinRank?.fusionCount).toBeGreaterThan(0);
  });

  it("deduplicates: same result via fewer missing materials preferred", () => {
    // Player owns 3x cards 1,2. Gamma (3) droppable by Simon.
    // Fusion 2+3→13(1400) at depth 1: only 3 missing.
    // Fusion 1+2→10, but 10+3→11(1800) at depth 2: only 3 missing (1,2 owned).
    const collection = new Map([
      [1, 3],
      [2, 3],
    ]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      1000,
      duelists,
      fusions,
      "pow",
    );
    // BetaGamma at depth 1 should have exactly 1 missing material (card 3)
    const bg = result.fusions.find((f) => f.resultCardId === 13 && f.depth === 1);
    expect(bg).toBeDefined();
    expect(bg?.missingMaterials).toEqual([3]);
  });
});

// ---------------------------------------------------------------------------
// Fusion depth limits
// ---------------------------------------------------------------------------
describe("discoverFarmableFusions respects fusionDepth", () => {
  it("fusionDepth=1: no chain fusions", () => {
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      1,
      0,
      duelists,
      fusions,
      "pow",
    );
    for (const f of result.fusions) {
      expect(f.depth).toBeLessThanOrEqual(1);
    }
  });

  it("fusionDepth=0: only standalone cards", () => {
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      0,
      0,
      duelists,
      fusions,
      "pow",
    );
    for (const f of result.fusions) {
      expect(f.depth).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Drop modes
// ---------------------------------------------------------------------------
describe("discoverFarmableFusions drop modes", () => {
  it("POW mode uses max(saPow, bcd) — includes both sources", () => {
    // Card 2: Heishin has saPow=80, bcd=0 → weight=80 in POW mode
    // Card 3: Simon has bcd=100 → weight=100 in POW mode
    const collection = new Map([[1, 3]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      1,
      0,
      duelists,
      fusions,
      "pow",
    );
    // Fusion 1+2→10 should be findable (card 2 droppable via Heishin saPow)
    const f = result.fusions.find((f) => f.resultCardId === 10 && f.depth === 1);
    expect(f).toBeDefined();
    expect(f?.dropSources.get(2)?.[0]?.weight).toBe(80);
  });

  it("TEC mode uses saTec only — excludes non-TEC drops", () => {
    // In TEC mode, only card 5 (Epsilon, saTec=60 from Heishin) is droppable.
    // Cards 2,3,4,20 have saTec=0, so not droppable.
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      duelists,
      fusions,
      "tec",
    );
    // No fusions should include materials 2,3,4 as missing (not droppable in TEC)
    for (const f of result.fusions) {
      for (const m of f.missingMaterials) {
        expect([5]).toContain(m);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Combinatorial safety
// ---------------------------------------------------------------------------
describe("discoverFarmableFusions combinatorial safety", () => {
  it("handles a large pool at fusionDepth=3 without exploding", () => {
    // Simulate a dense fusion table: 200 cards, many fusions.
    // Without deduplication this would generate millions of candidates.
    const bigDb = createCardDb();
    const bigAtk = new Int16Array(MAX_CARD_ID);
    const bigFt = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    bigFt.fill(FUSION_NONE);
    const bigFusions: RefFusion[] = [];

    const cardCount = 200;
    for (let id = 1; id <= cardCount; id++) {
      addCard(bigDb, {
        id,
        name: `C${id}`,
        kinds: [],
        isMonster: true,
        attack: id * 10,
        defense: 0,
      });
      bigAtk[id] = id * 10;
    }

    // Create a dense web of fusions: for every pair (a, a+1) → result a+50
    // This creates many depth-1 candidates that share resultIds.
    for (let a = 1; a <= 100; a++) {
      const b = a + 1;
      const r = Math.min(a + 50, cardCount);
      bigFt[a * MAX_CARD_ID + b] = r;
      bigFt[b * MAX_CARD_ID + a] = r;
      bigFusions.push({ material1Id: a, material2Id: b, resultId: r, resultAtk: r * 10 });
    }

    // All cards droppable by one duelist
    const bigDuelists: RefDuelistCard[] = [];
    for (let id = 1; id <= cardCount; id++) {
      bigDuelists.push({
        duelistId: 1,
        duelistName: "TestDuelist",
        cardId: id,
        deck: 0,
        saPow: 100,
        bcd: 0,
        saTec: 0,
      });
    }

    const collection = new Map<number, number>();

    // This should complete in well under 1 second, not OOM.
    const t0 = performance.now();
    const result = discoverFarmableFusions(
      collection,
      bigFt,
      bigAtk,
      bigDb,
      3,
      0,
      bigDuelists,
      bigFusions,
      "pow",
    );
    const elapsed = performance.now() - t0;

    expect(result.fusions.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5000);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("discoverFarmableFusions edge cases", () => {
  it("empty collection — all droppable cards are missing", () => {
    const collection = new Map<number, number>();
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      1,
      0,
      duelists,
      fusions,
      "pow",
    );
    // Should still find fusions between droppable cards
    expect(result.fusions.length).toBeGreaterThan(0);
  });

  it("empty duelists — no drops, no results", () => {
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      [],
      fusions,
      "pow",
    );
    expect(result.fusions).toEqual([]);
    expect(result.duelistRanking).toEqual([]);
  });

  it("very high deckScore — no results above threshold", () => {
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      9999,
      duelists,
      fusions,
      "pow",
    );
    expect(result.fusions).toEqual([]);
  });

  it("results sorted by depth asc then ATK desc", () => {
    const collection = new Map([[1, 1]]);
    const result = discoverFarmableFusions(
      collection,
      fusionTable,
      cardAtk,
      cardDb,
      3,
      0,
      duelists,
      fusions,
      "pow",
    );
    for (let i = 1; i < result.fusions.length; i++) {
      const prev = result.fusions[i - 1] ?? { depth: 0, resultAtk: 0 };
      const curr = result.fusions[i] ?? { depth: 0, resultAtk: 0 };
      if (prev.depth === curr.depth) {
        expect(curr.resultAtk).toBeLessThanOrEqual(prev.resultAtk);
      } else {
        expect(curr.depth).toBeGreaterThan(prev.depth);
      }
    }
  });
});
