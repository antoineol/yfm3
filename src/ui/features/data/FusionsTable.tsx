import { useCallback, useMemo, useState } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefFusion } from "../../../engine/reference/build-reference-table.ts";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { CardName } from "../../components/CardName.tsx";

interface FusionsTableProps {
  fusions: RefFusion[];
  cardDb: CardDb;
}

export function FusionsTable({ fusions, cardDb }: FusionsTableProps) {
  const [filterCard, setFilterCard] = useState<CardSpec | null>(null);

  const filteredFusions = useMemo(() => {
    if (!filterCard) return fusions;
    const id = filterCard.id;
    return fusions.filter((f) => f.material1Id === id || f.material2Id === id || f.resultId === id);
  }, [fusions, filterCard]);

  const handleSelect = useCallback((card: CardSpec) => {
    setFilterCard(card);
  }, []);

  const handleClear = useCallback(() => {
    setFilterCard(null);
  }, []);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <CardAutocomplete onSelect={handleSelect} placeholder="Filter by card…" />
        </div>
        {filterCard && (
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface px-2.5 py-1.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors duration-150"
            onClick={handleClear}
            type="button"
          >
            <span className="text-gold">{filterCard.name}</span>
            <span className="text-text-muted">&times;</span>
          </button>
        )}
        <span className="shrink-0 text-xs text-text-muted">
          {filteredFusions.length} fusion{filteredFusions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FusionsRows cardDb={cardDb} fusions={filteredFusions} />
      </div>
    </div>
  );
}

function FusionsRows({ fusions, cardDb }: { fusions: RefFusion[]; cardDb: CardDb }) {
  function cardName(id: number) {
    const card = cardDb.cardsById.get(id);
    return card ? <CardName cardId={card.id} name={card.name} /> : `#${id}`;
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
        <tr className="text-text-secondary text-xs uppercase tracking-wide">
          <th className="text-left py-2 px-1 font-normal">Material A</th>
          <th className="text-left py-2 px-1 font-normal">Material B</th>
          <th className="text-left py-2 px-1 font-normal">Result</th>
          <th className="text-left py-2 px-2 font-normal">ATK</th>
        </tr>
      </thead>
      <tbody>
        {fusions.map((f) => (
          <tr
            className="border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30"
            key={f.material1Id * MAX_CARD_ID + f.material2Id}
          >
            <td className="py-1.5 px-1 text-text-primary">{cardName(f.material1Id)}</td>
            <td className="py-1.5 px-1 text-text-primary">{cardName(f.material2Id)}</td>
            <td className="py-1.5 px-1 text-gold">{cardName(f.resultId)}</td>
            <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">{f.resultAtk}</td>
          </tr>
        ))}
        {fusions.length === 0 && (
          <tr>
            <td className="py-8 text-center text-text-muted" colSpan={4}>
              No fusions.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
