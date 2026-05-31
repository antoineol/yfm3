import { useEffect, useRef } from "react";
import type { PostDuelOptimizationSnapshot } from "../../lib/atoms.ts";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";

const MIN_OWNED_CARDS_FOR_DECK = 40;

export type CollectionSnapshot = PostDuelOptimizationSnapshot;

/**
 * Watch active duel transitions and detect collection changes after a duel starts.
 * Fires callbacks synchronously from effects — no internal state, just refs.
 */
export function useDuelCollectionTracker(
  bridge: EmulatorBridge,
  modMismatch: boolean,
  savedPreDuelCollection: Record<number, number> | null,
  savedPreDuelDeck: number[] | null,
  onDuelStart: () => void,
  onNewCards: (snapshot: CollectionSnapshot) => void,
): void {
  const wasInActiveDuelRef = useRef(false);
  const preDuelCollectionRef = useRef<Record<number, number> | null>(null);
  const lastKnownCollectionRef = useRef<Record<number, number> | null>(null);
  const lastKnownDeckRef = useRef<number[] | null>(null);
  const savedPreDuelCollectionRef = useRef<Record<number, number> | null>(savedPreDuelCollection);
  const savedPreDuelDeckRef = useRef<number[] | null>(savedPreDuelDeck);
  const hasFiredRef = useRef(false);

  // Keep callbacks fresh without re-triggering effects.
  const onDuelStartRef = useRef(onDuelStart);
  const onNewCardsRef = useRef(onNewCards);
  useEffect(() => {
    onDuelStartRef.current = onDuelStart;
  });
  useEffect(() => {
    onNewCardsRef.current = onNewCards;
  });
  useEffect(() => {
    savedPreDuelCollectionRef.current = savedPreDuelCollection;
  }, [savedPreDuelCollection]);
  useEffect(() => {
    savedPreDuelDeckRef.current = savedPreDuelDeck;
  }, [savedPreDuelDeck]);

  // ── Track active duel entry ──────────────────────────────────
  useEffect(() => {
    const isConfirmedActiveDuel =
      bridge.inDuel && bridge.phase !== "ended" && bridge.handReliable && bridge.hand.length > 0;
    const wasInActiveDuel = wasInActiveDuelRef.current;
    const currentCollection = bridge.collection ? { ...bridge.collection } : null;
    const currentDeck = completeDeckDefinition(bridge.deckDefinition);
    wasInActiveDuelRef.current = isConfirmedActiveDuel;

    if (modMismatch) return;
    if (currentDeck) {
      lastKnownDeckRef.current = currentDeck;
    }
    if (isConfirmedActiveDuel && !wasInActiveDuel) {
      preDuelCollectionRef.current = currentCollection ?? lastKnownCollectionRef.current;
      hasFiredRef.current = false;
      onDuelStartRef.current();
    } else if (
      bridge.inDuel &&
      bridge.phase !== "ended" &&
      !preDuelCollectionRef.current &&
      currentCollection
    ) {
      preDuelCollectionRef.current = currentCollection;
    }

    if (currentCollection) {
      lastKnownCollectionRef.current = currentCollection;
    }
  }, [
    bridge.inDuel,
    bridge.phase,
    bridge.handReliable,
    bridge.hand,
    bridge.collection,
    bridge.deckDefinition,
    modMismatch,
  ]);

  // ── Detect collection changes after duel start ────────────────
  const { collection, deckDefinition } = bridge;

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (modMismatch) return;
    if (!preDuelCollectionRef.current && bridge.phase === "ended") {
      preDuelCollectionRef.current = savedPreDuelCollectionRef.current;
    }
    if (!collection || !preDuelCollectionRef.current) return;

    const gainedCards = findNewCardQuantities(preDuelCollectionRef.current, collection);
    if (gainedCards.length === 0) return;

    const deck =
      completeDeckDefinition(deckDefinition) ??
      lastKnownDeckRef.current ??
      completeDeckDefinition(savedPreDuelDeckRef.current);
    if (!deck) return;
    if (countOwnedCards(collection) < MIN_OWNED_CARDS_FOR_DECK) return;

    hasFiredRef.current = true;
    onNewCardsRef.current({
      collection: { ...collection },
      deck,
    });
  }, [bridge.phase, collection, deckDefinition, modMismatch]);
}

export function isConfirmedActiveBridgeDuel(bridge: EmulatorBridge): boolean {
  return bridge.inDuel && bridge.phase !== "ended" && bridge.handReliable && bridge.hand.length > 0;
}

/** Find card IDs whose quantity increased between two collection snapshots. */
export function findNewCards(
  before: Record<number, number>,
  after: Record<number, number>,
): number[] {
  return findNewCardQuantities(before, after).map((card) => card.cardId);
}

export function findNewCardQuantities(
  before: Record<number, number>,
  after: Record<number, number>,
): Array<{ cardId: number; qty: number }> {
  const newCards: Array<{ cardId: number; qty: number }> = [];
  for (const [idStr, qty] of Object.entries(after)) {
    const id = Number(idStr);
    const prevQty = before[id] ?? 0;
    if (qty > prevQty) {
      newCards.push({ cardId: id, qty: qty - prevQty });
    }
  }
  return newCards;
}

function countOwnedCards(collection: Record<number, number>): number {
  let total = 0;
  for (const count of Object.values(collection)) {
    total += count;
  }
  return total;
}

function completeDeckDefinition(deck: number[] | null): number[] | null {
  if (!deck) return null;
  const cards = deck.filter((id) => id > 0);
  return cards.length >= MIN_OWNED_CARDS_FOR_DECK ? cards : null;
}
