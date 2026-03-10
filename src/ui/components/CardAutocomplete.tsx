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

/** Strip accents and lowercase for search normalisation. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Smart card filter:
 * - Accent-insensitive, case-insensitive
 * - Each query token must match the start of a word in the card name
 *   ("dark mag" → "Dark Magician", "bl ey" → "Blue-Eyes White Dragon")
 * - A pure-numeric query also matches the card ID ("123" → card #123)
 * - Substring fallback: if word-start matching fails, tries substring match
 */
let _prevQuery = "";
let _prevTokens: string[] = [];

export function cardFilter(card: CardSpec, query: string): boolean {
  if (!query) return true;

  // Cache tokenisation across calls within the same filter pass
  if (query !== _prevQuery) {
    _prevQuery = query;
    _prevTokens = normalize(query).split(/\s+/).filter(Boolean);
  }
  const tokens = _prevTokens;
  if (tokens.length === 0) return true;

  // Pure-numeric query: also match card ID
  const first = tokens[0];
  if (tokens.length === 1 && first !== undefined && /^\d+$/.test(first)) {
    if (String(card.id) === first) return true;
  }

  // Each token must match the start of at least one word in the card name
  const name = normalize(card.name);
  const words = name.split(/[\s-]+/);
  if (tokens.every((token) => words.some((word) => word.startsWith(token)))) {
    return true;
  }

  // Substring fallback: all tokens must appear somewhere in the name
  return tokens.every((token) => name.includes(token));
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
          className="w-full rounded-lg border border-border-subtle bg-bg-surface py-1.5 pr-3 pl-8 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>

      <Combobox.Portal>
        <Combobox.Positioner align="start" sideOffset={4}>
          <Combobox.Popup className="z-50 w-(--anchor-width) overflow-hidden rounded-lg border border-border-accent bg-bg-panel shadow-dropdown origin-(--transform-origin) transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
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
