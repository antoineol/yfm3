import type { CardId } from "../../engine/data/card-model.ts";
import { useOptionalCardDb } from "../lib/card-db-context.tsx";
import { useOpenCard } from "../lib/card-detail-context.tsx";
import { labelTextColor } from "./card-frame-palettes.ts";

export function CardName({
  cardId,
  name,
  className,
  labelColor,
}: {
  cardId: CardId;
  name: string;
  className?: string;
  labelColor?: string;
}) {
  const openCard = useOpenCard();
  const cardDb = useOptionalCardDb();
  const resolvedLabelColor = labelTextColor(
    labelColor ?? cardDb?.cardsById.get(cardId)?.labelColor,
  );

  return (
    <button
      className={`text-left truncate hover:underline decoration-gold/40 underline-offset-2 cursor-pointer transition-colors duration-150 hover:text-gold ${className ?? ""}`}
      onClick={(e) => {
        e.stopPropagation();
        openCard(cardId);
      }}
      style={resolvedLabelColor ? { color: resolvedLabelColor } : undefined}
      type="button"
    >
      {name}
    </button>
  );
}
