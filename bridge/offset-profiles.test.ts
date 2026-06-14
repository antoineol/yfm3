import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE, PAL_PROFILE } from "./offset-profiles.ts";

describe("offset profiles", () => {
  it("keeps NTSC rank stats at the known fusion-relative base", () => {
    expect(DEFAULT_PROFILE.rankStatsBase).toBe(DEFAULT_PROFILE.lpP1 - 0x13);
    expect(DEFAULT_PROFILE.rankLp).toBe(DEFAULT_PROFILE.lpP1);
    expect(DEFAULT_PROFILE.fusionCounter).toBe(DEFAULT_PROFILE.lpP1 - 0x0c);
    expect(DEFAULT_PROFILE.equipCounter).toBe(DEFAULT_PROFILE.rankStatsBase + 0x08);
    expect(DEFAULT_PROFILE.rankCardsUsed).toBe(DEFAULT_PROFILE.rankStatsBase + 0x17);
  });

  it("keeps PAL rank stats at the live SLES result-stat block", () => {
    expect(PAL_PROFILE.rankStatsBase).toBe(0x0eb279);
    expect(PAL_PROFILE.fusionCounter).toBe(0x0eb280);
    expect(PAL_PROFILE.equipCounter).toBe(0x0eb281);
    expect(PAL_PROFILE.rankLp).toBe(0x0eb28a);
    expect(PAL_PROFILE.rankCardsUsed).toBe(0x0eb296);
    expect(PAL_PROFILE.rankCardsUsed).not.toBe(PAL_PROFILE.cardsDealt);
  });

  it("maps the PAL cursor target without reusing NTSC relative offsets", () => {
    expect(PAL_PROFILE.duelCursorTargetCard).toBe(0x09c6b8);
    expect(DEFAULT_PROFILE.duelSelectedActionCard).toBe(0x0ea1ee);
    expect(DEFAULT_PROFILE.duelFieldCursorColumn).toBe(0x0e9f57);
    expect(DEFAULT_PROFILE.duelFieldCursorRow).toBe(0x0e9f58);
    expect(DEFAULT_PROFILE.duelFieldCursorMap).toBe(0x0907d8);
    expect(DEFAULT_PROFILE.duelTargetSelectionObject).toBe(0x0e9f68);
    expect(DEFAULT_PROFILE.duelCursorFieldSlot).toBe(0);
    expect(DEFAULT_PROFILE.duelBattleTargetMode).toBe(0);
    expect(PAL_PROFILE.duelSelectedActionCard).toBe(0);
    expect(PAL_PROFILE.duelFieldCursorColumn).toBe(0);
    expect(PAL_PROFILE.duelFieldCursorRow).toBe(0);
    expect(PAL_PROFILE.duelFieldCursorMap).toBe(0);
    expect(PAL_PROFILE.duelTargetSelectionObject).toBe(0);
    expect(PAL_PROFILE.duelCursorTargetCard).not.toBe(
      PAL_PROFILE.duelPhase + (DEFAULT_PROFILE.duelCursorTargetCard - DEFAULT_PROFILE.duelPhase),
    );
    expect(PAL_PROFILE.duelCursorFieldSlot).toBe(0x09c6d1);
    expect(PAL_PROFILE.duelCursorFieldSlot).not.toBe(0x09c6e8);
    expect(PAL_PROFILE.duelBattleTargetMode).toBe(0x09c585);
  });

  it("maps PAL terrain from the field-bonus routine terrain byte", () => {
    expect(PAL_PROFILE.terrain).toBe(0x09c6f9);
    expect(PAL_PROFILE.terrain).not.toBe(
      PAL_PROFILE.duelPhase + (DEFAULT_PROFILE.terrain - DEFAULT_PROFILE.duelPhase),
    );
  });
});
