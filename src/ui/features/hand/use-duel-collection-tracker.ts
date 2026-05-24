import { useEffect, useRef } from "react";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";

export interface CollectionSnapshot {
  collection: Record<number, number>;
  deck: number[];
}

/**
 * Watch bridge.inDuel transitions and detect collection changes after a duel starts.
 * Fires callbacks synchronously from effects — no internal state, just refs.
 */
export function useDuelCollectionTracker(
  bridge: EmulatorBridge,
  modMismatch: boolean,
  onDuelStart: () => void,
  onNewCards: (snapshot: CollectionSnapshot) => void,
): void {
  const wasInDuelRef = useRef(false);
  const preDuelCollectionRef = useRef<Record<number, number> | null>(null);
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

  // ── Track duel entry ─────────────────────────────────────────
  useEffect(() => {
    const isInDuel = bridge.inDuel;
    const wasInDuel = wasInDuelRef.current;
    wasInDuelRef.current = isInDuel;

    if (modMismatch) return;
    if (isInDuel && !wasInDuel) {
      preDuelCollectionRef.current = bridge.collection ? { ...bridge.collection } : null;
      hasFiredRef.current = false;
      onDuelStartRef.current();
    }
  }, [bridge.inDuel, bridge.collection, modMismatch]);

  // ── Detect collection changes after duel start ────────────────
  const { collection, deckDefinition } = bridge;

  useEffect(() => {
    if (hasFiredRef.current) return;
    if (modMismatch) return;
    if (!collection || !preDuelCollectionRef.current) return;

    const gainedCards = findNewCardQuantities(preDuelCollectionRef.current, collection);
    if (gainedCards.length === 0) return;

    if (!deckDefinition) return;

    hasFiredRef.current = true;
    onNewCardsRef.current({
      collection: { ...collection },
      deck: [...deckDefinition],
    });
  }, [collection, deckDefinition, modMismatch]);
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
