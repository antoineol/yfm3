import { type RefObject, useMemo } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { useDeck } from "../../db/use-deck.ts";
import { useHand, useHandMutations } from "../../db/use-hand.ts";
import { useHandSourceMode } from "../../db/use-user-preferences.ts";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function HandCardSelector({ inputRef }: { inputRef?: RefObject<HTMLInputElement | null> }) {
  const { cards: allCards, cardsById } = useCardDb();
  const deck = useDeck();
  const hand = useHand();
  const sourceMode = useHandSourceMode();
  const { addToHand } = useHandMutations();

  const handSize = hand?.length ?? 0;
  const isFull = handSize >= HAND_SIZE;

  const deckCardIds = useMemo(() => deck?.map((d) => d.cardId), [deck]);

  const deckCards = useMemo(() => {
    if (sourceMode !== "deck" || !deckCardIds) return undefined;
    const seen = new Set<number>();
    const result: CardSpec[] = [];
    for (const id of deckCardIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      const card = cardsById.get(id);
      if (card) result.push(card);
    }
    return result.sort((a, b) => b.attack - a.attack);
  }, [sourceMode, deckCardIds, cardsById]);

  return (
    <CardAutocomplete
      autoFocus
      cards={sourceMode === "deck" ? deckCards : allCards}
      disabled={isFull}
      inputRef={inputRef}
      onSelect={(card) => void addToHand({ cardId: card.id })}
      placeholder={
        isFull ? `Hand full (${String(HAND_SIZE)}/${String(HAND_SIZE)})` : "Add card to hand..."
      }
    />
  );
}
