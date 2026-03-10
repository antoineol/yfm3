import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { CloseButton } from "../../components/CloseButton.tsx";
import type { HandCard } from "../../db/use-hand.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function HandDisplay({
  cards,
  onRemove,
}: {
  cards: HandCard[];
  onRemove: (id: Id<"hand">) => void;
}) {
  const { cardsById } = useCardDb();
  const [animateRef] = useAutoAnimate();
  const slots = Array.from({ length: HAND_SIZE }, (_, i) => cards[i]);

  return (
    <ul
      aria-label="Your hand"
      className="grid grid-cols-5 items-stretch gap-2 sm:gap-3 list-none p-0 m-0"
      ref={animateRef}
    >
      {slots.map((card, i) =>
        card ? (
          <FilledSlot
            card={cardsById.get(card.cardId)}
            key={card.docId}
            onRemove={() => onRemove(card.docId)}
          />
        ) : (
          <EmptySlot index={i + 1} key={`empty-${String(i)}`} />
        ),
      )}
    </ul>
  );
}

function FilledSlot({ card, onRemove }: { card: CardSpec | undefined; onRemove: () => void }) {
  return (
    <li className="group relative flex flex-col rounded-lg border border-gold-dim/60 bg-bg-surface overflow-hidden shadow-glow-gold-xs hover:border-gold hover:shadow-glow-gold-hover transition-all duration-200">
      {/* Top accent bar */}
      <div className="h-0.5 bg-linear-to-r from-transparent via-gold-dim to-transparent" />

      <div className="flex flex-col gap-1 px-2 pt-2 pb-1.5 flex-1">
        <p className="font-display text-[10px] sm:text-xs leading-tight text-text-primary line-clamp-2 min-h-[2lh]">
          {card?.name ?? "Unknown"}
        </p>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-mono text-xs font-bold tabular-nums text-stat-atk">
            {card?.attack ?? 0}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-stat-def">
            {card?.defense ?? 0}
          </span>
        </div>
      </div>

      <CloseButton
        className="absolute top-1 right-1 bg-bg-deep/80 opacity-0 group-hover:opacity-100 hover:text-stat-atk hover:bg-bg-deep transition-all duration-150"
        label={`Remove ${card?.name ?? "card"}`}
        onClick={onRemove}
        size="sm"
      />
    </li>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <li
      aria-label={`Empty slot ${String(index)}`}
      className="flex items-center justify-center rounded-lg border border-dashed border-border-subtle/60 bg-bg-panel/40"
    >
      <span className="text-text-muted/40 text-xs font-mono">{index}</span>
    </li>
  );
}
