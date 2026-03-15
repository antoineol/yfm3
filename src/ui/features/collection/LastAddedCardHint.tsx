import { useMutation } from "convex/react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import {
  useDeckRowsFromState,
  useHydrateCollectionState,
  useLastAddedCollectionState,
} from "./collection-state.ts";
import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

export function LastAddedCardHint() {
  useHydrateCollectionState();

  const deck = useDeckRowsFromState();
  const cardDb = useCardDb();
  const { addedCardId, availableInCollection, card, totalOwned } = useLastAddedCollectionState();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const currentDeckScore = useAtomValue(currentDeckScoreAtom);
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const clearHint = useMutation(api.userPreferences.clearLastAddedCard);
  const applySuggestedSwap = useMutation(api.deck.applySuggestedSwap);
  const [applying, setApplying] = useState(false);
  const { loading, suggestion, clearSuggestion } = useDeckSwapSuggestion({
    addedCardId,
    addedCardAvailableCopies: availableInCollection,
    currentDeckScore,
    deck,
    deckSize,
    fusionDepth,
  });

  if (addedCardId === null || !card || totalOwned <= 0) return null;

  const lastAddedCardId = addedCardId;
  const name = card.name;
  const removedName = suggestion
    ? (cardDb.cardsById.get(suggestion.removedCardId)?.name ?? `#${suggestion.removedCardId}`)
    : "";

  function handleApplySuggestion() {
    if (!suggestion) return;
    setApplying(true);
    applySuggestedSwap({
      addCardId: lastAddedCardId,
      removeCardId: suggestion.removedCardId,
    })
      .then(() => {
        clearSuggestion();
        toast.success("Deck swap applied");
      })
      .catch((error) => {
        console.error("Suggested swap failed:", error);
        toast.error("Could not apply deck swap");
      })
      .finally(() => setApplying(false));
  }

  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">Last added:</span>
        <span className="text-text-primary font-medium truncate">{name}</span>
        <span className="text-text-muted font-mono">({totalOwned}/3)</span>
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <CardActionButton
            disabled={totalOwned >= 3}
            onClick={() => void addCard({ cardId: lastAddedCardId })}
            title="Add another copy"
            variant="add"
          >
            +
          </CardActionButton>
          <CardActionButton
            disabled={availableInCollection <= 0}
            onClick={() => void removeCard({ cardId: lastAddedCardId })}
            title="Remove one copy"
            variant="remove"
          >
            −
          </CardActionButton>
          <CardActionButton onClick={() => void clearHint({})} title="Dismiss" variant="dismiss">
            ×
          </CardActionButton>
        </div>
      </div>
      {loading && <div className="text-text-secondary">Checking deck upgrade...</div>}
      {suggestion && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-text-secondary">
            Upgrade deck: swap out{" "}
            <span className="text-text-primary font-medium">{removedName}</span> for{" "}
            <span className="text-text-primary font-medium">{name}</span>{" "}
            <span className="font-mono text-stat-up">{`(+${suggestion.improvement.toFixed(1)} ATK)`}</span>
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <Button disabled={applying} onClick={clearSuggestion} size="sm" variant="ghost">
              Reject
            </Button>
            <Button disabled={applying} onClick={handleApplySuggestion} size="sm" variant="outline">
              Apply swap
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
