import { describe, expect, it } from "vitest";
import { computeOwnedCards, interpretRawState } from "./use-emulator-bridge.ts";

function makeRaw(overrides: Record<string, unknown> = {}) {
  return {
    connected: true as const,
    pid: 1234,
    sceneId: 0,
    duelPhase: 0x04, // hand select
    turnIndicator: 0, // player's turn
    hand: [
      { cardId: 100, atk: 1200, def: 800, status: 0x80 },
      { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
      { cardId: 300, atk: 900, def: 700, status: 0x80 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    field: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    lp: [8000, 8000] as [number, number],
    fusions: 0,
    terrain: 0,
    duelistId: 5,
    trunk: new Array(722).fill(0) as number[],
    deckDefinition: new Array(40).fill(0) as number[],
    ...overrides,
  };
}

describe("interpretRawState", () => {
  describe("card filtering", () => {
    it("includes cards with STATUS_PRESENT (0x80)", () => {
      const result = interpretRawState(makeRaw());
      expect(result.hand).toEqual([100, 200, 300]);
    });

    it("excludes empty slots (cardId 0)", () => {
      const result = interpretRawState(makeRaw());
      expect(result.hand).toHaveLength(3);
    });

    it("includes cards with other status flags (0x90 = present + sticky marker)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x90 }, // present + 0x10 flag (sticky after selection)
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([100, 200]);
    });

    it("excludes cards with status 0x00 (truly empty)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x00 }, // status cleared = not present
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([]);
    });

    it("includes cards with any non-zero status (e.g. 0x04 attacker during battle)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x04 }, // attacker: no 0x80 but still active
            { cardId: 200, atk: 1500, def: 1000, status: 0x40 }, // other active flag
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([100, 200]);
    });

    it("excludes out-of-range card IDs (>= 723)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 722, atk: 2000, def: 1800, status: 0x80 },
            { cardId: 723, atk: 500, def: 500, status: 0x80 },
            { cardId: 999, atk: 500, def: 500, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([722]);
    });

    it("filters field cards the same way (any non-zero status = active)", () => {
      const result = interpretRawState(
        makeRaw({
          field: [
            { cardId: 50, atk: 1000, def: 600, status: 0x80 },
            { cardId: 60, atk: 1100, def: 700, status: 0x04 }, // attacker during battle
            { cardId: 70, atk: 800, def: 500, status: 0x00 }, // truly empty
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.field).toEqual([
        { cardId: 50, atk: 1000, def: 600 },
        { cardId: 60, atk: 1100, def: 700 },
      ]);
    });

    it("preserves equip-boosted ATK/DEF from RAM for field cards", () => {
      const result = interpretRawState(
        makeRaw({
          field: [
            { cardId: 50, atk: 1500, def: 1100, status: 0x80 }, // +500 equip boost
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.field).toEqual([{ cardId: 50, atk: 1500, def: 1100 }]);
    });
  });

  describe("phase mapping", () => {
    it("maps phase 0x04 on player turn to 'hand'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 0 }));
      expect(result.phase).toBe("hand");
    });

    it("maps phase 0x03 on player turn to 'draw'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x03, turnIndicator: 0 }));
      expect(result.phase).toBe("draw");
    });

    it("maps phase 0x02 (cleanup) on player turn to 'draw'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x02, turnIndicator: 0 }));
      expect(result.phase).toBe("draw");
    });

    it("maps phase 0x07 on player turn to 'fusion'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x07, turnIndicator: 0 }));
      expect(result.phase).toBe("fusion");
    });

    it("maps phase 0x08 (fusion resolve) on player turn to 'fusion'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x08, turnIndicator: 0 }));
      expect(result.phase).toBe("fusion");
    });

    it("maps phase 0x05 on player turn to 'field'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x05, turnIndicator: 0 }));
      expect(result.phase).toBe("field");
    });

    it("maps phase 0x09 on player turn to 'battle'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x09, turnIndicator: 0 }));
      expect(result.phase).toBe("battle");
    });

    it("maps unknown phase on player turn to 'other'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x0a, turnIndicator: 0 }));
      expect(result.phase).toBe("other");
    });

    it("maps any phase on opponent turn to 'opponent'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 1 }));
      expect(result.phase).toBe("opponent");
    });
  });

  describe("hand reliability", () => {
    it("reliable during hand select on player turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 0 }));
      expect(result.handReliable).toBe(true);
    });

    it("reliable during draw on player turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x03, turnIndicator: 0 }));
      expect(result.handReliable).toBe(true);
    });

    it("reliable during cleanup on player turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x02, turnIndicator: 0 }));
      expect(result.handReliable).toBe(true);
    });

    it("unreliable during fusion on player turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x07, turnIndicator: 0 }));
      expect(result.handReliable).toBe(false);
    });

    it("unreliable during battle on player turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x09, turnIndicator: 0 }));
      expect(result.handReliable).toBe(false);
    });

    it("unreliable on opponent turn even at reliable phase", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 1 }));
      expect(result.handReliable).toBe(false);
    });

    it("reliable during hand select with previously-selected cards (0x90 sticky flag)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04, // HAND_SELECT
          turnIndicator: 0,
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x90 }, // present + 0x10 sticky flag
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([100, 200, 300]);
      expect(result.handReliable).toBe(true);
    });
  });

  describe("inDuel detection", () => {
    it("true when in a recognized duel phase with cards", () => {
      const result = interpretRawState(makeRaw());
      expect(result.inDuel).toBe(true);
    });

    it("true during draw phase even with no cards yet (initial deal)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x03, // DRAW
          hand: [
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
    });

    it("false when phase is DUEL_END", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x0c }));
      expect(result.inDuel).toBe(false);
    });

    it("false when phase is RESULTS", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x0d }));
      expect(result.inDuel).toBe(false);
    });

    it("false when phase is unrecognized", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0xff }));
      expect(result.inDuel).toBe(false);
    });
  });

  describe("stats passthrough", () => {
    it("passes LP, fusions, terrain, and duelistId through", () => {
      const result = interpretRawState(
        makeRaw({ lp: [6000, 3000], fusions: 2, terrain: 4, duelistId: 12 }),
      );
      expect(result.lp).toEqual([6000, 3000]);
      expect(result.stats).toEqual({ fusions: 2, terrain: 4, duelistId: 12 });
    });
  });
});

