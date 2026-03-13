import { describe, expect, it } from "vitest";
import { validateSuggestedSwap } from "../../convex/deckSwap";

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
});
