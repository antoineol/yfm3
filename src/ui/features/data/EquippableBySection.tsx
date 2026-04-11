import { useCallback, useMemo, useState } from "react";
import { MODS } from "../../../engine/mods.ts";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";
import type { SortState } from "../../components/sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "../../components/sortable-header.tsx";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useFusionTable } from "../../lib/fusion-table-context.tsx";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

interface EquippableByRow {
  equipId: number;
  equipName: string;
  bonus: number;
}

type EquippableBySortKey = "bonus";

const EQUIPPABLE_GETTERS: Record<EquippableBySortKey, (r: EquippableByRow) => number> = {
  bonus: (r) => r.bonus,
};

/** Placeholder cards in some mods have numeric-only names (e.g. "177"). */
const NUMERIC_NAME_RE = /^\d+$/;

export function EquippableBySection({ cardId }: { cardId: number }) {
  const { equipCompat, cardDb } = useFusionTable();
  const modId = useSelectedMod();
  const bridge = useBridge();
  const eb = bridge.gameData?.equipBonuses;
  const megamorphId = eb?.megamorphId ?? MODS[modId].megamorphId;
  const stdBonus = eb?.equipBonus ?? 500;
  const mmBonus = eb?.megamorphBonus ?? 1000;

  const rows = useMemo(() => {
    const result: EquippableByRow[] = [];
    for (let equipId = 1; equipId < MAX_CARD_ID; equipId++) {
      if (!equipCompat[equipId * MAX_CARD_ID + cardId]) continue;
      const equipCard = cardDb.cardsById.get(equipId);
      const name = equipCard?.name ?? `#${equipId}`;
      if (NUMERIC_NAME_RE.test(name)) continue;
      result.push({
        equipId,
        equipName: name,
        bonus: equipId === megamorphId ? mmBonus : stdBonus,
      });
    }
    result.sort((a, b) => b.bonus - a.bonus || a.equipName.localeCompare(b.equipName));
    return result;
  }, [equipCompat, cardDb, cardId, megamorphId, stdBonus, mmBonus]);

  const [sort, setSort] = useState<SortState<EquippableBySortKey>>(null);
  const handleSort = useCallback(
    (key: EquippableBySortKey) => setSort((prev) => toggleSort(prev, key)),
    [],
  );
  const sortedRows = useMemo(() => sortEntries(rows, sort, EQUIPPABLE_GETTERS), [rows, sort]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-text-muted uppercase tracking-wide font-bold">
        Can be equipped by
      </span>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted italic">No equip cards for this monster.</p>
      ) : (
        <div className="rounded-lg border border-border-subtle overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="bg-bg-surface/80 text-text-muted uppercase tracking-wider text-[10px]">
                <th className="text-left py-1.5 px-2.5 font-semibold">Equip</th>
                <SortableHeader
                  align="text-right"
                  className="w-16"
                  dir={sort?.key === "bonus" ? sort.dir : undefined}
                  label="Bonus"
                  onClick={() => handleSort("bonus")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  className="border-t border-border-subtle/40 transition-colors duration-100 hover:bg-gold/4 even:bg-bg-surface/20"
                  key={r.equipId}
                >
                  <td className="py-1.5 px-2.5">
                    <a
                      className="block truncate text-text-primary hover:text-gold transition-colors duration-150 hover:underline decoration-gold/30 underline-offset-2"
                      href={`${window.location.pathname}#data/cards/${r.equipId}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {r.equipName}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-stat-atk whitespace-nowrap">
                    +{r.bonus}
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
