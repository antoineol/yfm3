import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";
import { formatCardId } from "../lib/format.ts";
import { CardName } from "./CardName.tsx";
import type { SortKey, SortState } from "./sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "./sortable-header.tsx";

export type { SortKey, SortState };

export type DiffStatus = "added" | "removed" | "kept";

export interface CardEntry {
  id: number;
  name: string;
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

export function countById(ids: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

const cardSortGetters = { id: (e: CardEntry) => e.id, atk: (e: CardEntry) => e.atk };

export function CardTable<T extends CardEntry>({
  entries,
  actions,
  leftActions,
  defaultSort,
  showKinds,
}: {
  entries: T[];
  actions?: (entry: T) => ReactNode;
  leftActions?: (entry: T) => ReactNode;
  defaultSort?: SortState;
  showKinds?: boolean;
}) {
  const [animateRef] = useAutoAnimate();
  const [sort, setSort] = useState<SortState>(defaultSort ?? { key: "id", dir: "asc" });

  const handleSortChange = useCallback((key: SortKey) => {
    setSort((prev) => toggleSort(prev, key));
  }, []);

  const sorted = useMemo(() => sortEntries(entries, sort, cardSortGetters) as T[], [entries, sort]);

  const first = entries[0] as T | undefined;
  const showC = first?.collectionCount !== undefined;
  const showD = first?.deckCount !== undefined;
  const hasCopyColumns = showC || showD;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            {leftActions && <th className="py-2 px-1 font-normal" />}
            <SortableHeader
              dir={sort?.key === "id" ? sort.dir : undefined}
              label="#"
              onClick={() => handleSortChange("id")}
            />
            <th className="text-left py-2 px-1 font-normal">Card</th>
            {showC && (
              <th className="text-center py-2 px-1 font-normal" title="In collection">
                C
              </th>
            )}
            {showD && (
              <th className="text-center py-2 px-1 font-normal" title="In deck">
                D
              </th>
            )}
            <SortableHeader
              dir={sort?.key === "atk" ? sort.dir : undefined}
              label="ATK"
              onClick={() => handleSortChange("atk")}
              px="px-2"
            />
            <th className="text-left py-2 px-2 font-normal">DFD</th>
            {showKinds && (
              <>
                <th className="text-left py-2 px-1 font-normal hidden sm:table-cell">Kind1</th>
                <th className="text-left py-2 px-1 font-normal hidden sm:table-cell">Kind2</th>
                <th className="text-left py-2 px-1 font-normal hidden md:table-cell">Kind3</th>
                <th className="text-left py-2 px-1 font-normal hidden md:table-cell">Color</th>
              </>
            )}
            {actions && <th className="py-2 px-1 font-normal" />}
          </tr>
        </thead>
        <tbody ref={animateRef}>
          {sorted.map((e) => {
            const diff = e.diffStatus;
            const rowDiff =
              diff === "removed"
                ? " bg-red-950/20 opacity-60"
                : diff === "added"
                  ? " bg-green-950/20"
                  : "";
            const idColor =
              diff === "removed"
                ? "text-red-400/70"
                : diff === "added"
                  ? "text-green-400/70"
                  : "text-text-muted";
            const nameColor =
              diff === "removed"
                ? "text-red-400"
                : diff === "added"
                  ? "text-green-400"
                  : "text-text-primary";
            const atkColor =
              diff === "removed"
                ? "text-red-400"
                : diff === "added"
                  ? "text-green-400"
                  : "text-stat-atk";
            const defColor =
              diff === "removed"
                ? "text-red-400/70"
                : diff === "added"
                  ? "text-green-400/70"
                  : "text-stat-def";
            const qtyColor =
              diff === "removed"
                ? "text-red-400/70"
                : diff === "added"
                  ? "text-green-400/70"
                  : "text-gold";

            return (
              <tr
                className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover
                  even:bg-bg-surface/30${e.qty === 0 ? " opacity-40" : ""}${rowDiff}`}
                key={e.id}
              >
                {leftActions && <td className="py-0.5 px-1 whitespace-nowrap">{leftActions(e)}</td>}
                <td className={`py-1.5 px-1 font-mono text-xs ${idColor}`}>{formatCardId(e.id)}</td>
                <td className={`py-1.5 px-1 ${nameColor}`}>
                  <CardName cardId={e.id} className={nameColor} name={e.name} />
                  {!hasCopyColumns && e.qty > 1 && (
                    <span
                      className={`${qtyColor} text-xs font-mono ml-1.5`}
                    >{`\u00d7${e.qty}`}</span>
                  )}
                </td>
                {showC && (
                  <td
                    className={`py-1.5 px-1 text-center font-mono text-xs ${e.collectionCount ? "text-text-secondary" : "text-text-muted/50"}`}
                  >
                    {e.collectionCount ?? 0}
                  </td>
                )}
                {showD && (
                  <td
                    className={`py-1.5 px-1 text-center font-mono text-xs ${e.deckCount ? "text-text-secondary" : "text-text-muted/50"}`}
                  >
                    {e.deckCount ?? 0}
                  </td>
                )}
                <td className={`py-1.5 px-2 text-left font-mono font-bold ${atkColor}`}>{e.atk}</td>
                <td className={`py-1.5 px-2 text-left font-mono text-xs ${defColor}`}>{e.def}</td>
                {showKinds && (
                  <>
                    <td className="py-1.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                      {e.kind1}
                    </td>
                    <td className="py-1.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                      {e.kind2}
                    </td>
                    <td className="py-1.5 px-1 text-text-muted text-xs hidden md:table-cell">
                      {e.kind3}
                    </td>
                    <td className="py-1.5 px-1 text-text-muted text-xs hidden md:table-cell">
                      {e.color}
                    </td>
                  </>
                )}
                {actions && (
                  <td className="py-0.5 px-1 text-right whitespace-nowrap">{actions(e)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
