import { useAtomValue } from "jotai";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { buildCardEntries, type CardEntry, countById } from "../../components/CardTable.tsx";
import { resultAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface ResultData {
  entries: CardEntry[];
  result: OptimizeDeckParallelResult;
}

export function useResultEntries(): ResultData | null {
  const result = useAtomValue(resultAtom);
  const cardDb = useCardDb();

  if (!result) return null;

  const counts = countById(result.deck);
  const entries = buildCardEntries(counts, cardDb);

  return { entries, result };
}
