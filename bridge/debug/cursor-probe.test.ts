import { describe, expect, it } from "vitest";
import type { GameState, OffsetProfile } from "../memory.ts";
import {
  buildCursorStatusSlots,
  cursorStatusKey,
  formatCursorStatus,
  readSuspectedCursorTarget,
} from "./cursor-probe.ts";

const baseState: GameState = {
  sceneId: 1,
  duelPhase: 0x04,
  turnIndicator: 0,
  hand: [
    { cardId: 11, atk: 100, def: 100, status: 0x80 },
    { cardId: 12, atk: 100, def: 100, status: 0x84 },
  ],
  field: [{ cardId: 21, atk: 100, def: 100, status: 0x00 }],
  lp: [8000, 8000],
  fusions: 0,
  terrain: 0,
  duelistId: 1,
  handSlots: [0, 1, 2, 3, 4],
  shuffledDeck: [],
  trunk: [],
  deckDefinition: [],
  opponentHand: [{ cardId: 31, atk: 100, def: 100, status: 0xa0 }],
  opponentField: [{ cardId: 41, atk: 100, def: 100, status: 0xbc }],
  opponentHandSlots: null,
  cpuShuffledDeck: [],
  duelistUnlock: [],
  rankCounters: null,
  duelCursorTargetCardId: null,
  duelCursorFieldSlotIndex: null,
};

const profile: OffsetProfile = {
  label: "test",
  duelPhase: 0x200,
  turnIndicator: 0x100,
  sceneId: 0x202,
  terrain: 0x204,
  duelistId: 0x206,
  lpP1: 0x300,
  lpP2: 0x320,
  rankLp: 0x300,
  fusionCounter: 0x2f8,
  rankCardsUsed: 0x304,
  cardsDealt: 0x304,
  handSlots: 0x306,
  rankStatsBase: 0x2f1,
  equipCounter: 0x2f9,
  duelCursorTargetCard: 0x2fe,
  duelCursorFieldSlot: 0x314,
};

describe("cursor probe", () => {
  it("marks slots with the highlight status bit", () => {
    expect(buildCursorStatusSlots(baseState)).toEqual([
      { zone: "playerHand", index: 0, cardId: 11, status: 0x80, highlighted: false },
      { zone: "playerHand", index: 1, cardId: 12, status: 0x84, highlighted: true },
      { zone: "playerField", index: 0, cardId: 21, status: 0x00, highlighted: false },
      { zone: "opponentHand", index: 0, cardId: 31, status: 0xa0, highlighted: false },
      { zone: "opponentField", index: 0, cardId: 41, status: 0xbc, highlighted: true },
    ]);
  });

  it("keys only phase, turn, and known card-slot statuses", () => {
    const slots = buildCursorStatusSlots(baseState);

    expect(cursorStatusKey(0x04, 0, slots, 12)).toBe("4|0|12|80,84,0,a0,bc");
  });

  it("formats a concise status line", () => {
    const slots = buildCursorStatusSlots(baseState);
    const targetSlot = slots[1];
    if (!targetSlot) throw new Error("missing target slot");
    const target = { offset: 0x2fe, cardId: 12, matches: [targetSlot] };

    expect(formatCursorStatus(0x04, 1, 0, slots, target)).toContain(
      "highlight=playerHand[2]#12:84 opponentField[1]#41:bc",
    );
  });

  it("reads the suspected target card id relative to duel phase", () => {
    const view = new DataView(new ArrayBuffer(0x400));
    view.setUint16(0x2fe, 12, true);
    const slots = buildCursorStatusSlots(baseState);

    expect(readSuspectedCursorTarget(view, profile, slots)).toEqual({
      offset: 0x2fe,
      cardId: 12,
      matches: [slots[1]],
    });
  });
});
