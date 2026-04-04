import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";

export type DiffStatus = "added" | "removed" | "kept";

export interface CardEntry {
  id: number;
  name: string;
  isMonster: boolean;
  atk: number;
  def: number;
  qty: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
  diffStatus?: DiffStatus;
  /** Copies available in collection (not in deck). */
  collectionCount?: number;
  /** Copies currently in deck. */
  deckCount?: number;
  /** Unique key for React when multiple rows share the same card id. */
  rowKey?: string;
}

export function buildCardEntries(
  idQtyPairs: Iterable<[number, number]>,
  cardDb: CardDb,
): CardEntry[] {
  const entries: CardEntry[] = [];
  for (const [id, qty] of idQtyPairs) {
    const card: CardSpec | undefined = cardDb.cardsById.get(id);
    entries.push({
      id,
      name: card?.name ?? `#${id}`,
      isMonster: card?.isMonster ?? true,
      atk: card?.attack ?? 0,
      def: card?.defense ?? 0,
      qty,
      kind1: card?.kinds[0],
      kind2: card?.kinds[1],
      kind3: card?.kinds[2],
      color: card?.color,
    });
  }
  return entries.sort((a, b) => b.atk - a.atk);
}

/** One CardEntry per element in `ids` (duplicates produce separate rows, each with qty 1). */
export function buildFlatEntries(ids: number[], cardDb: CardDb): CardEntry[] {
  const entries: CardEntry[] = [];
  const seenCount = new Map<number, number>();
  for (const id of ids) {
    const idx = seenCount.get(id) ?? 0;
    seenCount.set(id, idx + 1);
    const card: CardSpec | undefined = cardDb.cardsById.get(id);
    entries.push({
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
      rowKey: `${id}-${idx}`,
    });
  }
  return entries.sort((a, b) => b.atk - a.atk);
}

export function countById(ids: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}
