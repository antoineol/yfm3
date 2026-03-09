import { Combobox } from "@base-ui/react/combobox";
import { useCallback, useMemo } from "react";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { useCardDb } from "../lib/card-db-context.tsx";

export type CardAutocompleteProps = {
  /** Cards available for selection. If omitted, uses all cards from CardDb. */
  cards?: CardSpec[];
  /** Called when user selects a card */
  onSelect: (card: CardSpec) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
};

function cardFilter(card: CardSpec, query: string): boolean {
  if (!query) return true;
  return card.name.toLowerCase().includes(query.toLowerCase());
}

export function CardAutocomplete({
  cards,
  onSelect,
  placeholder = "Search cards...",
  disabled = false,
}: CardAutocompleteProps) {
  const { cards: allCards } = useCardDb();
  const sourceCards = useMemo(() => cards ?? allCards, [cards, allCards]);

  const handleValueChange = useCallback(
    (card: CardSpec | null) => {
      if (card) onSelect(card);
    },
    [onSelect],
  );

  return (
    <Combobox.Root<CardSpec>
      filter={cardFilter}
      items={sourceCards}
      itemToStringLabel={(card) => card.name}
      limit={50}
      onValueChange={handleValueChange}
      value={null}
    >
      <div className="relative">
        <SearchIcon />
        <Combobox.Input
          className="w-full rounded-lg border border-border-subtle bg-bg-surface py-1.5 pr-3 pl-8 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-gold-dim focus:ring-1 focus:ring-gold-dim/40 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>

      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={4}>
          <Combobox.Popup className="z-50 w-(--anchor-width) overflow-hidden rounded-lg border border-border-accent bg-bg-panel shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_1px_rgba(201,168,76,0.1)] origin-(--transform-origin) transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <Combobox.List className="peer overflow-y-auto max-h-64 p-1 scroll-py-1">
              {(card: CardSpec) => <CardOption card={card} key={card.id} />}
            </Combobox.List>
            <p className="hidden peer-data-empty:block px-3 py-4 text-center text-xs text-text-muted">
              No cards found
            </p>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CardOption({ card }: { card: CardSpec }) {
  return (
    <Combobox.Item
      className="group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm select-none cursor-default data-highlighted:bg-bg-hover transition-colors duration-75"
      value={card}
    >
      <span className="shrink-0 w-7 font-mono text-xs tabular-nums text-text-muted">
        {String(card.id).padStart(3, "0")}
      </span>
      <span className="flex-1 truncate text-text-primary group-data-highlighted:text-gold-bright transition-colors duration-75">
        {card.name}
      </span>
      <span className="shrink-0 w-10 text-right font-mono text-xs tabular-nums text-stat-atk/70 group-data-highlighted:text-stat-atk transition-colors duration-75">
        {card.attack}
      </span>
      <span className="shrink-0 w-10 text-right font-mono text-xs tabular-nums text-stat-def/70 group-data-highlighted:text-stat-def transition-colors duration-75">
        {card.defense}
      </span>
    </Combobox.Item>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-muted"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
