import { useCallback, useMemo, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { maxCopiesFor } from "../../../engine/data/game-db.ts";
import { Button } from "../../components/Button.tsx";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { CardTable } from "../../components/CardTable.tsx";
import {
  PanelBody,
  PanelEmptyState,
  PanelHeader,
  PanelLoadingState,
} from "../../components/panel-chrome.tsx";
import { useAuthMutation } from "../../core/convex-hooks.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridgeAutoSync, useDeckSize } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { LastAddedCardHint } from "./LastAddedCardHint.tsx";
import {
  type CollectionCardViewModel,
  useCollectionViewModel,
} from "./use-collection-view-model.ts";

export function CollectionPanel() {
  const cardDb = useCardDb();
  const { cards: allCards } = cardDb;
  const data = useCollectionViewModel();
  const targetSize = useDeckSize();
  const readOnly = useBridgeAutoSync();
  const addCard = useAuthMutation(api.ownedCards.addCard);
  const removeCard = useAuthMutation(api.ownedCards.removeCard);
  const addToDeck = useAuthMutation(api.deck.addToDeck);
  const updatePreferences = useUpdatePreferences();
  const entriesByCardId = data?.entriesByCardId;
  const deckFull = data !== undefined && data.deckLength >= targetSize;
  const inputRef = useRef<HTMLInputElement>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const autocompleteCards = useMemo(
    () =>
      allCards.map((card) => {
        const owned = entriesByCardId?.get(card.id)?.totalOwned ?? 0;
        return {
          ...card,
          disabled: owned >= maxCopiesFor(cardDb, card.id),
          ownedCount: owned,
        };
      }),
    [allCards, cardDb, entriesByCardId],
  );

  const renderActions = useCallback(
    (entry: CollectionCardViewModel) => {
      const canAddToDeck = entry.availableInCollection > 0 && !deckFull;

      return (
        <span className="inline-flex items-center gap-1.5 lg:gap-0.5">
          <CardActionButton
            disabled={entry.totalOwned >= maxCopiesFor(cardDb, entry.id)}
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
    [addCard, addToDeck, cardDb, deckFull, removeCard],
  );

  if (data === undefined) return <PanelLoadingState />;

  return (
    <>
      <PanelHeader stretch={!readOnly} title="Collection">
        {!readOnly && (
          <CardAutocomplete
            cards={autocompleteCards}
            inputRef={inputRef}
            onOpenChange={setComboboxOpen}
            onSelect={(card) => void addCard({ cardId: card.id })}
            placeholder="Add card..."
          />
        )}
      </PanelHeader>
      {!readOnly && (
        <div className="px-3">
          <LastAddedCardHint comboboxOpen={comboboxOpen} inputRef={inputRef} />
        </div>
      )}
      {data.totalOwnedCards === 0 ? (
        readOnly ? (
          <PanelEmptyState
            subtitle="Cards will appear here once the emulator is connected"
            title="Waiting for emulator sync..."
          />
        ) : data.deckLength === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-3 gap-5 text-center">
            <div className="flex gap-1.5 opacity-50">
              <div className="w-8 h-11 border-2 border-gold-dim rounded -rotate-6" />
              <div className="w-8 h-11 border-2 border-gold rounded" />
              <div className="w-8 h-11 border-2 border-gold-dim rounded rotate-6" />
            </div>
            <p className="text-text-primary font-medium">Start building your collection</p>
            <div className="flex flex-col gap-3 w-full max-w-64">
              <Button onClick={() => updatePreferences({ bridgeAutoSync: null })} variant="outline">
                Open setup guide
              </Button>
              <p className="text-xs text-text-muted">Or search above to add cards manually.</p>
            </div>
          </div>
        ) : (
          <PanelEmptyState
            subtitle="Search above to add cards to your collection"
            title="Your collection is empty"
          />
        )
      ) : (
        <PanelBody>
          <CardTable actions={readOnly ? undefined : renderActions} entries={data.entries} />
        </PanelBody>
      )}
    </>
  );
}
