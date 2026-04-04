import { useCallback, useMemo, useState } from "react";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";
import type { SortState } from "../../components/sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "../../components/sortable-header.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";

interface EquipsToRow {
  monsterId: number;
  monsterName: string;
  monsterAtk: number;
}

type EquipsToSortKey = "monsterAtk";

const EQUIPS_TO_GETTERS: Record<EquipsToSortKey, (r: EquipsToRow) => number> = {
  monsterAtk: (r) => r.monsterAtk,
};

/** Placeholder cards in some mods have numeric-only names (e.g. "177"). */
const NUMERIC_NAME_RE = /^\d+$/;

export function EquipsToSection({ cardId }: { cardId: number }) {
  const { equipCompat, cardDb } = useFusionTable();

  const totalMonsters = useMemo(
    () => cardDb.cards.filter((c) => c.isMonster && !NUMERIC_NAME_RE.test(c.name)).length,
    [cardDb],
  );

  const rows = useMemo(() => {
    const result: EquipsToRow[] = [];
    for (let monsterId = 1; monsterId < MAX_CARD_ID; monsterId++) {
      if (!equipCompat[cardId * MAX_CARD_ID + monsterId]) continue;
      const monsterCard = cardDb.cardsById.get(monsterId);
      const name = monsterCard?.name ?? `#${monsterId}`;
      if (NUMERIC_NAME_RE.test(name)) continue;
      result.push({
        monsterId,
        monsterName: name,
        monsterAtk: monsterCard?.attack ?? 0,
      });
    }
    result.sort((a, b) => b.monsterAtk - a.monsterAtk);
    return result;
  }, [equipCompat, cardDb, cardId]);

  const equipsAll = rows.length > 0 && rows.length >= totalMonsters;

  const [sort, setSort] = useState<SortState<EquipsToSortKey>>(null);
  const handleSort = useCallback(
    (key: EquipsToSortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortEntries(rows, sort, EQUIPS_TO_GETTERS), [rows, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Can equip
      </span>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted italic">No monsters can use this equip.</p>
      ) : equipsAll ? (
        <div className="rounded-lg border border-gold-dim/60 bg-gradient-to-r from-gold-dim/10 via-gold/8 to-gold-dim/10 px-3 py-2.5">
          <span className="text-sm font-bold text-gold">All monsters</span>
          <span className="text-xs text-text-muted ml-2">({totalMonsters} cards)</span>
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Monster</th>
                <SortableHeader
                  align="text-right"
                  className="w-14"
                  dir={sort?.key === "monsterAtk" ? sort.dir : undefined}
                  label="ATK"
                  onClick={() => handleSort("monsterAtk")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.monsterId}
                >
                  <td className="py-1.5 px-2.5">
                    <a
                      className="block truncate text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${r.monsterId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.monsterName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    {r.monsterAtk}
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
