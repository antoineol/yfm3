import { describe, expect, it } from "vitest";
import { computeOwnedCards, interpretRawState } from "./bridge-state-interpreter.ts";

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
    handSlots: [0, 1, 2, 3, 4],
    shuffledDeck: new Array(40).fill(0) as number[],
    trunk: new Array(722).fill(0) as number[],
    deckDefinition: new Array(40).fill(0) as number[],
    opponentHand: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    opponentField: [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ],
    opponentHandSlots: null,
    cpuShuffledDeck: new Array(40).fill(0) as number[],
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

    it("keeps transitioning card in hand when handSlots says present", () => {
      // With handSlots, the 0x10 transitioning bit is irrelevant — handSlots
      // is authoritative and only flips to FF on final confirm.
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x90 }, // present + transitioning
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          handSlots: [0, 1, 2, 3, 4],
        }),
      );
      expect(result.hand).toEqual([100, 200]);
    });

    it("excludes card when handSlots says FF (card left hand)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          handSlots: [0, 0xff, 2, 3, 4],
        }),
      );
      expect(result.hand).toEqual([100, 300]);
    });

    it("excludes cards with status 0x00 even when handSlots says present", () => {
      // handSlots may lag behind cardId being cleared — cardId check still applies.
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 0, atk: 0, def: 0, status: 0x00 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          handSlots: [0, 1, 2, 3, 4],
        }),
      );
      expect(result.hand).toEqual([]);
    });

    it("fallback: excludes transitioning cards when handSlots is null", () => {
      // Without handSlots, the old status-byte filter kicks in.
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x90 }, // present + transitioning
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          handSlots: null,
        }),
      );
      expect(result.hand).toEqual([100]);
    });

    it("fallback: excludes status 0x00 cards when handSlots is null", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x00 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          handSlots: null,
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

    it("maps phase 0x01 (init) to 'draw' regardless of turn indicator", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x01, turnIndicator: 1 }));
      expect(result.phase).toBe("draw");
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

  describe("opponentPhase mapping", () => {
    it("maps raw phase regardless of turn — hand select on opponent turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 1 }));
      expect(result.opponentPhase).toBe("hand");
    });

    it("maps raw phase regardless of turn — draw on opponent turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x03, turnIndicator: 1 }));
      expect(result.opponentPhase).toBe("draw");
    });

    it("maps raw phase regardless of turn — field on opponent turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x05, turnIndicator: 1 }));
      expect(result.opponentPhase).toBe("field");
    });

    it("maps raw phase regardless of turn — battle on opponent turn", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x09, turnIndicator: 1 }));
      expect(result.opponentPhase).toBe("battle");
    });

    it("locks to 'field' during player turn regardless of raw phase", () => {
      const hand = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 0 }));
      expect(hand.opponentPhase).toBe("field");
      const draw = interpretRawState(makeRaw({ duelPhase: 0x03, turnIndicator: 0 }));
      expect(draw.opponentPhase).toBe("field");
    });

    it("falls back to 'other' when duelPhase is null", () => {
      const result = interpretRawState(makeRaw({ duelPhase: null, hand: [] }));
      expect(result.opponentPhase).toBe("other");
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

    it("reliable during fusion on player turn (handSlots is deterministic)", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x07, turnIndicator: 0 }));
      expect(result.handReliable).toBe(true);
    });

    it("reliable during battle on player turn (handSlots is deterministic)", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x09, turnIndicator: 0 }));
      expect(result.handReliable).toBe(true);
    });

    it("reliable on opponent turn (handSlots is deterministic, hand unchanged)", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x04, turnIndicator: 1 }));
      expect(result.handReliable).toBe(true);
    });

    it("reliable during hand select even when a card is transitioning (0x90)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04, // HAND_SELECT
          turnIndicator: 0,
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x90 }, // transitioning but handSlots says present
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      // handSlots is authoritative — transitioning card stays in hand
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

    it("true during init phase (0x01, campaign duel setup)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x01,
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
      expect(result.handReliable).toBe(true);
    });

    it("false when phase is unrecognized and hand is empty", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0xff,
          hand: [
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(false);
    });
  });

  describe("fallback: null duelPhase (unknown game version)", () => {
    const emptyHand = [
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
      { cardId: 0, atk: 0, def: 0, status: 0 },
    ];

    it("infers inDuel=true when hand has cards", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
        }),
      );
      expect(result.inDuel).toBe(true);
    });

    it("infers phase='hand' and handReliable=true with 5 active cards", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 400, atk: 800, def: 600, status: 0x80 },
            { cardId: 500, atk: 1100, def: 900, status: 0x80 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
      expect(result.phase).toBe("hand");
      expect(result.handReliable).toBe(true);
    });

    it("infers phase='draw' with < 5 cards and empty field (initial deal)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
      expect(result.phase).toBe("draw");
      expect(result.handReliable).toBe(false);
    });

    it("infers phase='field' with < 5 cards and cards on field (post-play)", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          hand: [
            { cardId: 100, atk: 1200, def: 800, status: 0x80 },
            { cardId: 200, atk: 1500, def: 1000, status: 0x80 },
            { cardId: 300, atk: 900, def: 700, status: 0x80 },
            { cardId: 400, atk: 800, def: 600, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          field: [
            { cardId: 50, atk: 1800, def: 1400, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
      expect(result.phase).toBe("field");
      expect(result.handReliable).toBe(false);
    });

    it("infers inDuel from field cards even when hand is empty", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          hand: emptyHand,
          field: [
            { cardId: 50, atk: 1800, def: 1400, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
      expect(result.phase).toBe("field");
    });

    it("infers phase='field' when a hand card is transitioning to field (0x90)", () => {
      // Fallback scenario (no profile → handSlots null): card 567 has status 0x90
      // in hand (transitioning) and 0x94 in field. The status-byte filter excludes
      // the transitioning card, so hand count drops below 5 → phase becomes "field".
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          handSlots: null,
          hand: [
            { cardId: 567, atk: 1200, def: 900, status: 0x90 }, // transitioning → excluded
            { cardId: 102, atk: 900, def: 400, status: 0x80 },
            { cardId: 569, atk: 900, def: 800, status: 0x80 },
            { cardId: 130, atk: 600, def: 400, status: 0x80 },
            { cardId: 397, atk: 300, def: 350, status: 0x80 },
          ],
          field: [
            { cardId: 567, atk: 1200, def: 900, status: 0x94 }, // on field
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([102, 569, 130, 397]); // 567 excluded
      expect(result.field).toEqual([{ cardId: 567, atk: 1200, def: 900 }]);
      expect(result.phase).toBe("field"); // was incorrectly "hand" before the fix
      expect(result.inDuel).toBe(true);
    });

    it("not in duel when hand and field are empty", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
          hand: emptyHand,
        }),
      );
      expect(result.inDuel).toBe(false);
      expect(result.phase).toBe("other");
    });

    it("returns null stats when version-dependent fields are null", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: null,
          turnIndicator: null,
          lp: null,
          fusions: null,
          terrain: null,
          duelistId: null,
        }),
      );
      expect(result.lp).toBeNull();
      expect(result.stats).toBeNull();
    });
  });

  describe("stats passthrough", () => {
    it("passes LP, fusions, terrain, and duelistId through", () => {
      const result = interpretRawState(
        makeRaw({ lp: [6000, 3000], fusions: 2, terrain: 4, duelistId: 12 }),
      );
      expect(result.lp).toEqual([6000, 3000]);
      expect(result.stats).toEqual({ fusions: 2, terrain: 4, duelistId: 12, rankCounters: null });
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
