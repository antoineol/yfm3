import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { buildFlatEntries, type CardEntry } from "../../components/CardTable.tsx";
import { liveBestDeckAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function useLiveDeckEntries(): CardEntry[] {
  const liveDeck = useAtomValue(liveBestDeckAtom);
  const cardDb = useCardDb();

  return useMemo(() => {
    if (liveDeck.length === 0) return [];
    return buildFlatEntries(liveDeck, cardDb);
  }, [liveDeck, cardDb]);
}
