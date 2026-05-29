import { describe, expect, it } from "vitest";
import { PAL_PROFILE } from "./offset-profiles.ts";
import { readRankCounters } from "./rank-counters.ts";

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
});
