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

export type SortKey = "id" | "atk";
export type SortDir = "asc" | "desc";
export type SortState = { key: SortKey; dir: SortDir } | null;

export function CardTable<T extends CardEntry>({
  entries,
  actions,
  leftActions,
  sort,
  onSortChange,
}: {
  entries: T[];
  actions?: (entry: T) => ReactNode;
  leftActions?: (entry: T) => ReactNode;
  sort?: SortState;
  onSortChange?: (key: SortKey) => void;
}) {
  const [animateRef] = useAutoAnimate();
  const sortable = onSortChange !== undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            {leftActions && <th className="py-2 px-1 font-normal" />}
            <SortableHeader
              dir={sort?.key === "id" ? sort.dir : undefined}
              label="#"
              onClick={sortable ? () => onSortChange("id") : undefined}
            />
            <th className="text-left py-2 px-1 font-normal">Card</th>
            <SortableHeader
              dir={sort?.key === "atk" ? sort.dir : undefined}
              label="ATK"
              onClick={sortable ? () => onSortChange("atk") : undefined}
              px="px-2"
            />
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

function SortableHeader({
  label,
  dir,
  onClick,
  px = "px-1",
}: {
  label: string;
  dir?: SortDir;
  onClick?: () => void;
  px?: string;
}) {
  if (!onClick) {
    return <th className={`text-left py-2 ${px} font-normal`}>{label}</th>;
  }
  return (
    <th
      className={`text-left py-2 ${px} font-normal cursor-pointer select-none hover:text-text-primary ${dir ? "text-gold" : ""}`}
      onClick={onClick}
    >
      {label}
      {dir && <span className="ml-0.5">{dir === "asc" ? "\u25B4" : "\u25BE"}</span>}
    </th>
  );
}
