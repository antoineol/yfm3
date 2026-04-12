import { cardFieldBonus } from "../../../engine/data/field-bonus.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function OpponentHandGrid({
  cardIds,
  terrain = 0,
}: {
  cardIds: number[];
  terrain?: number;
}) {
  const { cardsById } = useCardDb();
  const slots = Array.from({ length: 5 }, (_, i) => cardIds[i] ?? null);

  return (
    <ul aria-label="Opponent's hand" className="grid grid-cols-5 gap-2 sm:gap-3 list-none p-0 m-0">
      {slots.map((cardId, i) => {
        const card = cardId != null ? cardsById.get(cardId) : undefined;
        const fb = card ? cardFieldBonus(card, terrain) : undefined;
        return card ? (
          <li key={`opp-${String(i)}-${String(cardId)}`}>
            <MiniGameCard atkOverride={fb?.atk} card={card} defOverride={fb?.def} />
          </li>
        ) : (
          <li className="fm-mini-empty" key={`opp-empty-${String(i)}`}>
            <span className="text-text-muted/30 text-xs font-mono">{i + 1}</span>
          </li>
        );
      })}
    </ul>
  );
}
