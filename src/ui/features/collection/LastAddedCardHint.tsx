import { useMutation } from "convex/react";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "../../components/Button.tsx";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { currentDeckScoreAtom } from "../../lib/atoms.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useCollectionViewModel } from "./use-collection-view-model.ts";
import { useDeckSwapSuggestion } from "./use-deck-swap-suggestion.ts";

export function LastAddedCardHint() {
  const lastAdded = useLastAddedCard();
  const cardDb = useCardDb();
  const collection = useCollectionViewModel();
  const deck = useDeck();
  const ownedCardTotals = useOwnedCardTotals();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const currentDeckScore = useAtomValue(currentDeckScoreAtom);
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const clearHint = useMutation(api.userPreferences.clearLastAddedCard);
  const applySuggestedSwap = useMutation(api.deck.applySuggestedSwap);
  const [applying, setApplying] = useState(false);
  const addedCardId = lastAdded?.cardId ?? null;
  const card = addedCardId === null ? undefined : cardDb.cardsById.get(addedCardId);
  const entry =
    addedCardId === null || collection === undefined
      ? undefined
      : collection.entriesByCardId.get(addedCardId);
  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);
  const addedCardDeckCopies = useMemo(
    () => (addedCardId === null ? 0 : countCardCopies(deckCardIds, addedCardId)),
    [addedCardId, deckCardIds],
  );
  const addedCardOwnedCopies = addedCardId === null ? 0 : (ownedCardTotals?.[addedCardId] ?? 0);
  const addedCardAvailableCopies = Math.max(addedCardOwnedCopies - addedCardDeckCopies, 0);
  const { loading, suggestion, clearSuggestion } = useDeckSwapSuggestion({
    addedCardId,
    addedCardAvailableCopies,
    currentDeckScore,
    deck,
    deckSize,
    fusionDepth,
  });
  const name = card?.name ?? (addedCardId === null ? "" : `#${addedCardId}`);
  const removedName = suggestion
    ? (cardDb.cardsById.get(suggestion.removedCardId)?.name ?? `#${suggestion.removedCardId}`)
    : "";

  if (addedCardId === null || collection === undefined || !entry) return null;
  const lastAddedCardId = addedCardId;

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
        <span className="text-text-muted font-mono">({entry.totalOwned}/3)</span>
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <CardActionButton
            disabled={entry.totalOwned >= 3}
            onClick={() => void addCard({ cardId: lastAddedCardId })}
            title="Add another copy"
            variant="add"
          >
            +
          </CardActionButton>
          <CardActionButton
            disabled={entry.availableInCollection <= 0}
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

function countCardCopies(deckCardIds: number[], cardId: number) {
  let copies = 0;

  for (const currentCardId of deckCardIds) {
    if (currentCardId === cardId) copies++;
  }

  return copies;
}
