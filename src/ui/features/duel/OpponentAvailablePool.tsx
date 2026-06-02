import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cardFieldBonus } from "../../../engine/data/field-bonus.ts";
import { MiniGameCard } from "../../components/MiniGameCard.tsx";
import type { OpponentPoolCard } from "../../lib/bridge-state-interpreter.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function OpponentAvailablePool({
  handCards,
  reserveCards,
  terrain = 0,
}: {
  handCards: Array<OpponentPoolCard | null>;
  reserveCards: OpponentPoolCard[];
  terrain?: number;
}) {
  const [animateRef] = useAutoAnimate();
  if (handCards.every((card) => card == null) && reserveCards.length === 0) return null;

  const visibleHandCards = handCards.filter((card): card is OpponentPoolCard => card != null);
  const usedCardKeys = new Set<number>();

  return (
    <ol aria-label="Opponent available pool" className="fm-opponent-pool" ref={animateRef}>
      {visibleHandCards.map((card, i) => (
        <OpponentPoolItem
          card={card}
          key={poolCardKey(card, usedCardKeys, `hand-${String(i)}`)}
          kind="hand"
          slotNumber={i + 1}
          terrain={terrain}
        />
      ))}
      {reserveCards.map((card, reserveIndex) => (
        <OpponentPoolItem
          card={card}
          key={poolCardKey(card, usedCardKeys, `reserve-${String(reserveIndex)}`)}
          kind={reserveIndex === 0 ? "next-draw" : "reserve"}
          reserveNumber={reserveIndex + 1}
          terrain={terrain}
        />
      ))}
    </ol>
  );
}

function poolCardKey(
  card: OpponentPoolCard,
  usedCardKeys: Set<number>,
  duplicateScope: string,
): string {
  if (usedCardKeys.has(card.slotId))
    return `opp-pool-card-${String(card.slotId)}-${duplicateScope}`;
  usedCardKeys.add(card.slotId);
  return `opp-pool-card-${String(card.slotId)}`;
}

function OpponentPoolItem({
  card,
  kind,
  reserveNumber,
  slotNumber,
  terrain,
}: {
  card: OpponentPoolCard;
  kind: "hand" | "next-draw" | "reserve";
  reserveNumber?: number;
  slotNumber?: number;
  terrain: number;
}) {
  const { cardsById } = useCardDb();
  const cardData = cardsById.get(card.cardId);
  const fb = cardData ? cardFieldBonus(cardData, terrain) : undefined;
  const label =
    kind === "hand"
      ? `Opponent hand card ${String(slotNumber)}`
      : `Opponent reserve card ${String(reserveNumber)}${kind === "next-draw" ? " next draw" : ""}`;

  return (
    <li
      aria-label={label}
      className={`fm-opponent-pool-thumb fm-opponent-pool-thumb--${kind === "hand" ? "hand" : "reserve"}${kind === "next-draw" ? " fm-opponent-pool-thumb--next-draw" : ""}`}
    >
      {cardData && <MiniGameCard atkOverride={fb?.atk} card={cardData} defOverride={fb?.def} />}
    </li>
  );
}
