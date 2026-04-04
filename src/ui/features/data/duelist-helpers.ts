import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";

export interface Duelist {
  id: number;
  name: string;
}

export type DuelistSortKey = "id" | "atk" | "def" | "deck" | "saPow" | "bcd" | "saTec" | "owned";

/** Keys where "higher is more interesting" → default desc first. */
export const DESC_FIRST_KEYS: ReadonlySet<DuelistSortKey> = new Set([
  "atk",
  "def",
  "deck",
  "saPow",
  "bcd",
  "saTec",
  "owned",
]);

export function extractDuelists(rows: RefDuelistCard[]): Duelist[] {
  const seen = new Map<number, string>();
  for (const r of rows) {
    if (!seen.has(r.duelistId)) seen.set(r.duelistId, r.duelistName);
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

export function getDeckCards(rows: RefDuelistCard[], duelistId: number): RefDuelistCard[] {
  return rows.filter((r) => r.duelistId === duelistId && r.deck > 0);
}

export function getDropCards(rows: RefDuelistCard[], duelistId: number): RefDuelistCard[] {
  return rows.filter((r) => r.duelistId === duelistId && (r.saPow > 0 || r.bcd > 0 || r.saTec > 0));
}
