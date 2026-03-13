export interface SuggestedSwapValidationInput {
  addCardId: number;
  collectionQuantity: number | null;
  deckCopiesOfAddedCard: number;
  deckCopiesOfRemovedCard: number;
  removeCardId: number;
}

export function validateSuggestedSwap(input: SuggestedSwapValidationInput): string | null {
  const {
    addCardId,
    collectionQuantity,
    deckCopiesOfAddedCard,
    deckCopiesOfRemovedCard,
    removeCardId,
  } = input;

  if (addCardId === removeCardId) {
    return 'Suggested swap must change the deck';
  }
  if (deckCopiesOfRemovedCard <= 0) {
    return 'Card to remove not found in deck';
  }
  if (collectionQuantity === null || collectionQuantity <= 0) {
    return 'Card to add not found in collection';
  }
  if (deckCopiesOfAddedCard >= collectionQuantity) {
    return 'No available copies in collection';
  }

  return null;
}
