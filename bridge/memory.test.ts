import { describe, expect, it } from "vitest";
import {
  CARD_STATS_OFFSET,
  CARD_STATS_SIZE,
  readCardStats,
  readGameState,
  readModFingerprint,
  validateProfile,
} from "./memory.ts";
import { DEFAULT_PROFILE, PAL_PROFILE } from "./offset-profiles.ts";
import { readLiveRankCounters, readRankCounters } from "./rank-counters.ts";

describe("readCardStats", () => {
  it("reads the universal RAM card-stat table without opening shared memory", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    for (let i = 0; i < CARD_STATS_SIZE; i++) {
      view.setUint8(CARD_STATS_OFFSET + i, i & 0xff);
    }

    const stats = readCardStats(view);

    expect(stats).toHaveLength(CARD_STATS_SIZE);
    expect(stats[0]).toBe(0);
    expect(stats[255]).toBe(255);
    expect(stats[256]).toBe(0);
    expect(readModFingerprint(view)).toBe("000102030405060708090a0b0c0d0e0f");
  });
});

describe("validateProfile", () => {
  it("rejects all-zero LP values from not-yet-loaded shared memory", () => {
    const view = new DataView(new ArrayBuffer(0x200000));

    expect(validateProfile(view, DEFAULT_PROFILE)).toBe(false);
  });
});

describe("readRankCounters", () => {
  it("reads PAL rank cards-used from the rank stat block instead of the hand counter", () => {
    const view = new DataView(new ArrayBuffer(0x200000));

    view.setUint8(PAL_PROFILE.rankStatsBase, 3); // turns
    view.setUint8(PAL_PROFILE.rankStatsBase + 1, 0); // effective attacks
    view.setUint8(PAL_PROFILE.rankStatsBase + 2, 0); // defensive wins
    view.setUint8(PAL_PROFILE.rankStatsBase + 3, 0); // face-downs
    view.setUint8(PAL_PROFILE.rankStatsBase + 4, 0); // pure magic
    view.setUint8(PAL_PROFILE.rankStatsBase + 5, 0); // traps
    view.setUint8(PAL_PROFILE.rankStatsBase + 6, 2); // recap-only "Jeux combo"
    view.setUint8(PAL_PROFILE.fusionCounter, 1);
    view.setUint8(PAL_PROFILE.equipCounter, 1);
    view.setUint8(PAL_PROFILE.rankCardsUsed, 8);
    view.setUint8(PAL_PROFILE.cardsDealt, 64);
    view.setUint16(PAL_PROFILE.rankLp, 8000, true);

    expect(readRankCounters(view, PAL_PROFILE)).toEqual([3, 0, 0, 0, 1, 1, 0, 0, 32, 8000]);
  });

  it("uses the live PAL deal counter for cards left before the result screen", () => {
    const view = new DataView(new ArrayBuffer(0x200000));

    view.setUint8(PAL_PROFILE.rankStatsBase, 1);
    view.setUint8(PAL_PROFILE.fusionCounter, 2);
    view.setUint8(PAL_PROFILE.rankCardsUsed, 0xff);
    view.setUint8(PAL_PROFILE.cardsDealt, 7);
    view.setUint16(PAL_PROFILE.rankLp, 8000, true);

    expect(readLiveRankCounters(view, PAL_PROFILE, 0x08)).toEqual([
      1, 0, 0, 0, 2, 0, 0, 0, 33, 8000,
    ]);
  });

  it("keeps the result-screen PAL cards-used byte when the duel has ended", () => {
    const view = new DataView(new ArrayBuffer(0x200000));

    view.setUint8(PAL_PROFILE.rankCardsUsed, 8);
    view.setUint8(PAL_PROFILE.cardsDealt, 7);
    view.setUint16(PAL_PROFILE.rankLp, 8000, true);

    expect(readLiveRankCounters(view, PAL_PROFILE, 0x0d)[8]).toBe(32);
  });
});

