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

function byAtk(results: FusionChainResult[]): number[] {
  return results.map((r) => r.resultAtk);
}

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------
describe("findFusionChains", () => {
  it("returns raw plays when no fusions are possible", () => {
    const results = findFusionChains([4, 5], fusionTable, cardDb, 3);
    // No fusions between Delta(4) and Epsilon(5), but both appear as direct plays
    expect(results.map((r) => r.resultCardId)).toEqual([5, 4]); // sorted by ATK desc: 900, 800
    expect(results.every((r) => r.steps.length === 0 && r.equipCardIds.length === 0)).toBe(true);
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

  it("deduplicates by resultCardId+equips, keeping highest ATK", () => {
    // Card 11 (ABGamma) can be reached via 2 steps. There shouldn't be duplicates.
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    // Each unique (cardId + equips) combo should appear at most once
    const keys = results.map((r) => `${String(r.resultCardId)}+${r.equipCardIds.join(",")}`);
    expect(keys.length).toBe(new Set(keys).size);
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
  it("fusionDepth=1: only single fusions (plus raw plays)", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 1);
    for (const r of results) {
      // Raw plays have 0 steps, fusions at depth 1 have exactly 1 step
      expect(r.steps.length).toBeLessThanOrEqual(1);
    }
    // At least one actual fusion exists
    expect(results.some((r) => r.steps.length === 1)).toBe(true);
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
// Non-monster cards as fusion materials
// ---------------------------------------------------------------------------
describe("findFusionChains with non-monster materials", () => {
  let nmCardDb: CardDb;
  let nmFusionTable: Int16Array;

  beforeAll(() => {
    nmCardDb = createCardDb();
    // Equip card (non-monster, ATK=0)
    addCard(nmCardDb, {
      id: 50,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    // Monster cards
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
    addCard(nmCardDb, {
      id: 53,
      name: "Filler",
      kinds: [],
      isMonster: true,
      attack: 300,
      defense: 200,
    });

    nmFusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    nmFusionTable.fill(FUSION_NONE);
    setFusion(nmFusionTable, 50, 51, 52); // Power Sword + Warrior → Armed Warrior (2400)
  });

  it("finds fusion when a non-monster (ATK=0) card is a material", () => {
    const results = findFusionChains([50, 51, 53], nmFusionTable, nmCardDb, 3);
    const armed = results.find((r) => r.resultCardId === 52);
    expect(armed).toBeDefined();
    expect(armed?.resultAtk).toBe(2400);
    expect(armed?.materialCardIds.sort()).toEqual([50, 51]);
  });

  it("non-monster material appears in fusion steps", () => {
    const results = findFusionChains([50, 51, 53], nmFusionTable, nmCardDb, 3);
    const armed = results.find((r) => r.resultCardId === 52);
    expect(armed?.steps[0]).toEqual({
      material1CardId: 50,
      material2CardId: 51,
      resultCardId: 52,
    });
  });
});

// ---------------------------------------------------------------------------
// FM sequential chain rule
// ---------------------------------------------------------------------------
describe("findFusionChains enforces sequential chains", () => {
  // Setup: two independent fusions whose results can fuse together.
  // Cards: 20=X(200), 21=Y(300), 22=Z(400), 23=W(500)
  // Fusions: 20+21→30(800), 22+23→31(900), 30+31→32(3000)
  // A branching chain would be: 20+21→30, 22+23→31, 30+31→32
  // FM rules forbid this: step 2 (22+23→31) doesn't use result 30 from step 1.
  let branchDb: CardDb;
  let branchFt: Int16Array;

  beforeAll(() => {
    branchDb = createCardDb();
    addTestCard(branchDb, 20, "X", 200);
    addTestCard(branchDb, 21, "Y", 300);
    addTestCard(branchDb, 22, "Z", 400);
    addTestCard(branchDb, 23, "W", 500);
    addTestCard(branchDb, 24, "Filler", 100);
    addTestCard(branchDb, 30, "XY", 800);
    addTestCard(branchDb, 31, "ZW", 900);
    addTestCard(branchDb, 32, "XYZW", 3000);

    branchFt = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    branchFt.fill(FUSION_NONE);
    setFusion(branchFt, 20, 21, 30); // X + Y → XY (800)
    setFusion(branchFt, 22, 23, 31); // Z + W → ZW (900)
    setFusion(branchFt, 30, 31, 32); // XY + ZW → XYZW (3000) — only reachable via branching
  });

  it("does NOT find a result that requires two independent fusions", () => {
    const results = findFusionChains([20, 21, 22, 23, 24], branchFt, branchDb, 3);
    // XYZW (card 32) requires branching: 20+21→30, 22+23→31, 30+31→32
    // FM rules forbid step 2 from ignoring the result of step 1.
    expect(results.find((r) => r.resultCardId === 32)).toBeUndefined();
    // Individual fusions XY and ZW are still reachable
    expect(results.find((r) => r.resultCardId === 30)).toBeDefined();
    expect(results.find((r) => r.resultCardId === 31)).toBeDefined();
  });

  it("each step after the first uses the previous result as a material", () => {
    const results = findFusionChains([1, 2, 3, 4, 5], fusionTable, cardDb, 3);
    for (const r of results) {
      for (let s = 1; s < r.steps.length; s++) {
        const prev = r.steps[s - 1];
        const curr = r.steps[s];
        if (!prev || !curr) continue;
        const usesPrev =
          curr.material1CardId === prev.resultCardId || curr.material2CardId === prev.resultCardId;
        expect(usesPrev, `step ${s} of chain to ${r.resultName} must use previous result`).toBe(
          true,
        );
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Equip bonus
// ---------------------------------------------------------------------------
describe("findFusionChains with equip bonus", () => {
  let eqCardDb: CardDb;
  let eqFusionTable: Int16Array;
  let equipCompat: Uint8Array;

  beforeAll(() => {
    eqCardDb = createCardDb();
    addTestCard(eqCardDb, 60, "Warrior", 2000);
    addTestCard(eqCardDb, 61, "Dragon", 2500);
    addCard(eqCardDb, {
      id: 62,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    addCard(eqCardDb, {
      id: 657,
      name: "Megamorph",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    addTestCard(eqCardDb, 64, "Filler", 300);
    addTestCard(eqCardDb, 65, "SwordDragon", 3500);

    eqFusionTable = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    eqFusionTable.fill(FUSION_NONE);
    setFusion(eqFusionTable, 60, 61, 65); // Warrior + Dragon → SwordDragon (3500)

    equipCompat = new Uint8Array(MAX_CARD_ID * MAX_CARD_ID);
    equipCompat[62 * MAX_CARD_ID + 60] = 1; // Power Sword equips Warrior
    equipCompat[62 * MAX_CARD_ID + 61] = 1; // Power Sword equips Dragon
    equipCompat[657 * MAX_CARD_ID + 60] = 1; // Megamorph equips Warrior
    equipCompat[657 * MAX_CARD_ID + 65] = 1; // Megamorph equips SwordDragon
  });

  it("shows direct play + equip as a result", () => {
    const results = findFusionChains([60, 62, 64], eqFusionTable, eqCardDb, 3, equipCompat);
    const equipped = results.find((r) => r.resultCardId === 60 && r.equipCardIds.length > 0);
    expect(equipped).toBeDefined();
    expect(equipped?.resultAtk).toBe(2500); // 2000 + 500
    expect(equipped?.equipCardIds).toEqual([62]);
  });

  it("shows fusion result + equip", () => {
    // Warrior(60) + Dragon(61) → SwordDragon(65, ATK 3500)
    // Megamorph(657) equips SwordDragon → 3500 + 1000 = 4500
    const results = findFusionChains([60, 61, 657, 64], eqFusionTable, eqCardDb, 3, equipCompat);
    const fusionEquipped = results.find((r) => r.resultCardId === 65 && r.equipCardIds.length > 0);
    expect(fusionEquipped).toBeDefined();
    expect(fusionEquipped?.resultAtk).toBe(4500); // 3500 + 1000
  });

  it("multiple equips cumulate on a direct play", () => {
    // Warrior(60) + Power Sword(62, +500) + Megamorph(657, +1000) = 3500
    const results = findFusionChains([60, 62, 657, 64], eqFusionTable, eqCardDb, 3, equipCompat);
    const doubleEquip = results.find((r) => r.resultCardId === 60 && r.equipCardIds.length === 2);
    expect(doubleEquip).toBeDefined();
    expect(doubleEquip?.resultAtk).toBe(3500); // 2000 + 500 + 1000
  });

  it("without equipCompat, no equip results are shown but raw plays appear", () => {
    const results = findFusionChains([60, 62, 64], eqFusionTable, eqCardDb, 3);
    // No fusions possible, no equip compat — only raw monster plays
    const ids = results.map((r) => r.resultCardId);
    expect(ids).toContain(60); // Warrior (2000)
    expect(ids).toContain(64); // Filler (300)
    expect(ids).not.toContain(62); // Power Sword (ATK 0, non-monster)
    expect(results.every((r) => r.equipCardIds.length === 0)).toBe(true);
  });

  it("does not suggest equips absent from hand, even with compatible field monster", () => {
    // Warrior(60) on field with existing equip boost (live ATK 2500).
    // Hand has only Filler(64) — no equip cards.
    // Power Sword(62) is compatible with Warrior but is NOT in the hand.
    const results = findFusionChains([64], eqFusionTable, eqCardDb, 3, equipCompat, [
      { cardId: 60, atk: 2500, def: 500 },
    ]);
    for (const r of results) {
      expect(r.equipCardIds).toEqual([]);
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("findFusionChains edge cases", () => {
  it("empty hand returns no results", () => {
    expect(findFusionChains([], fusionTable, cardDb, 3)).toEqual([]);
  });

  it("single card returns a raw play", () => {
    const results = findFusionChains([1], fusionTable, cardDb, 3);
    expect(results).toHaveLength(1);
    expect(results[0]?.resultCardId).toBe(1);
    expect(results[0]?.resultAtk).toBe(500);
    expect(results[0]?.steps).toEqual([]);
    expect(results[0]?.equipCardIds).toEqual([]);
    expect(results[0]?.materialCardIds).toEqual([1]);
  });

  it("duplicate cards in hand: both copies usable as materials", () => {
    // Two copies of Alpha + Beta: can fuse either copy with Beta
    const results = findFusionChains([1, 1, 2], fusionTable, cardDb, 3);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.materialCardIds).toEqual([1, 2]);
  });

  it("hand with 2 cards that fuse includes fusion and raw plays", () => {
    const results = findFusionChains([1, 2], fusionTable, cardDb, 3);
    const ids = results.map((r) => r.resultCardId);
    expect(ids).toContain(10); // AlphaBeta fusion
    expect(ids).toContain(1); // Alpha raw
    expect(ids).toContain(2); // Beta raw
    // Sorted by ATK: AlphaBeta(1200), Beta(600), Alpha(500)
    expect(results.map((r) => r.resultAtk)).toEqual([1200, 600, 500]);
  });
});

// ---------------------------------------------------------------------------
// Field cards as first material
// ---------------------------------------------------------------------------
describe("findFusionChains with field cards", () => {
  it("field card as first fusion material", () => {
    // Alpha(1) on field + Beta(2) in hand → AlphaBeta(10)
    const results = findFusionChains([2, 5], fusionTable, cardDb, 3, undefined, [
      { cardId: 1, atk: 500, def: 0 },
    ]);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.fieldMaterialCardIds).toEqual([1]);
    expect(ab?.materialCardIds).toEqual([2]);
    expect(ab?.steps[0]?.material1CardId).toBe(1); // field card is material1
    expect(ab?.steps[0]?.material2CardId).toBe(2);
  });

  it("field card alone without fusion or equip is excluded, hand card appears as raw play", () => {
    // Delta(4) on field, Epsilon(5) in hand — no fusion between 4 and 5
    const results = findFusionChains([5], fusionTable, cardDb, 3, undefined, [
      { cardId: 4, atk: 800, def: 0 },
    ]);
    // Field card should NOT appear as a raw play
    expect(results.find((r) => r.resultCardId === 4)).toBeUndefined();
    // Hand card Epsilon appears as a raw play
    expect(results).toHaveLength(1);
    expect(results[0]?.resultCardId).toBe(5);
    expect(results[0]?.resultAtk).toBe(900);
  });

  it("field monster with equip from hand is included", () => {
    // Reuse equip test universe inline
    const eqDb = createCardDb();
    addTestCard(eqDb, 60, "Warrior", 2000);
    addCard(eqDb, {
      id: 62,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    addTestCard(eqDb, 64, "Filler", 300);
    const eqFt = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    eqFt.fill(FUSION_NONE);
    const ec = new Uint8Array(MAX_CARD_ID * MAX_CARD_ID);
    ec[62 * MAX_CARD_ID + 60] = 1; // Power Sword equips Warrior

    // Warrior(60) on field, Power Sword(62) in hand
    const results = findFusionChains([62, 64], eqFt, eqDb, 3, ec, [
      { cardId: 60, atk: 2000, def: 0 },
    ]);
    const equipped = results.find((r) => r.resultCardId === 60 && r.equipCardIds.length > 0);
    expect(equipped).toBeDefined();
    expect(equipped?.resultAtk).toBe(2500); // 2000 + 500
    expect(equipped?.fieldMaterialCardIds).toEqual([60]);
    expect(equipped?.materialCardIds).toEqual([]); // no hand monster consumed
  });

  it("both materials from field is excluded (FM rule)", () => {
    // Alpha(1) and Beta(2) both on field, Epsilon(5) in hand
    const results = findFusionChains([5], fusionTable, cardDb, 3, undefined, [
      { cardId: 1, atk: 500, def: 0 },
      { cardId: 2, atk: 600, def: 0 },
    ]);
    // Alpha+Beta fusion should NOT appear since both are field cards
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeUndefined();
  });

  it("field card at depth > 0 is excluded (stripped after first fusion)", () => {
    // Alpha(1) in hand, Beta(2) in hand, Gamma(3) on field
    // Possible: Alpha+Beta→AlphaBeta(10), then AlphaBeta+Gamma→ABGamma(11)
    // But Gamma is on field, so it's stripped after depth 0 — can't participate at depth 1
    const results = findFusionChains([1, 2], fusionTable, cardDb, 3, undefined, [
      { cardId: 3, atk: 700, def: 0 },
    ]);
    const abg = results.find((r) => r.resultCardId === 11);
    expect(abg).toBeUndefined();
    // But Alpha+Beta single fusion still works
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.fieldMaterialCardIds).toEqual([]);
  });

  it("field card always appears as material1CardId in the step", () => {
    // Beta(2) on field + Alpha(1) in hand → AlphaBeta(10)
    const results = findFusionChains([1, 5], fusionTable, cardDb, 3, undefined, [
      { cardId: 2, atk: 600, def: 0 },
    ]);
    const ab = results.find((r) => r.resultCardId === 10);
    expect(ab).toBeDefined();
    expect(ab?.steps[0]?.material1CardId).toBe(2); // field card (Beta) is material1
    expect(ab?.steps[0]?.material2CardId).toBe(1); // hand card (Alpha) is material2
  });

  it("fieldMaterialCardIds is empty when no field cards provided", () => {
    const results = findFusionChains([1, 2, 5], fusionTable, cardDb, 3);
    for (const r of results) {
      expect(r.fieldMaterialCardIds).toEqual([]);
    }
  });

  it("field card in first fusion allows chain to continue with hand cards", () => {
    // Alpha(1) on field, Beta(2)+Gamma(3)+Epsilon(5) in hand
    // Chain: field Alpha(1)+Beta(2)→AlphaBeta(10), AlphaBeta(10)+Gamma(3)→ABGamma(11)
    const results = findFusionChains([2, 3, 5], fusionTable, cardDb, 3, undefined, [
      { cardId: 1, atk: 500, def: 0 },
    ]);
    const abg = results.find((r) => r.resultCardId === 11);
    expect(abg).toBeDefined();
    expect(abg?.fieldMaterialCardIds).toEqual([1]);
    expect(abg?.materialCardIds.sort()).toEqual([2, 3]);
    expect(abg?.steps).toHaveLength(2);
  });

  it("field card with existing equip boost uses live ATK for new equip", () => {
    // Warrior(60) on field with existing equip boost: base 2000, live 2500
    // Power Sword(62) in hand adds +500 → should be 2500 + 500 = 3000, not 2000 + 500 = 2500
    const eqDb = createCardDb();
    addTestCard(eqDb, 60, "Warrior", 2000);
    addCard(eqDb, {
      id: 62,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    addTestCard(eqDb, 64, "Filler", 300);
    const eqFt = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    eqFt.fill(FUSION_NONE);
    const ec = new Uint8Array(MAX_CARD_ID * MAX_CARD_ID);
    ec[62 * MAX_CARD_ID + 60] = 1;

    const results = findFusionChains([62, 64], eqFt, eqDb, 3, ec, [
      { cardId: 60, atk: 2500, def: 500 }, // live ATK boosted from base 2000 to 2500
    ]);
    const equipped = results.find((r) => r.resultCardId === 60 && r.equipCardIds.length > 0);
    expect(equipped).toBeDefined();
    expect(equipped?.resultAtk).toBe(3000); // 2500 (live) + 500 (new equip)
    expect(equipped?.resultDef).toBe(1000); // 500 (live) + 500 (new equip)
  });
});

// ---------------------------------------------------------------------------
// Raw (direct) plays
// ---------------------------------------------------------------------------
describe("findFusionChains raw plays", () => {
  it("raw hand monsters appear sorted by ATK alongside fusions", () => {
    // Hand: Alpha(500), Beta(600), Gamma(700) — fusions: AlphaBeta(1200), BetaGamma(1400), ABGamma(1800)
    const results = findFusionChains([1, 2, 3], fusionTable, cardDb, 3);
    const atks = byAtk(results);
    // Raw plays (700, 600, 500) should appear below fusions (1800, 1400, 1200)
    expect(atks).toEqual([1800, 1400, 1200, 700, 600, 500]);
  });

  it("raw play has empty steps, empty equips, and materialCardIds with the card", () => {
    const results = findFusionChains([5], fusionTable, cardDb, 3);
    expect(results).toHaveLength(1);
    const r = results[0];
    expect(r?.steps).toEqual([]);
    expect(r?.equipCardIds).toEqual([]);
    expect(r?.materialCardIds).toEqual([5]);
    expect(r?.fieldMaterialCardIds).toEqual([]);
  });

  it("field monster without equip does NOT appear as a raw play", () => {
    const results = findFusionChains([5], fusionTable, cardDb, 3, undefined, [
      { cardId: 4, atk: 800, def: 0 },
    ]);
    expect(results.find((r) => r.resultCardId === 4)).toBeUndefined();
  });

  it("non-monster card (ATK 0) does not appear as a raw play", () => {
    const nmDb = createCardDb();
    addCard(nmDb, {
      id: 50,
      name: "Power Sword",
      kinds: [],
      isMonster: false,
      attack: 0,
      defense: 0,
    });
    const nmFt = new Int16Array(MAX_CARD_ID * MAX_CARD_ID);
    nmFt.fill(FUSION_NONE);
    const results = findFusionChains([50], nmFt, nmDb, 3);
    expect(results).toEqual([]);
  });

  it("duplicate hand cards produce only one raw entry", () => {
    const results = findFusionChains([1, 1], fusionTable, cardDb, 3);
    const rawAlphas = results.filter(
      (r) => r.resultCardId === 1 && r.steps.length === 0 && r.equipCardIds.length === 0,
    );
    expect(rawAlphas).toHaveLength(1);
  });
});
