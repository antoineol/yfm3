import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardSpec } from "../../../../engine/data/card-model.ts";
import { Input } from "../../../components/Input.tsx";
import {
  SortableHeader,
  type SortState,
  sortEntries,
  toggleSort,
} from "../../../components/sortable-header.tsx";
import { useFusionTable } from "../../../lib/fusion-table-context.tsx";
import {
  draftWeightsAtom,
  modifiedCardIdsAtom,
  pinnedCardIdsAtom,
  setRangePinnedAtom,
  togglePinAtom,
} from "./atoms.ts";
import { DropPoolRow } from "./DropPoolRow.tsx";

type SortKey = "id" | "atk" | "def" | "weight";

const SORT_FIRST_DIRS: Record<SortKey, "asc" | "desc"> = {
  id: "asc",
  atk: "desc",
  def: "desc",
  weight: "desc",
};

type Entry = {
  cardId: number;
  card: CardSpec | undefined;
  atk: number;
  def: number;
  weight: number;
  pinned: boolean;
  modified: boolean;
};

const SORT_GETTERS: Record<SortKey, (e: Entry) => number> = {
  id: (e) => e.cardId,
  atk: (e) => e.atk,
  def: (e) => e.def,
  weight: (e) => e.weight,
};

export function DropPoolTable() {
  const { cardDb } = useFusionTable();
  const draft = useAtomValue(draftWeightsAtom);
  const pinned = useAtomValue(pinnedCardIdsAtom);
  const modified = useAtomValue(modifiedCardIdsAtom);
  const [search, setSearch] = useState("");
  const [nonzeroOnly, setNonzeroOnly] = useState(true);
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "weight", dir: "desc" });
  const togglePin = useSetAtom(togglePinAtom);
  const setRangePinned = useSetAtom(setRangePinnedAtom);
  // Anchor for shift-click range selection, held in a ref so it doesn't
  // invalidate memo'd rows. Updated after every pin toggle.
  const anchorCardIdRef = useRef<number | null>(null);

  const entries = useMemo<Entry[]>(() => {
    if (!draft) return [];
    const needle = search.trim().toLowerCase();
    const out: Entry[] = [];
    for (let i = 0; i < draft.length; i++) {
      const cardId = i + 1;
      const weight = draft[i] ?? 0;
      const isPinned = pinned.has(cardId);
      const isModified = modified.has(cardId);
      if (nonzeroOnly && weight === 0 && !isPinned && !isModified) continue;
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
        weight,
        pinned: isPinned,
        modified: isModified,
      });
    }
    return out;
  }, [draft, cardDb, search, nonzeroOnly, pinned, modified]);

  const sorted = useMemo(() => sortEntries(entries, sort, SORT_GETTERS), [entries, sort]);

  function handleSort(key: SortKey) {
    setSort((prev) => toggleSort(prev, key, SORT_FIRST_DIRS[key]));
  }

  const masterPinState: "none" | "some" | "all" = useMemo(() => {
    if (sorted.length === 0) return "none";
    let pinnedVisible = 0;
    for (const e of sorted) if (e.pinned) pinnedVisible++;
    if (pinnedVisible === 0) return "none";
    if (pinnedVisible === sorted.length) return "all";
    return "some";
  }, [sorted]);

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
  const totalCount = draft.length;

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3 py-1 flex-wrap">
        <Input
          className="max-w-xs py-1! text-sm!"
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search card by name or ID…"
          value={search}
        />
        <label className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer select-none">
          <input
            checked={nonzeroOnly}
            className="accent-gold size-3.5"
            onChange={(e) => setNonzeroOnly(e.currentTarget.checked)}
            type="checkbox"
          />
          Nonzero only
        </label>
        <span className="ml-auto font-mono text-[11px] text-text-secondary tabular-nums">
          {entries.length} / {totalCount}
        </span>
      </div>
      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-panel border-b border-border-accent z-10">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="w-8 py-1.5 px-1 font-normal text-center">
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
                px="px-2"
              />
              <SortableHeader
                align="text-right"
                dir={sort?.key === "def" ? sort.dir : undefined}
                label="DFD"
                onClick={() => handleSort("def")}
                px="px-2"
              />
              <SortableHeader
                align="text-right"
                dir={sort?.key === "weight" ? sort.dir : undefined}
                label="Weight"
                onClick={() => handleSort("weight")}
                px="px-2"
              />
              <th className="text-right py-1.5 px-2 font-normal w-14">%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-text-muted italic" colSpan={7}>
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
                  onTogglePin={handleTogglePin}
                  pinned={e.pinned}
                  weight={e.weight}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
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
      title="Pin / unpin all visible cards"
      type="checkbox"
    />
  );
}
