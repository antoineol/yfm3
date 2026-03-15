import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { useCollectionViewModelFromState, useHydrateCollectionState } from "./collection-state.ts";

export interface OwnedCardQuantities {
  totalOwned: number;
  inDeck: number;
  availableInCollection: number;
}

export interface CollectionCardViewModel extends CardEntry, OwnedCardQuantities {}

export interface CollectionViewModel {
  entries: CollectionCardViewModel[];
  entriesByCardId: Map<number, CollectionCardViewModel>;
  totalOwnedCards: number;
  uniqueOwnedCards: number;
  deckLength: number;
}

export function useCollectionViewModel(): CollectionViewModel | undefined {
  useHydrateCollectionState();
  return useCollectionViewModelFromState();
}

export function buildCollectionViewModel(
  ownedCardTotals: Record<number, number>,
  deckCardIds: number[],
  cardDb: Parameters<typeof buildCardEntries>[1],
): CollectionViewModel {
  const deckCounts = countById(deckCardIds);
  const entries = buildCardEntries(
    Object.entries(ownedCardTotals).map(([cardId, totalOwned]) => {
      const id = Number(cardId);
      const inDeck = deckCounts.get(id) ?? 0;
      const availableInCollection = Math.max(totalOwned - inDeck, 0);
      return [id, availableInCollection] as const;
    }),
    cardDb,
  ).map((entry) => {
    const totalOwned = ownedCardTotals[entry.id] ?? 0;
    const inDeck = deckCounts.get(entry.id) ?? 0;
    const availableInCollection = entry.qty;

    return {
      ...entry,
      totalOwned,
      inDeck,
      availableInCollection,
    };
  });

  return {
    entries,
    entriesByCardId: new Map(entries.map((entry) => [entry.id, entry])),
    totalOwnedCards: Object.values(ownedCardTotals).reduce((sum, quantity) => sum + quantity, 0),
    uniqueOwnedCards: entries.length,
    deckLength: deckCardIds.length,
  };
}
