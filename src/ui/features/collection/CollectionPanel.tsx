import { useMutation } from "convex/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { CardTable, type SortKey, type SortState } from "../../components/CardTable.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  PanelLoadingState,
} from "../../components/panel-chrome.tsx";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import {
  type CollectionCardViewModel,
  useCollectionViewModel,
} from "./use-collection-view-model.ts";

const MAX_COPIES_PER_CARD = 3;

export function CollectionPanel() {
  const { cards: allCards } = useCardDb();
  const data = useCollectionViewModel();
  const targetSize = useDeckSize();
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const addToDeck = useMutation(api.deck.addToDeck);
  const entriesByCardId = data?.entriesByCardId;
  const deckFull = data !== undefined && data.deckLength >= targetSize;
  const inputRef = useRef<HTMLInputElement>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: "id", dir: "asc" });

  const handleSortChange = useCallback((key: SortKey) => {
    setSort((prev) => {
      const firstDir = key === "atk" ? "desc" : "asc";
      const secondDir = firstDir === "asc" ? "desc" : "asc";
      if (prev?.key !== key) return { key, dir: firstDir };
      if (prev.dir === firstDir) return { key, dir: secondDir };
      return null;
    });
  }, []);

  const sortedEntries = useMemo(() => {
    if (!data) return [];
    if (!sort) return data.entries;
    const sorted = [...data.entries];
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "id") sorted.sort((a, b) => dir * (a.id - b.id));
    else sorted.sort((a, b) => dir * (a.atk - b.atk));
    return sorted;
  }, [data, sort]);

  const autocompleteCards = useMemo(
    () =>
      allCards.map((card) => ({
        ...card,
        disabled: (entriesByCardId?.get(card.id)?.totalOwned ?? 0) >= MAX_COPIES_PER_CARD,
      })),
    [allCards, entriesByCardId],
  );

  const renderActions = useCallback(
    (entry: CollectionCardViewModel) => {
      const canAddToDeck = entry.availableInCollection > 0 && !deckFull;

      return (
        <span className="inline-flex items-center gap-0.5">
          <CardActionButton
            disabled={entry.totalOwned >= MAX_COPIES_PER_CARD}
            onClick={() => void addCard({ cardId: entry.id })}
            title="Add copy"
            variant="add"
          >
            +
          </CardActionButton>
          <CardActionButton
            disabled={entry.availableInCollection <= 0}
            onClick={() => void removeCard({ cardId: entry.id })}
            title="Remove copy"
            variant="remove"
          >
            −
          </CardActionButton>
          <CardActionButton
            disabled={!canAddToDeck}
            onClick={() => void addToDeck({ cardId: entry.id })}
            title="Add to deck"
            variant="to-deck"
          >
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5 inline-block"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M6 3l5 5-5 5V3z" />
            </svg>
          </CardActionButton>
        </span>
      );
    },
    [addCard, addToDeck, deckFull, removeCard],
  );

  if (data === undefined) return <PanelLoadingState />;

  return (
    <>
      <PanelHeader stretch title="Collection">
        <CardAutocomplete
          cards={autocompleteCards}
          inputRef={inputRef}
          onOpenChange={setComboboxOpen}
          onSelect={(card) => void addCard({ cardId: card.id })}
          placeholder="Add card..."
        />
      </PanelHeader>
      <LastAddedCardHint comboboxOpen={comboboxOpen} inputRef={inputRef} />
      {data.totalOwnedCards === 0 ? (
        <PanelEmptyState
          subtitle="Search above to add cards to your collection"
          title="Your collection is empty"
        />
      ) : (
        <PanelBody>
          <CardTable
            actions={renderActions}
            entries={sortedEntries}
            onSortChange={handleSortChange}
            sort={sort}
          />
        </PanelBody>
      )}
    </>
  );
}
