import type { CardSpec } from "../../engine/data/card-model.ts";
import type { CardDb } from "../../engine/data/game-db.ts";

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

export function CardTable({ entries }: { entries: CardEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            <th className="text-left py-2 px-1 font-normal">#</th>
            <th className="text-left py-2 px-1 font-normal">Card</th>
            <th className="text-left py-2 px-2 font-normal">ATK</th>
            <th className="text-left py-2 px-2 font-normal">DEF</th>
            <th className="text-left py-2 px-2 font-normal">Qty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.id}
              className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover
                even:bg-bg-surface/30`}
            >
              <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                {String(e.id).padStart(3, "0")}
              </td>
              <td className="py-1.5 px-1 text-text-primary">{e.name}</td>
              <td className="py-1.5 px-2 text-left font-mono font-bold text-stat-atk">{e.atk}</td>
              <td className="py-1.5 px-2 text-left font-mono text-xs text-stat-def">{e.def}</td>
              <td className="py-1.5 px-2 text-left font-mono text-gold">
                {e.qty > 1 ? `\u00d7${e.qty}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
