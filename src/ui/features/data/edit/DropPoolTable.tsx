import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { maxCopiesFor } from "../../../../engine/data/game-db.ts";
import { Input } from "../../../components/Input.tsx";
import {
  SortableHeader,
  type SortState,
  sortEntries,
  toggleSort,
} from "../../../components/sortable-header.tsx";
import { useOwnedCardTotals } from "../../../db/use-owned-card-totals.ts";
import { useFusionTable } from "../../../lib/fusion-table-context.tsx";
import {
  draftWeightsAtom,
  type EditView,
  modifiedCardIdsAtom,
  POOL_TYPE_LABELS,
  POOLS_BY_VIEW,
  type PoolType,
  pinnedCardIdsAtom,
  setRangePinnedAtom,
  togglePinAtom,
} from "./atoms.ts";
import { BulkEditRow } from "./BulkEditRow.tsx";
import { DropPoolRow } from "./DropPoolRow.tsx";

type SortKey = "id" | "atk" | "def" | `weight:${PoolType}`;

const STATIC_SORT_DIRS: Record<"id" | "atk" | "def", "asc" | "desc"> = {
  id: "asc",
  atk: "desc",
  def: "desc",
};

type Entry = {
  cardId: number;
  card: CardSpec | undefined;
  atk: number;
  def: number;
  weights: Partial<Record<PoolType, number>>;
  pinned: boolean;
  modified: boolean;
  needMore: boolean;
};

function buildSortGetters(pools: readonly PoolType[]): Record<SortKey, (e: Entry) => number> {
  const out: Record<string, (e: Entry) => number> = {
    id: (e) => e.cardId,
    atk: (e) => e.atk,
    def: (e) => e.def,
  };
  for (const p of pools) {
    out[`weight:${p}`] = (e) => e.weights[p] ?? 0;
  }
  return out as Record<SortKey, (e: Entry) => number>;
}

