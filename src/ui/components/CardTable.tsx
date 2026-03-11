import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";
import { formatCardId } from "../lib/format.ts";

export interface CardEntry {
  id: number;
  name: string;
  atk: number;
  def: number;
  qty: number;
}

export function buildCardEntries(
  idQtyPairs: Iterable<[number, number]>,
  cardDb: CardDb,
): CardEntry[] {
  const entries: CardEntry[] = [];
  for (const [id, qty] of idQtyPairs) {
    const card: CardSpec | undefined = cardDb.cardsById.get(id);
    entries.push({
      id,
      name: card?.name ?? `#${id}`,
      atk: card?.attack ?? 0,
      def: card?.defense ?? 0,
      qty,
    });
  }
  return entries.sort((a, b) => b.atk - a.atk);
}

export function countById(ids: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

export function CardTable({
  entries,
  actions,
  leftActions,
}: {
  entries: CardEntry[];
  actions?: (entry: CardEntry) => ReactNode;
  leftActions?: (entry: CardEntry) => ReactNode;
}) {
  const [animateRef] = useAutoAnimate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            {leftActions && <th className="py-2 px-1 font-normal" />}
            <th className="text-left py-2 px-1 font-normal">#</th>
            <th className="text-left py-2 px-1 font-normal">Card</th>
            <th className="text-left py-2 px-2 font-normal">ATK</th>
            <th className="text-left py-2 px-2 font-normal">DEF</th>
            {actions && <th className="py-2 px-1 font-normal" />}
          </tr>
        </thead>
        <tbody ref={animateRef}>
          {entries.map((e) => (
            <tr
              className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover
                even:bg-bg-surface/30${e.qty === 0 ? " opacity-40" : ""}`}
              key={e.id}
            >
              {leftActions && <td className="py-0.5 px-1 whitespace-nowrap">{leftActions(e)}</td>}
              <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                {formatCardId(e.id)}
              </td>
              <td className="py-1.5 px-1 text-text-primary">
                <span>{e.name}</span>
                {e.qty > 1 && (
                  <span className="text-gold text-xs font-mono ml-1.5">{`\u00d7${e.qty}`}</span>
                )}
              </td>
              <td className="py-1.5 px-2 text-left font-mono font-bold text-stat-atk">{e.atk}</td>
              <td className="py-1.5 px-2 text-left font-mono text-xs text-stat-def">{e.def}</td>
              {actions && (
                <td className="py-0.5 px-1 text-right whitespace-nowrap">{actions(e)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
