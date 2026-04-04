import { useCallback, useMemo, useState } from "react";
import type { SortDir, SortState } from "../../components/sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "../../components/sortable-header.tsx";
import { formatRate } from "../../lib/format.ts";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";

interface DuelistDrop {
  duelistId: number;
  duelistName: string;
  saPow: number;
  bcd: number;
  saTec: number;
}

type DropSortKey = "saPow" | "bcd" | "saTec";

const DROP_GETTERS: Record<DropSortKey, (d: DuelistDrop) => number> = {
  saPow: (d) => d.saPow,
  bcd: (d) => d.bcd,
  saTec: (d) => d.saTec,
};

export function DroppedBySection({ cardId }: { cardId: number }) {
  const { duelists } = useFusionTable();

  const drops = useMemo(() => {
    const result: DuelistDrop[] = [];
    for (const row of duelists) {
      if (row.cardId === cardId && (row.saPow > 0 || row.bcd > 0 || row.saTec > 0)) {
        result.push({
          duelistId: row.duelistId,
          duelistName: row.duelistName,
          saPow: row.saPow,
          bcd: row.bcd,
          saTec: row.saTec,
        });
      }
    }
    result.sort((a, b) => b.saPow + b.bcd + b.saTec - (a.saPow + a.bcd + a.saTec));
    return result;
  }, [duelists, cardId]);

  const [sort, setSort] = useState<SortState<DropSortKey>>(null);
  const handleSort = useCallback(
    (key: DropSortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );
  const sortedDrops = useMemo(() => sortEntries(drops, sort, DROP_GETTERS), [drops, sort]);

  function sortDir(key: DropSortKey): SortDir | undefined {
    return sort?.key === key ? sort.dir : undefined;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Dropped by
      </span>
      {drops.length === 0 ? (
        <p className="text-xs text-text-muted italic">No duelists drop this card.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Duelist</th>
                <SortableHeader
                  align="text-right"
                  className="w-15"
                  dir={sortDir("saPow")}
                  label="SA-POW"
                  onClick={() => handleSort("saPow")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  className="w-12"
                  dir={sortDir("bcd")}
                  label="BCD"
                  onClick={() => handleSort("bcd")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sortDir("saTec")}
                  label="SA-TEC"
                  onClick={() => handleSort("saTec")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedDrops.map((d) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={d.duelistId}
                >
                  <td className="py-1.5 px-2.5 truncate">
                    <a
                      className="text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`#data/duelists/${d.duelistId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {d.duelistName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.saPow)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.bcd)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-gold/90">
                    {formatRate(d.saTec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
