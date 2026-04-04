import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";
import { artworkSrc, formatCardId } from "../lib/format.ts";
import { useIsDesktop } from "../lib/use-is-desktop.ts";
import { useSelectedMod } from "../lib/use-selected-mod.ts";
import { CardName } from "./CardName.tsx";
import type { SortState } from "./sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "./sortable-header.tsx";

export type SortKey = "id" | "atk";
export type { SortState };

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

const SORT_FIRST_DIRS: Record<SortKey, "asc" | "desc"> = { id: "asc", atk: "desc" };
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
  const modId = useSelectedMod();
  const isDesktop = useIsDesktop();
  const [animateRef] = useAutoAnimate();
  const [sort, setSort] = useState<SortState>(defaultSort ?? { key: "id", dir: "asc" });

  const handleSortChange = useCallback((key: SortKey) => {
    setSort((prev) => toggleSort(prev, key, SORT_FIRST_DIRS[key]));
  }, []);

  const sorted = useMemo(() => sortEntries(entries, sort, cardSortGetters) as T[], [entries, sort]);

  const first = entries[0] as T | undefined;
  const showC = first?.collectionCount !== undefined;
  const showD = first?.deckCount !== undefined;
  const hasCopyColumns = showC || showD;

  if (!isDesktop) {
    return (
      <div ref={animateRef}>
        {sorted.map((e) => (
          <MobileCardRow
            actions={actions}
            entry={e}
            hasCopyColumns={hasCopyColumns}
            key={e.rowKey ?? e.id}
            leftActions={leftActions}
            modId={modId}
            showC={showC}
            showD={showD}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            {leftActions && <th className="py-1.5 px-1 font-normal" />}
            <th className="py-1.5 w-7" />
            <SortableHeader
              dir={sort?.key === "id" ? sort.dir : undefined}
              label="#"
              onClick={() => handleSortChange("id")}
            />
            <th className="text-left py-1.5 px-1 font-normal">Card</th>
            {showC && (
              <th className="text-center py-1.5 px-1 font-normal" title="In collection">
                C
              </th>
            )}
            {showD && (
              <th className="text-center py-1.5 px-1 font-normal" title="In deck">
                D
              </th>
            )}
            <SortableHeader
              dir={sort?.key === "atk" ? sort.dir : undefined}
              label="ATK"
              onClick={() => handleSortChange("atk")}
              px="px-2"
            />
            <th className="text-left py-1.5 px-2 font-normal">DFD</th>
            {showKinds && (
              <>
                <th className="text-left py-1.5 px-1 font-normal hidden sm:table-cell">Kind1</th>
                <th className="text-left py-1.5 px-1 font-normal hidden sm:table-cell">Kind2</th>
                <th className="text-left py-1.5 px-1 font-normal hidden md:table-cell">Kind3</th>
                <th className="text-left py-1.5 px-1 font-normal hidden md:table-cell">Color</th>
              </>
            )}
            {actions && <th className="py-1.5 px-1 font-normal" />}
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
                key={e.rowKey ?? e.id}
              >
                {leftActions && <td className="py-0.5 px-1 whitespace-nowrap">{leftActions(e)}</td>}
                <td className="py-0.5 px-1">
                  <img
                    alt=""
                    className="w-7 h-6 object-cover rounded-[3px] border border-border-subtle/50"
                    loading="lazy"
                    src={artworkSrc(modId, e.id)}
                  />
                </td>
                <td className={`py-0.5 px-1 font-mono text-xs ${idColor}`}>{formatCardId(e.id)}</td>
                <td className={`py-0.5 px-1 ${nameColor}`}>
                  <CardName cardId={e.id} className={nameColor} name={e.name} />
                  {!hasCopyColumns && e.qty > 1 && (
                    <span
                      className={`${qtyColor} text-xs font-mono ml-1.5`}
                    >{`\u00d7${e.qty}`}</span>
                  )}
                </td>
                {showC && (
                  <td
                    className={`py-0.5 px-1 text-center font-mono text-xs ${e.collectionCount ? "text-text-secondary" : "text-text-muted/50"}`}
                  >
                    {e.collectionCount ?? 0}
                  </td>
                )}
                {showD && (
                  <td
                    className={`py-0.5 px-1 text-center font-mono text-xs ${e.deckCount ? "text-text-secondary" : "text-text-muted/50"}`}
                  >
                    {e.deckCount ?? 0}
                  </td>
                )}
                <td className={`py-0.5 px-2 text-left font-mono font-bold ${atkColor}`}>
                  {e.isMonster ? e.atk : ""}
                </td>
                <td className={`py-0.5 px-2 text-left font-mono text-xs ${defColor}`}>
                  {e.isMonster ? e.def : ""}
                </td>
                {showKinds && (
                  <>
                    <td className="py-0.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                      {e.kind1}
                    </td>
                    <td className="py-0.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                      {e.kind2}
                    </td>
                    <td className="py-0.5 px-1 text-text-muted text-xs hidden md:table-cell">
                      {e.kind3}
                    </td>
                    <td className="py-0.5 px-1 text-text-muted text-xs hidden md:table-cell">
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

/* ── Mobile card row ── */

function MobileCardRow<T extends CardEntry>({
  entry: e,
  leftActions,
  actions,
  hasCopyColumns,
  showC,
  showD,
  modId,
}: {
  entry: T;
  leftActions?: (entry: T) => ReactNode;
  actions?: (entry: T) => ReactNode;
  hasCopyColumns: boolean;
  showC: boolean;
  showD: boolean;
  modId: string;
}) {
  const diff = e.diffStatus;
  const rowBg =
    diff === "removed" ? "bg-red-950/20 opacity-60" : diff === "added" ? "bg-green-950/20" : "";
  const nameColor =
    diff === "removed" ? "text-red-400" : diff === "added" ? "text-green-400" : "text-text-primary";
  const atkColor =
    diff === "removed" ? "text-red-400" : diff === "added" ? "text-green-400" : "text-stat-atk";
  const defColor =
    diff === "removed"
      ? "text-red-400/70"
      : diff === "added"
        ? "text-green-400/70"
        : "text-stat-def";
  const idColor =
    diff === "removed"
      ? "text-red-400/70"
      : diff === "added"
        ? "text-green-400/70"
        : "text-text-muted";
  const qtyColor =
    diff === "removed" ? "text-red-400/70" : diff === "added" ? "text-green-400/70" : "text-gold";

  const hasPills = showC || showD;

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 border-b border-border-subtle/50 ${rowBg} ${e.qty === 0 ? "opacity-40" : ""}`}
    >
      <img
        alt=""
        className="w-9 h-8 object-cover rounded-[3px] border border-border-subtle/50 shrink-0"
        loading="lazy"
        src={artworkSrc(modId, e.id)}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Row 1: Name + stats */}
        <div className="flex items-baseline gap-3">
          <span className={`flex-1 min-w-0 truncate flex text-[15px] ${nameColor}`}>
            <CardName cardId={e.id} className={nameColor} name={e.name} />
            {!hasCopyColumns && e.qty > 1 && (
              <span className={`${qtyColor} text-xs font-mono ml-1`}>{`\u00d7${e.qty}`}</span>
            )}
          </span>
          {e.isMonster && (
            <span className="shrink-0 flex items-baseline gap-1.5">
              <span className={`font-mono font-bold text-base ${atkColor}`}>{e.atk}</span>
              <span className={`font-mono text-xs ${defColor}`}>/ {e.def}</span>
            </span>
          )}
        </div>

        {/* Row 2: Ownership pills + actions */}
        <div className="flex items-center gap-2">
          <div className={`text-xs font-mono ${idColor}`}>#{formatCardId(e.id)}</div>
          {hasPills && (
            <div className="flex items-center gap-1.5">
              {showC && (
                <span className="inline-flex items-center gap-1 text-xs font-mono bg-bg-surface rounded px-2 py-0.5 text-text-secondary">
                  <span className="text-text-muted">C</span>
                  <span
                    className={`font-bold ${(e.collectionCount ?? 0) > 0 ? "text-text-primary" : "text-text-muted"}`}
                  >
                    {e.collectionCount ?? 0}
                  </span>
                </span>
              )}
              {showD && (
                <span className="inline-flex items-center gap-1 text-xs font-mono bg-bg-surface rounded px-2 py-0.5 text-text-secondary">
                  <span className="text-text-muted">D</span>
                  <span
                    className={`font-bold ${(e.deckCount ?? 0) > 0 ? "text-gold" : "text-text-muted"}`}
                  >
                    {e.deckCount ?? 0}
                  </span>
                </span>
              )}
            </div>
          )}
          {(leftActions || actions) && (
            <div className="ml-auto flex items-center gap-2">
              {leftActions?.(e)}
              {actions?.(e)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
