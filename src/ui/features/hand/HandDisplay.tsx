import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function HandDisplay({
  cards,
  onRemove,
  frozen,
}: {
  cards: HandCard[];
  onRemove?: (id: Id<"hand">) => void;
  frozen?: boolean;
}) {
  const { cardsById } = useCardDb();
  const [animateRef] = useAutoAnimate();
  const slots = Array.from({ length: HAND_SIZE }, (_, i) => cards[i]);

  return (
    <div className="relative">
      <ul
        aria-label="Your hand"
        className={`grid grid-cols-5 items-start gap-2 sm:gap-3 list-none p-0 m-0 transition-all duration-300 ${frozen ? "opacity-40 saturate-0 pointer-events-none" : ""}`}
        ref={animateRef}
      >
        {slots.map((card, i) =>
          card ? (
            <FilledSlot
              card={cardsById.get(card.cardId)}
              key={card.docId}
              onRemove={onRemove ? () => onRemove(card.docId) : undefined}
            />
          ) : (
            <EmptySlot index={i + 1} key={`empty-${String(i)}`} />
          ),
        )}
      </ul>
      {frozen && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-text-muted bg-surface-primary/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
            Hand may have changed — updates at next turn
          </span>
        </div>
      )}
    </div>
  );
}

function FilledSlot({ card, onRemove }: { card: CardSpec | undefined; onRemove?: () => void }) {
  if (!card) return null;

  return (
    <li>
      <MiniGameCard card={card} onRemove={onRemove} />
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
