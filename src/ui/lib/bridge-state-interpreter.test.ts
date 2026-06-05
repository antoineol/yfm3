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
    duelCursorTargetCardId: null,
    duelCursorFieldSlotIndex: null,
    ...overrides,
  };
}

describe("interpretRawState", () => {
  describe("cursor target", () => {
    it("resolves the suspected cursor card id to a player hand slot", () => {
      const result = interpretRawState(makeRaw({ duelCursorTargetCardId: 200 }));

      expect(result.cursorTarget).toEqual({
        zone: "playerHand",
        index: 1,
        cardId: 200,
        hidden: false,
      });
    });

    it("marks opponent targets as hidden", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x09,
          duelCursorTargetCardId: 493,
          opponentField: [
            { cardId: 493, atk: 1550, def: 1400, status: 0xb8 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "opponentField",
        index: 0,
        cardId: 493,
        hidden: true,
      });
    });

    it("resolves player field cards even while the logical phase still says hand", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 572,
          duelCursorFieldSlotIndex: 0,
          field: [
            { cardId: 572, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerField",
        index: 0,
        cardId: 572,
        hidden: false,
      });
    });

    it("resolves opponent field preview while the logical phase still says hand", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 493,
          duelCursorFieldSlotIndex: 1,
          opponentField: [
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 493, atk: 1400, def: 1200, status: 0xbc },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "opponentField",
        index: 1,
        cardId: 493,
        hidden: true,
      });
    });

    it("ignores a stale field target after returning to hand", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 493,
          duelCursorFieldSlotIndex: null,
          opponentField: [
            { cardId: 493, atk: 1400, def: 1200, status: 0xb8 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("ignores a stale field target when field preview has closed but the field signal lags", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 493,
          duelCursorFieldSlotIndex: 1,
          opponentField: [
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 493, atk: 1400, def: 1200, status: 0xb8 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("keeps resolving hand focus from current state after returning from field view", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 200,
          field: [
            { cardId: 572, atk: 2100, def: 1700, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerHand",
        index: 1,
        cardId: 200,
        hidden: false,
      });
    });

    it("clears focus when field preview is on an empty slot with a stale hand target", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 200,
          duelCursorFieldSlotIndex: null,
          field: [
            { cardId: 572, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("clears focus when field preview has no matching field card for the stale target", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelCursorTargetCardId: 200,
          duelCursorFieldSlotIndex: 0,
          field: [
            { cardId: 572, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("ignores a stale hand target once the hand slot is no longer available", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 200,
          handSlots: [0, 0xff, 2, 3, 4],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("ignores inactive slots with a stale target id", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 572,
          field: [
            { cardId: 572, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("uses the live player field cursor slot during field phase", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 531,
          duelCursorFieldSlotIndex: 1,
          field: [
            { cardId: 460, atk: 1400, def: 1500, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 627, atk: 1900, def: 2000, status: 0 },
            { cardId: 401, atk: 2150, def: 1950, status: 0 },
            { cardId: 411, atk: 300, def: 350, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerField",
        index: 1,
        cardId: 531,
        hidden: false,
      });
    });

    it("uses the trusted player field cursor slot when duplicate cards have different live stats", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 613,
          duelCursorFieldSlotIndex: 2,
          field: [
            { cardId: 401, atk: 2150, def: 1950, status: 0x84 },
            { cardId: 613, atk: 3300, def: 2600, status: 0x84 },
            { cardId: 613, atk: 2800, def: 2100, status: 0x84 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerField",
        index: 2,
        cardId: 613,
        hidden: false,
      });
    });

    it("uses the target card id when the field slot signal points to a different live player card", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 460,
          duelCursorFieldSlotIndex: 1,
          field: [
            { cardId: 460, atk: 1400, def: 1500, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 627, atk: 1900, def: 2000, status: 0 },
            { cardId: 401, atk: 2150, def: 1950, status: 0 },
            { cardId: 411, atk: 300, def: 350, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerField",
        index: 0,
        cardId: 460,
        hidden: false,
      });
    });

    it("clears a stale player field target when the field cursor is on an empty slot", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 531,
          duelCursorFieldSlotIndex: null,
          field: [
            { cardId: 460, atk: 1400, def: 1500, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 627, atk: 1900, def: 2000, status: 0 },
            { cardId: 401, atk: 2150, def: 1950, status: 0 },
            { cardId: 411, atk: 300, def: 350, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("keeps opponent hidden field focus when the field slot signal is non-empty", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 548,
          duelCursorFieldSlotIndex: 2,
          field: [
            { cardId: 460, atk: 1400, def: 1500, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 627, atk: 1900, def: 2000, status: 0 },
            { cardId: 401, atk: 2150, def: 1950, status: 0 },
            { cardId: 411, atk: 300, def: 350, status: 0 },
          ],
          opponentField: [
            { cardId: 548, atk: 400, def: 300, status: 0xbc },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "opponentField",
        index: 0,
        cardId: 548,
        hidden: true,
      });
    });

    it("resolves PAL field focus when only the target card address is mapped", () => {
      const raw = makeRaw({
        gameSerial: "SLES_039.48",
        duelPhase: 0x05,
        duelCursorTargetCardId: 277,
        field: [
          { cardId: 401, atk: 2150, def: 1950, status: 0x84 },
          { cardId: 487, atk: 1800, def: 1400, status: 0x84 },
          { cardId: 41, atk: 1400, def: 1200, status: 0x84 },
          { cardId: 41, atk: 1400, def: 1200, status: 0 },
          { cardId: 0, atk: 0, def: 0, status: 0 },
        ],
        opponentHand: [
          { cardId: 277, atk: 300, def: 1300, status: 0xb0 },
          { cardId: 432, atk: 1100, def: 700, status: 0xa0 },
          { cardId: 298, atk: 900, def: 900, status: 0xa0 },
          { cardId: 116, atk: 900, def: 800, status: 0xa0 },
          { cardId: 206, atk: 900, def: 700, status: 0xa0 },
        ],
        opponentField: [
          { cardId: 277, atk: 300, def: 1300, status: 0xbc },
          { cardId: 0, atk: 0, def: 0, status: 0 },
          { cardId: 0, atk: 0, def: 0, status: 0 },
          { cardId: 0, atk: 0, def: 0, status: 0 },
          { cardId: 0, atk: 0, def: 0, status: 0 },
        ],
      });
      const { duelCursorFieldSlotIndex: _fieldSlot, ...rawWithoutFieldSlot } = raw;

      const result = interpretRawState(rawWithoutFieldSlot);

      expect(result.cursorTarget).toEqual({
        zone: "opponentField",
        index: 0,
        cardId: 277,
        hidden: true,
      });
    });

    it("uses PAL's non-zero field focus signal without treating it as a trusted slot index", () => {
      const result = interpretRawState(
        makeRaw({
          gameSerial: "SLES_039.48",
          duelPhase: 0x05,
          duelCursorTargetCardId: 531,
          duelCursorFieldSlotIndex: 1,
          field: [
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0 },
            { cardId: 531, atk: 2100, def: 1700, status: 0 },
            { cardId: 122, atk: 900, def: 300, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toEqual({
        zone: "playerField",
        index: 0,
        cardId: 531,
        hidden: false,
      });
    });

    it("clears PAL field focus when the focus-present signal is empty but the target id is stale", () => {
      const result = interpretRawState(
        makeRaw({
          gameSerial: "SLES_039.48",
          duelPhase: 0x05,
          duelCursorTargetCardId: 531,
          duelCursorFieldSlotIndex: null,
          field: [
            { cardId: 531, atk: 2100, def: 1700, status: 0x84 },
            { cardId: 531, atk: 2100, def: 1700, status: 0 },
            { cardId: 531, atk: 2100, def: 1700, status: 0 },
            { cardId: 122, atk: 900, def: 300, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });

    it("clears a stale opponent hidden target when the field cursor is on an empty slot", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x05,
          duelCursorTargetCardId: 548,
          duelCursorFieldSlotIndex: null,
          opponentField: [
            { cardId: 548, atk: 400, def: 300, status: 0xbc },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
        }),
      );

      expect(result.cursorTarget).toBeNull();
    });
  });

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
        { cardId: 50, atk: 1000, def: 600, status: 0x80, slotIndex: 0 },
        { cardId: 60, atk: 1100, def: 700, status: 0x04, slotIndex: 1 },
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
      expect(result.field).toEqual([
        { cardId: 50, atk: 1500, def: 1100, status: 0x80, slotIndex: 0 },
      ]);
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

    it("maps phase 0x06 (field spell play) on player turn to 'field'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x06, turnIndicator: 0 }));
      expect(result.phase).toBe("field");
      expect(result.inDuel).toBe(true);
    });

    it("maps phase 0x06 on opponent turn to 'opponent'", () => {
      const result = interpretRawState(makeRaw({ duelPhase: 0x06, turnIndicator: 1 }));
      expect(result.phase).toBe("opponent");
      expect(result.opponentPhase).toBe("field");
      expect(result.inDuel).toBe(true);
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
      expect(result.field).toEqual([
        { cardId: 567, atk: 1200, def: 900, status: 0x94, slotIndex: 0 },
      ]);
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
      expect(result.stats).toEqual({
        fusions: 2,
        terrain: 4,
        duelistId: 12,
        rankCounters: null,
      });
    });
  });

  describe("opponent available pool", () => {
    it("clears stale opponent pool data during duel init", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x01,
          duelistId: 7,
          opponentCardsDealt: 5,
          opponentHandSlots: [40, 41, 42, 43, 44],
          opponentHand: [
            { cardId: 11, atk: 100, def: 100, status: 0x80 },
            { cardId: 12, atk: 100, def: 100, status: 0x80 },
            { cardId: 13, atk: 100, def: 100, status: 0x80 },
            { cardId: 14, atk: 100, def: 100, status: 0x80 },
            { cardId: 15, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
        }),
      );

      expect(result.inDuel).toBe(true);
      expect(result.opponentHand).toEqual([]);
      expect(result.opponentHandCards).toEqual([null, null, null, null, null]);
      expect(result.opponentHandPool).toEqual([null, null, null, null, null]);
      expect(result.opponentReserve).toEqual([]);
      expect(result.opponentReservePool).toEqual([]);
      expect(result.opponentAvailablePool).toEqual([]);
    });

    it("clears stale opponent pool data when hand slots do not match the current CPU duel deck", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x03,
          duelistId: 7,
          opponentCardsDealt: 0,
          opponentHandSlots: [40, 41, 42, 43, 44],
          opponentHand: [
            { cardId: 11, atk: 100, def: 100, status: 0x80 },
            { cardId: 12, atk: 100, def: 100, status: 0x80 },
            { cardId: 13, atk: 100, def: 100, status: 0x80 },
            { cardId: 14, atk: 100, def: 100, status: 0x80 },
            { cardId: 15, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
        }),
      );

      expect(result.inDuel).toBe(true);
      expect(result.opponentHand).toEqual([]);
      expect(result.opponentHandCards).toEqual([null, null, null, null, null]);
      expect(result.opponentHandPool).toEqual([null, null, null, null, null]);
      expect(result.opponentReserve).toEqual([]);
      expect(result.opponentReservePool).toEqual([]);
      expect(result.opponentAvailablePool).toEqual([]);
    });

    it("shows the current opponent pool before the opponent deal counter advances", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelistId: 7, // Alpha table handSize 10 when raw-indexed.
          opponentCardsDealt: 0,
          opponentHandSlots: [40, 41, 42, 43, 44],
          opponentHand: [
            { cardId: 101, atk: 100, def: 100, status: 0x80 },
            { cardId: 102, atk: 100, def: 100, status: 0x80 },
            { cardId: 103, atk: 100, def: 100, status: 0x80 },
            { cardId: 104, atk: 100, def: 100, status: 0x80 },
            { cardId: 105, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
        }),
      );

      expect(result.opponentHandCards).toEqual([101, 102, 103, 104, 105]);
      expect(result.opponentHandPool).toEqual([
        { cardId: 101, slotId: 40 },
        { cardId: 102, slotId: 41 },
        { cardId: 103, slotId: 42 },
        { cardId: 104, slotId: 43 },
        { cardId: 105, slotId: 44 },
      ]);
      expect(result.opponentReserve).toEqual([106, 107, 108, 109, 110]);
      expect(result.opponentAvailablePool).toEqual([
        101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
      ]);
    });

    it("shows the reserve-only opponent pool before any opponent hand slot materializes", () => {
      const result = interpretRawState(
        makeRaw({
          duelPhase: 0x04,
          duelistId: 7, // Alpha table handSize 10 when raw-indexed.
          opponentCardsDealt: 0,
          opponentHandSlots: [0xff, 0xff, 0xff, 0xff, 0xff],
          opponentHand: [
            { cardId: 519, atk: 100, def: 100, status: 0 },
            { cardId: 334, atk: 100, def: 100, status: 0 },
            { cardId: 458, atk: 100, def: 100, status: 0 },
            { cardId: 131, atk: 100, def: 100, status: 0 },
            { cardId: 507, atk: 100, def: 100, status: 0 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
        }),
      );

      expect(result.opponentHandCards).toEqual([null, null, null, null, null]);
      expect(result.opponentReserve).toEqual([101, 102, 103, 104, 105, 106, 107, 108, 109, 110]);
      expect(result.opponentReservePool[0]).toEqual({ cardId: 101, slotId: 40 });
      expect(result.opponentAvailablePool).toEqual([
        101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
      ]);
    });

    it("combines visible hand and reserve draw-window cards up to the duelist hand size", () => {
      const result = interpretRawState(
        makeRaw({
          duelistId: 8, // Alpha table handSize 20 when raw-indexed.
          opponentCardsDealt: 5,
          opponentHandSlots: [40, 41, 42, 43, 44],
          opponentHand: [
            { cardId: 11, atk: 100, def: 100, status: 0x80 },
            { cardId: 12, atk: 100, def: 100, status: 0x80 },
            { cardId: 13, atk: 100, def: 100, status: 0x80 },
            { cardId: 14, atk: 100, def: 100, status: 0x80 },
            { cardId: 15, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
          cpuShuffledDeck: Array.from({ length: 40 }, (_, i) => i + 501),
        }),
      );

      expect(result.opponentAvailablePool).toEqual([
        11, 12, 13, 14, 15, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
        120,
      ]);
      expect(result.opponentHandCards).toEqual([11, 12, 13, 14, 15]);
      expect(result.opponentHandPool).toEqual([
        { cardId: 11, slotId: 40 },
        { cardId: 12, slotId: 41 },
        { cardId: 13, slotId: 42 },
        { cardId: 14, slotId: 43 },
        { cardId: 15, slotId: 44 },
      ]);
      expect(result.opponentReserve).toEqual([
        106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
      ]);
      expect(result.opponentReservePool[0]).toEqual({ cardId: 106, slotId: 45 });
      expect(result.opponentReservePool.at(-1)).toEqual({ cardId: 120, slotId: 59 });
    });

    it("uses the live duel deck instead of the original shuffled deck after a reserve swap", () => {
      const result = interpretRawState(
        makeRaw({
          duelistId: 7, // Alpha table handSize 10 when raw-indexed.
          opponentCardsDealt: 5,
          opponentHandSlots: [49, 41, 42, 43, 44],
          opponentHand: [
            { cardId: 199, atk: 100, def: 100, status: 0x80 },
            { cardId: 12, atk: 100, def: 100, status: 0x80 },
            { cardId: 13, atk: 100, def: 100, status: 0x80 },
            { cardId: 14, atk: 100, def: 100, status: 0x80 },
            { cardId: 15, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: [101, 102, 103, 104, 105, 201, 202, 203, 204, 205],
          cpuShuffledDeck: [101, 102, 103, 104, 105, 301, 302, 303, 304, 305],
        }),
      );

      expect(result.opponentAvailablePool).toEqual([199, 12, 13, 14, 15, 201, 202, 203, 204, 205]);
      expect(result.opponentHandCards).toEqual([199, 12, 13, 14, 15]);
      expect(result.opponentHandPool[0]).toEqual({ cardId: 199, slotId: 49 });
      expect(result.opponentReserve).toEqual([201, 202, 203, 204, 205]);
      expect(result.opponentReservePool).toEqual([
        { cardId: 201, slotId: 45 },
        { cardId: 202, slotId: 46 },
        { cardId: 203, slotId: 47 },
        { cardId: 204, slotId: 48 },
        { cardId: 205, slotId: 49 },
      ]);
    });

    it("preserves empty visible hand slots without consuming reserve capacity", () => {
      const result = interpretRawState(
        makeRaw({
          duelistId: 7, // Alpha table handSize 10 when raw-indexed.
          opponentCardsDealt: 7,
          opponentHandSlots: [40, 0xff, 42, 0xff, 44],
          opponentHand: [
            { cardId: 11, atk: 100, def: 100, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 13, atk: 100, def: 100, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
            { cardId: 15, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck: Array.from({ length: 40 }, (_, i) => i + 101),
        }),
      );

      expect(result.opponentHand).toEqual([11, 13, 15]);
      expect(result.opponentHandCards).toEqual([11, null, 13, null, 15]);
      expect(result.opponentHandPool).toEqual([
        { cardId: 11, slotId: 40 },
        null,
        { cardId: 13, slotId: 42 },
        null,
        { cardId: 15, slotId: 44 },
      ]);
      expect(result.opponentReserve).toEqual([108, 109, 110, 111, 112, 113, 114]);
      expect(result.opponentReservePool[0]).toEqual({ cardId: 108, slotId: 47 });
      expect(result.opponentAvailablePool).toEqual([11, 13, 15, 108, 109, 110, 111, 112, 113, 114]);
    });

    it("advances the reserve draw window when the opponent draws into an empty hand slot", () => {
      const cpuDuelDeck = Array.from({ length: 40 }, (_, i) => i + 101);
      const beforeDraw = interpretRawState(
        makeRaw({
          duelistId: 7, // Alpha table handSize 10 when raw-indexed.
          opponentCardsDealt: 5,
          opponentHandSlots: [40, 41, 42, 43, 0xff],
          opponentHand: [
            { cardId: 101, atk: 100, def: 100, status: 0x80 },
            { cardId: 102, atk: 100, def: 100, status: 0x80 },
            { cardId: 103, atk: 100, def: 100, status: 0x80 },
            { cardId: 104, atk: 100, def: 100, status: 0x80 },
            { cardId: 0, atk: 0, def: 0, status: 0 },
          ],
          cpuDuelDeck,
        }),
      );
      const afterDraw = interpretRawState(
        makeRaw({
          duelistId: 7,
          opponentCardsDealt: 6,
          opponentHandSlots: [40, 41, 42, 43, 45],
          opponentHand: [
            { cardId: 101, atk: 100, def: 100, status: 0x80 },
            { cardId: 102, atk: 100, def: 100, status: 0x80 },
            { cardId: 103, atk: 100, def: 100, status: 0x80 },
            { cardId: 104, atk: 100, def: 100, status: 0x80 },
            { cardId: 106, atk: 100, def: 100, status: 0x80 },
          ],
          cpuDuelDeck,
        }),
      );

      expect(beforeDraw.opponentHandCards).toEqual([101, 102, 103, 104, null]);
      expect(beforeDraw.opponentReserve).toEqual([106, 107, 108, 109, 110, 111]);
      expect(beforeDraw.opponentReservePool[0]).toEqual({ cardId: 106, slotId: 45 });
      expect(afterDraw.opponentHandCards).toEqual([101, 102, 103, 104, 106]);
      expect(afterDraw.opponentHandPool[4]).toEqual({ cardId: 106, slotId: 45 });
      expect(afterDraw.opponentReserve).toEqual([107, 108, 109, 110, 111]);
      expect(afterDraw.opponentReservePool[0]).toEqual({ cardId: 107, slotId: 46 });
      expect(afterDraw.opponentAvailablePool).toEqual([
        101, 102, 103, 104, 106, 107, 108, 109, 110, 111,
      ]);
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
