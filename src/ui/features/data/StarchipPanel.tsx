import { useMemo, useState } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { displayCardType } from "../../../engine/data/card-type-names.ts";
import { cardKinds } from "../../../engine/data/rp-types.ts";
import { CardTable } from "../../components/CardTable.tsx";
import {
  type CardEntry,
  cardKindLabel,
  cardTypeDisplayLabel,
} from "../../components/card-entries.ts";
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
  const kindOptions = useMemo(() => buildKindOptions(cards), [cards]);

  return (
    <div className="flex flex-col gap-3">
      <StarchipFilterBar filters={filters} kindOptions={kindOptions} onChange={setFilters} />
      <CardTable defaultSort={{ key: "value", dir: "desc" }} entries={entries} showCost />
    </div>
  );
}

function buildKindOptions(cards: CardSpec[]): Array<{ value: string; label: string }> {
  const labels = new Map<string, string>();
  const present = new Set<string>();
  for (const card of cards) {
    for (const kind of card.kinds) present.add(kind);
    const primaryKind = card.kinds[0];
    if (!primaryKind || labels.has(primaryKind) || card.cardType !== primaryKind) continue;
    labels.set(primaryKind, cardTypeDisplayLabel(card));
  }
  return cardKinds
    .filter((kind) => present.has(kind))
    .map((kind) => ({
      value: kind,
      label: labels.get(kind) ?? displayCardType(kind),
    }));
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
      cardTypeLabel: c.cardTypeLabel,
      atk: c.attack,
      def: c.defense,
      qty: 1,
      cost: c.starchipCost,
      kind1: c.kinds[0],
      kindLabel1: cardKindLabel(c, 0),
      dimmed: fullyStocked,
    });
  }
  return entries;
}
