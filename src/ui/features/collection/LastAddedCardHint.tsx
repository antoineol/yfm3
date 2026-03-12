import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";
import { useCollectionViewModel } from "./use-collection-view-model.ts";

export function LastAddedCardHint() {
  const lastAdded = useLastAddedCard();
  const cardDb = useCardDb();
  const collection = useCollectionViewModel();
  const addCard = useMutation(api.ownedCards.addCard);
  const removeCard = useMutation(api.ownedCards.removeCard);
  const clearHint = useMutation(api.userPreferences.clearLastAddedCard);

  if (!lastAdded || collection === undefined) return null;

  const card = cardDb.cardsById.get(lastAdded.cardId);
  const entry = collection.entriesByCardId.get(lastAdded.cardId);

  if (!entry) return null;

  const name = card?.name ?? `#${lastAdded.cardId}`;

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <span className="text-text-secondary">Last added:</span>
      <span className="text-text-primary font-medium truncate">{name}</span>
      <span className="text-text-muted font-mono">({entry.totalOwned}/3)</span>
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <CardActionButton
          disabled={entry.totalOwned >= 3}
          onClick={() => void addCard({ cardId: lastAdded.cardId })}
          title="Add another copy"
          variant="add"
        >
          +
        </CardActionButton>
        <CardActionButton
          disabled={entry.availableInCollection <= 0}
          onClick={() => void removeCard({ cardId: lastAdded.cardId })}
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
  );
}
