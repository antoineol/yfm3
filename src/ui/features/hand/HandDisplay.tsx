import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { cardFieldBonus } from "../../../engine/data/field-bonus.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function HandDisplay({
  cards,
  onRemove,
  frozen,
  drawing,
  terrain = 0,
}: {
  cards: HandCard[];
  onRemove?: (id: Id<"hand">) => void;
  frozen?: boolean;
  drawing?: boolean;
  terrain?: number;
}) {
  const { cardsById } = useCardDb();
  const [animateRef] = useAutoAnimate();
  const slots = Array.from({ length: HAND_SIZE }, (_, i) => cards[i]);

  return (
    <div className="relative">
      <ul
        aria-label="Your hand"
        className={`grid grid-cols-5 gap-2 sm:gap-3 list-none p-0 m-0 transition-all duration-300 ${frozen || drawing ? "opacity-40 saturate-0 pointer-events-none" : ""}`}
        ref={animateRef}
      >
        {slots.map((card, i) =>
          card ? (
            <FilledSlot
              card={cardsById.get(card.cardId)}
              key={card.docId}
              onRemove={onRemove ? () => onRemove(card.docId) : undefined}
              terrain={terrain}
            />
          ) : (
            <EmptySlot index={i + 1} key={`empty-${String(i)}`} />
          ),
        )}
      </ul>
      {(frozen || drawing) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-text-muted bg-surface-primary/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {drawing ? "Drawing\u2026" : "Hand may have changed \u2014 updates at next turn"}
          </span>
        </div>
      )}
    </div>
  );
}

function FilledSlot({
  card,
  onRemove,
  terrain = 0,
}: {
  card: CardSpec | undefined;
  onRemove?: () => void;
  terrain?: number;
}) {
  if (!card) return null;
  const fb = cardFieldBonus(card, terrain);

  return (
    <li>
      <MiniGameCard atkOverride={fb?.atk} card={card} defOverride={fb?.def} onRemove={onRemove} />
    </li>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <li aria-label={`Empty slot ${String(index)}`} className="fm-mini-empty">
      <span className="text-text-muted/30 text-xs font-mono">{index}</span>
    </li>
  );
}
