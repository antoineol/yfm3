import { useCardDb } from "../../lib/card-db-context.tsx";
import { CardDetailBody } from "./CardDetail.tsx";

export function CardDetailPage({ cardId }: { cardId: number }) {
  const { cardsById } = useCardDb();
  const card = cardsById.get(cardId);

  if (!card) {
    return <div className="text-center py-16 text-text-muted">Card not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-3">
      <a
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors w-fit"
        href="#data/cards"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Cards
      </a>
      <div className="rounded-xl border border-border-accent bg-bg-panel shadow-panel overflow-hidden">
        <CardDetailBody
          card={card}
          header={
            <h1 className="font-display text-base sm:text-lg font-bold text-gold leading-tight">
              {card.name}
              <span className="ml-2 align-middle text-[11px] font-mono font-normal text-text-muted/50">
                #{card.id}
              </span>
            </h1>
          }
        />
      </div>
    </div>
  );
}
