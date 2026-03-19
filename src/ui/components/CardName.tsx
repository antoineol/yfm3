import type { CardId } from "../../engine/data/card-model.ts";
import { useCardDetail } from "../lib/card-detail-context.tsx";

export function CardName({
  cardId,
  name,
  className,
}: {
  cardId: CardId;
  name: string;
  className?: string;
}) {
  const { openCard } = useCardDetail();

  return (
    <button
      className={`text-left hover:underline decoration-gold/40 underline-offset-2 cursor-pointer transition-colors duration-150 hover:text-gold ${className ?? ""}`}
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
