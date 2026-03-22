import { useCallback, useMemo, useState } from "react";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import { MAX_COPIES } from "../../../engine/types/constants.ts";
import { CardName } from "../../components/CardName.tsx";
import { SectionLabel } from "../../components/panel-chrome.tsx";
import type { SortDir } from "../../components/sortable-header.tsx";
import { SortableHeader } from "../../components/sortable-header.tsx";
import { formatCardId, formatRate } from "../../lib/format.ts";

// ---------------------------------------------------------------------------
// Duelist list helpers
// ---------------------------------------------------------------------------

interface Duelist {
  id: number;
  name: string;
}

function extractDuelists(rows: RefDuelistCard[]): Duelist[] {
  const seen = new Map<number, string>();
  for (const r of rows) {
    if (!seen.has(r.duelistId)) seen.set(r.duelistId, r.duelistName);
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

function getDeckCards(rows: RefDuelistCard[], duelistId: number) {
  return rows.filter((r) => r.duelistId === duelistId && r.deck > 0);
}

function getDropCards(rows: RefDuelistCard[], duelistId: number) {
  return rows.filter((r) => r.duelistId === duelistId && (r.saPow > 0 || r.bcd > 0 || r.saTec > 0));
}

// ---------------------------------------------------------------------------
// Generic sort helper (reuses SortableHeader visuals)
// ---------------------------------------------------------------------------

type DuelistSortKey = "id" | "atk" | "def" | "deck" | "saPow" | "bcd" | "saTec" | "owned";
type DuelistSortState = { key: DuelistSortKey; dir: SortDir } | null;

/** Keys where "higher is more interesting" → default desc first. */
const DESC_FIRST: Set<DuelistSortKey> = new Set([
  "atk",
  "def",
  "deck",
  "saPow",
  "bcd",
  "saTec",
  "owned",
]);

function toggleDuelistSort(prev: DuelistSortState, key: DuelistSortKey): DuelistSortState {
  const firstDir: SortDir = DESC_FIRST.has(key) ? "desc" : "asc";
  const secondDir: SortDir = firstDir === "asc" ? "desc" : "asc";
  if (prev?.key !== key) return { key, dir: firstDir };
  if (prev.dir === firstDir) return { key, dir: secondDir };
  return null;
}

function sortRows(
  rows: RefDuelistCard[],
  sort: DuelistSortState,
  cardDb: CardDb,
  ownedTotals?: Record<number, number>,
): RefDuelistCard[] {
  if (!sort) return rows;
  const dir = sort.dir === "asc" ? 1 : -1;
  const getters: Record<DuelistSortKey, (r: RefDuelistCard) => number> = {
    id: (r) => r.cardId,
    atk: (r) => cardDb.cardsById.get(r.cardId)?.attack ?? 0,
    def: (r) => cardDb.cardsById.get(r.cardId)?.defense ?? 0,
    deck: (r) => r.deck,
    saPow: (r) => r.saPow,
    bcd: (r) => r.bcd,
    saTec: (r) => r.saTec,
    owned: (r) => ownedTotals?.[r.cardId] ?? 0,
  };
  const getter = getters[sort.key];
  return [...rows].sort((a, b) => dir * (getter(a) - getter(b)));
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DuelistsPanel({
  duelists,
  cardDb,
  selectedDuelistId,
  onDuelistChange,
  ownedTotals,
}: {
  duelists: RefDuelistCard[];
  cardDb: CardDb;
  selectedDuelistId?: number;
  onDuelistChange: (id: number) => void;
  ownedTotals?: Record<number, number>;
}) {
  const duelistList = useMemo(() => extractDuelists(duelists), [duelists]);
  const selectedId = selectedDuelistId ?? duelistList[0]?.id ?? 1;

  const selectedDuelist = duelistList.find((d) => d.id === selectedId);
  const deckCards = useMemo(() => getDeckCards(duelists, selectedId), [duelists, selectedId]);
  const dropCards = useMemo(() => getDropCards(duelists, selectedId), [duelists, selectedId]);

  // Sorting state per table
  const [deckSort, setDeckSort] = useState<DuelistSortState>({ key: "deck", dir: "desc" });
  const [dropSort, setDropSort] = useState<DuelistSortState>({ key: "saPow", dir: "desc" });

  const sortedDeck = useMemo(
    () => sortRows(deckCards, deckSort, cardDb, ownedTotals),
    [deckCards, deckSort, cardDb, ownedTotals],
  );
  const sortedDrops = useMemo(
    () => sortRows(dropCards, dropSort, cardDb, ownedTotals),
    [dropCards, dropSort, cardDb, ownedTotals],
  );

  const handleDeckSort = useCallback(
    (key: DuelistSortKey) => setDeckSort((prev) => toggleDuelistSort(prev, key)),
    [],
  );
  const handleDropSort = useCallback(
    (key: DuelistSortKey) => setDropSort((prev) => toggleDuelistSort(prev, key)),
    [],
  );

  const showOwned = ownedTotals !== undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* Duelist Selector */}
      <div className="flex items-center gap-4">
        <label
          className="font-display text-xs font-semibold uppercase tracking-widest text-gold-dim"
          htmlFor="duelist-select"
        >
          Duelist
        </label>
        <div className="relative">
          <select
            className="appearance-none bg-bg-surface border border-border-subtle rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary
              focus:outline-none focus:border-gold-dim focus:shadow-glow-gold-xs transition-all duration-200
              hover:border-border-accent cursor-pointer"
            id="duelist-select"
            onChange={(e) => onDuelistChange(Number(e.target.value))}
            value={selectedId}
          >
            {duelistList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">
            ▾
          </div>
        </div>
        {selectedDuelist && (
          <span className="text-xs text-text-muted ml-auto">#{selectedDuelist.id}</span>
        )}
      </div>

      {/* Drops Section */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel>Drops</SectionLabel>
          <span className="text-xs text-text-muted font-mono">{dropCards.length} cards</span>
        </div>
        {dropCards.length > 0 ? (
          <DuelistTable>
            <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
              <tr className="text-text-secondary text-xs uppercase tracking-wide">
                <SortableHeader
                  dir={dropSort?.key === "id" ? dropSort.dir : undefined}
                  label="#"
                  onClick={() => handleDropSort("id")}
                />
                <th className="text-left py-2 px-1 font-normal">Card</th>
                {showOwned && (
                  <SortableHeader
                    align="text-right"
                    dir={dropSort?.key === "owned" ? dropSort.dir : undefined}
                    label="Own"
                    onClick={() => handleDropSort("owned")}
                    px="px-2"
                  />
                )}
                <SortableHeader
                  dir={dropSort?.key === "atk" ? dropSort.dir : undefined}
                  label="ATK"
                  onClick={() => handleDropSort("atk")}
                  px="px-2"
                />
                <SortableHeader
                  dir={dropSort?.key === "def" ? dropSort.dir : undefined}
                  label="DFD"
                  onClick={() => handleDropSort("def")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  dir={dropSort?.key === "saPow" ? dropSort.dir : undefined}
                  label="SA-POW"
                  onClick={() => handleDropSort("saPow")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  dir={dropSort?.key === "bcd" ? dropSort.dir : undefined}
                  label="BCD"
                  onClick={() => handleDropSort("bcd")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  dir={dropSort?.key === "saTec" ? dropSort.dir : undefined}
                  label="SA-TEC"
                  onClick={() => handleDropSort("saTec")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedDrops.map((row) => {
                const card = cardDb.cardsById.get(row.cardId);
                const isMonster = card?.isMonster ?? true;
                const needMore = showOwned && (ownedTotals[row.cardId] ?? 0) < MAX_COPIES;
                return (
                  <DuelistRow className={needMore ? "owned-need-row" : undefined} key={row.cardId}>
                    <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                      {formatCardId(row.cardId)}
                    </td>
                    <td className="py-1.5 px-1 text-text-primary">
                      <CardName
                        cardId={row.cardId}
                        className={needMore ? "text-text-need" : undefined}
                        name={card?.name ?? `#${row.cardId}`}
                      />
                    </td>
                    {showOwned && (
                      <td
                        className={`py-1.5 px-2 text-right font-mono text-xs ${needMore ? "font-bold text-text-need owned-need" : "text-text-muted"}`}
                      >
                        {ownedTotals[row.cardId] ?? 0}
                      </td>
                    )}
                    <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">
                      {isMonster ? (card?.attack ?? 0) : ""}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-xs text-stat-def">
                      {isMonster ? (card?.defense ?? 0) : ""}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.saPow)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.bcd)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.saTec)}
                    </td>
                  </DuelistRow>
                );
              })}
            </tbody>
          </DuelistTable>
        ) : (
          <EmptySection message="No drops for this duelist." />
        )}
      </section>

      {/* Deck Section */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <SectionLabel>Deck</SectionLabel>
          <span className="text-xs text-text-muted font-mono">{deckCards.length} cards</span>
        </div>
        {deckCards.length > 0 ? (
          <DuelistTable>
            <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle z-10">
              <tr className="text-text-secondary text-xs uppercase tracking-wide">
                <SortableHeader
                  dir={deckSort?.key === "id" ? deckSort.dir : undefined}
                  label="#"
                  onClick={() => handleDeckSort("id")}
                />
                <th className="text-left py-2 px-1 font-normal">Card</th>
                {showOwned && (
                  <SortableHeader
                    align="text-right"
                    dir={deckSort?.key === "owned" ? deckSort.dir : undefined}
                    label="Own"
                    onClick={() => handleDeckSort("owned")}
                    px="px-2"
                  />
                )}
                <SortableHeader
                  dir={deckSort?.key === "atk" ? deckSort.dir : undefined}
                  label="ATK"
                  onClick={() => handleDeckSort("atk")}
                  px="px-2"
                />
                <SortableHeader
                  dir={deckSort?.key === "def" ? deckSort.dir : undefined}
                  label="DFD"
                  onClick={() => handleDeckSort("def")}
                  px="px-2"
                />
                <SortableHeader
                  align="text-right"
                  dir={deckSort?.key === "deck" ? deckSort.dir : undefined}
                  label="Rate"
                  onClick={() => handleDeckSort("deck")}
                  px="px-2"
                />
              </tr>
            </thead>
            <tbody>
              {sortedDeck.map((row) => {
                const card = cardDb.cardsById.get(row.cardId);
                const isMonster = card?.isMonster ?? true;
                const needMore = showOwned && (ownedTotals[row.cardId] ?? 0) < MAX_COPIES;
                return (
                  <DuelistRow className={needMore ? "owned-need-row" : undefined} key={row.cardId}>
                    <td className="py-1.5 px-1 font-mono text-xs text-text-muted">
                      {formatCardId(row.cardId)}
                    </td>
                    <td className="py-1.5 px-1 text-text-primary">
                      <CardName
                        cardId={row.cardId}
                        className={needMore ? "text-text-need" : undefined}
                        name={card?.name ?? `#${row.cardId}`}
                      />
                    </td>
                    {showOwned && (
                      <td
                        className={`py-1.5 px-2 text-right font-mono text-xs ${needMore ? "font-bold text-text-need owned-need" : "text-text-muted"}`}
                      >
                        {ownedTotals[row.cardId] ?? 0}
                      </td>
                    )}
                    <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">
                      {isMonster ? (card?.attack ?? 0) : ""}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-xs text-stat-def">
                      {isMonster ? (card?.defense ?? 0) : ""}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-xs text-gold">
                      {formatRate(row.deck)}
                    </td>
                  </DuelistRow>
                );
              })}
            </tbody>
          </DuelistTable>
        ) : (
          <EmptySection message="No cards in deck." />
        )}
      </section>
    </div>
  );
}

function DuelistTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function DuelistRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr
      className={`border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30 ${className ?? ""}`}
    >
      {children}
    </tr>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="py-6 text-center text-text-muted text-sm border border-border-subtle rounded-lg bg-bg-surface/20">
      {message}
    </div>
  );
}
