import { useMutation } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type {
  DeckSwapSuggestion,
  FindBestDeckSwapSuggestionOptions,
} from "../../../engine/suggest-deck-swap.ts";
import { Button } from "../../components/Button.tsx";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { useDeckSize, useFusionDepth } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useCollectionViewModel } from "./use-collection-view-model.ts";

export function LastAddedCardHint() {
  const lastAdded = useLastAddedCard();
  const cardDb = useCardDb();
  const collection = useCollectionViewModel();
  const deck = useDeck();
  const ownedCardTotals = useOwnedCardTotals();
  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const clearHint = useMutation(api.userPreferences.clearLastAddedCard);
  const applySuggestedSwap = useMutation(api.deck.applySuggestedSwap);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<DeckSwapSuggestion | null>(null);
  const deckCardIds = useMemo(() => deck?.map((card) => card.cardId) ?? [], [deck]);
  const addedCardId = lastAdded?.cardId ?? null;
  const card = addedCardId === null ? undefined : cardDb.cardsById.get(addedCardId);
  const entry =
    addedCardId === null || collection === undefined
      ? undefined
      : collection.entriesByCardId.get(addedCardId);
  const name = card?.name ?? (addedCardId === null ? "" : `#${addedCardId}`);
  const removedName = suggestion
    ? (cardDb.cardsById.get(suggestion.removedCardId)?.name ?? `#${suggestion.removedCardId}`)
    : "";

  useEffect(() => {
    if (
      addedCardId === null ||
      deck === undefined ||
      ownedCardTotals === undefined ||
      deckCardIds.length !== deckSize
    ) {
      setLoading(false);
      setSuggestion(null);
      return;
    }

    const worker = new Worker(
      new URL("../../../engine/worker/suggestion-worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    const request: FindBestDeckSwapSuggestionOptions = {
      addedCardId: addedCardId,
      collection: ownedCardTotals,
      config: { deckSize, fusionDepth },
      deck: deckCardIds,
    };

    let cancelled = false;
    setLoading(true);
    setSuggestion(null);

    worker.onmessage = (event: MessageEvent<DeckSwapSuggestion | null>) => {
      if (!cancelled) {
        setLoading(false);
        setSuggestion(event.data);
      }
      worker.terminate();
    };
    worker.onerror = (error) => {
      console.error("Suggestion lookup failed:", error);
      if (!cancelled) {
        setLoading(false);
        setSuggestion(null);
      }
      worker.terminate();
    };

    worker.postMessage(request);

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [addedCardId, deck, deckCardIds, deckSize, fusionDepth, ownedCardTotals]);

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
        setSuggestion(null);
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
            <Button
              disabled={applying}
              onClick={() => setSuggestion(null)}
              size="sm"
              variant="ghost"
            >
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
