import type { CardSpec } from "../../../engine/data/card-model.ts";
import { fieldBonus } from "../../../engine/data/field-bonus.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import type { FieldCard } from "../../lib/bridge-state-interpreter.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

const FIELD_SIZE = 5;

export function FieldDisplay({ cards, terrain = 0 }: { cards: FieldCard[]; terrain?: number }) {
  const { cardsById } = useCardDb();
  const slots = Array.from({ length: FIELD_SIZE }, (_, i) => cards[i]);

  return (
    <ul
      aria-label="Your field"
      className="grid grid-cols-5 items-start gap-2 sm:gap-3 list-none p-0 m-0"
    >
      {slots.map((fc, i) => {
        const card = fc ? cardsById.get(fc.cardId) : undefined;
        return card && fc ? (
          <FieldSlot
            card={card}
            fieldCard={fc}
            key={`field-${String(i)}-${String(fc.cardId)}`}
            terrain={terrain}
          />
        ) : (
          <EmptyFieldSlot index={i + 1} key={`field-empty-${String(i)}`} />
        );
      })}
    </ul>
  );
}

function FieldSlot({
  card,
  fieldCard,
  terrain = 0,
}: {
  card: CardSpec;
  fieldCard: FieldCard;
  terrain?: number;
}) {
  const fb = fieldBonus(terrain, card.cardType);
  const displayAtk = fieldCard.atk + fb;
  const displayDef = fieldCard.def + fb;
  const atkChanged = card.isMonster && displayAtk !== card.attack;
  const defChanged = card.isMonster && displayDef !== card.defense;
  return (
    <li>
      <MiniGameCard
        atkOverride={atkChanged ? displayAtk : undefined}
        card={card}
        defOverride={defChanged ? displayDef : undefined}
      />
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
