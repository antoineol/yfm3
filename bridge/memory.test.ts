import { describe, expect, it } from "vitest";
import { PAL_PROFILE } from "./offset-profiles.ts";
import { readLiveRankCounters, readRankCounters } from "./rank-counters.ts";

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
