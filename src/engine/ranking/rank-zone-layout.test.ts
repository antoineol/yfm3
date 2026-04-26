import { describe, expect, it } from "vitest";
import { getActiveZoneIndex, getFactorZoneDefinitions } from "./rank-zone-layout.ts";

// ---------------------------------------------------------------------------
// getFactorZoneDefinitions
// ---------------------------------------------------------------------------

describe("getFactorZoneDefinitions", () => {
  it("returns 10 factor zone layouts", () => {
    expect(getFactorZoneDefinitions()).toHaveLength(10);
  });

  it("each factor has exactly 5 zones", () => {
    for (const layout of getFactorZoneDefinitions()) {
      expect(layout.zones).toHaveLength(5);
    }
  });

  it("zones are ordered TEC→POW (ascending points)", () => {
    for (const layout of getFactorZoneDefinitions()) {
      const pts = layout.zones.map((z) => z.points);
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i]).toBeGreaterThanOrEqual(pts[i - 1] ?? -Infinity);
      }
    }
  });

  it("Equips zones (reversed: TEC left, POW right)", () => {
    const equips = getFactorZoneDefinitions().find((f) => f.name === "Equips");
    const pts = equips?.zones.map((z) => z.points);
    expect(pts).toEqual([-12, -8, -4, 0, 4]);
    // After reversal, leftLabel/rightLabel are swapped so open ends face outward
    const left = equips?.zones.map((z) => z.leftLabel);
    const right = equips?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "14", "9", "4", "0"]);
    expect(right).toEqual(["15", "10", "5", "1", ""]);
  });

  it("Turns zones (reversed: TEC left, POW right)", () => {
    const turns = getFactorZoneDefinitions().find((f) => f.name === "Turns");
    const pts = turns?.zones.map((z) => z.points);
    expect(pts).toEqual([-12, -8, 0, 8, 12]);
    const left = turns?.zones.map((z) => z.leftLabel);
    const right = turns?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "32", "28", "8", "4"]);
    expect(right).toEqual(["33", "29", "9", "5", ""]);
  });

  it("Remaining LP zones (not reversed, already ascending)", () => {
    const lp = getFactorZoneDefinitions().find((f) => f.name === "Remaining LP");
    const pts = lp?.zones.map((z) => z.points);
    expect(pts).toEqual([-7, -5, 0, 4, 6]);
    const left = lp?.zones.map((z) => z.leftLabel);
    const right = lp?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "100", "1k", "7k", "8k"]);
    expect(right).toEqual(["99", "1k", "7k", "8k", ""]);
  });

  it("Cards left zones (not reversed, already ascending)", () => {
    const cards = getFactorZoneDefinitions().find((f) => f.name === "Cards left");
    const pts = cards?.zones.map((z) => z.points);
    expect(pts).toEqual([-7, -5, 0, 12, 15]);
    const left = cards?.zones.map((z) => z.leftLabel);
    const right = cards?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "4", "8", "28", "32"]);
    expect(right).toEqual(["3", "7", "27", "31", ""]);
  });

  it("Cards left zones use RP 1.3 thresholds when requested", () => {
    const cards = getFactorZoneDefinitions("rp").find((f) => f.name === "Cards left");
    expect(cards?.zones.map((z) => z.points)).toEqual([-7, -5, 0, 20, 32]);
    expect(cards?.zones.map((z) => z.leftLabel)).toEqual(["", "4", "8", "26", "32"]);
    expect(cards?.zones.map((z) => z.rightLabel)).toEqual(["3", "7", "25", "31", ""]);
  });

  it("Traps zones (reversed: TEC left, POW right)", () => {
    const traps = getFactorZoneDefinitions().find((f) => f.name === "Traps");
    const pts = traps?.zones.map((z) => z.points);
    expect(pts).toEqual([-32, -24, -16, -8, 2]);
    const left = traps?.zones.map((z) => z.leftLabel);
    const right = traps?.zones.map((z) => z.rightLabel);
    expect(left).toEqual(["", "6", "4", "2", "0"]);
    expect(right).toEqual(["7", "5", "3", "1", ""]);
  });
});

// ---------------------------------------------------------------------------
// getActiveZoneIndex
// ---------------------------------------------------------------------------

describe("getActiveZoneIndex", () => {
  it("Turns: reversed — low turns (POW) on right, high turns (TEC) on left", () => {
    // Turns (index 0): reversed, display order [-12, -8, 0, +8, +12]
    expect(getActiveZoneIndex(0, 0)).toBe(4); // <5 turns → rightmost (POW)
    expect(getActiveZoneIndex(0, 4)).toBe(4);
    expect(getActiveZoneIndex(0, 5)).toBe(3); // 5-8
    expect(getActiveZoneIndex(0, 8)).toBe(3);
    expect(getActiveZoneIndex(0, 9)).toBe(2); // 9-28
    expect(getActiveZoneIndex(0, 28)).toBe(2);
    expect(getActiveZoneIndex(0, 29)).toBe(1); // 29-32
    expect(getActiveZoneIndex(0, 32)).toBe(1);
    expect(getActiveZoneIndex(0, 33)).toBe(0); // 33+ → leftmost (TEC)
    expect(getActiveZoneIndex(0, 100)).toBe(0);
  });

  it("Equips: reversed — 0 equips (POW) on right, 15+ (TEC) on left", () => {
    // Equips (index 5): reversed, display order [-12, -8, -4, 0, +4]
    expect(getActiveZoneIndex(5, 0)).toBe(4); // 0 equips → rightmost (POW)
    expect(getActiveZoneIndex(5, 1)).toBe(3); // 1-4
    expect(getActiveZoneIndex(5, 4)).toBe(3);
    expect(getActiveZoneIndex(5, 5)).toBe(2); // 5-9
    expect(getActiveZoneIndex(5, 15)).toBe(0); // 15+ → leftmost (TEC)
  });

  it("Remaining LP: not reversed — low LP (TEC) on left, high LP (POW) on right", () => {
    // Remaining LP (index 9): not reversed, display order [-7, -5, 0, +4, +6]
    expect(getActiveZoneIndex(9, 0)).toBe(0); // <100 → leftmost (TEC)
    expect(getActiveZoneIndex(9, 99)).toBe(0);
    expect(getActiveZoneIndex(9, 100)).toBe(1); // 100-1k
    expect(getActiveZoneIndex(9, 999)).toBe(1);
    expect(getActiveZoneIndex(9, 1000)).toBe(2); // 1k-7k
    expect(getActiveZoneIndex(9, 6999)).toBe(2);
    expect(getActiveZoneIndex(9, 7000)).toBe(3); // 7k-8k
    expect(getActiveZoneIndex(9, 8000)).toBe(4); // 8k+ → rightmost (POW)
  });

  it("Cards left: RP profile maps 29 cards left to the +20 zone", () => {
    expect(getActiveZoneIndex(8, 29, "rp")).toBe(3);
  });

  it("invalid factor index returns 0", () => {
    expect(getActiveZoneIndex(99, 5)).toBe(0);
  });
});
