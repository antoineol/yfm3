/* biome-ignore-all lint/style/useNamingConvention: Convex internals and document ids use _handler and _id. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockAggregateDelete, mockAggregateInsert, mockGetUserMod } = vi.hoisted(
  () => ({
    mockRequireAuth: vi.fn(),
    mockAggregateDelete: vi.fn(),
    mockAggregateInsert: vi.fn(),
    mockGetUserMod: vi.fn(),
  }),
);

vi.mock("../../convex/authHelper.ts", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("../../convex/deckAggregate.ts", () => ({
  deckAggregate: {
    delete: mockAggregateDelete,
    insert: mockAggregateInsert,
  },
  deckAggregateKey: (userId: string, mod: string | undefined) => `${userId}:${mod ?? "rp"}`,
}));

vi.mock("../../convex/modHelper.ts", () => ({
  getUserMod: mockGetUserMod,
}));

import { applySuggestedSwap } from "../../convex/deck.ts";

const applySuggestedSwapHandler = (
  applySuggestedSwap as typeof applySuggestedSwap & {
    _handler: (
      ctx: ReturnType<typeof makeMutationCtx>,
      args: { addCardId: number; removeCardId: number },
    ) => Promise<{ success: boolean }>;
  }
)._handler;

describe("applySuggestedSwap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue("user-1");
    mockAggregateDelete.mockResolvedValue(undefined);
    mockAggregateInsert.mockResolvedValue(undefined);
    mockGetUserMod.mockResolvedValue("rp");
  });

  it("applies the swap when the removed card is in the deck and an owned copy is available", async () => {
    const deckCards = [
      { _id: "deck-1", userId: "user-1", cardId: 2, order: 0.25 },
      { _id: "deck-2", userId: "user-1", cardId: 7, order: 0.5 },
      { _id: "deck-3", userId: "user-1", cardId: 8, order: 0.75 },
    ];
    const ctx = makeMutationCtx({
      deckCards,
      ownedCard: { _id: "owned-1", userId: "user-1", cardId: 5, quantity: 1 },
    });

    const result = await applySuggestedSwapHandler(ctx, {
      addCardId: 5,
      removeCardId: 2,
    });

    expect(result).toEqual({ success: true });
    expect(ctx.db.delete).toHaveBeenCalledWith("deck-1");
    expect(mockAggregateDelete).toHaveBeenCalledWith(ctx, deckCards[0]);
    expect(ctx.db.insert).toHaveBeenCalledWith("deck", {
      userId: "user-1",
      cardId: 5,
      mod: "rp",
    });
    expect(mockAggregateInsert).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ _id: "new-deck-id", userId: "user-1", cardId: 5 }),
    );
  });

  it("rejects self-swaps", async () => {
    const ctx = makeMutationCtx({
      deckCards: [{ _id: "deck-1", userId: "user-1", cardId: 5 }],
      ownedCard: { _id: "owned-1", userId: "user-1", cardId: 5, quantity: 2 },
    });

    await expect(
      applySuggestedSwapHandler(ctx, {
        addCardId: 5,
        removeCardId: 5,
      }),
    ).rejects.toThrow("Suggested swap must change the deck");
  });

  it("rejects when the removed card is no longer in the deck", async () => {
    const ctx = makeMutationCtx({
      deckCards: [{ _id: "deck-1", userId: "user-1", cardId: 7 }],
      ownedCard: { _id: "owned-1", userId: "user-1", cardId: 5, quantity: 1 },
    });

    await expect(
      applySuggestedSwapHandler(ctx, {
        addCardId: 5,
        removeCardId: 2,
      }),
    ).rejects.toThrow("Card to remove not found in deck");
  });

  it("rejects when there is no owned copy left to add", async () => {
    const ctx = makeMutationCtx({
      deckCards: [
        { _id: "deck-1", userId: "user-1", cardId: 5 },
        { _id: "deck-2", userId: "user-1", cardId: 7 },
      ],
      ownedCard: { _id: "owned-1", userId: "user-1", cardId: 5, quantity: 1 },
    });

    await expect(
      applySuggestedSwapHandler(ctx, {
        addCardId: 5,
        removeCardId: 7,
      }),
    ).rejects.toThrow("No available copies in collection");
  });

  it("rejects when the added card is not owned", async () => {
    const ctx = makeMutationCtx({
      deckCards: [{ _id: "deck-1", userId: "user-1", cardId: 2 }],
      ownedCard: null,
    });

    await expect(
      applySuggestedSwapHandler(ctx, {
        addCardId: 5,
        removeCardId: 2,
      }),
    ).rejects.toThrow("Card to add not found in collection");
  });
});

function makeMutationCtx(params: {
  deckCards: Array<{ _id: string; userId: string; cardId: number; order?: number }>;
  ownedCard: { _id: string; userId: string; cardId: number; quantity: number } | null;
}) {
  const { deckCards, ownedCard } = params;
  let insertedDeckDoc: { _id: string; userId: string; cardId: number } | null = null;

  return {
    db: {
      query(table: string) {
        return {
          withIndex() {
            if (table === "deck") {
              return {
                collect: async () => deckCards,
              };
            }

            if (table === "ownedCards") {
              return {
                first: async () => ownedCard,
              };
            }

            throw new Error(`Unexpected table ${table}`);
          },
        };
      },
      delete: vi.fn(async () => undefined),
      insert: vi.fn(async (_table: string, doc: { userId: string; cardId: number }) => {
        insertedDeckDoc = { _id: "new-deck-id", ...doc };
        return "new-deck-id";
      }),
      get: vi.fn(async (id: string) => {
        if (id === "new-deck-id") {
          return insertedDeckDoc;
        }
        return null;
      }),
    },
  };
}
