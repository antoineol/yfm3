import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import { MAX_COPIES } from "../../../engine/types/constants.ts";
import { CardName } from "../../components/CardName.tsx";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import type { SortState } from "../../components/sortable-header.tsx";
import { SortableHeader } from "../../components/sortable-header.tsx";
import { formatCardId, formatRate } from "../../lib/format.ts";
import type { DuelistSortKey } from "./duelist-helpers.ts";

export type RateColumn = {
  key: DuelistSortKey;
  label: string;
  getValue: (row: RefDuelistCard) => number;
};

export function DuelistCardTable({
  label,
  count,
  rows,
  sort,
  onSort,
  rateColumns,
  cardDb,
  ownedTotals,
  emptyMessage,
}: {
  label: string;
  count: number;
  rows: RefDuelistCard[];
  sort: SortState<DuelistSortKey>;
  onSort: (key: DuelistSortKey) => void;
  rateColumns: RateColumn[];
  cardDb: CardDb;
  ownedTotals?: Record<number, number>;
  emptyMessage: string;
}) {
  const showOwned = ownedTotals !== undefined;

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-xs text-text-muted font-mono">{count} cards</span>
      </div>
      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
              <tr className="text-text-secondary text-xs uppercase tracking-wide">
                <SortableHeader
                  dir={sort?.key === "id" ? sort.dir : undefined}
                  label="#"
                  onClick={() => onSort("id")}
                />
                <th className="text-left py-2 px-1 font-normal">Card</th>
                {showOwned && (
                  <SortableHeader
                    align="text-right"
                    dir={sort?.key === "owned" ? sort.dir : undefined}
                    label="Own"
                    onClick={() => onSort("owned")}
                    px="px-2"
                  />
                )}
                <SortableHeader
                  dir={sort?.key === "atk" ? sort.dir : undefined}
                  label="ATK"
                  onClick={() => onSort("atk")}
                  px="px-2"
                />
                <SortableHeader
                  dir={sort?.key === "def" ? sort.dir : undefined}
                  label="DFD"
                  onClick={() => onSort("def")}
                  px="px-2"
                />
                {rateColumns.map((col) => (
                  <SortableHeader
                    align="text-right"
                    dir={sort?.key === col.key ? sort.dir : undefined}
                    key={col.key}
                    label={col.label}
                    onClick={() => onSort(col.key)}
                    px="px-2"
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const card = cardDb.cardsById.get(row.cardId);
                const isMonster = card?.isMonster ?? true;
                const needMore = showOwned && (ownedTotals[row.cardId] ?? 0) < MAX_COPIES;
                return (
                  <tr
                    className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30 ${needMore ? "owned-need-row" : ""}`}
                    key={row.cardId}
                  >
                    <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                      {formatCardId(row.cardId)}
                    </td>
                    <td className="py-1.5 px-1 text-text-primary">
                      <CardName
                        cardId={row.cardId}
                        className={needMore ? "text-text-need" : undefined}
                        name={card?.name ?? `#${row.cardId}`}
                      />
                    </td>
                    {showOwned && (
                      <td
                        className={`py-1.5 px-2 text-right font-mono text-xs ${needMore ? "font-bold text-text-need owned-need" : "text-text-muted"}`}
                      >
                        {ownedTotals[row.cardId] ?? 0}
                      </td>
                    )}
                    <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">
                      {isMonster ? (card?.attack ?? 0) : ""}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-xs text-stat-def">
                      {isMonster ? (card?.defense ?? 0) : ""}
                    </td>
                    {rateColumns.map((col) => (
                      <td
                        className="py-1.5 px-2 text-right font-mono text-xs text-gold"
                        key={col.key}
                      >
                        {formatRate(col.getValue(row))}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-6 text-center text-text-muted text-sm border border-border-subtle rounded-lg bg-bg-surface/20">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
