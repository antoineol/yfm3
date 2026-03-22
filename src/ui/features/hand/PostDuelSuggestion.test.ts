import { describe, expect, it } from "vitest";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { buildPostDuelDiff } from "./PostDuelSuggestion.tsx";

function makeCard(id: number, attack: number): CardSpec {
  return { id, name: `Card${String(id)}`, attack, isMonster: true } as CardSpec;
}

function makeCardsById(ids: number[]): Map<number, CardSpec> {
  const map = new Map<number, CardSpec>();
  for (const id of ids) map.set(id, makeCard(id, id * 100));
  return map;
}

describe("buildPostDuelDiff", () => {
  it("expands one row per copy when a card has multiple copies removed", () => {
    // current: 3× card1, suggested: 1× card1 + 2× card2
    const current = [1, 1, 1];
    const suggested = [1, 2, 2];
    const cardsById = makeCardsById([1, 2]);

    const rows = buildPostDuelDiff(current, suggested, cardsById);
    const removed = rows.filter((r) => r.type === "removed");
    const added = rows.filter((r) => r.type === "added");

    expect(removed).toHaveLength(2);
    expect(removed.every((r) => r.cardId === 1)).toBe(true);
    expect(added).toHaveLength(2);
    expect(added.every((r) => r.cardId === 2)).toBe(true);
  });

  it("lists each copy separately so remove and add counts match", () => {
    // current: 3× card1 + 3× card2, suggested: 1× card3..card8
    const current = [1, 1, 1, 2, 2, 2];
    const suggested = [3, 4, 5, 6, 7, 8];
    const cardsById = makeCardsById([1, 2, 3, 4, 5, 6, 7, 8]);

    const rows = buildPostDuelDiff(current, suggested, cardsById);
    const removed = rows.filter((r) => r.type === "removed");
    const added = rows.filter((r) => r.type === "added");

    expect(removed).toHaveLength(6);
    expect(added).toHaveLength(6);
  });

  it("returns empty when decks are identical", () => {
    const deck = [1, 2, 3];
    const cardsById = makeCardsById([1, 2, 3]);

    expect(buildPostDuelDiff(deck, deck, cardsById)).toEqual([]);
  });

  it("sorts removed first then by card ID ascending", () => {
    const current = [2, 1];
    const suggested = [4, 3];
    const cardsById = makeCardsById([1, 2, 3, 4]);

    const rows = buildPostDuelDiff(current, suggested, cardsById);

    expect(rows[0]?.type).toBe("removed");
    expect(rows[1]?.type).toBe("removed");
    expect(rows[0]?.cardId).toBe(1);
    expect(rows[1]?.cardId).toBe(2);
    expect(rows[2]?.type).toBe("added");
    expect(rows[3]?.type).toBe("added");
    expect(rows[2]?.cardId).toBe(3);
    expect(rows[3]?.cardId).toBe(4);
  });
});
