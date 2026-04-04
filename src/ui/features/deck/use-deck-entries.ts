import { useMemo } from "react";
import { buildCardEntries, type CardEntry, countById } from "../../components/card-entries.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface DeckData {
  entries: CardEntry[];
  deckLength: number;
  /** Raw card IDs in deck order (for fusion analysis). */
  deckCardIds: number[];
}

export function useDeckEntries(): DeckData | undefined {
  const deck = useDeck();
  const cardDb = useCardDb();

  return useMemo(() => {
    if (deck === undefined) return undefined;

    const deckCardIds = deck.map((d) => d.cardId);
    const counts = countById(deckCardIds);
    const entries = buildCardEntries(counts, cardDb).map((e) => ({
      ...e,
      deckCount: e.qty,
    }));

    return { entries, deckLength: deck.length, deckCardIds };
  }, [deck, cardDb]);
}
