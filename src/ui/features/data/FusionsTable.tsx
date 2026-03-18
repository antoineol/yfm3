import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefFusion } from "../../../engine/reference/build-reference-table.ts";
import { MAX_CARD_ID } from "../../../engine/types/constants.ts";

interface FusionsTableProps {
  fusions: RefFusion[];
  cardDb: CardDb;
}

export function FusionsTable({ fusions, cardDb }: FusionsTableProps) {
  function name(id: number): string {
    return cardDb.cardsById.get(id)?.name ?? `#${id}`;
  }

  return (
    <div className="overflow-x-auto">
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
              <td className="py-1.5 px-1 text-text-primary">{name(f.material1Id)}</td>
              <td className="py-1.5 px-1 text-text-primary">{name(f.material2Id)}</td>
              <td className="py-1.5 px-1 text-gold">{name(f.resultId)}</td>
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
    </div>
  );
}
