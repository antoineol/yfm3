import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { CardActionButton } from "../../components/CardActionButton.tsx";
import { countById } from "../../components/CardTable.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useLastAddedCard } from "../../db/use-last-added-card.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function LastAddedCardHint() {
  const lastAdded = useLastAddedCard();
  const cardDb = useCardDb();
  const deck = useDeck();
  const addCard = useMutation(api.collection.addCard);
  const removeCard = useMutation(api.collection.removeCard);
  const clearHint = useMutation(api.collection.clearLastAddedCard);

  const deckCounts = useMemo(() => {
    if (!deck) return new Map<number, number>();
    return countById(deck.map((d) => d.cardId));
  }, [deck]);

  if (!lastAdded) return null;

  const card = cardDb.cardsById.get(lastAdded.cardId);
  const name = card?.name ?? `#${lastAdded.cardId}`;
  const available = lastAdded.quantity - (deckCounts.get(lastAdded.cardId) ?? 0);

  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg-surface border border-border-subtle text-xs">
      <span className="text-text-secondary">Last added:</span>
      <span className="text-text-primary font-medium truncate">{name}</span>
      <span className="text-text-muted font-mono">({lastAdded.quantity}/3)</span>
      <div className="flex items-center gap-0.5 ml-auto shrink-0">
        <CardActionButton
          disabled={lastAdded.quantity >= 3}
          onClick={() => void addCard({ cardId: lastAdded.cardId })}
          title="Add another copy"
          variant="add"
        >
          +
        </CardActionButton>
        <CardActionButton
          disabled={available <= 0}
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
