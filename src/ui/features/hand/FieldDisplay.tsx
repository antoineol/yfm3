import type { CardSpec } from "../../../engine/data/card-model.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";

const FIELD_SIZE = 5;

export function FieldDisplay({ cardIds }: { cardIds: number[] }) {
  const { cardsById } = useCardDb();
  const slots = Array.from({ length: FIELD_SIZE }, (_, i) => cardIds[i]);

  return (
    <ul
      aria-label="Your field"
      className="grid grid-cols-5 items-start gap-2 sm:gap-3 list-none p-0 m-0"
    >
      {slots.map((cardId, i) => {
        const card = cardId !== undefined ? cardsById.get(cardId) : undefined;
        return card ? (
          <FieldSlot card={card} key={`field-${String(i)}-${String(cardId)}`} />
        ) : (
          <EmptyFieldSlot index={i + 1} key={`field-empty-${String(i)}`} />
        );
      })}
    </ul>
  );
}

function FieldSlot({ card }: { card: CardSpec }) {
  return (
    <li>
      <MiniGameCard card={card} />
    </li>
  );
}

function EmptyFieldSlot({ index }: { index: number }) {
  return (
    <li aria-label={`Empty field slot ${String(index)}`} className="fm-mini-empty">
      <span className="text-text-muted/30 text-xs font-mono">{index}</span>
    </li>
  );
}
