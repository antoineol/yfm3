import { describe, expect, it } from "vitest";
import { validateSuggestedSwap, validateSuggestedSwapDeckSize } from "../../convex/deckSwap";

describe("validateSuggestedSwap", () => {
  it("accepts a valid one-for-one swap", () => {
    expect(
      validateSuggestedSwap({
        addCardId: 5,
        collectionQuantity: 2,
        deckCopiesOfAddedCard: 1,
        deckCopiesOfRemovedCard: 1,
        removeCardId: 4,
      }),
    ).toBeNull();
  });

  it("rejects when the added card has no available copy", () => {
    expect(
      validateSuggestedSwap({
        addCardId: 5,
        collectionQuantity: 1,
        deckCopiesOfAddedCard: 1,
        deckCopiesOfRemovedCard: 1,
        removeCardId: 4,
      }),
    ).toBe("No available copies in collection");
  });

  it("rejects when the removable card is not present in the deck", () => {
    expect(
      validateSuggestedSwap({
        addCardId: 5,
        collectionQuantity: 2,
        deckCopiesOfAddedCard: 0,
        deckCopiesOfRemovedCard: 0,
        removeCardId: 4,
      }),
    ).toBe("Card to remove not found in deck");
  });

  it("rejects self-swaps", () => {
    expect(
      validateSuggestedSwap({
        addCardId: 5,
        collectionQuantity: 2,
        deckCopiesOfAddedCard: 1,
        deckCopiesOfRemovedCard: 1,
        removeCardId: 5,
      }),
    ).toBe("Suggested swap must change the deck");
  });

  it("rejects when the added card is not in the collection", () => {
    expect(
      validateSuggestedSwap({
        addCardId: 5,
        collectionQuantity: null,
        deckCopiesOfAddedCard: 0,
        deckCopiesOfRemovedCard: 1,
        removeCardId: 4,
      }),
    ).toBe("Card to add not found in collection");
  });
});

describe("validateSuggestedSwapDeckSize", () => {
  it("accepts a full deck at the configured size", () => {
    expect(
      validateSuggestedSwapDeckSize({
        currentDeckSize: 40,
        expectedDeckSize: 40,
      }),
    ).toBeNull();
  });

  it("rejects underfilled decks", () => {
    expect(
      validateSuggestedSwapDeckSize({
        currentDeckSize: 39,
        expectedDeckSize: 40,
      }),
    ).toBe("Deck must contain exactly 40 cards");
  });
});
