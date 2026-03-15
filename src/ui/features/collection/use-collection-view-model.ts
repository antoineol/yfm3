import { useRef } from "react";
import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

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
  const ownedCardTotals = useOwnedCardTotals();
  const deck = useDeck();
  const cardDb = useCardDb();
  const previousResultRef = useRef<{
    deckCardIdsKey: string;
    ownedCardTotalsKey: string;
    value: CollectionViewModel;
  } | null>(null);

  if (ownedCardTotals === undefined) {
    previousResultRef.current = null;
    return undefined;
  }

  const deckCardIds = (deck ?? []).map((entry) => entry.cardId);
  const deckCardIdsKey = createDeckCardIdsKey(deckCardIds);
  const ownedCardTotalsKey = createOwnedCardTotalsKey(ownedCardTotals);
  const previousResult = previousResultRef.current;

  if (
    previousResult &&
    previousResult.deckCardIdsKey === deckCardIdsKey &&
    previousResult.ownedCardTotalsKey === ownedCardTotalsKey
  ) {
    return previousResult.value;
  }

  const value = buildCollectionViewModel(ownedCardTotals, deckCardIds, cardDb);
  previousResultRef.current = { deckCardIdsKey, ownedCardTotalsKey, value };
  return value;
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

function createDeckCardIdsKey(deckCardIds: number[]) {
  return deckCardIds.join(",");
}

function createOwnedCardTotalsKey(ownedCardTotals: Record<number, number>) {
  const cardIds = Object.keys(ownedCardTotals)
    .map((cardId) => Number(cardId))
    .sort((first, second) => first - second);

  return cardIds.map((cardId) => `${cardId}:${ownedCardTotals[cardId] ?? 0}`).join("|");
}