export function DropPoolTable({ view }: { view: EditView }) {
  const { cardDb } = useFusionTable();
  const draft = useAtomValue(draftWeightsAtom);
  const pinned = useAtomValue(pinnedCardIdsAtom);
  const modified = useAtomValue(modifiedCardIdsAtom);
  const ownedTotals = useOwnedCardTotals();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const pools = POOLS_BY_VIEW[view];
  const firstPool = pools[0] ?? "saPow";
  const [sort, setSort] = useState<SortState<SortKey>>({
    key: `weight:${firstPool}`,
    dir: "desc",
  });
  const togglePin = useSetAtom(togglePinAtom);
  const setRangePinned = useSetAtom(setRangePinnedAtom);
  // Anchor for shift-click range selection, held in a ref so it doesn't
  // invalidate memo'd rows. Updated after every pin toggle.
  const anchorCardIdRef = useRef<number | null>(null);

  // Re-seed the sort key when the view switches, so we don't carry a
  // weight:saPow sort into the deck view (which has no saPow column).
  useEffect(() => {
    setSort({ key: `weight:${firstPool}`, dir: "desc" });
  }, [firstPool]);

  const entries = useMemo<Entry[]>(() => {
    if (!draft) return [];
    const needle = search.trim().toLowerCase();
    const cardCount = draft[firstPool]?.length ?? 0;
    const out: Entry[] = [];
    for (let i = 0; i < cardCount; i++) {
      const cardId = i + 1;
      const isPinned = pinned.has(cardId);
      const isModified = modified.has(cardId);
      const weights: Partial<Record<PoolType, number>> = {};
      let anyNonzero = false;
      for (const p of pools) {
        const w = draft[p]?.[i] ?? 0;
        weights[p] = w;
        if (w !== 0) anyNonzero = true;
      }
      // Search bypasses the zero-hiding filter: when the user is looking up a
      // specific card by name, surface it regardless of weight.
      if (needle === "" && !showAll && !anyNonzero && !isPinned && !isModified) continue;
      const card = cardDb.cardsById.get(cardId);
      if (needle !== "") {
        const hay = `${cardId} ${card?.name ?? ""} ${card?.cardType ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) continue;
      }
      out.push({
        cardId,
        card,
        atk: card?.attack ?? 0,
        def: card?.defense ?? 0,
        weights,
        pinned: isPinned,
        modified: isModified,
        needMore: (ownedTotals?.[cardId] ?? 0) < maxCopiesFor(cardDb, cardId),
      });
    }
    return out;
  }, [draft, cardDb, search, showAll, pinned, modified, pools, firstPool, ownedTotals]);

  const sortGetters = useMemo(() => buildSortGetters(pools), [pools]);
  const sorted = useMemo(
    () => sortEntries(entries, sort, sortGetters),
    [entries, sort, sortGetters],
  );

  function handleSort(key: SortKey) {
    const firstDir: "asc" | "desc" = key.startsWith("weight:")
      ? "desc"
      : STATIC_SORT_DIRS[key as "id" | "atk" | "def"];
    setSort((prev) => toggleSort(prev, key, firstDir));
  }

  const pinnedVisibleCardIds = useMemo(
    () => sorted.filter((e) => e.pinned).map((e) => e.cardId),
    [sorted],
  );

  const masterPinState: "none" | "some" | "all" = useMemo(() => {
    if (sorted.length === 0) return "none";
    const n = pinnedVisibleCardIds.length;
    if (n === 0) return "none";
    if (n === sorted.length) return "all";
    return "some";
  }, [sorted, pinnedVisibleCardIds]);

  const { targetCardIds, scopeLabel } = useMemo(() => {
    if (pinnedVisibleCardIds.length > 0) {
      return {
        scopeLabel: `Apply to ${pinnedVisibleCardIds.length} pinned`,
        targetCardIds: pinnedVisibleCardIds,
      };
    }
    const visible = sorted.map((e) => e.cardId);
    return {
      scopeLabel: visible.length === 0 ? "No rows" : `Apply to all ${visible.length} visible`,
      targetCardIds: visible,
    };
  }, [sorted, pinnedVisibleCardIds]);

  const handleMasterTogglePin = useCallback(() => {
    if (sorted.length === 0) return;
    // Gmail semantics: all-pinned → unpin; otherwise (none/some) → pin all.
    const desired = masterPinState !== "all";
    const cardIds = sorted.map((e) => e.cardId);
    setRangePinned({ cardIds, pinned: desired });
    anchorCardIdRef.current = null;
  }, [sorted, masterPinState, setRangePinned]);

  const handleTogglePin = useCallback(
    (cardId: number, desired: boolean, shiftKey: boolean) => {
      const anchor = anchorCardIdRef.current;
      if (shiftKey && anchor !== null && anchor !== cardId) {
        const anchorIdx = sorted.findIndex((e) => e.cardId === anchor);
        const targetIdx = sorted.findIndex((e) => e.cardId === cardId);
        if (anchorIdx >= 0 && targetIdx >= 0) {
          const [lo, hi] = anchorIdx < targetIdx ? [anchorIdx, targetIdx] : [targetIdx, anchorIdx];
          const cardIds = sorted.slice(lo, hi + 1).map((e) => e.cardId);
          setRangePinned({ cardIds, pinned: desired });
          anchorCardIdRef.current = cardId;
          return;
        }
      }
      togglePin(cardId);
      anchorCardIdRef.current = cardId;
    },
    [sorted, togglePin, setRangePinned],
  );

  if (!draft) return null;
  const headerColSpan = 5 + pools.length * 2; // pin + id + card + atk + def + (weight + %)×N

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3 py-1 flex-wrap">
        <Input
          className="max-w-xs py-1! text-sm!"
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search card by name or ID…"
          value={search}
        />
        <label
          className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer select-none"
          title="Include cards with zero weight in every visible pool. Off by default — search bypasses this filter automatically."
        >
          <input
            checked={showAll}
            className="accent-gold size-3.5"
            onChange={(e) => setShowAll(e.currentTarget.checked)}
            type="checkbox"
          />
          All cards
        </label>
      </div>
      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-panel border-b border-border-accent z-10">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="w-8 py-1.5 px-0.5 font-normal text-center">
                <MasterPinCheckbox onToggle={handleMasterTogglePin} state={masterPinState} />
              </th>
              <SortableHeader
                dir={sort?.key === "id" ? sort.dir : undefined}
                label="#"
                onClick={() => handleSort("id")}
                px="px-1"
              />
              <th className="text-left py-1.5 px-1 font-normal">Card</th>
              <SortableHeader
                align="text-right"
                dir={sort?.key === "atk" ? sort.dir : undefined}
                label="ATK"
                onClick={() => handleSort("atk")}
                px="px-1"
              />
              <SortableHeader
                align="text-right"
                dir={sort?.key === "def" ? sort.dir : undefined}
                label="DFD"
                onClick={() => handleSort("def")}
                px="px-1"
              />
              {pools.map((p) => (
                <WeightHeaderPair
                  key={p}
                  onSort={() => handleSort(`weight:${p}`)}
                  poolType={p}
                  sortDir={sort?.key === `weight:${p}` ? sort.dir : undefined}
                />
              ))}
            </tr>
            <BulkEditRow pools={pools} scopeLabel={scopeLabel} targetCardIds={targetCardIds} />
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-text-muted italic" colSpan={headerColSpan}>
                  No cards match.
                </td>
              </tr>
            ) : (
              sorted.map((e) => (
                <DropPoolRow
                  card={e.card}
                  cardId={e.cardId}
                  key={e.cardId}
                  modified={e.modified}
                  needMore={e.needMore}
                  onTogglePin={handleTogglePin}
                  pinned={e.pinned}
                  pools={pools}
                  weights={e.weights}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeightHeaderPair({
  poolType,
  sortDir,
  onSort,
}: {
  poolType: PoolType;
  sortDir: "asc" | "desc" | undefined;
  onSort: () => void;
}) {
  return (
    <>
      <SortableHeader
        align="text-right"
        dir={sortDir}
        label={POOL_TYPE_LABELS[poolType]}
        onClick={onSort}
        px="px-1"
      />
      <th
        className="text-right py-1.5 px-1 font-normal w-10"
        title="Weight as a percentage of 2048"
      >
        %
      </th>
    </>
  );
}

/** Tri-state master checkbox for the Pin column header. `indeterminate` is a
 *  DOM property, not a React attribute, so it has to be set imperatively via
 *  ref after render. */
function MasterPinCheckbox({
  state,
  onToggle,
}: {
  state: "none" | "some" | "all";
  onToggle: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "some";
  }, [state]);
  return (
    <input
      aria-label={state === "all" ? "Unpin all visible cards" : "Pin all visible cards"}
      checked={state === "all"}
      className="accent-gold size-4 cursor-pointer align-middle"
      onChange={onToggle}
      ref={ref}
      title="Pin / unpin all visible cards (uncheck to clear pins)"
      type="checkbox"
    />
  );
}
