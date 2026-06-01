/* biome-ignore-all lint/style/useNamingConvention: Convex internals and document ids use _handler and _id. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockResolveUserId, mockGetUserMod } = vi.hoisted(() => ({
  mockResolveUserId: vi.fn(),
  mockGetUserMod: vi.fn(),
}));

vi.mock("../../convex/authHelper.ts", () => ({
  authArgs: { anonymousId: { optional: true } },
  resolveUserId: mockResolveUserId,
}));

vi.mock("../../convex/modHelper.ts", () => ({
  getUserMod: mockGetUserMod,
}));

import { getDeck } from "../../convex/deck.ts";

type DeckRow = { _id: string; userId: string; cardId: number; order?: number };

const getDeckHandler = (
  getDeck as typeof getDeck & {
    _handler: (
      ctx: ReturnType<typeof makeQueryCtx>,
      args: { anonymousId?: string },
    ) => Promise<DeckRow[]>;
  }
)._handler;

describe("getDeck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUserId.mockResolvedValue("user-1");
    mockGetUserMod.mockResolvedValue("rp");
  });

  it("returns deck rows in fractional order", async () => {
    const ctx = makeQueryCtx([
      { _id: "deck-3", userId: "user-1", cardId: 300, order: 0.75 },
      { _id: "deck-1", userId: "user-1", cardId: 100, order: 0.25 },
      { _id: "deck-2", userId: "user-1", cardId: 200, order: 0.5 },
    ]);

    const rows = await getDeckHandler(ctx, {});

    expect(rows.map((row) => row.cardId)).toEqual([100, 200, 300]);
  });

  it("uses card id as a stable fallback when orders tie or are missing", async () => {
    const ctx = makeQueryCtx([
      { _id: "deck-3", userId: "user-1", cardId: 300 },
      { _id: "deck-1", userId: "user-1", cardId: 100 },
      { _id: "deck-2", userId: "user-1", cardId: 200 },
    ]);

    const rows = await getDeckHandler(ctx, {});

    expect(rows.map((row) => row.cardId)).toEqual([100, 200, 300]);
  });

  it("puts rows without order after ordered rows", async () => {
    const ctx = makeQueryCtx([
      { _id: "deck-3", userId: "user-1", cardId: 300 },
      { _id: "deck-1", userId: "user-1", cardId: 100, order: 0.25 },
      { _id: "deck-2", userId: "user-1", cardId: 200, order: 0.5 },
    ]);

    const rows = await getDeckHandler(ctx, {});

    expect(rows.map((row) => row.cardId)).toEqual([100, 200, 300]);
  });
});

function makeQueryCtx(deckRows: DeckRow[]) {
  return {
    db: {
      query(table: string) {
        if (table !== "deck") throw new Error(`Unexpected table ${table}`);
        return {
          withIndex() {
            return {
              collect: async () => deckRows,
            };
          },
        };
      },
    },
  };
}
