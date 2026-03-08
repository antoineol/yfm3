import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface DeckData {
  entries: CardEntry[];
  deckLength: number;
}

export function useDeckEntries(): DeckData | undefined {
  const deck = useDeck();
  const cardDb = useCardDb();

  if (deck === undefined) return undefined;

  const counts = countById(deck.map((d) => d.cardId));
  const entries = buildCardEntries(counts, cardDb);

  return { entries, deckLength: deck.length };
}
