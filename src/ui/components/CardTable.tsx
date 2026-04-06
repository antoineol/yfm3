import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { formatCardId } from "../lib/format.ts";
import { useArtworkSrc } from "../lib/use-artwork-src.ts";
import { useIsDesktop } from "../lib/use-is-desktop.ts";
import { CardName } from "./CardName.tsx";
import type { CardEntry, DiffStatus } from "./card-entries.ts";
import { cardTypeBorderColor } from "./card-entries.ts";
import type { SortState } from "./sortable-header.tsx";
import { SortableHeader, sortEntries, toggleSort } from "./sortable-header.tsx";

type SortKey = "id" | "atk";

/* ── Diff-status colors (shared by desktop & mobile) ── */

interface DiffColors {
  row: string;
  id: string;
  name: string;
  atk: string;
  def: string;
  qty: string;
}

const NEUTRAL: DiffColors = {
  row: "",
  id: "text-text-muted",
  name: "text-text-primary",
  atk: "text-stat-atk",
  def: "text-stat-def",
  qty: "text-gold",
};

const ADDED: DiffColors = {
  row: " bg-green-950/20",
  id: "text-green-400/70",
  name: "text-green-400",
  atk: "text-green-400",
  def: "text-green-400/70",
  qty: "text-green-400/70",
};

const REMOVED: DiffColors = {
  row: " bg-red-950/20 opacity-60",
  id: "text-red-400/70",
  name: "text-red-400",
  atk: "text-red-400",
  def: "text-red-400/70",
  qty: "text-red-400/70",
};

function diffColors(status: DiffStatus | undefined): DiffColors {
  if (status === "added") return ADDED;
  if (status === "removed") return REMOVED;
  return NEUTRAL;
}

/* ── Sort config ── */

const SORT_FIRST_DIRS: Record<SortKey, "asc" | "desc"> = { id: "asc", atk: "desc" };
const cardSortGetters = { id: (e: CardEntry) => e.id, atk: (e: CardEntry) => e.atk };

/* ── CardTable ── */

