import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { type CardEntry, CardTable, countById } from "../../components/CardTable.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  PanelLoadingState,
} from "../../components/panel-chrome.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useDeckSize } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import { useCollectionEntries } from "./use-collection-entries.ts";

const MAX_COPIES_PER_CARD = 3;

export function CollectionPanel() {
  const { cards: allCards } = useCardDb();
  const data = useCollectionEntries();
  const deck = useDeck();
  const targetSize = useDeckSize();
  const addCard = useMutation(api.collection.addCard);
  const removeCard = useMutation(api.collection.removeCard);
  const addToDeck = useMutation(api.deck.addToDeck);

  if (data === undefined) return <PanelLoadingState />;

  const deckCounts = countById((deck ?? []).map((d) => d.cardId));
  const deckLength = deck?.length ?? 0;
  const deckFull = deckLength >= targetSize;

  const { entries, totalCards } = data;
  const collectionCounts = new Map(entries.map((entry) => [entry.id, entry.qty]));

  const autocompleteCards = allCards.map((card) => {
    const totalOwned = (collectionCounts.get(card.id) ?? 0) + (deckCounts.get(card.id) ?? 0);
    return {
      ...card,
      disabled: totalOwned >= MAX_COPIES_PER_CARD,
    };
  });

  const displayEntries = entries.map((entry) => ({
    ...entry,
    qty: Math.max(0, entry.qty - (deckCounts.get(entry.id) ?? 0)),
  }));

  function renderActions(entry: CardEntry) {
    const inDeck = deckCounts.get(entry.id) ?? 0;
    const totalOwned = entry.qty + inDeck;
    const canAddToDeck = entry.qty > 0 && !deckFull;

    return (
      <span className="inline-flex items-center gap-0.5">
        <CardActionButton
          disabled={totalOwned >= MAX_COPIES_PER_CARD}
          onClick={() => void addCard({ cardId: entry.id })}
          title="Add copy"
          variant="add"
        >
          +
        </CardActionButton>
        <CardActionButton
          disabled={entry.qty <= 0}
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
  }

  return (
    <>
      <PanelHeader stretch title="Collection">
        <CardAutocomplete
          cards={autocompleteCards}
          onSelect={(card) => void addCard({ cardId: card.id })}
          placeholder="Add card..."
        />
      </PanelHeader>
      <LastAddedCardHint />
      {totalCards === 0 ? (
        <PanelEmptyState
          subtitle="Search above to add cards to your collection"
          title="Your collection is empty"
        />
      ) : (
        <PanelBody>
          <CardTable actions={renderActions} entries={displayEntries} />
        </PanelBody>
      )}
    </>
  );
}
