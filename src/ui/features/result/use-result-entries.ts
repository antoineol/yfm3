import { useAtomValue } from "jotai";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import type { CardEntry, DiffStatus } from "../../components/card-entries.ts";
import { countById, padWithUtilityCards } from "../../components/card-entries.ts";
import { useDeck } from "../../db/use-deck.ts";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { resultAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export interface ResultData {
  entries: CardEntry[];
  removed: CardEntry[];
  added: CardEntry[];
  kept: CardEntry[];
  swapCount: number;
  result: OptimizeDeckParallelResult;
}

export function useResultEntries(): ResultData | null {
  const result = useAtomValue(resultAtom);
  const cardDb = useCardDb();
  const deck = useDeck();

  const deckSize = useDeckSize();

  if (!result) return null;

  const currentDeckIds = deck ? deck.map((d) => d.cardId) : [];
  const paddedDeck = padWithUtilityCards(result.deck, currentDeckIds, cardDb.cardsById, deckSize);
  const suggestedCounts = countById(paddedDeck);
  const currentCounts = deck ? countById(currentDeckIds) : new Map<number, number>();

  const entries = buildDiffEntries(suggestedCounts, currentCounts, cardDb);
  const removed = entries.filter((e) => e.diffStatus === "removed");
  const added = entries.filter((e) => e.diffStatus === "added");
  const kept = entries.filter((e) => e.diffStatus === "kept");
  const swapCount = removed.length;

  const paddedResult = paddedDeck !== result.deck ? { ...result, deck: paddedDeck } : result;
  return { entries, removed, added, kept, swapCount, result: paddedResult };
}

/** Diff order: removed, added, kept. Within each group, by card id. */
const DIFF_ORDER: Record<DiffStatus, number> = { removed: 0, added: 1, kept: 2 };

function buildDiffEntries(
  suggestedCounts: Map<number, number>,
  currentCounts: Map<number, number>,
  cardDb: CardDb,
): CardEntry[] {
  const allIds = new Set([...suggestedCounts.keys(), ...currentCounts.keys()]);
  const entries: CardEntry[] = [];

  for (const id of allIds) {
    const sugQty = suggestedCounts.get(id) ?? 0;
    const curQty = currentCounts.get(id) ?? 0;
    const card = cardDb.cardsById.get(id);

    const base: Omit<CardEntry, "diffStatus" | "rowKey"> = {
      id,
      name: card?.name ?? `#${id}`,
      isMonster: card?.isMonster ?? true,
      atk: card?.attack ?? 0,
      def: card?.defense ?? 0,
      qty: 1,
      kind1: card?.kinds[0],
      kind2: card?.kinds[1],
      kind3: card?.kinds[2],
      color: card?.color,
    };

    const removedQty = Math.max(0, curQty - sugQty);
    const addedQty = Math.max(0, sugQty - curQty);
    const keptQty = Math.min(sugQty, curQty);

    for (let i = 0; i < removedQty; i++)
      entries.push({ ...base, diffStatus: "removed", rowKey: `${id}-r${i}` });
    for (let i = 0; i < addedQty; i++)
      entries.push({ ...base, diffStatus: "added", rowKey: `${id}-a${i}` });
    for (let i = 0; i < keptQty; i++)
      entries.push({ ...base, diffStatus: "kept", rowKey: `${id}-k${i}` });
  }

  entries.sort((a, b) => {
    const da = DIFF_ORDER[a.diffStatus ?? "kept"];
    const db = DIFF_ORDER[b.diffStatus ?? "kept"];
    if (da !== db) return da - db;
    return a.id - b.id;
  });

  return entries;
}