export function CardTable<T extends CardEntry>({
  entries,
  actions,
  leftActions,
  defaultSort,
  showKinds,
}: {
  entries: T[];
  actions?: (entry: T) => ReactNode;
  leftActions?: (entry: T) => ReactNode;
  defaultSort?: SortState;
  showKinds?: boolean;
}) {
  const resolveArtwork = useArtworkSrc();
  const isDesktop = useIsDesktop();
  const [animateRef] = useAutoAnimate();
  const [sort, setSort] = useState<SortState>(defaultSort ?? { key: "id", dir: "asc" });

  const handleSortChange = useCallback((key: SortKey) => {
    setSort((prev) => toggleSort(prev, key, SORT_FIRST_DIRS[key]));
  }, []);

  const sorted = useMemo(() => sortEntries(entries, sort, cardSortGetters) as T[], [entries, sort]);

  const first = entries[0] as T | undefined;
  const showC = first?.collectionCount !== undefined;
  const showD = first?.deckCount !== undefined;
  const hasCopyColumns = showC || showD;

  if (!isDesktop) {
    return (
      <div ref={animateRef}>
        {sorted.map((e) => (
          <MobileCardRow
            actions={actions}
            entry={e}
            hasCopyColumns={hasCopyColumns}
            key={e.rowKey ?? e.id}
            leftActions={leftActions}
            resolveArtwork={resolveArtwork}
            showC={showC}
            showD={showD}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
          <tr className="text-text-secondary text-xs uppercase tracking-wide">
            {leftActions && <th className="py-1.5 px-1 font-normal" />}
            <th className="py-1.5 w-7" />
            <SortableHeader
              dir={sort?.key === "id" ? sort.dir : undefined}
              label="#"
              onClick={() => handleSortChange("id")}
            />
            <th className="text-left py-1.5 px-1 font-normal">Card</th>
            {showC && (
              <th className="text-center py-1.5 px-1 font-normal" title="In collection">
                C
              </th>
            )}
            {showD && (
              <th className="text-center py-1.5 px-1 font-normal" title="In deck">
                D
              </th>
            )}
            <SortableHeader
              dir={sort?.key === "atk" ? sort.dir : undefined}
              label="ATK"
              onClick={() => handleSortChange("atk")}
              px="px-2"
            />
            <th className="text-left py-1.5 px-2 font-normal">DFD</th>
            {showKinds && (
              <>
                <th className="text-left py-1.5 px-1 font-normal hidden sm:table-cell">Kind1</th>
                <th className="text-left py-1.5 px-1 font-normal hidden sm:table-cell">Kind2</th>
                <th className="text-left py-1.5 px-1 font-normal hidden md:table-cell">Kind3</th>
                <th className="text-left py-1.5 px-1 font-normal hidden md:table-cell">Color</th>
              </>
            )}
            {actions && <th className="py-1.5 px-1 font-normal" />}
          </tr>
        </thead>
        <tbody ref={animateRef}>
          {sorted.map((e) => (
            <DesktopCardRow
              actions={actions}
              entry={e}
              hasCopyColumns={hasCopyColumns}
              key={e.rowKey ?? e.id}
              leftActions={leftActions}
              resolveArtwork={resolveArtwork}
              showC={showC}
              showD={showD}
              showKinds={showKinds}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Desktop row ── */

function DesktopCardRow<T extends CardEntry>({
  entry: e,
  leftActions,
  actions,
  hasCopyColumns,
  showC,
  showD,
  showKinds,
  resolveArtwork,
}: {
  entry: T;
  leftActions?: (entry: T) => ReactNode;
  actions?: (entry: T) => ReactNode;
  hasCopyColumns: boolean;
  showC: boolean;
  showD: boolean;
  showKinds?: boolean;
  resolveArtwork: (cardId: number) => string;
}) {
  const c = diffColors(e.diffStatus);
  const borderColor = cardTypeBorderColor(e.cardType, e.isMonster);

  return (
    <tr
      className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover
        even:bg-bg-surface/30${e.qty === 0 ? " opacity-40" : ""}${c.row}`}
      key={e.rowKey ?? e.id}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {leftActions && <td className="py-0.5 px-1 whitespace-nowrap">{leftActions(e)}</td>}
      <td className="py-0.5 px-1">
        <img
          alt=""
          className="w-7 h-6 object-cover rounded-[3px] border border-border-subtle/50"
          loading="lazy"
          src={resolveArtwork(e.id)}
        />
      </td>
      <td className={`py-0.5 px-1 font-mono text-xs ${c.id}`}>{formatCardId(e.id)}</td>
      <td className={`py-0.5 px-1 ${c.name}`}>
        <CardName cardId={e.id} className={c.name} name={e.name} />
        {!hasCopyColumns && e.qty > 1 && (
          <span className={`${c.qty} text-xs font-mono ml-1.5`}>{`\u00d7${e.qty}`}</span>
        )}
      </td>
      {showC && (
        <td
          className={`py-0.5 px-1 text-center font-mono text-xs ${e.collectionCount ? "text-text-secondary" : "text-text-muted/50"}`}
        >
          {e.collectionCount ?? 0}
        </td>
      )}
      {showD && (
        <td
          className={`py-0.5 px-1 text-center font-mono text-xs ${e.deckCount ? "text-text-secondary" : "text-text-muted/50"}`}
        >
          {e.deckCount ?? 0}
        </td>
      )}
      <td className={`py-0.5 px-2 text-left font-mono font-bold ${c.atk}`}>
        {e.isMonster ? e.atk : ""}
      </td>
      <td className={`py-0.5 px-2 text-left font-mono text-xs ${c.def}`}>
        {e.isMonster ? e.def : ""}
      </td>
      {showKinds && (
        <>
          <td className="py-0.5 px-1 text-text-muted text-xs hidden sm:table-cell">{e.kind1}</td>
          <td className="py-0.5 px-1 text-text-muted text-xs hidden sm:table-cell">{e.kind2}</td>
          <td className="py-0.5 px-1 text-text-muted text-xs hidden md:table-cell">{e.kind3}</td>
          <td className="py-0.5 px-1 text-text-muted text-xs hidden md:table-cell">{e.color}</td>
        </>
      )}
      {actions && <td className="py-0.5 px-1 text-right whitespace-nowrap">{actions(e)}</td>}
    </tr>
  );
}

/* ── Mobile row ── */

function MobileCardRow<T extends CardEntry>({
  entry: e,
  leftActions,
  actions,
  hasCopyColumns,
  showC,
  showD,
  resolveArtwork,
}: {
  entry: T;
  leftActions?: (entry: T) => ReactNode;
  actions?: (entry: T) => ReactNode;
  hasCopyColumns: boolean;
  showC: boolean;
  showD: boolean;
  resolveArtwork: (cardId: number) => string;
}) {
  const c = diffColors(e.diffStatus);
  const hasPills = showC || showD;
  const borderColor = cardTypeBorderColor(e.cardType, e.isMonster);

  return (
    <div
      className={`flex items-center gap-2 py-1 px-2 border-b border-border-subtle/50 ${c.row.trim()} ${e.qty === 0 ? "opacity-40" : ""}`}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <img
        alt=""
        className="w-9 h-8 object-cover rounded-[3px] border border-border-subtle/50 shrink-0"
        loading="lazy"
        src={resolveArtwork(e.id)}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Row 1: Name + stats */}
        <div className="flex items-baseline gap-3">
          <span className={`flex-1 min-w-0 truncate flex text-[15px] ${c.name}`}>
            <CardName cardId={e.id} className={c.name} name={e.name} />
            {!hasCopyColumns && e.qty > 1 && (
              <span className={`${c.qty} text-xs font-mono ml-1`}>{`\u00d7${e.qty}`}</span>
            )}
          </span>
          {e.isMonster && (
            <span className="shrink-0 flex items-baseline gap-1.5">
              <span className={`font-mono font-bold text-base ${c.atk}`}>{e.atk}</span>
              <span className={`font-mono text-xs ${c.def}`}>/ {e.def}</span>
            </span>
          )}
        </div>

        {/* Row 2: Ownership pills + actions */}
        <div className="flex items-center gap-2">
          <div className={`text-xs font-mono ${c.id}`}>#{formatCardId(e.id)}</div>
          {hasPills && (
            <div className="flex items-center gap-1.5">
              {showC && (
                <span className="inline-flex items-center gap-1 text-xs font-mono bg-bg-surface rounded px-2 py-0.5 text-text-secondary">
                  <span className="text-text-muted">C</span>
                  <span
                    className={`font-bold ${(e.collectionCount ?? 0) > 0 ? "text-text-primary" : "text-text-muted"}`}
                  >
                    {e.collectionCount ?? 0}
                  </span>
                </span>
              )}
              {showD && (
                <span className="inline-flex items-center gap-1 text-xs font-mono bg-bg-surface rounded px-2 py-0.5 text-text-secondary">
                  <span className="text-text-muted">D</span>
                  <span
                    className={`font-bold ${(e.deckCount ?? 0) > 0 ? "text-gold" : "text-text-muted"}`}
                  >
                    {e.deckCount ?? 0}
                  </span>
                </span>
              )}
            </div>
          )}
          {(leftActions || actions) && (
            <div className="ml-auto flex items-center gap-2">
              {leftActions?.(e)}
              {actions?.(e)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
