import type { CardId } from "../../engine/data/card-model.ts";
import { useOpenCard } from "../lib/card-detail-context.tsx";

export function CardName({
  cardId,
  name,
  className,
}: {
  cardId: CardId;
  name: string;
  className?: string;
}) {
  const openCard = useOpenCard();

  return (
    <button
      className={`text-left truncate hover:underline decoration-gold/40 underline-offset-2 cursor-pointer transition-colors duration-150 hover:text-gold ${className ?? ""}`}
      onClick={(e) => {
        e.stopPropagation();
        openCard(cardId);
      }}
      type="button"
    >
      {name}
    </button>
  );
}
