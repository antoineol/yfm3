import { useAtomValue } from "jotai";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { resultAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface ResultData {
  entries: CardEntry[];
  result: OptimizeDeckParallelResult;
}

export function useResultEntries(): ResultData | null {
  const result = useAtomValue(resultAtom);
  const cardDb = useCardDb();
  const deck = useDeck();

  if (!result) return null;

  const suggestedCounts = countById(result.deck);
  const currentCounts = deck ? countById(deck.map((d) => d.cardId)) : new Map<number, number>();

  const entries = buildDiffEntries(suggestedCounts, currentCounts, cardDb);

  return { entries, result };
}

/** Diff order: removed, added, kept. Within each group, by ATK descending. */
const DIFF_ORDER = { removed: 0, added: 1, kept: 2 } as const;

function buildDiffEntries(
  suggestedCounts: Map<number, number>,
  currentCounts: Map<number, number>,
  cardDb: Parameters<typeof buildCardEntries>[1],
): CardEntry[] {
  const allIds = new Set([...suggestedCounts.keys(), ...currentCounts.keys()]);
  const pairs: [number, number][] = [];
  const statusMap = new Map<number, CardEntry["diffStatus"]>();

  for (const id of allIds) {
    const inSuggested = suggestedCounts.get(id) ?? 0;
    const inCurrent = currentCounts.get(id) ?? 0;

    if (inSuggested > 0 && inCurrent === 0) {
      statusMap.set(id, "added");
      pairs.push([id, inSuggested]);
    } else if (inSuggested === 0 && inCurrent > 0) {
      statusMap.set(id, "removed");
      pairs.push([id, inCurrent]);
    } else {
      statusMap.set(id, "kept");
      pairs.push([id, inSuggested]);
    }
  }

  const entries = buildCardEntries(pairs, cardDb);
  for (const e of entries) e.diffStatus = statusMap.get(e.id);

  entries.sort((a, b) => {
    const da = DIFF_ORDER[a.diffStatus ?? "kept"];
    const db = DIFF_ORDER[b.diffStatus ?? "kept"];
    if (da !== db) return da - db;
    return b.atk - a.atk;
  });

  return entries;
}
