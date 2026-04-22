import { useAtomValue } from "jotai";
import { useState } from "react";
import { CARD_QUANTITY_COUNT } from "../../../engine/savefile/save.ts";
import type { BridgeCard } from "../../../engine/worker/messages.ts";
import { Input } from "../../components/Input.tsx";
import { useBridge } from "../../lib/bridge-context.tsx";
import { mergeOwnedCounts, modifiedIndicesAtom, quantitiesAtom } from "./atoms.ts";
import { LedgerRow } from "./LedgerRow.tsx";

type OwnedFilter = "all" | "owned" | "missing";

export function Ledger() {
  const bridge = useBridge();
  const quantities = useAtomValue(quantitiesAtom);
  const modifiedIndices = useAtomValue(modifiedIndicesAtom);
  const [search, setSearch] = useState("");
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>("owned");

  const cards = bridge.gameData?.cards ?? [];
  const cardsById = indexCards(cards);
  // Owned = trunk copies + deck copies (matches the rest of the app).
  const owned = mergeOwnedCounts(quantities, bridge.deckDefinition);

  const visible: number[] = [];
  const needle = search.trim().toLowerCase();
  for (let i = 0; i < CARD_QUANTITY_COUNT; i++) {
    const totalOwned = owned[i + 1] ?? 0;
    if (ownedFilter === "owned" && totalOwned === 0) continue;
    if (ownedFilter === "missing" && totalOwned > 0) continue;
    if (needle !== "") {
      const card = cardsById.get(i + 1);
      const hay = `${i} ${card?.id ?? ""} ${card?.name ?? ""} ${card?.type ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) continue;
    }
    visible.push(i);
  }

  // Show the counter only when search narrows the list — the owned/missing
  // filter counts are already conveyed by the `Unique` stat in the header,
  // so repeating them here is noise.
  const showCounter = needle !== "";

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3 py-2">
        <Input
          className="max-w-sm"
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search by name, ID, or index…"
          value={search}
        />
        <FilterSeg onChange={setOwnedFilter} value={ownedFilter} />
        {showCounter && (
          <span className="ml-auto font-display text-[11px] uppercase tracking-widest text-text-muted tabular-nums">
            {visible.length} / {CARD_QUANTITY_COUNT}
          </span>
        )}
      </div>
      <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3 items-center px-3 py-2 border-b border-border-accent font-display text-[10px] uppercase tracking-widest text-text-muted sticky top-0 bg-bg-panel z-10">
        <span>#</span>
        <span>Card</span>
        <span
          className="justify-self-end pr-1"
          title="Copies currently in the chest (trunk). Cards in the deck are not directly editable here — remove them in-game first."
        >
          In chest
        </span>
      </div>
      <div className="overflow-y-auto">
        {visible.length === 0 ? (
          <div className="p-8 text-center text-text-muted italic">No cards match.</div>
        ) : (
          visible.map((index) => (
            <LedgerRow
              card={cardsById.get(index + 1)}
              index={index}
              key={index}
              modified={modifiedIndices.has(index)}
              quantity={quantities[index] ?? 0}
              totalOwned={owned[index + 1] ?? 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function indexCards(cards: readonly BridgeCard[]): Map<number, BridgeCard> {
  const out = new Map<number, BridgeCard>();
  for (const c of cards) out.set(c.id, c);
  return out;
}

function FilterSeg({
  value,
  onChange,
}: {
  value: OwnedFilter;
  onChange: (v: OwnedFilter) => void;
}) {
  const options: OwnedFilter[] = ["all", "owned", "missing"];
  return (
    <div className="inline-flex rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      {options.map((opt) => (
        <button
          className={`px-3 py-1.5 font-display text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
            value === opt
              ? "bg-bg-hover text-gold-bright"
              : "text-text-secondary hover:text-text-primary"
          }`}
          key={opt}
          onClick={() => onChange(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
