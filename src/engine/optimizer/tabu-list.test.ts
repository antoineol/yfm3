import { describe, expect, it } from "vitest";

import { createTabuList } from "./tabu-list.ts";

describe("TabuList", () => {
  it("newly created tabu has nothing marked", () => {
    const tabu = createTabuList();
    expect(tabu.isTabu(0, 100)).toBe(false);
    expect(tabu.isTabu(5, 200)).toBe(false);
  });

  it("prevents recently rejected card", () => {
    const tabu = createTabuList();
    tabu.addTabu(3, 42);
    expect(tabu.isTabu(3, 42)).toBe(true);
    // Different slot is unaffected
    expect(tabu.isTabu(4, 42)).toBe(false);
  });

  it("ring wraps after 8 entries, oldest overwritten", () => {
    const tabu = createTabuList();
    // Add 8 cards to slot 0
    for (let i = 1; i <= 8; i++) {
      tabu.addTabu(0, i);
    }
    // All 8 should be tabu
    for (let i = 1; i <= 8; i++) {
      expect(tabu.isTabu(0, i)).toBe(true);
    }
    // Adding a 9th overwrites the oldest (card 1)
    tabu.addTabu(0, 99);
    expect(tabu.isTabu(0, 99)).toBe(true);
    expect(tabu.isTabu(0, 1)).toBe(false);
    // Cards 2..8 still tabu
    for (let i = 2; i <= 8; i++) {
      expect(tabu.isTabu(0, i)).toBe(true);
    }
  });
});
