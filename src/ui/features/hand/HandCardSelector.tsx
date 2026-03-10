import { type RefObject, useMemo } from "react";
import type { CardSpec } from "../../../engine/data/card-model.ts";
import { HAND_SIZE } from "../../../engine/types/constants.ts";
import { CardAutocomplete } from "../../components/CardAutocomplete.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";

export function HandCardSelector({
  deckCardIds,
  onSelect,
  handSize,
  sourceMode,
  inputRef,
}: {
  /** Card IDs in the user's deck — used when sourceMode is "deck". */
  deckCardIds: number[] | undefined;
  onSelect: (card: CardSpec) => void;
  handSize: number;
  sourceMode: "deck" | "all";
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const { cards: allCards, cardsById } = useCardDb();
  const isFull = handSize >= HAND_SIZE;

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
      onSelect={onSelect}
      placeholder={
        isFull ? `Hand full (${String(HAND_SIZE)}/${String(HAND_SIZE)})` : "Add card to hand..."
      }
    />
  );
}
