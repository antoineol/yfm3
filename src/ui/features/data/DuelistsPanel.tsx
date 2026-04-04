import { useMemo, useState } from "react";
import type { CardDb } from "../../../engine/data/game-db.ts";
import type { RefDuelistCard } from "../../../engine/reference/build-reference-table.ts";
import type { SortState } from "../../components/sortable-header.tsx";
import { sortEntries, toggleSort } from "../../components/sortable-header.tsx";
import { DuelistCardTable, type RateColumn } from "./DuelistCardTable.tsx";
import {
  DESC_FIRST_KEYS,
  type DuelistSortKey,
  extractDuelists,
  getDeckCards,
  getDropCards,
} from "./duelist-helpers.ts";

// ── Column definitions ──────────────────────────────────────────────

const DROP_COLUMNS: RateColumn[] = [
  { key: "saPow", label: "SA-POW", getValue: (r) => r.saPow },
  { key: "bcd", label: "BCD", getValue: (r) => r.bcd },
  { key: "saTec", label: "SA-TEC", getValue: (r) => r.saTec },
];

const DECK_COLUMNS: RateColumn[] = [{ key: "deck", label: "Rate", getValue: (r) => r.deck }];

// ── Sort helpers ────────────────────────────────────────────────────

function buildSortGetters(
  cardDb: CardDb,
  ownedTotals?: Record<number, number>,
): Record<DuelistSortKey, (r: RefDuelistCard) => number> {
  return {
    id: (r) => r.cardId,
    atk: (r) => cardDb.cardsById.get(r.cardId)?.attack ?? 0,
    def: (r) => cardDb.cardsById.get(r.cardId)?.defense ?? 0,
    deck: (r) => r.deck,
    saPow: (r) => r.saPow,
    bcd: (r) => r.bcd,
    saTec: (r) => r.saTec,
    owned: (r) => ownedTotals?.[r.cardId] ?? 0,
  };
}

function handleSort(
  prev: SortState<DuelistSortKey>,
  key: DuelistSortKey,
): SortState<DuelistSortKey> {
  return toggleSort(prev, key, DESC_FIRST_KEYS.has(key) ? "desc" : "asc");
}

// ── Container component ─────────────────────────────────────────────

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

  const [deckSort, setDeckSort] = useState<SortState<DuelistSortKey>>({ key: "deck", dir: "desc" });
  const [dropSort, setDropSort] = useState<SortState<DuelistSortKey>>({
    key: "saPow",
    dir: "desc",
  });

  const getters = useMemo(() => buildSortGetters(cardDb, ownedTotals), [cardDb, ownedTotals]);
  const sortedDeck = useMemo(
    () => sortEntries(deckCards, deckSort, getters),
    [deckCards, deckSort, getters],
  );
  const sortedDrops = useMemo(
    () => sortEntries(dropCards, dropSort, getters),
    [dropCards, dropSort, getters],
  );

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

      <DuelistCardTable
        cardDb={cardDb}
        count={dropCards.length}
        emptyMessage="No drops for this duelist."
        label="Drops"
        onSort={(k) => setDropSort((prev) => handleSort(prev, k))}
        ownedTotals={ownedTotals}
        rateColumns={DROP_COLUMNS}
        rows={sortedDrops}
        sort={dropSort}
      />
      <DuelistCardTable
        cardDb={cardDb}
        count={deckCards.length}
        emptyMessage="No cards in deck."
        label="Deck"
        onSort={(k) => setDeckSort((prev) => handleSort(prev, k))}
        ownedTotals={ownedTotals}
        rateColumns={DECK_COLUMNS}
        rows={sortedDeck}
        sort={deckSort}
      />
    </div>
  );
}
