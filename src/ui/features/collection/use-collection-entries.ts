import { buildCardEntries, type CardEntry } from "../../components/CardTable.tsx";
import { useCollection } from "../../db/use-collection.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface CollectionData {
  entries: CardEntry[];
  totalCards: number;
  uniqueCards: number;
}

export function useCollectionEntries(): CollectionData | undefined {
  const collection = useCollection();
  const cardDb = useCardDb();

  if (collection === undefined) return undefined;

  const pairs: [number, number][] = Object.entries(collection).map(([id, qty]) => [
    Number(id),
    qty,
  ]);
  const entries = buildCardEntries(pairs, cardDb);
  const totalCards = entries.reduce((sum, e) => sum + e.qty, 0);
  const uniqueCards = entries.length;

  return { entries, totalCards, uniqueCards };
}
