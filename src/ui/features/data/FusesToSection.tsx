import { useCallback, useMemo, useState } from "react";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";
import type { SortState } from "../../components/sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "../../components/sortable-header.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";

interface FusesToRow {
  otherMaterialId: number;
  otherMaterialName: string;
  resultId: number;
  resultName: string;
  resultAtk: number;
  fusionKey: number;
}

type FusesToSortKey = "resultAtk";

const FUSES_TO_GETTERS: Record<FusesToSortKey, (r: FusesToRow) => number> = {
  resultAtk: (r) => r.resultAtk,
};

export function FusesToSection({ cardId }: { cardId: number }) {
  const { fusions, cardDb } = useFusionTable();

  const fusesTo = useMemo(() => {
    const rows: FusesToRow[] = [];
    for (const f of fusions) {
      if (f.material1Id === cardId || f.material2Id === cardId) {
        const otherId = f.material1Id === cardId ? f.material2Id : f.material1Id;
        const otherCard = cardDb.cardsById.get(otherId);
        const resultCard = cardDb.cardsById.get(f.resultId);
        rows.push({
          otherMaterialId: otherId,
          otherMaterialName: otherCard?.name ?? `#${otherId}`,
          resultId: f.resultId,
          resultName: resultCard?.name ?? `#${f.resultId}`,
          resultAtk: f.resultAtk,
          fusionKey: f.material1Id * MAX_CARD_ID + f.material2Id,
        });
      }
    }
    rows.sort((a, b) => b.resultAtk - a.resultAtk);
    return rows;
  }, [fusions, cardDb, cardId]);

  const [sort, setSort] = useState<SortState<FusesToSortKey>>(null);
  const handleSort = useCallback(
    (key: FusesToSortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortEntries(fusesTo, sort, FUSES_TO_GETTERS), [fusesTo, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Fuses to
      </span>
      {fusesTo.length === 0 ? (
        <p className="text-xs text-text-muted italic">This card has no fusions.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="w-12 py-1.5 px-2.5 font-semibold text-left">With</th>
                <th className="text-left py-1.5 px-2.5 font-semibold">Result</th>
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sort?.key === "resultAtk" ? sort.dir : undefined}
                  label="ATK"
                  onClick={() => handleSort("resultAtk")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.fusionKey}
                >
                  <td className="py-1.5 px-2.5 font-mono text-text-muted">
                    <a
                      className="block truncate hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${String(r.otherMaterialId)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      #{String(r.otherMaterialId)}
                    </a>
                  </td>
                  <td className="py-1.5 px-2.5 text-gold">
                    <a
                      className="block truncate text-gold hover:text-gold-bright transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${String(r.resultId)}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.resultName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    {r.resultAtk}
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
