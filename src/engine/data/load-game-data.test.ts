import { beforeEach, describe, expect, it } from "vitest";
import { MAX_CARD_ID } from "../types/constants.ts";
import type { FusionDb } from "./card-model.ts";
import { addCard, type CardDb, createCardDb } from "./game-db.ts";
import { registerFusionOnlyCards } from "./load-game-data.ts";

// ---------------------------------------------------------------------------
// registerFusionOnlyCards unit tests
// ---------------------------------------------------------------------------

describe("registerFusionOnlyCards", () => {
  let cardDb: CardDb;

  beforeEach(() => {
    cardDb = createCardDb();
  });

  it("reassigns out-of-range base card IDs to gap slots", () => {
    addCard(cardDb, { id: 1000, name: "Synth1", kinds: [], attack: 500, defense: 400 });
    addCard(cardDb, { id: 1001, name: "Synth2", kinds: [], attack: 600, defense: 300 });
    const fusionDb: FusionDb = { fusions: [] };

    registerFusionOnlyCards(cardDb, fusionDb);

    for (const card of cardDb.cards) {
      expect(card.id).toBeGreaterThan(0);
      expect(card.id).toBeLessThan(MAX_CARD_ID);
    }
    // Maps are consistent after reassignment
    for (const card of cardDb.cards) {
      expect(cardDb.cardsById.get(card.id)).toBe(card);
      expect(cardDb.cardsByName.get(card.name)).toBe(card);
    }
    // Old IDs removed from map
    expect(cardDb.cardsById.has(1000)).toBe(false);
    expect(cardDb.cardsById.has(1001)).toBe(false);
  });

  it("registers fusion-only cards with gap IDs", () => {
    addCard(cardDb, { id: 100, name: "Base1", kinds: [], attack: 1000, defense: 800 });
    const fusionDb: FusionDb = {
      fusions: [
        { name: "FusionOnly1", materials: new Set(["Base1:Base1"]), attack: 2000, defense: 1500 },
        {
          name: "FusionOnly2",
          materials: new Set(["Base1:FusionOnly1"]),
          attack: 3000,
          defense: 2000,
        },
      ],
    };

    registerFusionOnlyCards(cardDb, fusionDb);

    // Fusion-only cards added to cardDb
    expect(cardDb.cardsByName.has("FusionOnly1")).toBe(true);
    expect(cardDb.cardsByName.has("FusionOnly2")).toBe(true);
    // Total cards: 1 base + 2 fusion-only
    expect(cardDb.cards.length).toBe(3);
    // All IDs in range
    for (const card of cardDb.cards) {
      expect(card.id).toBeGreaterThan(0);
      expect(card.id).toBeLessThan(MAX_CARD_ID);
    }
    // ATK preserved
    expect(cardDb.cardsByName.get("FusionOnly1")?.attack).toBe(2000);
    expect(cardDb.cardsByName.get("FusionOnly2")?.attack).toBe(3000);
  });

  it("skips fusion results already in base cards", () => {
    addCard(cardDb, { id: 100, name: "SharedName", kinds: [], attack: 1500, defense: 800 });
    const fusionDb: FusionDb = {
      fusions: [{ name: "SharedName", materials: new Set(["x:y"]), attack: 1500, defense: 800 }],
    };

    registerFusionOnlyCards(cardDb, fusionDb);

    // Should not duplicate
    expect(cardDb.cards.length).toBe(1);
    expect(cardDb.cardsByName.get("SharedName")?.id).toBe(100);
  });

  it("assigns unique IDs: no two cards share an ID", () => {
    // Add base cards with some IDs, plus out-of-range ones
    addCard(cardDb, { id: 5, name: "A", kinds: [], attack: 100, defense: 100 });
    addCard(cardDb, { id: 10, name: "B", kinds: [], attack: 200, defense: 100 });
    addCard(cardDb, { id: 1000, name: "C", kinds: [], attack: 300, defense: 100 });
    const fusionDb: FusionDb = {
      fusions: [
        { name: "D", materials: new Set(["A:B"]), attack: 400, defense: 100 },
        { name: "E", materials: new Set(["B:C"]), attack: 500, defense: 100 },
      ],
    };

    registerFusionOnlyCards(cardDb, fusionDb);

    const ids = cardDb.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Reassigned card C must not steal IDs 5 or 10 from existing cards
    const cId = cardDb.cardsByName.get("C")?.id ?? -1;
    expect(cId).not.toBe(5);
    expect(cId).not.toBe(10);
    expect(cId).toBeGreaterThan(0);
    expect(cId).toBeLessThan(MAX_CARD_ID);
  });

  it("handles both out-of-range and fusion-only in the same call", () => {
    addCard(cardDb, { id: 50, name: "InRange", kinds: [], attack: 100, defense: 100 });
    addCard(cardDb, { id: 1005, name: "OutOfRange", kinds: [], attack: 200, defense: 100 });
    const fusionDb: FusionDb = {
      fusions: [
        {
          name: "FusionNew",
          materials: new Set(["InRange:OutOfRange"]),
          attack: 500,
          defense: 100,
        },
      ],
    };

    registerFusionOnlyCards(cardDb, fusionDb);

    expect(cardDb.cards.length).toBe(3);
    for (const card of cardDb.cards) {
      expect(card.id).toBeGreaterThan(0);
      expect(card.id).toBeLessThan(MAX_CARD_ID);
    }
    expect(cardDb.cardsByName.get("OutOfRange")?.id).toBeLessThan(MAX_CARD_ID);
    expect(cardDb.cardsByName.get("FusionNew")?.id).toBeLessThan(MAX_CARD_ID);
  });
});
