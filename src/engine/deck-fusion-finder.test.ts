import { beforeAll, describe, expect, it } from "vitest";
import { addCard, type CardDb, createCardDb } from "./data/game-db.ts";
import { findDeckFusions } from "./deck-fusion-finder.ts";
import { FUSION_NONE, MAX_CARD_ID } from "./types/constants.ts";

// ---------------------------------------------------------------------------
// Test universe: same small card set as fusion-chain-finder tests
// ---------------------------------------------------------------------------
// Cards:  1=Alpha(500), 2=Beta(600), 3=Gamma(700), 4=Delta(800), 5=Epsilon(900)
// Fusions: 1+2→10(1200), 10+3→11(1800), 11+4→12(2500), 2+3→13(1400)

let cardDb: CardDb;
let fusionTable: Int16Array;

function addTestCard(db: CardDb, id: number, name: string, atk: number): void {
  addCard(db, { id, name, kinds: [], isMonster: true, attack: atk, defense: 0 });
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

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------
describe("findDeckFusions", () => {
  it("returns empty array when no fusions are possible", () => {
    const results = findDeckFusions([4, 5], fusionTable, cardDb, 3);
    expect(results).toEqual([]);
  });

  it("finds direct 2-material fusions", () => {
    const results = findDeckFusions([1, 2, 5], fusionTable, cardDb, 1);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultCardId).toBe(10);
    expect(results[0]?.materialCount).toBe(2);
    expect(results[0]?.resultAtk).toBe(1200);
    expect(results[0]?.materialPaths).toEqual([[1, 2]]);
  });

  it("finds chain fusions (3 materials)", () => {
    const results = findDeckFusions([1, 2, 3, 5], fusionTable, cardDb, 3);
    const chain3 = results.find((r) => r.resultCardId === 11 && r.materialCount === 3);
    expect(chain3).toBeDefined();
    expect(chain3?.resultAtk).toBe(1800);
    expect(chain3?.materialPaths[0]?.sort()).toEqual([1, 2, 3]);
  });

  it("finds deep chain fusions (4 materials)", () => {
    const results = findDeckFusions([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    const chain4 = results.find((r) => r.resultCardId === 12 && r.materialCount === 4);
    expect(chain4).toBeDefined();
    expect(chain4?.resultAtk).toBe(2500);
    expect(chain4?.materialPaths[0]?.sort()).toEqual([1, 2, 3, 4]);
  });

  it("results are grouped by material count, sorted by ATK desc within groups", () => {
    const results = findDeckFusions([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    // Check ordering: material count ascending, ATK descending within each group
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];
      if (prev && curr && prev.materialCount === curr.materialCount) {
        expect(curr.resultAtk).toBeLessThanOrEqual(prev.resultAtk);
      } else if (prev && curr) {
        expect(curr.materialCount).toBeGreaterThan(prev.materialCount);
      }
    }
  });

  it("finds all direct fusions from the deck", () => {
    const results = findDeckFusions([1, 2, 3], fusionTable, cardDb, 1);
    const ids = results.map((r) => r.resultCardId);
    expect(ids).toContain(10); // Alpha + Beta → AlphaBeta
    expect(ids).toContain(13); // Beta + Gamma → BetaGamma
  });

  it("deduplicates identical material sets", () => {
    // Deck with duplicate card IDs shouldn't create duplicate paths
    const results = findDeckFusions([1, 1, 2], fusionTable, cardDb, 1);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.materialPaths).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Fusion depth limits
// ---------------------------------------------------------------------------
describe("findDeckFusions respects fusionDepth", () => {
  it("fusionDepth=1: only direct fusions", () => {
    const results = findDeckFusions([1, 2, 3, 4, 5], fusionTable, cardDb, 1);
    for (const r of results) {
      expect(r.materialCount).toBe(2);
    }
  });

  it("fusionDepth=2: chains up to 3 materials", () => {
    const results = findDeckFusions([1, 2, 3, 4, 5], fusionTable, cardDb, 2);
    const maxMaterials = Math.max(...results.map((r) => r.materialCount));
    expect(maxMaterials).toBeLessThanOrEqual(3);
    // Should find 3-material chain but not 4-material
    expect(results.find((r) => r.resultCardId === 11 && r.materialCount === 3)).toBeDefined();
    expect(results.find((r) => r.resultCardId === 12)).toBeUndefined();
  });

  it("fusionDepth=3: finds the full chain", () => {
    const results = findDeckFusions([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    expect(results.find((r) => r.resultCardId === 12)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Non-monster cards as fusion materials
// ---------------------------------------------------------------------------
describe("findDeckFusions with non-monster materials", () => {
  let nmCardDb: CardDb;
  let nmFusionTable: Int16Array;

  beforeAll(() => {
    nmCardDb = createCardDb();
    addCard(nmCardDb, {
      id: 50,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    addCard(nmCardDb, {
      id: 51,
      name: "Warrior",
      kinds: [],
      isMonster: true,
      attack: 1200,
      defense: 800,
    });
    addCard(nmCardDb, {
      id: 52,
      name: "Armed Warrior",
      kinds: [],
      isMonster: true,
      attack: 2400,
      defense: 1600,
    });

    nmFusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    nmFusionTable.fill(FUSION_NONE);
    setFusion(nmFusionTable, 50, 51, 52); // Power Sword + Warrior → Armed Warrior
  });

  it("finds fusion when one material is a non-monster card", () => {
    const results = findDeckFusions([50, 51], nmFusionTable, nmCardDb, 1);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultCardId).toBe(52);
    expect(results[0]?.resultAtk).toBe(2400);
    expect(results[0]?.materialPaths).toEqual([[50, 51]]);
  });
});

// ---------------------------------------------------------------------------
// Field bonus
// ---------------------------------------------------------------------------
describe("findDeckFusions with terrain field bonus", () => {
  let fbCardDb: CardDb;
  let fbFusionTable: Int16Array;

  beforeAll(() => {
    fbCardDb = createCardDb();
    // Dragon gets +500 on Mountain (terrain 3)
    addCard(fbCardDb, {
      id: 60,
      name: "Fire Dragon",
      kinds: [],
      isMonster: true,
      attack: 1800,
      defense: 1000,
      cardType: "Dragon",
    });
    addCard(fbCardDb, {
      id: 61,
      name: "Wind Bird",
      kinds: [],
      isMonster: true,
      attack: 1200,
      defense: 800,
      cardType: "Winged Beast",
    });
    // Fusion result is also a Dragon → boosted on Mountain
    addCard(fbCardDb, {
      id: 62,
      name: "Storm Dragon",
      kinds: [],
      isMonster: true,
      attack: 2400,
      defense: 1600,
      cardType: "Dragon",
    });

    fbFusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    fbFusionTable.fill(FUSION_NONE);
    setFusion(fbFusionTable, 60, 61, 62); // Fire Dragon + Wind Bird → Storm Dragon
  });

  it("applies field bonus to fusion result ATK", () => {
    // Mountain (terrain 3) boosts Dragon +500
    const results = findDeckFusions([60, 61], fbFusionTable, fbCardDb, 1, 3);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultAtk).toBe(2900); // 2400 + 500
  });

  it("returns base ATK when terrain is 0", () => {
    const results = findDeckFusions([60, 61], fbFusionTable, fbCardDb, 1, 0);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultAtk).toBe(2400);
  });

  it("returns base ATK when terrain is omitted", () => {
    const results = findDeckFusions([60, 61], fbFusionTable, fbCardDb, 1);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultAtk).toBe(2400);
  });

  it("applies field malus to weakened types", () => {
    // Sea (terrain 5) weakens Machine -500
    const machineDb = createCardDb();
    addCard(machineDb, {
      id: 70,
      name: "Gear A",
      kinds: [],
      isMonster: true,
      attack: 800,
      defense: 600,
      cardType: "Machine",
    });
    addCard(machineDb, {
      id: 71,
      name: "Gear B",
      kinds: [],
      isMonster: true,
      attack: 900,
      defense: 700,
      cardType: "Machine",
    });
    addCard(machineDb, {
      id: 72,
      name: "Mega Machine",
      kinds: [],
      isMonster: true,
      attack: 1600,
      defense: 1200,
      cardType: "Machine",
    });
    const ft = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    ft.fill(FUSION_NONE);
    setFusion(ft, 70, 71, 72);

    const results = findDeckFusions([70, 71], ft, machineDb, 1, 5);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultAtk).toBe(1100); // 1600 - 500
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("findDeckFusions edge cases", () => {
  it("empty deck returns no results", () => {
    expect(findDeckFusions([], fusionTable, cardDb, 3)).toEqual([]);
  });

  it("single card returns no results", () => {
    expect(findDeckFusions([1], fusionTable, cardDb, 3)).toEqual([]);
  });

  it("does not use same card twice in a direct fusion", () => {
    // Only one copy of Alpha — cannot fuse with itself
    const results = findDeckFusions([1], fusionTable, cardDb, 3);
    expect(results).toEqual([]);
  });

  it("chain does not reuse a material already consumed", () => {
    // Deck has only [1, 2] — can fuse 1+2→10 but no more chains possible
    const results = findDeckFusions([1, 2], fusionTable, cardDb, 3);
    expect(results).toHaveLength(1);
    expect(results[0]?.materialCount).toBe(2);
  });
});
