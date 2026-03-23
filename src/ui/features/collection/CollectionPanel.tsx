import { useMutation } from "convex/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
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
import { useBridgeAutoSync, useDeckSize } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { importExportSchema } from "../config/import-export-schema.ts";
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
  const readOnly = useBridgeAutoSync();
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const addToDeck = useMutation(api.deck.addToDeck);
  const importMutation = useMutation(api.importExport.importData);
  const entriesByCardId = data?.entriesByCardId;
  const deckFull = data !== undefined && data.deckLength >= targetSize;
  const inputRef = useRef<HTMLInputElement>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  async function loadSampleData() {
    setLoadingSample(true);
    try {
      const res = await fetch("/data/sample.json");
      const parsed = importExportSchema.safeParse(await res.json());
      if (!parsed.success) {
        toast.error("Invalid sample data");
        return;
      }
      await importMutation({
        collection: parsed.data.collection,
        deck: parsed.data.deck,
      });
      toast.success("Sample collection loaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sample data");
    } finally {
      setLoadingSample(false);
    }
  }

  const autocompleteCards = useMemo(
    () =>
      allCards.map((card) => {
        const owned = entriesByCardId?.get(card.id)?.totalOwned ?? 0;
        return {
          ...card,
          disabled: owned >= MAX_COPIES_PER_CARD,
          ownedCount: owned,
        };
      }),
    [allCards, entriesByCardId],
  );

  const renderActions = useCallback(
    (entry: CollectionCardViewModel) => {
      const canAddToDeck = entry.availableInCollection > 0 && !deckFull;

      return (
        <span className="inline-flex items-center gap-1.5 lg:gap-0.5">
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
      {!readOnly && <LastAddedCardHint comboboxOpen={comboboxOpen} inputRef={inputRef} />}
      {data.totalOwnedCards === 0 ? (
        readOnly ? (
          <PanelEmptyState
            subtitle="Cards will appear here once the emulator is connected"
            title="Waiting for emulator sync..."
          />
        ) : data.deckLength === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
            <div className="flex gap-1.5 opacity-50">
              <div className="w-8 h-11 border-2 border-gold-dim rounded -rotate-6" />
              <div className="w-8 h-11 border-2 border-gold rounded" />
              <div className="w-8 h-11 border-2 border-gold-dim rounded rotate-6" />
            </div>
            <div className="space-y-1.5">
              <p className="text-text-primary font-medium">New here? Try it out instantly</p>
              <p className="text-xs text-text-muted max-w-56">
                Load a ready-made collection to explore all features right away.
              </p>
            </div>
            <Button disabled={loadingSample} onClick={() => void loadSampleData()}>
              {loadingSample ? "Loading..." : "Load sample collection"}
            </Button>
            <p className="text-xs text-text-muted">Or search above to build your own collection</p>
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