describe("readGameState", () => {
  it("reads the PAL cursor field focus signal as non-null when a field card is focused", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint16(PAL_PROFILE.duelCursorTargetCard, 531, true);
    view.setUint8(PAL_PROFILE.duelCursorFieldSlot, 2);

    const state = readGameState(view, PAL_PROFILE);

    expect(state.duelCursorTargetCardId).toBe(531);
    expect(state.duelCursorFieldSlotIndex).toBe(1);
  });

  it("reads the PAL cursor field focus signal as null on an empty field slot", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint16(PAL_PROFILE.duelCursorTargetCard, 531, true);
    view.setUint8(PAL_PROFILE.duelCursorFieldSlot, 0);

    const state = readGameState(view, PAL_PROFILE);

    expect(state.duelCursorTargetCardId).toBe(531);
    expect(state.duelCursorFieldSlotIndex).toBeNull();
  });

  it("reads the PAL battle target-selection mode byte", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint8(PAL_PROFILE.duelBattleTargetMode, 0x83);

    const state = readGameState(view, PAL_PROFILE);

    expect(state.duelBattleTargetMode).toBe(0x83);
  });

  it("leaves the NTSC battle target mode unmapped", () => {
    const view = new DataView(new ArrayBuffer(0x200000));

    const state = readGameState(view, DEFAULT_PROFILE);

    expect(state.duelBattleTargetMode).toBeNull();
  });

  it("maps the NTSC live field cursor coordinates to a duel-table slot", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint8(DEFAULT_PROFILE.turnIndicator, 0);
    view.setInt8(DEFAULT_PROFILE.duelFieldCursorColumn, 1);
    view.setInt8(DEFAULT_PROFILE.duelFieldCursorRow, 2);
    view.setUint8(DEFAULT_PROFILE.duelFieldCursorMap + 11, 6);

    const state = readGameState(view, DEFAULT_PROFILE);

    expect(state.duelCursorDuelTableSlot).toBe(6);
  });

  it("reads the NTSC active target-selection slot from the turn object pointer", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint8(DEFAULT_PROFILE.turnIndicator, 0);
    view.setUint32(DEFAULT_PROFILE.duelTargetSelectionObject, 0x80001000, true);
    view.setInt8(DEFAULT_PROFILE.duelTargetSelectionObject + 0x0b, 4);
    view.setInt8(DEFAULT_PROFILE.duelTargetSelectionObject + 0x0c, 1);
    view.setUint8(DEFAULT_PROFILE.duelFieldCursorMap + 9, 20);

    const state = readGameState(view, DEFAULT_PROFILE);

    expect(state.duelTargetSelectionDuelTableSlot).toBe(20);
  });

  it("returns null when the NTSC target-selection object is inactive", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint8(DEFAULT_PROFILE.turnIndicator, 0);
    view.setUint32(DEFAULT_PROFILE.duelTargetSelectionObject, 0, true);

    const state = readGameState(view, DEFAULT_PROFILE);

    expect(state.duelTargetSelectionDuelTableSlot).toBeNull();
  });

  it("reads the NTSC selected action card id", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint16(DEFAULT_PROFILE.duelSelectedActionCard, 462, true);

    const state = readGameState(view, DEFAULT_PROFILE);

    expect(state.duelSelectedActionCardId).toBe(462);
  });

  it("reads the PAL terrain byte from the live field-bonus routine address", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    view.setUint8(PAL_PROFILE.terrain, 6);

    const state = readGameState(view, PAL_PROFILE);

    expect(state.terrain).toBe(6);
  });

  it("reads the opponent dealt counter and live CPU duel deck", () => {
    const view = new DataView(new ArrayBuffer(0x200000));
    const cpuDuelDeckBase = 0x1a7e20 + 40 * 6;
    view.setUint8(PAL_PROFILE.lpP2 + (PAL_PROFILE.cardsDealt - PAL_PROFILE.lpP1), 9);
    view.setUint16(cpuDuelDeckBase, 123, true);
    view.setUint16(cpuDuelDeckBase + 6, 456, true);

    const state = readGameState(view, PAL_PROFILE);

    expect(state.opponentCardsDealt).toBe(9);
    expect(state.cpuDuelDeck.slice(0, 3)).toEqual([123, 456, 0]);
  });
});
