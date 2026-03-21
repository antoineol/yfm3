import { describe, expect, it } from "vitest";
import { interpretRawState } from "./use-emulator-bridge.ts";

function makeRaw(overrides: Record<string, unknown> = {}) {
  return {
    connected: true as const,
    pid: 1234,
    sceneId: 0,
    duelPhase: 0x04, // hand select
    turnIndicator: 0, // player's turn
    hand: [
      { cardId: 100, status: 0x80 },
      { cardId: 200, status: 0x80 },
      { cardId: 300, status: 0x80 },
      { cardId: 0, status: 0 },
      { cardId: 0, status: 0 },
    ],
    field: [
      { cardId: 0, status: 0 },
      { cardId: 0, status: 0 },
      { cardId: 0, status: 0 },
      { cardId: 0, status: 0 },
      { cardId: 0, status: 0 },
    ],
    lp: [8000, 8000] as [number, number],
    fusions: 0,
    terrain: 0,
    duelistId: 5,
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

    it("excludes transitioning cards (status 0x90 = present + transitioning)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, status: 0x80 },
            { cardId: 200, status: 0x90 }, // transitioning to field
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([100]);
    });

    it("excludes cards without present bit", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 100, status: 0x00 }, // not present
            { cardId: 200, status: 0x40 }, // some other flag, not present
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([]);
    });

    it("excludes out-of-range card IDs (>= 723)", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 722, status: 0x80 },
            { cardId: 723, status: 0x80 },
            { cardId: 999, status: 0x80 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
      expect(result.hand).toEqual([722]);
    });

    it("filters field cards the same way", () => {
      const result = interpretRawState(
        makeRaw({
          field: [
            { cardId: 50, status: 0x80 },
            { cardId: 60, status: 0x90 }, // transitioning
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
      expect(result.field).toEqual([50]);
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
  });

  describe("inDuel detection", () => {
    it("true when hand has cards", () => {
      const result = interpretRawState(makeRaw());
      expect(result.inDuel).toBe(true);
    });

    it("true when only field has cards", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
          field: [
            { cardId: 400, status: 0x80 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
      expect(result.inDuel).toBe(true);
    });

    it("false when no cards present", () => {
      const result = interpretRawState(
        makeRaw({
          hand: [
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
            { cardId: 0, status: 0 },
          ],
        }),
      );
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