describe("computeOwnedCards", () => {
  it("returns empty record for all-zero trunk and deck", () => {
    const trunk = new Array(722).fill(0) as number[];
    const deck = new Array(40).fill(0) as number[];
    expect(computeOwnedCards(trunk, deck)).toEqual({});
  });

  it("counts trunk copies (index 0 = card 1)", () => {
    const trunk = new Array(722).fill(0) as number[];
    trunk[0] = 8; // card 1: 8 copies
    trunk[2] = 3; // card 3: 3 copies
    const result = computeOwnedCards(trunk, []);
    expect(result).toEqual({ 1: 8, 3: 3 });
  });

  it("counts deck copies", () => {
    const trunk = new Array(722).fill(0) as number[];
    const deck = [5, 5, 5, 10];
    const result = computeOwnedCards(trunk, deck);
    expect(result).toEqual({ 5: 3, 10: 1 });
  });

  it("merges trunk + deck into total owned", () => {
    const trunk = new Array(722).fill(0) as number[];
    trunk[2] = 1; // card 3: 1 spare
    trunk[7] = 0; // card 8: 0 spare
    const deck = [3, 3, 3, 8, 8, 8]; // 3 copies of card 3, 3 copies of card 8
    const result = computeOwnedCards(trunk, deck);
    expect(result[3]).toBe(4); // 1 trunk + 3 deck
    expect(result[8]).toBe(3); // 0 trunk + 3 deck
  });

  it("ignores zero card IDs in deck", () => {
    const trunk = new Array(722).fill(0) as number[];
    const deck = [0, 0, 5];
    const result = computeOwnedCards(trunk, deck);
    expect(result).toEqual({ 5: 1 });
  });
});
