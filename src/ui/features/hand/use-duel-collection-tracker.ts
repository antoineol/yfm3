import { useEffect, useRef } from "react";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";

export interface CollectionSnapshot {
  collection: Record<number, number>;
  deck: number[];
}

/**
 * Watch bridge.inDuel transitions and detect collection changes during a duel.
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

    if (isInDuel !== wasInDuel) {
      console.log(
        `[PostDuel] inDuel: ${String(wasInDuel)} → ${String(isInDuel)}, phase: ${bridge.phase}`,
      );
    }

    if (modMismatch) return;
    if (isInDuel && !wasInDuel) {
      console.log(`[PostDuel] Duel started — phase: ${bridge.phase}`);
      preDuelCollectionRef.current = bridge.collection ? { ...bridge.collection } : null;
      hasFiredRef.current = false;
      onDuelStartRef.current();
    }
  }, [bridge.inDuel, bridge.phase, bridge.collection, modMismatch]);

  // ── Detect collection changes during duel ─────────────────────
  useEffect(() => {
    if (hasFiredRef.current) return;
    if (!bridge.inDuel || modMismatch) return;
    if (!bridge.collection || !preDuelCollectionRef.current) return;

    const newCards = findNewCards(preDuelCollectionRef.current, bridge.collection);
    if (newCards.length === 0) return;

    console.log(
      `[PostDuel] Collection changed during duel: ${String(newCards.length)} new card(s)`,
    );
    hasFiredRef.current = true;
    if (bridge.deckDefinition) {
      onNewCardsRef.current({
        collection: { ...bridge.collection },
        deck: [...bridge.deckDefinition],
      });
    }
  }, [bridge.inDuel, bridge.collection, bridge.deckDefinition, modMismatch]);
}

/** Find card IDs whose quantity increased between two collection snapshots. */
export function findNewCards(
  before: Record<number, number>,
  after: Record<number, number>,
): number[] {
  const newCards: number[] = [];
  for (const [idStr, qty] of Object.entries(after)) {
    const id = Number(idStr);
    const prevQty = before[id] ?? 0;
    if (qty > prevQty) {
      newCards.push(id);
    }
  }
  return newCards;
}
