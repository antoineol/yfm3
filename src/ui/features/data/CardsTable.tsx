import { useMemo } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { CardTable } from "../../components/CardTable.tsx";
import type { CardEntry } from "../../components/card-entries.ts";

interface CardsTableProps {
  cards: CardSpec[];
}

export function CardsTable({ cards }: CardsTableProps) {
  const entries = useMemo(
    (): CardEntry[] =>
      cards.map((c) => ({
        id: c.id,
        name: c.name,
        isMonster: c.isMonster,
        atk: c.attack,
        def: c.defense,
        qty: 1,
      })),
    [cards],
  );

  return <CardTable entries={entries} />;
}
