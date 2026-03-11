import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { liveBestDeckAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function useLiveDeckEntries(): CardEntry[] {
  const liveDeck = useAtomValue(liveBestDeckAtom);
  const cardDb = useCardDb();

  return useMemo(() => {
    if (liveDeck.length === 0) return [];
    const counts = countById(liveDeck);
    return buildCardEntries(counts, cardDb);
  }, [liveDeck, cardDb]);
}
