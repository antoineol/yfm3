import { atom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { useLayoutEffect } from "react";
import type { CardDb } from "../../../engine/data/game-db.ts";
import { buildCardEntries, countById } from "../../components/card-entries.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import type { CollectionViewModel } from "./use-collection-view-model.ts";

type DeckRow = { cardId: number };
type LastAdded = { cardId: number; quantity: number } | null;

type CollectionSnapshot = {
  cardDb: CardDb | undefined;
  deckRows: DeckRow[] | undefined;
  lastAdded: LastAdded | undefined;
  ownedCardTotals: Record<number, number> | undefined;
};

const collectionSnapshotAtom = atom<CollectionSnapshot>({
  cardDb: undefined,
  deckRows: undefined,
  lastAdded: undefined,
  ownedCardTotals: undefined,
});

const setCollectionSnapshotAtom = atom(null, (get, set, next: CollectionSnapshot) => {
  const previous = get(collectionSnapshotAtom);
  set(collectionSnapshotAtom, areCollectionSnapshotsEqual(previous, next) ? previous : next);
});

const stableCollectionSnapshotAtom = selectAtom(
  collectionSnapshotAtom,
  (value) => value,
  areCollectionSnapshotsEqual,
);

const collectionViewModelAtom = atom<CollectionViewModel | undefined>((get) => {
  const { cardDb, deckRows, ownedCardTotals } = get(stableCollectionSnapshotAtom);

  if (ownedCardTotals === undefined || cardDb === undefined) return undefined;

  return buildCollectionViewModelFromState(
    ownedCardTotals,
    (deckRows ?? []).map((row) => row.cardId),
    cardDb,
  );
});

const lastAddedDerivedAtom = atom((get) => {
  const { cardDb, deckRows, lastAdded, ownedCardTotals } = get(stableCollectionSnapshotAtom);
  const addedCardId = lastAdded?.cardId ?? null;

  if (addedCardId === null || ownedCardTotals === undefined || cardDb === undefined) {
    return {
      addedCardId: null,
      availableInCollection: 0,
      card: undefined,
      totalOwned: 0,
    };
  }

  const deckCardIds = (deckRows ?? []).map((entry) => entry.cardId);
  const inDeck = countCardCopies(deckCardIds, addedCardId);
  const totalOwned = ownedCardTotals[addedCardId] ?? 0;

  return {
    addedCardId,
    availableInCollection: Math.max(totalOwned - inDeck, 0),
    card: cardDb.cardsById.get(addedCardId),
    totalOwned,
  };
});

const stableLastAddedDerivedAtom = selectAtom(
  lastAddedDerivedAtom,
  (value) => value,
  (a, b) => {
    return (
      a.addedCardId === b.addedCardId &&
      a.availableInCollection === b.availableInCollection &&
      a.totalOwned === b.totalOwned &&
      Object.is(a.card, b.card)
    );
  },
);

const deckRowsFromSnapshotAtom = selectAtom(
  stableCollectionSnapshotAtom,
  (snapshot) => snapshot.deckRows,
);

export function useHydrateCollectionState() {
  const deckRows = useDeck() as DeckRow[] | undefined;
  const ownedCardTotals = useOwnedCardTotals() as Record<number, number> | undefined;
  const lastAdded = useLastAddedCard() as LastAdded | undefined;
  const cardDb = useCardDb();
  const setCollectionSnapshot = useSetAtom(setCollectionSnapshotAtom);

  useLayoutEffect(() => {
    setCollectionSnapshot({ cardDb, deckRows, lastAdded, ownedCardTotals });
  }, [cardDb, deckRows, lastAdded, ownedCardTotals, setCollectionSnapshot]);
}

export function useCollectionViewModelFromState(): CollectionViewModel | undefined {
  return useAtomValue(collectionViewModelAtom);
}

export function useLastAddedCollectionState() {
  return useAtomValue(stableLastAddedDerivedAtom);
}

export function useDeckRowsFromState() {
  return useAtomValue(deckRowsFromSnapshotAtom);
}

function buildCollectionViewModelFromState(
  ownedCardTotals: Record<number, number>,
  deckCardIds: number[],
  cardDb: CardDb,
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
    const inDeck = deckCounts.get(entry.id) ?? 0;
    return {
      ...entry,
      totalOwned: ownedCardTotals[entry.id] ?? 0,
      inDeck,
      availableInCollection: entry.qty,
      collectionCount: entry.qty,
      deckCount: inDeck,
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

function countCardCopies(deckCardIds: number[], cardId: number) {
  let copies = 0;

  for (const currentCardId of deckCardIds) {
    if (currentCardId === cardId) copies++;
  }

  return copies;
}

function areCollectionSnapshotsEqual(previous: CollectionSnapshot, next: CollectionSnapshot) {
  return (
    Object.is(previous.cardDb, next.cardDb) &&
    areDeckRowsEqual(previous.deckRows, next.deckRows) &&
    areLastAddedEqual(previous.lastAdded, next.lastAdded) &&
    areOwnedCardTotalsEqual(previous.ownedCardTotals, next.ownedCardTotals)
  );
}

function areDeckRowsEqual(previous: DeckRow[] | undefined, next: DeckRow[] | undefined) {
  if (previous === next) return true;
  if (previous === undefined || next === undefined) return false;
  if (previous.length !== next.length) return false;

  for (let index = 0; index < previous.length; index++) {
    if (previous[index]?.cardId !== next[index]?.cardId) return false;
  }

  return true;
}

function areOwnedCardTotalsEqual(
  previous: Record<number, number> | undefined,
  next: Record<number, number> | undefined,
) {
  if (previous === next) return true;
  if (previous === undefined || next === undefined) return false;

  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) return false;

  for (const key of previousKeys) {
    if ((previous[Number(key)] ?? 0) !== (next[Number(key)] ?? 0)) return false;
  }

  return true;
}

function areLastAddedEqual(previous: LastAdded | undefined, next: LastAdded | undefined) {
  if (previous === next) return true;
  if (previous === undefined || next === undefined) return false;
  if (previous === null || next === null) return previous === next;
  return previous.cardId === next.cardId && previous.quantity === next.quantity;
}
