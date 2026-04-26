import { useMemo, useState } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { CardTable } from "../../components/CardTable.tsx";
import type { CardEntry } from "../../components/card-entries.ts";
import { StarchipFilterBar, type StarchipFilters } from "./StarchipFilterBar.tsx";

const NOT_FOR_SALE = 999999;

const DEFAULT_FILTERS: StarchipFilters = {
  kind: "all",
  minAtk: 1500,
  maxCost: NOT_FOR_SALE - 1,
  hideFullyStocked: true,
};

export function StarchipPanel({
  cards,
  ownedTotals,
}: {
  cards: CardSpec[];
  ownedTotals: Record<number, number> | undefined;
}) {
  const [filters, setFilters] = useState<StarchipFilters>(DEFAULT_FILTERS);

  const entries = useMemo(
    (): CardEntry[] => buildStarchipEntries(cards, ownedTotals, filters),
    [cards, ownedTotals, filters],
  );

  return (
    <div className="flex flex-col gap-3">
      <StarchipFilterBar filters={filters} onChange={setFilters} />
      <CardTable defaultSort={{ key: "value", dir: "desc" }} entries={entries} showCost />
    </div>
  );
}

function buildStarchipEntries(
  cards: CardSpec[],
  ownedTotals: Record<number, number> | undefined,
  filters: StarchipFilters,
): CardEntry[] {
  const entries: CardEntry[] = [];
  for (const c of cards) {
    if (!c.isMonster) continue;
    if (c.starchipCost === undefined || c.starchipCost === NOT_FOR_SALE) continue;
    if (c.attack < filters.minAtk) continue;
    if (c.starchipCost > filters.maxCost) continue;
    if (filters.kind !== "all" && !(c.kinds as string[]).includes(filters.kind)) continue;

    const owned = ownedTotals?.[c.id] ?? 0;
    const fullyStocked = owned >= 3;
    if (filters.hideFullyStocked && fullyStocked) continue;

    entries.push({
      id: c.id,
      name: c.name,
      isMonster: true,
      cardType: c.cardType,
      atk: c.attack,
      def: c.defense,
      qty: 1,
      cost: c.starchipCost,
      dimmed: fullyStocked,
    });
  }
  return entries;
}
